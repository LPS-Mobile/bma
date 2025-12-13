'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { 
  Plus, Search, Filter, MoreVertical, Zap, Settings, 
  Download, Loader2, FileCode, BarChart3, Trash2, AlertTriangle, ArrowLeft
} from 'lucide-react';

// ==========================================
// 1. UI COMPONENTS
// ==========================================

const Button = ({ variant = 'primary', size = 'md', className = '', children, onClick, disabled, ...props }: any) => {
  const base = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none";
  const variants: any = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-900/20",
    secondary: "bg-gray-800 text-white hover:bg-gray-700 border border-gray-700",
    ghost: "hover:bg-gray-800 text-gray-400 hover:text-white",
    danger: "text-red-400 hover:bg-red-950/30 hover:text-red-300 border border-transparent hover:border-red-900/50", // ⭐ Added danger style
    outline: "border-2 border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white",
  };
  const sizes: any = { xs: "h-6 px-2 text-xs", sm: "h-8 px-3 text-xs", md: "h-10 px-4 py-2 text-sm", icon: "h-10 w-10" };
  return <button onClick={onClick} disabled={disabled} className={`${base} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`} {...props}>{children}</button>;
};

const Card = ({ children, className = "" }: any) => (
  <div className={`bg-gray-900 border border-gray-800 rounded-xl overflow-hidden ${className}`}>{children}</div>
);

const Badge = ({ children, variant = 'default' }: any) => {
  const styles: any = {
    default: "bg-gray-800 text-gray-400 border border-gray-700",
    success: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  };
  return <span className={`px-2 py-1 rounded text-xs font-mono border ${styles[variant] || styles.default}`}>{children}</span>;
};

// ==========================================
// 2. MAIN PAGE COMPONENT
// ==========================================

export default function BotsPage() {
  const router = useRouter();
  const supabase = createClient();
  
  // Real Data State
  const [bots, setBots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ⭐ FETCH REAL DATA
  const fetchBots = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
          router.push('/login');
          return;
      }

      // Fetch bots WITH their deployments
      const { data, error } = await supabase
        .from('bots')
        .select(`
          *,
          deployments(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBots(data || []);
    } catch (error) {
      console.error("Error fetching bots:", error);
      toast.error("Failed to load strategies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBots();
  }, []);

  // ⭐ DELETE FUNCTIONALITY
  const handleDelete = async (e: React.MouseEvent, botId: string) => {
    e.stopPropagation(); // Prevent card click
    if (!confirm("Are you sure you want to delete this strategy? This cannot be undone.")) return;

    setDeletingId(botId);
    try {
        const { error } = await supabase.from('bots').delete().eq('id', botId);
        if (error) throw error;

        setBots(prev => prev.filter(b => b.id !== botId));
        toast.success("Strategy deleted successfully");
    } catch (err: any) {
        toast.error("Delete failed", { description: err.message });
    } finally {
        setDeletingId(null);
    }
  };

  const handleCreate = () => {
    router.push('/bots/new');
  };

  const filteredBots = bots.filter(b => 
    b.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.symbol?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-0 hover:bg-transparent hover:text-blue-400 text-gray-500" 
                onClick={() => router.push('/dashboard')}
              >
                <ArrowLeft className="w-5 h-5 mr-1" /> Back
              </Button>
            </div>
            <h1 className="text-2xl font-bold mb-1">My Strategy Portfolio</h1>
            <p className="text-gray-400 text-sm">Manage, backtest, and deploy your automated strategies.</p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" /> Create New Bot
          </Button>
        </div>

        {/* Filters */}
        {bots.length > 0 && (
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search bots..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <Button variant="secondary" className="hidden md:flex">
              <Filter className="w-4 h-4 mr-2" /> Filter
            </Button>
          </div>
        )}

        {/* Content */}
        {filteredBots.length === 0 ? (
          // EMPTY STATE
          <div className="border border-dashed border-gray-800 rounded-xl p-12 text-center bg-gray-900/30">
            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500">
              <BarChart3 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">No bots found</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              {searchTerm ? "No strategies match your search." : "You haven't built any strategies yet. Use our AI builder to generate your first trading bot in seconds."}
            </p>
            <Button onClick={handleCreate} size="lg">
              {searchTerm ? "Clear Search" : "Start Building Now"}
            </Button>
          </div>
        ) : (
          // LIST STATE
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBots.map((bot: any) => (
              <Card key={bot.id} className="group hover:border-blue-500/50 transition-colors flex flex-col justify-between">
                <div className="p-6">
                  {/* Card Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${bot.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-gray-800 text-gray-400'}`}>
                        <Zap className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{bot.name || 'Untitled'}</h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{bot.symbol || 'N/A'}</span>
                          <span>•</span>
                          <span className="font-mono">{bot.timeframe || '1m'}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* ⭐ DELETE BUTTON */}
                    <Button 
                        variant="danger" 
                        size="icon" 
                        onClick={(e: any) => handleDelete(e, bot.id)}
                        disabled={deletingId === bot.id}
                        title="Delete Strategy"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                       {deletingId === bot.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </Button>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-4 bg-black/20 p-3 rounded-lg">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Win Rate</div>
                      <div className={`font-mono font-bold ${bot.win_rate >= 50 ? 'text-emerald-400' : 'text-gray-400'}`}>
                        {bot.win_rate ? `${bot.win_rate}%` : '-'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Net P&L</div>
                      <div className={`font-mono font-bold ${bot.net_profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {bot.net_profit ? `$${bot.net_profit}` : '-'}
                      </div>
                    </div>
                  </div>

                  {/* ⭐ DEPLOYMENT STATUS SECTION */}
                  {bot.deployments && bot.deployments.length > 0 && (
                    <div className="mb-4 space-y-2">
                      {bot.deployments.map((dep: any) => (
                        <div key={dep.id} className="text-xs bg-gray-800/50 rounded px-2 py-2 border border-gray-700/50 flex items-center justify-between">
                          
                          <div className="flex flex-col gap-0.5">
                            <span className="font-medium text-slate-200">
                              {dep.project_name || dep.platform}
                            </span>
                            <span className="flex items-center text-gray-500 text-[10px]">
                              <FileCode className="w-3 h-3 mr-1" /> 
                              {dep.platform}
                            </span>
                          </div>
                          
                          {dep.status === 'pending' ? (
                            <span className="flex items-center text-yellow-500 font-medium">
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" /> Building
                            </span>
                          ) : (
                            // ⭐ FIX: Stop propagation to prevent card click when downloading
                            <a 
                              href={dep.file_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              download
                              className="flex items-center text-emerald-400 hover:text-emerald-300 font-medium cursor-pointer transition-colors"
                              onClick={(e) => e.stopPropagation()} 
                            >
                              <Download className="w-3 h-3 mr-1" /> Download
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="px-6 py-4 border-t border-gray-800 bg-gray-900/50 flex items-center justify-between">
                  <Badge variant={bot.status === 'active' ? 'success' : 'default'}>
                    {bot.status === 'active' ? 'LIVE' : 'DRAFT'}
                  </Badge>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => router.push(`/bots/${bot.id}`)}>
                      <Settings className="w-4 h-4" />
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => router.push(`/bots/${bot.id}`)}>
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}