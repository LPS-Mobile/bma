'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useBots } from '@/hooks/useBots'; 
import { 
  Sparkles, Settings, TrendingUp, BarChart3, 
  LineChart, Store, Plus, 
  ArrowRight, Play, Save, Lock, AlertCircle, ArrowLeft, 
  Monitor, Globe, Cpu, Crown,
  Loader2, BadgeCheck, SlidersHorizontal
} from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

// --- IMPORTS ---
// Ensure these components exist in your project
import BacktestMetrics from '@/components/bots/BacktestMetrics';

// --- TYPES ---
interface TradeData {
  entry_time?: string;
  date?: string;
  type?: string;
  entry_price?: number;
  entryPrice?: number;
  exit_price?: number;
  exitPrice?: number;
  pnl?: number;
  exit_reason?: string;
  result?: string;
}

interface BacktestResult {
  metrics: any; 
  trades: TradeData[];
  chartImage?: string;
  dates?: string[];
  runId?: string;
}

// --- UI COMPONENTS ---

const Button = ({ variant = 'primary', size = 'md', className = '', children, onClick, isLoading, disabled, ...props }: any) => {
  const base = "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 focus:outline-none active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants: any = {
    primary: "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/20",
    secondary: "bg-gray-800 text-white hover:bg-gray-700 border border-gray-700",
    success: "bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-900/20",
    locked: "bg-gray-900 text-gray-600 border border-gray-800 border-dashed",
  };
  const sizes: any = { sm: "h-9 px-4 text-sm", md: "h-12 px-6 text-base", lg: "h-14 px-8 text-lg" };
  
  return (
    <button 
      onClick={onClick} 
      disabled={disabled || isLoading} 
      className={`${base} ${variants[disabled ? 'locked' : variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`} 
      {...props}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
      {children}
    </button>
  );
};

const Badge = ({ children, variant = 'default' }: any) => {
  const styles: any = {
    default: "bg-gray-800 text-gray-400",
    blue: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    green: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    red: "bg-red-500/10 text-red-400 border border-red-500/20",
  };
  return <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border border-transparent ${styles[variant] || styles.default}`}>{children}</span>;
};

const Card = ({ children, className = "", title, icon }: any) => (
  <div className={`bg-[#0F1115] border border-gray-800 rounded-2xl overflow-hidden ${className}`}>
    {title && (
      <div className="px-5 py-3 border-b border-gray-800/50 bg-gray-900/30 flex items-center gap-2">
        {icon && <span className="text-gray-400">{icon}</span>}
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">{title}</h3>
      </div>
    )}
    <div className="p-5">{children}</div>
  </div>
);

const UpgradeWall = ({ router }: any) => (
  <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
    <div className="max-w-md w-full bg-[#0F1115] border border-gray-800 rounded-2xl p-8 text-center shadow-2xl">
      <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
        <Lock className="w-8 h-8 text-gray-500" />
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">Limit Reached</h1>
      <p className="text-gray-400 mb-6">
        You are on the <span className="text-white font-bold">Free Tier</span>, which allows 1 active bot. Upgrade to create unlimited strategies.
      </p>
      <div className="space-y-3">
        <Button onClick={() => router.push('/pricing')} className="w-full bg-blue-600 hover:bg-blue-500">
          <Crown className="w-4 h-4 mr-2" /> Upgrade Plan
        </Button>
        <Button variant="secondary" onClick={() => router.push('/dashboard')} className="w-full">
          Back to Dashboard
        </Button>
      </div>
    </div>
  </div>
);

// --- STRATEGY INPUT COMPONENTS ---

const StrategyInput = ({ value, onChange }: any) => (
  <div className="space-y-3">
    <div className="relative bg-gray-950 border border-gray-800 rounded-xl focus-within:border-blue-500/50 transition-colors p-1">
      <textarea 
        className="w-full h-32 bg-transparent rounded-lg p-3 text-sm text-white focus:outline-none resize-none placeholder-gray-600 font-mono"
        placeholder="Describe your strategy (e.g. 'Buy when RSI crosses below 30 and sell when it crosses above 70'). The AI will configure parameters."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="px-3 py-2 flex items-center justify-between border-t border-gray-800/50">
        <div className="flex items-center gap-2 text-[10px] text-gray-500">
          <Sparkles className="w-3 h-3 text-purple-400" /> 
          AI Strategy Interpreter Active
        </div>
      </div>
    </div>
  </div>
);

const MarketConfig = ({ config, setConfig }: any) => (
  <div className="space-y-5">
    <div>
      <label className="text-[10px] uppercase text-gray-500 font-bold mb-1.5 block">Asset</label>
      <select 
        value={config.symbol} 
        onChange={(e) => setConfig({...config, symbol: e.target.value})} 
        className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-white focus:border-blue-500 outline-none"
      >
        <option value="ES.c.0">ES - S&P 500 E-mini</option>
        <option value="NQ.c.0">NQ - Nasdaq 100 E-mini</option>
        <option value="YM.c.0">YM - Dow Jones E-mini</option>
        <option value="RTY.c.0">RTY - Russell 2000</option>
        <option value="CL.c.0">CL - Crude Oil</option>
        <option value="GC.c.0">GC - Gold</option>
        <option value="BTC.c.0">BTC - Bitcoin Futures</option>
      </select>
    </div>

    <div>
      <label className="text-[10px] uppercase text-gray-500 font-bold mb-1.5 block">Timeframe</label>
      <select 
        value={config.timeframe} 
        onChange={(e) => setConfig({...config, timeframe: e.target.value})}
        className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-white focus:border-blue-500 outline-none"
      >
        <option value="1D">Daily (1D)</option>
        <option value="4H">4 Hours (4H)</option>
        <option value="1H">1 Hour (1H)</option>
        <option value="15M">15 Minutes (15M)</option>
        <option value="5M">5 Minutes (5M)</option>
      </select>
    </div>
    
    <div>
      <label className="text-[10px] uppercase text-gray-500 font-bold mb-1.5 block">Backtest Period</label>
      <div className="grid grid-cols-2 gap-2">
        <input 
          type="date" 
          value={config.start_date} 
          onChange={(e) => setConfig({...config, start_date: e.target.value})} 
          className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-xs text-gray-300 [color-scheme:dark]" 
        />
        <input 
          type="date" 
          value={config.end_date} 
          onChange={(e) => setConfig({...config, end_date: e.target.value})} 
          className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-xs text-gray-300 [color-scheme:dark]" 
        />
      </div>
    </div>
  </div>
);

const ParameterTuning = ({ config, setConfig }: any) => (
  <div className="space-y-6">
    <div>
      <div className="flex justify-between mb-2">
        <label className="text-xs text-gray-400">Indicator Period</label>
        <span className="text-xs font-mono text-blue-400">{config.period} bars</span>
      </div>
      <input 
        type="range" min="2" max="200" step="1" 
        value={config.period}
        onChange={(e) => setConfig({...config, period: Number(e.target.value)})}
        className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-600" 
      />
    </div>

    <div>
      <div className="flex justify-between mb-2">
        <label className="text-xs text-gray-400">Buy Threshold</label>
        <span className="text-xs font-mono text-green-400">{config.buy_threshold}</span>
      </div>
      <input 
        type="range" min="1" max="100" step="1" 
        value={config.buy_threshold}
        onChange={(e) => setConfig({...config, buy_threshold: Number(e.target.value)})}
        className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-green-600" 
      />
    </div>

    <div>
      <div className="flex justify-between mb-2">
        <label className="text-xs text-gray-400">Sell Threshold</label>
        <span className="text-xs font-mono text-red-400">{config.sell_threshold}</span>
      </div>
      <input 
        type="range" min="1" max="100" step="1" 
        value={config.sell_threshold}
        onChange={(e) => setConfig({...config, sell_threshold: Number(e.target.value)})}
        className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-red-600" 
      />
    </div>
  </div>
);

const TemplateMarketplace = ({ onSelectTemplate }: any) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-fade-in">
    {[
      { title: 'ES Mean Reversion', desc: 'RSI oversold/overbought on S&P 500', indicator: 'rsi', period: 14, buy: 30, sell: 70 },
      { title: 'Trend Follower', desc: 'EMA crossover momentum', indicator: 'ema', period: 20, buy: 0, sell: 0 },
      { title: 'Gold Scalper', desc: 'Fast RSI for Gold', indicator: 'rsi', period: 9, buy: 20, sell: 80 }
    ].map((t, i) => (
      <button 
        key={i} 
        onClick={() => onSelectTemplate(t)} 
        className="flex flex-col text-left p-6 bg-[#0F1115] border border-gray-800 hover:border-blue-500/50 hover:bg-gray-900/50 rounded-2xl transition-all group"
      >
        <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform mb-4">
          <Store className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold mb-2 text-white">{t.title}</h3>
        <p className="text-sm text-gray-400 mb-4 flex-1">{t.desc}</p>
        <div className="flex items-center text-blue-400 text-sm font-medium">
          Use Template <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </div>
      </button>
    ))}
    
    <button 
      onClick={() => onSelectTemplate({ title: 'Custom', desc: 'Build your own', indicator: 'rsi', period: 14, buy: 30, sell: 70 })} 
      className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-800 hover:border-gray-600 hover:bg-gray-900/30 rounded-2xl transition-all group text-center"
    >
      <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        <Plus className="w-8 h-8 text-gray-500 group-hover:text-gray-300" />
      </div>
      <h3 className="text-lg font-bold text-gray-400 group-hover:text-white mb-2 transition-colors">Start from Scratch</h3>
      <p className="text-sm text-gray-600">Build your own strategy</p>
    </button>
  </div>
);

// --- REQUEST DEPLOYMENT COMPONENT (FIXED) ---
const RequestDeployment = ({ botId, botName, platform }: any) => {
  const [loading, setLoading] = useState(false);
  const [requested, setRequested] = useState(false);
  const supabase = createClient();

  const handleRequest = async () => {
    if (!botId) return toast.error("Please save your bot first.");
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Check existing
      const { data: existing } = await supabase
        .from('deployments')
        .select('*')
        .eq('bot_id', botId)
        .eq('platform', platform)
        .single();

      if (existing) {
        toast.info(`Request for ${platform} already pending.`);
        setRequested(true);
        return;
      }

      // Create Request
      const { error } = await supabase.from('deployments').insert({
        user_id: user.id,
        bot_id: botId,
        bot_name: botName,
        platform: platform,
        status: 'pending',
        requested_at: new Date().toISOString()
      });

      if (error) throw error;

      toast.success(`${platform} request submitted!`);
      setRequested(true);
    } catch (e: any) {
      console.error(e);
      toast.error("Request Failed", { description: e.message });
    } finally {
      setLoading(false);
    }
  };

  if (requested) {
    return (
      <button disabled className="w-full h-10 bg-green-900/20 border border-green-500/30 text-green-500 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-not-allowed">
        <BadgeCheck className="w-4 h-4" /> Request Sent
      </button>
    );
  }

  return (
    <Button 
      onClick={handleRequest} 
      isLoading={loading} 
      className="w-full h-10 text-sm bg-blue-600 hover:bg-blue-500"
    >
      Request {platform} Setup
    </Button>
  );
};

// --- DEPLOYMENT SCREEN (FIXED) ---
const DeploymentScreen = ({ botId, botName, plan, onSave, isSaving }: any) => {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const router = useRouter();
  
  // 1. SAFETY CHECK: If bot is unsaved, BLOCK the view
  if (!botId) {
    return (
      <div className="max-w-2xl mx-auto mt-12 text-center animate-fade-in">
        <div className="bg-[#0F1115] border border-gray-800 rounded-2xl p-10 flex flex-col items-center shadow-2xl">
          <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mb-6 border border-amber-500/20">
            <AlertCircle className="w-10 h-10 text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Save Strategy First</h2>
          <p className="text-gray-400 mb-8 max-w-md">
            You must save your strategy to the database before you can access deployment options or request expert reviews.
          </p>
          <Button 
            onClick={onSave} 
            isLoading={isSaving}
            className="w-full max-w-xs bg-white text-black hover:bg-gray-200 font-bold"
          >
            <Save className="w-4 h-4 mr-2" /> Save Strategy Now
          </Button>
        </div>
      </div>
    );
  }

  const normalizedPlan = plan ? plan.toLowerCase().trim().replace(/ /g, '_') : 'free';
  const canDeployTv = ['live_trader', 'automation_pro', 'pro'].includes(normalizedPlan);
  const canDeployPro = ['automation_pro', 'pro'].includes(normalizedPlan);

  const handleAudit = async () => {
    setIsCheckingOut(true);
    try {
       const res = await fetch('/api/stripe/checkout', { 
         method: 'POST', 
         headers: {'Content-Type': 'application/json'}, 
         body: JSON.stringify({ botId, planType: 'expert_review' }) 
       });
       
       const data = await res.json();
       if (!res.ok) throw new Error(data.error || 'Checkout failed');
       if(data.url) window.location.href = data.url;
       
    } catch(e: any) { 
      toast.error('Checkout failed', { description: e.message }); 
      setIsCheckingOut(false); 
    }
  };

  return (
    <div className="animate-fade-in max-w-5xl mx-auto pb-20">
        <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">Go Live</h2>
            <p className="text-gray-400">Deploy your strategy to a live trading environment.</p>
            
            <div className="mt-4 inline-flex items-center gap-2 bg-gray-900/80 border border-gray-700 rounded-full px-3 py-1 text-xs text-gray-400">
                <BadgeCheck className="w-3 h-3 text-blue-500" />
                <span>Current Plan: <span className="text-white font-mono font-bold uppercase">{normalizedPlan.replace('_', ' ')}</span></span>
            </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
            {/* TradingView Card */}
            <div className="bg-[#0F1115] border border-gray-800 rounded-2xl p-6 flex flex-col items-center text-center hover:border-blue-500/50 transition-colors group">
              <div className="w-14 h-14 bg-blue-900/10 rounded-full flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform"><Globe className="w-7 h-7" /></div>
              <h3 className="text-xl font-bold mb-2">TradingView</h3>
              <p className="text-sm text-gray-400 mb-6 flex-1">Webhooks & Alert automation</p>
              <div className="w-full mt-auto">
                {canDeployTv ? (
                    <RequestDeployment botId={botId} botName={botName} platform="TradingView" />
                ) : (
                    <Button onClick={() => router.push('/pricing')} variant="locked" className="w-full text-xs">Upgrade to Unlock</Button>
                )}
              </div>
            </div>

            {/* MT5 Card */}
            <div className="bg-[#0F1115] border border-gray-800 rounded-2xl p-6 flex flex-col items-center text-center hover:border-amber-500/50 transition-colors group">
              <div className="w-14 h-14 bg-amber-900/10 rounded-full flex items-center justify-center text-amber-500 mb-4 group-hover:scale-110 transition-transform"><Monitor className="w-7 h-7" /></div>
              <h3 className="text-xl font-bold mb-2">MetaTrader 5</h3>
              <p className="text-sm text-gray-400 mb-6 flex-1">Expert Advisor (.MQ5)</p>
              <div className="w-full mt-auto">
                {canDeployPro ? (
                    <RequestDeployment botId={botId} botName={botName} platform="MetaTrader 5" />
                ) : (
                    <Button onClick={() => router.push('/pricing')} variant="locked" className="w-full text-xs">Requires Pro Plan</Button>
                )}
              </div>
            </div>

            {/* NinjaTrader Card */}
            <div className="bg-[#0F1115] border border-gray-800 rounded-2xl p-6 flex flex-col items-center text-center hover:border-green-500/50 transition-colors group">
              <div className="w-14 h-14 bg-green-900/10 rounded-full flex items-center justify-center text-green-500 mb-4 group-hover:scale-110 transition-transform"><Cpu className="w-7 h-7" /></div>
              <h3 className="text-xl font-bold mb-2">NinjaTrader 8</h3>
              <p className="text-sm text-gray-400 mb-6 flex-1">C# Strategy (.CS)</p>
              <div className="w-full mt-auto">
                {canDeployPro ? (
                    <RequestDeployment botId={botId} botName={botName} platform="NinjaTrader 8" />
                ) : (
                    <Button onClick={() => router.push('/pricing')} variant="locked" className="w-full text-xs">Requires Pro Plan</Button>
                )}
              </div>
            </div>
        </div>

        {/* Expert Review Section */}
        <div className="mt-8 bg-gradient-to-r from-purple-900/10 to-blue-900/10 border border-purple-500/20 rounded-2xl p-6 relative overflow-hidden group">
            <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="w-16 h-16 bg-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-purple-500/30">
                <Crown className="w-8 h-8 text-purple-400" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h4 className="text-lg font-bold text-white mb-2">Professional Strategy Review</h4>
                <p className="text-sm text-gray-400 mb-4 max-w-2xl">
                  Get your strategy reviewed by a qualified quant. Includes parameter optimization suggestions and code validation.
                </p>
                <button 
                  onClick={handleAudit}
                  disabled={isCheckingOut}
                  className="inline-flex items-center justify-center h-12 px-8 text-sm font-bold bg-white text-black rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-900/20"
                >
                  {isCheckingOut ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Request Expert Review - $49
                    </>
                  )}
                </button>
              </div>
            </div>
        </div>
    </div>
  );
};

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function BotBuilderPage() {
  const router = useRouter();
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<'build' | 'deploy'>('build');
  
  const { bots, loading: checkingLimit } = useBots();
  const [realPlan, setRealPlan] = useState<string | null>(null);
  const [checkingSub, setCheckingSub] = useState(true);

  // Configuration matching Python backend
  const [config, setConfig] = useState({
    symbol: 'ES.c.0',
    indicator: 'rsi',
    timeframe: '1D',
    period: 14,
    buy_threshold: 30,
    sell_threshold: 70,
    start_date: '2024-01-01',
    end_date: '2024-06-01'
  });

  const [strategyInput, setStrategyInput] = useState('');
  const [botName, setBotName] = useState('');
  const [savedBotId, setSavedBotId] = useState<string | null>(null);
  const [generatedStrategy, setGeneratedStrategy] = useState<any>(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [step, setStep] = useState<1 | 2>(1);

  // Clear generated strategy when user types new text
  useEffect(() => {
    if (generatedStrategy) {
      setGeneratedStrategy(null);
    }
  }, [strategyInput]);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: subs } = await supabase
          .from('subscriptions')
          .select('plan_id, status')
          .eq('user_id', user.id)
          .in('status', ['active', 'trialing'])
          .single();
        setRealPlan(subs ? subs.plan_id : 'free');
      } catch (e) {
        setRealPlan('free');
      } finally {
        setCheckingSub(false);
      }
    };
    fetchPlan();
  }, [supabase]);

  const isFree = !realPlan || realPlan === 'free';
  const limitReached = isFree && bots.length >= 1;

  if (checkingLimit || checkingSub) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-sm text-gray-500">Loading Account...</span>
      </div>
    );
  }

  if (limitReached && !savedBotId) return <UpgradeWall router={router} />;

  const handleSelectTemplate = (t: any) => {
    setStrategyInput(t.title === 'Custom' ? '' : `Create a ${t.title} strategy.`);
    setBotName(t.title === 'Custom' ? 'My Strategy' : `${t.title} Bot`);
    
    if (t.indicator) {
      setConfig(prev => ({
        ...prev,
        indicator: t.indicator.toLowerCase(),
        period: t.period || 14,
        buy_threshold: t.buy || 30,
        sell_threshold: t.sell || 70
      }));
    }
    setStep(2);
  };

  const handleSaveBot = async () => {
    // 1. Validation
    if (!result) return toast.error("Please run a backtest first to validate the strategy.");
    if (!botName) return toast.error("Please name your strategy before saving.");
    
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in');

      // 2. Prepare Data
      // FIX: Removed last_backtest_result as it does not exist in the schema
      const botData = {
        user_id: user.id,
        name: botName,
        description: strategyInput || 'No description',
        strategy_prompt: config, 
        symbol: config.symbol,
        status: 'active'
        // last_backtest_result: result.metrics // <-- REMOVED THIS LINE
      };

      if (savedBotId) {
        // Update existing
        const { error } = await supabase
          .from('bots')
          .update(botData)
          .eq('id', savedBotId);
        if (error) throw error;
      } else {
        // Insert new
        const { data: newBot, error } = await supabase
          .from('bots')
          .insert(botData)
          .select()
          .single();
        if (error) throw error;
        if (newBot) setSavedBotId(newBot.id);
      }
      toast.success('Strategy Saved Successfully');
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to save strategy', { description: err.message || err.details });
    } finally {
      setSaving(false);
    }
  };

  const handleRunBacktest = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:8000';

      let backendUrl;
      let requestBody;
      let strategyToUse = generatedStrategy;

      // 1. AI STRATEGY GENERATION
      if (strategyInput.trim().length > 5 && !strategyToUse) {
        try {
            const aiResponse = await fetch('/api/parse/strategy', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    prompt: strategyInput,
                    timeframe: config.timeframe
                })
            });

            const aiData = await aiResponse.json();

            if (!aiResponse.ok) {
                throw new Error(aiData.error || "AI Strategy Generation Failed");
            }

            if (aiData.success && aiData.strategy) {
                strategyToUse = aiData.strategy;
                setGeneratedStrategy(strategyToUse);
                toast.success(`AI Generated: ${strategyToUse.name}`);
            } else {
                throw new Error("AI response was empty or invalid");
            }
        } catch (aiErr: any) {
            console.error("AI Generation Failed:", aiErr);
            toast.error("AI Generation Failed", { description: aiErr.message });
            setLoading(false);
            return;
        }
      }

      // 2. PREPARE PYTHON BACKEND PAYLOAD
      if (strategyToUse) {
        // AI Route
        backendUrl = `${API_URL}/api/backtest/ai`;
        requestBody = {
          symbol: config.symbol,
          strategy: strategyToUse,
          start_date: config.start_date,
          end_date: config.end_date,
          timeframe: config.timeframe,
          initial_capital: 100000,
          risk_per_trade: 0.01
        };
      } else {
        // Manual Route (Sliders)
        backendUrl = `${API_URL}/api/backtest/professional`;
        requestBody = {
          symbol: config.symbol,
          indicator: config.indicator.toLowerCase(),
          period: Number(config.period),
          buy_threshold: Number(config.buy_threshold),
          sell_threshold: Number(config.sell_threshold),
          start_date: config.start_date,
          end_date: config.end_date,
          timeframe: config.timeframe,
          initial_capital: 100000,
          stop_loss_pct: 0.02,
          take_profit_pct: 0.04,
          commission: 2.50,
          slippage_pct: 0.05
        };
      }

      // 3. EXECUTE SIMULATION
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(errorData.detail || `Backtest failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.metrics || !data.trades) {
          throw new Error("Invalid response format from backtest engine");
      }

      setResult(data);
      toast.success(`Simulation Complete: ${data.metrics.totalTrades} trades`);

    } catch (err: any) {
      console.error("Backtest Error:", err);
      if (err.message.includes('fetch') || err.message.includes('connect')) {
        setError("Connection Failed. Is the Python backend running on port 8000?");
      } else {
        setError(err.message || "Simulation failed");
      }
      toast.error('Backtest Failed', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (step === 1) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10">
            <button onClick={() => router.push('/dashboard')} className="text-gray-400 hover:text-white flex items-center gap-2 mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4"/> Back to Dashboard
            </button>
            <h1 className="text-4xl font-bold mb-2">Strategy Lab</h1>
            <p className="text-gray-400">Choose a foundation for your algorithmic trading strategy.</p>
          </div>
          <TemplateMarketplace onSelectTemplate={handleSelectTemplate} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* HEADER */}
      <header className="h-16 border-b border-gray-800 bg-[#0A0A0A]/80 backdrop-blur-md flex items-center px-6 sticky top-0 z-50">
        <div className="flex items-center gap-4 w-1/3">
          <button onClick={() => setStep(1)} className="text-gray-400 hover:text-white flex items-center gap-2 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Templates
          </button>
          <div className="h-4 w-px bg-gray-800"></div>
          <span className="text-sm font-semibold text-gray-200">{botName}</span>
        </div>
        
        <div className="flex-1 flex justify-center">
          <div className="bg-gray-900 p-1 rounded-xl flex gap-1 border border-gray-800">
            <button 
                onClick={() => setActiveTab('build')} 
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'build' ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
            >
              1. Build & Test
            </button>
            <button 
                onClick={() => setActiveTab('deploy')} 
                disabled={!result && !savedBotId} 
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'deploy' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed'}`}
            >
              2. Go Live
            </button>
          </div>
        </div>
        
        <div className="w-1/3 flex justify-end">
          <Button 
            onClick={handleSaveBot} 
            isLoading={saving} 
            disabled={!result} 
            variant="primary"
            size="sm" 
            className="shadow-lg shadow-blue-900/20"
          >
            <Save className="w-4 h-4 mr-2" /> 
            {savedBotId ? 'Update Strategy' : 'Save Strategy'}
          </Button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {activeTab === 'build' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* LEFT SIDEBAR CONTROLS */}
            <div className="lg:col-span-4 space-y-6">
              <Card title="Definition" icon={<Sparkles className="w-4 h-4"/>}>
                <StrategyInput value={strategyInput} onChange={setStrategyInput} />
              </Card>
              <Card title="Market Settings" icon={<Settings className="w-4 h-4"/>}>
                <MarketConfig config={config} setConfig={setConfig} />
              </Card>
              <Card title="Parameters" icon={<SlidersHorizontal className="w-4 h-4"/>}>
                <ParameterTuning config={config} setConfig={setConfig} />
              </Card>
              <Button onClick={handleRunBacktest} isLoading={loading} className="w-full h-14 text-lg shadow-blue-500/20">
                <Play className="w-5 h-5 mr-2 fill-current" /> Run Simulation
              </Button>
            </div>
            
            {/* RIGHT RESULTS AREA */}
            <div className="lg:col-span-8">
              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-3 animate-in slide-in-from-top-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" /> 
                  <div>
                    <p className="font-bold text-sm">Simulation Error</p>
                    <p className="text-xs opacity-80">{error}</p>
                  </div>
                </div>
              )}
              
              {!result ? (
                // EMPTY STATE
                <div className="h-[600px] bg-[#0F1115] border border-gray-800 border-dashed rounded-2xl flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mb-6 border border-gray-800">
                        <BarChart3 className="w-10 h-10 text-gray-700" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-400">Strategy Lab Ready</h3>
                    <p className="text-sm mt-2 text-gray-600 max-w-xs text-center">
                        Configure your settings on the left and click "Run Simulation" to generate professional-grade backtests.
                    </p>
                  </div>
                </div>
              ) : (
                // RESULTS DASHBOARD
                <div className="space-y-6 animate-fade-in">
                  <BacktestMetrics metrics={result.metrics} />
                  
                  {/* Performance Chart */}
                  <div className="bg-[#0F1115] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="px-6 py-4 border-b border-gray-800/50 bg-gradient-to-r from-gray-900/50 to-transparent flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                            <LineChart className="w-5 h-5 text-blue-400" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-white">Equity & Price Action</h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {config.symbol} • {config.timeframe} • {config.period} Period
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-4">
                             <div className="text-right">
                                <span className="text-xs text-gray-500 block">Net Profit</span>
                                <span className={`text-sm font-bold ${result.metrics.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                    ${Number(result.metrics.netProfit).toLocaleString()}
                                </span>
                             </div>
                        </div>
                    </div>
                    
                    {result.chartImage && (
                      <div className="relative bg-[#050505] p-2 min-h-[500px] flex items-center justify-center">
                        <div className="relative w-full h-[500px]">
                          <Image 
                            src={result.chartImage} 
                            alt="Backtest Performance Chart" 
                            fill
                            className="object-contain"
                            unoptimized 
                            priority
                          />
                        </div>
                      </div>
                    )}

                    <div className="bg-gray-900/50 border-t border-gray-800 p-3 flex justify-between items-center text-xs text-gray-500">
                         <div className="flex gap-4">
                            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Equity</span>
                            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-white/50"></div> Price</span>
                         </div>
                         <div className="font-mono">ID: {result.runId || 'LOCAL_TEST'}</div>
                    </div>
                  </div>

                  {/* Trade History Table */}
                  {result.trades && result.trades.length > 0 && (
                    <div className="bg-[#0F1115] border border-gray-800 rounded-2xl overflow-hidden">
                      <div className="px-6 py-4 border-b border-gray-800/50 bg-gradient-to-r from-gray-900/50 to-transparent flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-purple-400" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-white">Trade Blotter</h3>
                            <p className="text-xs text-gray-500 mt-0.5">Executed Trades</p>
                          </div>
                        </div>
                        <Badge variant="blue">{result.trades.length} Trades</Badge>
                      </div>
                      
                      <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        <table className="w-full">
                          <thead className="sticky top-0 bg-[#0F1115] z-10 shadow-sm">
                            <tr className="text-xs text-gray-500 border-b border-gray-800">
                              <th className="px-6 py-3 text-left font-semibold">Time</th>
                              <th className="px-6 py-3 text-left font-semibold">Side</th>
                              <th className="px-6 py-3 text-right font-semibold">Entry</th>
                              <th className="px-6 py-3 text-right font-semibold">Exit</th>
                              <th className="px-6 py-3 text-right font-semibold">P&L</th>
                              <th className="px-6 py-3 text-left font-semibold pl-8">Reason</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-800/50">
                            {result.trades.slice(0, 100).map((trade, idx) => {
                              const entryPrice = trade.entry_price ?? trade.entryPrice ?? 0;
                              const exitPrice = trade.exit_price ?? trade.exitPrice ?? 0;
                              const pnl = trade.pnl ?? 0;
                              const type = trade.type || 'UNKNOWN';
                              const reason = trade.exit_reason || trade.result || '-';
                              const isWin = pnl > 0;
                              
                              const dateRaw = trade.entry_time || trade.date;
                              const dateDisplay = dateRaw ? new Date(dateRaw).toLocaleString() : '-';

                              return (
                                <tr key={idx} className="text-sm hover:bg-gray-900/50 transition-colors group">
                                  <td className="px-6 py-3 text-gray-400 font-mono text-xs whitespace-nowrap">{dateDisplay}</td>
                                  <td className="px-6 py-3">
                                    <Badge variant={type === 'LONG' ? 'green' : 'red'}>{type}</Badge>
                                  </td>
                                  <td className="px-6 py-3 text-right font-mono text-gray-300">${Number(entryPrice).toFixed(2)}</td>
                                  <td className="px-6 py-3 text-right font-mono text-gray-300">${Number(exitPrice).toFixed(2)}</td>
                                  <td className={`px-6 py-3 text-right font-mono font-bold ${isWin ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {isWin ? '+' : ''}{Number(pnl).toFixed(2)}
                                  </td>
                                  <td className="px-6 py-3 pl-8 text-xs text-gray-500 group-hover:text-gray-300">{reason}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'deploy' && (
            <DeploymentScreen 
                botId={savedBotId} 
                botName={botName} 
                plan={realPlan}
                onSave={handleSaveBot}
                isSaving={saving}
            />
        )}
      </main>
    </div>
  );
}