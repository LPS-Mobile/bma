'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useSubscription } from '@/hooks/useSubscription'; 
import { 
  Sparkles, Settings, TrendingUp, BarChart3, 
  Share2, Play, Lock, AlertCircle, ArrowLeft, 
  Calendar, Rocket, Crown, Eye, DollarSign, Percent,
  Loader2 
} from 'lucide-react';

// --- ENGINE IMPORTS ---
import { BacktestEngine } from '@/lib/backtesting/engine';
import { SMA, crossover, crossunder } from '@/lib/backtesting/indicators';
import { StrategyFunction, BacktestResult, Candle, Trade } from '@/types/backtest.types';

// --- VISUALS ---
import BacktestMetrics from '@/components/bots/BacktestMetrics';
import EquityCurveChart from '@/components/bots/EquityCurveChart';
import TradeDetailModal from '@/components/bots/TradeDetailModal';

// ... (UI Components) ...
const Button = ({ variant = 'primary', size = 'md', className = '', children, onClick, isLoading, disabled, ...props }: any) => {
  const base = "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 focus:outline-none active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants: any = {
    primary: "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/20",
    secondary: "bg-gray-800 text-gray-200 hover:bg-gray-700 border border-gray-700",
    success: "bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-900/20",
    locked: "bg-gray-900 text-gray-500 border border-gray-800 border-dashed cursor-not-allowed",
    premium: "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg shadow-purple-900/20 border-0",
  };
  const sizes: any = { sm: "h-9 px-4 text-sm", md: "h-12 px-6 text-base", lg: "h-14 px-8 text-lg" };
  return <button onClick={onClick} disabled={disabled || isLoading} className={`${base} ${variants[disabled ? 'locked' : variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`} {...props}>{isLoading ? 'Processing...' : children}</button>;
};

const Card = ({ children, className = "", title, icon, isLocked }: any) => (
  <div className={`bg-[#0F1115] border border-gray-800 rounded-2xl overflow-hidden ${className} ${isLocked ? 'opacity-75' : ''}`}>
    {title && (
      <div className="px-5 py-3 border-b border-gray-800/50 bg-gray-900/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
            {icon && <span className="text-gray-400">{icon}</span>}
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">{title}</h3>
        </div>
        {isLocked && <Lock className="w-3 h-3 text-amber-500" />}
      </div>
    )}
    <div className="p-5 relative">
        {children}
        {isLocked && (
             <div className="absolute inset-0 z-10 bg-transparent cursor-not-allowed" title="Upgrade to edit"></div>
        )}
    </div>
  </div>
);

const StrategyInput = ({ value, isLocked }: any) => (
    <div className="relative bg-gray-950 border border-gray-800 rounded-xl p-1">
      <textarea 
        disabled={true} 
        className={`w-full h-32 bg-transparent rounded-lg p-3 text-sm text-white focus:outline-none resize-none ${isLocked ? 'text-gray-500' : ''}`}
        value={value || ''}
        readOnly
      />
      <div className="px-3 py-2 flex items-center justify-between border-t border-gray-800/50">
        <div className="flex items-center gap-2 text-[10px] text-gray-500">
            {isLocked ? <span className="flex items-center gap-1 text-amber-500"><Lock className="w-3 h-3" /> Logic Locked</span> : <span>Read Only</span>}
        </div>
      </div>
    </div>
);

const MarketConfig = ({ symbol, capital, risk, startDate, endDate, isLocked }: any) => (
  <div className="space-y-5">
    <div className="grid grid-cols-2 gap-4">
        <div>
            <label className="text-[10px] uppercase text-gray-500 font-bold mb-1.5 block">Asset</label>
            <div className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-gray-400 font-mono">
                {symbol}
            </div>
        </div>
        <div>
            <label className="text-[10px] uppercase text-gray-500 font-bold mb-1.5 block">Account Size</label>
            <div className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-gray-400 font-mono">
                ${capital}
            </div>
        </div>
    </div>
    <div>
        <label className="text-[10px] uppercase text-gray-500 font-bold mb-1.5 block">Risk Per Trade</label>
        <div className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-gray-400 font-mono flex justify-between">
            {risk} <span>%</span>
        </div>
    </div>
    <div>
        <label className="text-[10px] uppercase text-gray-500 font-bold mb-1.5 block">Backtest Period</label>
        <div className="grid grid-cols-2 gap-2">
            <div className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-xs text-gray-500">{startDate}</div>
            <div className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-xs text-gray-500">{endDate}</div>
        </div>
    </div>
  </div>
);

const ParameterTuning = ({ parameters, isLocked }: any) => (
    <div className="space-y-4">
        {parameters && Object.entries(parameters).map(([key, param]: any) => (
            <div key={key} className={isLocked ? 'opacity-50' : ''}>
                <div className="flex justify-between mb-1">
                    <label className="text-xs text-gray-400">{param.label || key}</label>
                    <span className="text-xs font-mono text-blue-400">{param.value}</span>
                </div>
                <input 
                    type="range" min={param.min || 1} max={param.max || 100} 
                    value={param.value || 0} 
                    disabled={true} 
                    className="w-full h-1 bg-gray-800 rounded-lg appearance-none"
                />
            </div>
        ))}
    </div>
);

const TradeTable = ({ trades, onSelect }: any) => (
    <div className="bg-gray-900 p-6 rounded-lg border border-gray-800 h-96 overflow-auto">
        <table className="w-full text-sm text-left">
            <thead className="text-gray-500 border-b border-gray-800 bg-gray-900 sticky top-0">
                <tr>
                    <th className="pb-3 pl-2">Type</th>
                    <th className="pb-3">Entry</th>
                    <th className="pb-3">Exit</th>
                    <th className="pb-3 text-right pr-2">PnL</th>
                    <th className="pb-3"></th>
                </tr>
            </thead>
            <tbody>
                {trades && trades.slice().reverse().map((t:any) => (
                    <tr key={t.id} onClick={() => onSelect(t)} className="border-b border-gray-800/50 hover:bg-gray-800/80 cursor-pointer transition-colors group">
                        <td className={`py-3 pl-2 font-mono font-bold ${t.type === 'LONG' ? 'text-green-500' : 'text-red-500'}`}>{t.type}</td>
                        <td className="py-3 text-gray-300 font-mono">${t.entryPrice.toFixed(2)}</td>
                        <td className="py-3 text-gray-300 font-mono">${t.exitPrice.toFixed(2)}</td>
                        <td className={`py-3 pr-2 text-right font-mono font-bold ${t.pnl > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {t.pnl > 0 ? '+' : ''}{t.pnl.toFixed(2)}
                        </td>
                        <td className="py-3 text-gray-600 group-hover:text-blue-400"><Eye className="w-4 h-4" /></td>
                    </tr>
                ))}
            </tbody>
        </table>
        {(!trades || trades.length === 0) && <div className="text-center text-gray-500 pt-8">No trades executed</div>}
    </div>
);

// ==========================================
// 3. MAIN PAGE (DETAIL VIEW)
// ==========================================

export default function BotDetailPage({ params }: { params: Promise<{ botId: string }> }) {
  // Unwrap the Promise using React.use()
  const { botId } = React.use(params);
  
  const router = useRouter();
  const supabase = createClient();
  
  // FIX: Destructure 'subscription' and 'loading' correctly, then derive 'isFree'
  const { subscription, loading: subLoading } = useSubscription();
  const isFree = !subscription || subscription.tier === 'free_trial';
  
  const isLocked = isFree; 

  // State
  const [bot, setBot] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [rawCandles, setRawCandles] = useState<Candle[]>([]);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);

  // Default Dates
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // 1. FETCH BOT DATA
  const fetchBotData = useCallback(async () => {
    try {
       const { data, error } = await supabase.from('bots').select('*').eq('id', botId).single();
       if (error) throw error;
       setBot(data);
       
       // 2. AUTO-RUN SIMULATION
       runSimulation(data);

    } catch (err) {
       console.error("Failed to fetch bot:", err);
       router.push('/dashboard');
    } finally {
       setLoading(false);
    }
  }, [botId, router, supabase]);

  useEffect(() => {
    fetchBotData();
  }, [fetchBotData]);

  const runSimulation = async (botData: any) => {
      setSimulating(true);
      try {
          const start = weekAgo; 
          const end = yesterday;
          const symbol = botData.symbol || 'ES.c.0';
          
          const response = await fetch(`/api/market-data?symbol=${symbol}&start=${start}&end=${end}`);
          const data = await response.json();
          
          if (!data.candles) return;
          setRawCandles(data.candles);

          // Mock Logic Reconstruction (In real app, parse this from botData)
          const strategyLogic: StrategyFunction = (candle, index, allCandles) => {
              const p = botData.parameters || { fastMA: {value:9}, slowMA: {value:21} };
              const fastMA = SMA(allCandles, p.fastMA?.value || 9, index);
              const slowMA = SMA(allCandles, p.slowMA?.value || 21, index);
              if (!fastMA || !slowMA) return 'HOLD';
              if (crossover(fastMA, slowMA, 0, 0)) return 'BUY';
              if (crossunder(fastMA, slowMA, 0, 0)) return 'SELL';
              return 'HOLD';
          };

          const engine = new BacktestEngine(botData.capital || 50000);
          const results = engine.run(data.candles, strategyLogic);
          setResult(results);

      } catch (err) {
          console.error("Auto-sim failed", err);
      } finally {
          setSimulating(false);
      }
  };

  if (loading || subLoading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  );
  
  if (!bot) return null;

  return (
    <div className="min-h-screen bg-black text-white">
      
      {/* HEADER */}
      <header className="h-16 border-b border-gray-800 bg-[#0A0A0A] flex items-center px-6 sticky top-0 z-50">
         <div className="flex items-center gap-4 w-1/3">
            <button onClick={() => router.push('/dashboard')} className="text-gray-400 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors">
                <ArrowLeft className="w-4 h-4"/> Dashboard
            </button>
         </div>
         <div className="flex-1 text-center">
            <h1 className="font-bold text-sm">{bot.name}</h1>
            <span className="text-xs text-gray-500 font-mono">{bot.symbol}</span>
         </div>
         <div className="w-1/3 flex justify-end gap-2">
            {isLocked ? (
                <Button onClick={() => router.push('/pricing')} variant="premium">
                    <Crown className="w-4 h-4 mr-2" /> Upgrade to Edit
                </Button>
            ) : (
                <Button onClick={() => runSimulation(bot)} isLoading={simulating} variant="success">
                    <Play className="w-4 h-4 mr-2 fill-current" /> Re-Run
                </Button>
            )}
         </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT: CONFIG (READ ONLY) */}
            <div className="lg:col-span-4 space-y-6">
                <Card title="Logic" icon={<Sparkles className="w-4 h-4"/>} isLocked={isLocked}>
                    <StrategyInput value={bot.description} isLocked={isLocked} />
                </Card>
                <Card title="Settings" icon={<Settings className="w-4 h-4"/>} isLocked={isLocked}>
                    <MarketConfig 
                        symbol={bot.symbol} 
                        capital={bot.capital || 50000} 
                        risk={bot.risk || 1} 
                        startDate={weekAgo} 
                        endDate={yesterday} 
                        isLocked={isLocked} 
                    />
                </Card>
                <Card title="Parameters" icon={<Settings className="w-4 h-4"/>} isLocked={isLocked}>
                     <ParameterTuning parameters={bot.parameters} isLocked={isLocked} />
                </Card>
            </div>

            {/* RIGHT: RESULTS (ALWAYS VISIBLE) */}
            <div className="lg:col-span-8">
                {!result ? (
                    <div className="h-full min-h-[500px] bg-[#0F1115] border border-gray-800 border-dashed rounded-2xl flex flex-col items-center justify-center text-gray-500">
                        <BarChart3 className="w-16 h-16 mb-4 opacity-20 animate-pulse" />
                        <p>Loading Results...</p>
                    </div>
                ) : (
                    <div className="space-y-6 animate-fade-in">
                        <BacktestMetrics metrics={result.metrics} />
                        
                        <div className="bg-[#0F1115] border border-gray-800 rounded-2xl p-1">
                            <div className="h-[400px] w-full">
                                <EquityCurveChart data={result.equityCurve} />
                            </div>
                        </div>

                        <div className="bg-[#0F1115] border border-gray-800 rounded-2xl overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-800 flex justify-between">
                                <h4 className="font-bold text-sm text-gray-400 uppercase">Recent Trades</h4>
                                <span className="text-xs text-gray-500">{result.trades.length} Total</span>
                            </div>
                            <TradeTable trades={result.trades} onSelect={setSelectedTrade} />
                        </div>
                    </div>
                )}
            </div>
          </div>
      </main>

      {selectedTrade && (
         <TradeDetailModal 
            trade={selectedTrade} 
            allCandles={rawCandles}
            onClose={() => setSelectedTrade(null)} 
         />
      )}
    </div>
  );
}