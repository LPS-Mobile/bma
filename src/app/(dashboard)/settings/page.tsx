'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { 
  User, CreditCard, Activity, Zap, LogOut, Loader2, ArrowLeft 
} from 'lucide-react';
import Link from 'next/link';

// ==========================================
// 1. UI COMPONENTS
// ==========================================

const Button = ({ variant = 'primary', size = 'md', className = '', children, onClick, disabled, isLoading, ...props }: any) => {
  const base = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed";
  const variants: any = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-900/20",
    secondary: "bg-gray-800 text-white hover:bg-gray-700 border border-gray-700",
    danger: "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20",
    ghost: "hover:bg-gray-800 text-gray-400 hover:text-white",
    outline: "border border-gray-600 text-gray-300 hover:border-gray-500 hover:bg-gray-800"
  };
  const sizes: any = { sm: "h-8 px-3 text-xs", md: "h-10 px-4 py-2 text-sm", icon: "h-10 w-10" };
  return (
    <button 
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${base} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
};

const Card = ({ children, className = "" }: any) => (
  <div className={`bg-gray-900 border border-gray-800 rounded-xl overflow-hidden ${className}`}>{children}</div>
);

const Input = ({ label, ...props }: any) => (
  <div className="space-y-1.5">
    <label className="text-sm text-gray-400 font-medium">{label}</label>
    <input 
      className="w-full bg-black/50 border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none transition-all disabled:opacity-50"
      {...props} 
    />
  </div>
);

const Select = ({ label, options, ...props }: any) => (
  <div className="space-y-1.5">
    <label className="text-sm text-gray-400 font-medium">{label}</label>
    <div className="relative">
      <select 
        className="w-full bg-black/50 border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none appearance-none"
        {...props}
      >
        {options.map((opt: any) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <div className="absolute right-3 top-3 pointer-events-none text-gray-500">▼</div>
    </div>
  </div>
);

const Badge = ({ children, variant = 'default' }: any) => {
  const styles: any = {
    default: "bg-gray-800 text-gray-300",
    success: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    blue: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  };
  return <span className={`px-2 py-1 rounded text-xs font-mono border ${styles[variant] || styles.default}`}>{children}</span>;
};

// ==========================================
// 3. MAIN SETTINGS PAGE
// ==========================================

// FIX 1: Define interface to allow 'renews' to be string OR null
interface SubscriptionState {
  plan: string;
  status: string;
  renews: string | null;
}

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  
  // Profile State
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    experience: 'beginner',
    risk: 'medium',
    exchange: 'tradingview',
    preferred_asset: ''
  });

  // Subscription State
  // FIX 2: Apply the interface here so TS knows 'renews' can change from null to string later
  const [subscription, setSubscription] = useState<SubscriptionState>({
    plan: 'free',
    status: 'inactive',
    renews: null
  });

  // 1. Fetch Data on Mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }
        setUser(user);

        // Fetch public profile (metadata)
        const { data: publicProfile } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        // Fetch subscription
        const { data: subs } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single();

        // Update State
        setProfile({
            full_name: publicProfile?.full_name || user.user_metadata?.full_name || '',
            email: user.email || '',
            experience: publicProfile?.experience || 'beginner', 
            risk: publicProfile?.risk || 'medium',
            exchange: publicProfile?.exchange || 'tradingview',
            preferred_asset: publicProfile?.preferred_asset || ''
        });

        if (subs) {
            setSubscription({
                plan: subs.plan_id || 'free',
                status: subs.status,
                renews: subs.current_period_end ? new Date(subs.current_period_end).toLocaleDateString() : null
            });
        }

      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router, supabase]);


  // 2. Handle Save
  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
        const { error } = await supabase
            .from('users')
            .update({
                full_name: profile.full_name,
                // Add other fields here if they exist in your DB schema
                // experience: profile.experience,
                // risk: profile.risk,
                // exchange: profile.exchange
            })
            .eq('id', user.id);

        if (error) throw error;
        toast.success('Profile updated successfully');
    } catch (error: any) {
        toast.error('Failed to save profile', { description: error.message });
    } finally {
        setSaving(false);
    }
  };

  // 3. Handle Upgrade
  const handleUpgrade = async (priceId: string, planName: string) => {
    if (!priceId) return;
    setIsUpgrading(planName);
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, planName }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Checkout failed');
      if (data.url) window.location.href = data.url;
    } catch (error) {
      toast.error('Upgrade failed. Try again.');
      setIsUpgrading(null);
    }
  };

  // 4. Handle Sign Out (Fixed)
  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await supabase.auth.signOut();
      toast.success('Signed out successfully');
      router.push('/'); // Force redirect to home/login
    } catch (error) {
      console.error('Sign out error', error);
      toast.error('Error signing out');
    } finally {
      setIsSigningOut(false);
    }
  };

  if (loading) {
      return (
          <div className="min-h-screen bg-black flex items-center justify-center text-white">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        
        {/* Header Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Back Button */}
            <Link href="/dashboard">
              <Button variant="outline" size="icon" className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold mb-1">Account Settings</h1>
              <p className="text-gray-400 text-sm">Manage your profile, trading preferences, and subscription.</p>
            </div>
          </div>
          
          {/* Sign Out Button */}
          <Button 
            variant="danger" 
            size="sm" 
            onClick={handleSignOut} 
            isLoading={isSigningOut}
            className="w-full md:w-auto"
          >
             <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Summary Card */}
          <div className="space-y-6">
            <Card className="p-6 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold uppercase text-white">
                {profile.full_name ? profile.full_name.charAt(0) : user?.email?.charAt(0)}
              </div>
              <h2 className="text-lg font-bold">{profile.full_name || 'Anonymous Trader'}</h2>
              <p className="text-sm text-gray-400 mb-4">{profile.email}</p>
              <Badge variant={subscription.status === 'active' ? 'success' : 'default'}>
                {subscription.plan === 'free' ? 'FREE TIER' : subscription.plan.toUpperCase()}
              </Badge>
            </Card>

            <nav className="space-y-1">
              <button className="w-full flex items-center gap-3 px-4 py-3 bg-gray-800/50 text-white rounded-lg text-sm font-medium border border-gray-700">
                <User className="w-4 h-4" /> Profile & Trading
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800/30 rounded-lg text-sm font-medium transition-colors">
                <CreditCard className="w-4 h-4" /> Subscription
              </button>
            </nav>
          </div>

          {/* RIGHT COLUMN: Forms */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* 1. PROFILE SECTION */}
            <section>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-500" /> Profile Details
              </h3>
              <Card className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input 
                    label="Full Name" 
                    value={profile.full_name} 
                    onChange={(e: any) => setProfile({...profile, full_name: e.target.value})} 
                  />
                  <Input 
                    label="Email Address" 
                    value={profile.email} 
                    disabled 
                    className="opacity-50 cursor-not-allowed"
                  />
                </div>
                <div className="pt-4 flex justify-end">
                  <Button onClick={handleSave} disabled={saving} isLoading={saving}>
                    Save Changes
                  </Button>
                </div>
              </Card>
            </section>

            {/* 2. TRADING PREFERENCES */}
            <section>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-500" /> Trading Profile
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                These settings help the AI generator tailor strategies to your style.
              </p>
              <Card className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select 
                    label="Experience Level"
                    value={profile.experience}
                    onChange={(e: any) => setProfile({...profile, experience: e.target.value})}
                    options={[
                      { value: 'beginner', label: 'Beginner (0-1 years)' },
                      { value: 'intermediate', label: 'Intermediate (1-3 years)' },
                      { value: 'advanced', label: 'Advanced (3+ years)' },
                      { value: 'pro', label: 'Professional Trader' },
                    ]}
                  />
                  <Select 
                    label="Risk Tolerance"
                    value={profile.risk}
                    onChange={(e: any) => setProfile({...profile, risk: e.target.value})}
                    options={[
                      { value: 'low', label: 'Low - Capital Preservation' },
                      { value: 'medium', label: 'Medium - Balanced Growth' },
                      { value: 'high', label: 'High - Aggressive Growth' },
                    ]}
                  />
                  <Select 
                    label="Primary Exchange"
                    value={profile.exchange}
                    onChange={(e: any) => setProfile({...profile, exchange: e.target.value})}
                    options={[
                      { value: 'tradingview', label: 'TradingView' },
                      { value: 'metatrader', label: 'MetaTrader' },
                      { value: 'ninjatrader', label: 'NinjaTrader' },
                    ]}
                  />
                  <Input 
                    label="Preferred Asset Class" 
                    placeholder="e.g. Crypto, Forex, Stocks"
                    value={profile.preferred_asset}
                    onChange={(e: any) => setProfile({...profile, preferred_asset: e.target.value})}
                  />
                </div>
                
                {/* Dynamic Tip based on experience */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-sm text-blue-300 flex gap-3">
                  <Zap className="w-5 h-5 flex-shrink-0" />
                  <p>
                    {profile.experience === 'beginner' 
                        ? 'AI Tip: For beginners, the bot builder prioritizes risk management and simpler moving average strategies.'
                        : 'AI Tip: Your experience level unlocks advanced indicators like Ichimoku Cloud and Bollinger Bands automatically.'}
                  </p>
                </div>
                
                <div className="pt-2 flex justify-end">
                  <Button onClick={handleSave} variant="secondary" disabled={saving}>
                    Update Preferences
                  </Button>
                </div>
              </Card>
            </section>

            {/* 3. SUBSCRIPTION SECTION */}
            <section>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-purple-500" /> Subscription
              </h3>
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-800">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Current Plan</div>
                    <div className="text-2xl font-bold text-white flex items-center gap-2 uppercase">
                      {subscription.plan} 
                      {subscription.status === 'active' && <Badge variant="success">Active</Badge>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400 mb-1">Renews</div>
                    <div className="font-mono text-white">{subscription.renews || 'N/A'}</div>
                  </div>
                </div>

                {/* Plan Options */}
                <div className="space-y-4 mb-6">
                  <h4 className="text-sm font-medium text-gray-300">Available Upgrades</h4>
                  
                  {/* Builder Plan */}
                  <div className="flex items-center justify-between p-4 bg-gray-800/30 border border-gray-800 rounded-lg hover:border-gray-700 transition-colors">
                    <div>
                      <div className="font-bold text-white">Builder Plan</div>
                      <div className="text-sm text-gray-400">Unlimited bots + TradingView Export</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-lg">$49<span className="text-sm text-gray-500">/mo</span></span>
                      <Button 
                        size="sm" 
                        onClick={() => handleUpgrade('price_1SJd1hDATCpMStKajg0ByEXv', 'builder')}
                        isLoading={isUpgrading === 'builder'}
                        disabled={isUpgrading !== null || subscription.plan === 'builder'}
                      >
                        {subscription.plan === 'builder' ? 'Current' : 'Upgrade'}
                      </Button>
                    </div>
                  </div>

                  {/* Live Trader Plan */}
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-900/10 to-emerald-900/10 border border-blue-500/20 rounded-lg hover:border-blue-500/40 transition-colors">
                    <div>
                      <div className="font-bold text-white flex items-center gap-2">
                        Live Trader <Zap className="w-3 h-3 text-yellow-400 fill-current" />
                      </div>
                      <div className="text-sm text-gray-400">Live Deployment + Webhooks</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-lg">$99<span className="text-sm text-gray-500">/mo</span></span>
                      <Button 
                        size="sm" 
                        variant="primary"
                        onClick={() => handleUpgrade('price_1SJd29DATCpMStKa9wc05i4L', 'live_trader')}
                        isLoading={isUpgrading === 'live_trader'}
                        disabled={isUpgrading !== null || subscription.plan === 'live_trader'}
                      >
                         {subscription.plan === 'live_trader' ? 'Current' : 'Upgrade'}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button className="text-sm text-red-400 hover:text-red-300 underline decoration-dotted">
                    Cancel Subscription
                  </button>
                  <div className="text-xs text-gray-500">
                    Payments secured by Stripe
                  </div>
                </div>
              </Card>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}