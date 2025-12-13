'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBots } from '@/hooks/useBots';
import { createClient } from '@/lib/supabase/client'; 
import { Button } from '@/components/ui/button';
import { Plus, ArrowRight, BarChart3, Activity, Zap, Loader2, Crown, HelpCircle } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const { bots, loading: botsLoading } = useBots();
  
  // ⭐ STATE: Track Real Subscription Plan
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [planLoading, setPlanLoading] = useState(true);

  // ⭐ FETCH: Get Plan Directly from DB
  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: sub } = await supabase
          .from('subscriptions')
          .select('plan_id')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single();

        setCurrentPlan(sub?.plan_id || 'free');
      } catch (e) {
        console.error("Dashboard Plan Fetch Error:", e);
        setCurrentPlan('free');
      } finally {
        setPlanLoading(false);
      }
    };
    fetchPlan();
  }, []);

  // Show ALL bots in recent list (Draft or Active)
  const recentBots = bots ? bots.slice(0, 4) : [];

  const handleCreateBot = () => router.push('/bots/new');
  // Navigate to bot detail (Edit/View logic is handled there based on plan)
  const handleViewBot = (botId: string) => router.push(`/bots/${botId}`);

  // Helper to format plan name
  const formatPlanName = (plan: string) => {
    if (!plan || plan === 'free') return 'Free Tier';
    return plan.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  if (botsLoading || planLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
           <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
           <p className="text-gray-400 font-mono">LOADING DASHBOARD...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Welcome Banner */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Dashboard</h1>
            <p className="text-gray-400 text-sm">Overview of your strategies.</p>
          </div>
          <div className="flex items-center gap-3">
            {/* ⭐ REQUEST HELP BUTTON with Subject Line */}
            <Button 
              variant="secondary" 
              onClick={() => window.location.href = 'mailto:info@lepaleshadow.com?subject=Botman%20AI%20Help%20request'}
              className="border-gray-700 hover:bg-gray-800"
            >
              <HelpCircle className="w-4 h-4 mr-2" /> Request Help
            </Button>
            
            <Button onClick={handleCreateBot} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" /> New Strategy
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="text-gray-500 text-xs font-bold uppercase mb-2">Total Bots</div>
              <div className="text-3xl font-bold text-white">{bots.length}</div>
           </div>
           
           <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="text-gray-500 text-xs font-bold uppercase mb-2">Active</div>
              <div className="text-3xl font-bold text-emerald-400">{bots.filter(b => b.status === 'active').length}</div>
           </div>
           
           {/* ⭐ DYNAMIC PLAN CARD */}
           <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="text-gray-500 text-xs font-bold uppercase mb-2">Current Plan</div>
              <div className="text-xl font-bold text-white flex items-center gap-2">
                {currentPlan === 'free' ? (
                    <>
                        <Zap className="w-5 h-5 text-gray-500" /> 
                        <span>Free Tier</span>
                    </>
                ) : (
                    <>
                        <Crown className="w-5 h-5 text-yellow-400" />
                        <span className="bg-gradient-to-r from-yellow-200 to-yellow-500 bg-clip-text text-transparent">
                            {formatPlanName(currentPlan || 'free')}
                        </span>
                    </>
                )}
              </div>
           </div>
        </div>

        {/* Recent Bots */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Recent Strategies</h2>
          
          {recentBots.length === 0 ? (
            <div className="bg-gray-900/30 border-2 border-dashed border-gray-800 rounded-xl p-12 text-center">
               <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-600" />
               <h3 className="text-white font-bold mb-1">No bots found</h3>
               <p className="text-gray-500 text-sm mb-4">Create your first strategy to get started.</p>
               <Button variant="outline" onClick={handleCreateBot}>Create Bot</Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {recentBots.map((bot: any) => (
                <div 
                  key={bot.id} 
                  onClick={() => handleViewBot(bot.id)}
                  className="bg-gray-900/50 border border-gray-800 hover:border-blue-500/50 p-5 rounded-xl cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 font-bold">
                          {bot.name ? bot.name.charAt(0).toUpperCase() : '?'}
                      </div>
                      <div>
                          <h4 className="font-bold text-white">{bot.name || 'Untitled Bot'}</h4>
                          <div className="flex items-center gap-2 text-xs text-gray-500 font-mono mt-1">
                             <span>{bot.symbol || 'ES.c.0'}</span>
                             <span>•</span>
                             <span className={bot.status === 'active' ? 'text-green-500' : 'text-gray-500'}>
                                {bot.status ? bot.status.toUpperCase() : 'DRAFT'}
                             </span>
                          </div>
                      </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Visual indicator that editing is unlocked for paid users */}
                    {currentPlan !== 'free' && (
                        <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-1 rounded border border-blue-500/20 font-medium">
                            EDITABLE
                        </span>
                    )}
                    <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-blue-500 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}