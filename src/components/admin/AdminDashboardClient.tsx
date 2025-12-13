'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Users, DollarSign, Activity, Search, MapPin, 
  TrendingUp, Zap, Globe, Calendar, Plus, Ban, CreditCard, Trash2, MoreHorizontal,
  FileCode, Upload, CheckCircle, Loader2, Download, RefreshCw, AlertCircle, ShieldAlert, Database,
  Wrench, User, AlertTriangle, Eye, FileUp, X
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal'; 
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription 
} from '@/components/ui/dialog'; 
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { createUser, banUser, changeUserPlan, cancelUserSubscription, syncUsers, ensureSelf } from '@/app/actions/admin';

// --- TYPES ---
interface Deployment {
  id: string;
  created_at: string;
  platform: string;
  project_name?: string;
  status: string; 
  file_url: string | null;
  bots: { name: string; logic_explanation: string | null };
  users: { email: string };
}

interface AdminDashboardProps {
  data: {
    stats: { mrr: number; totalUsers: number; activeBots: number; payingCount: number };
    topLocations: { country: string; count: number }[];
    powerUsers: any[];
    recentUsers: any[];
    allUsers: any[];
    deployments: Deployment[]; 
  };
}

// --- HELPERS ---
const sanitizeFileName = (name: string) => {
  // Replace spaces and special chars with underscores, keep extension
  return name.replace(/[^a-zA-Z0-9.-]/g, '_');
};

// --- SUB-COMPONENTS ---

const GrowthChart = () => (
  <div className="h-32 flex items-end gap-2 mt-4 px-2">
    {[35, 45, 30, 60, 75, 50, 65, 80, 95, 85, 100, 110].map((h, i) => (
      <div key={i} className="flex-1 bg-blue-500/20 hover:bg-blue-500/40 transition-all rounded-t-sm relative group">
        <div style={{ height: `${h}%` }} className="w-full bg-blue-600 rounded-t-sm relative">
           <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity font-bold">
             {h * 12}
           </div>
        </div>
      </div>
    ))}
  </div>
);

const DeploymentRow = ({ req }: { req: Deployment }) => {
  const [uploading, setUploading] = useState(false);
  const [showDetails, setShowDetails] = useState(false); 
  const fileInputRef = useRef<HTMLInputElement>(null); 
  const router = useRouter();
  const supabase = createClient();

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      // ⭐ FIX 2: Sanitize filename to prevent invalid key errors
      const safeName = sanitizeFileName(file.name);
      const fileName = `${req.id}-${safeName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('bot-exports')
        .upload(fileName, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('bot-exports')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase
        .from('deployments')
        .update({ status: 'completed', file_url: urlData.publicUrl })
        .eq('id', req.id);
      if (dbError) throw dbError;

      toast.success(`Sent ${file.name} to user!`);
      router.refresh(); 
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase() || 'unknown';
    if (s === 'pending') return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20">Pending Build</Badge>;
    if (s === 'completed') return <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">Sent</Badge>;
    return <Badge variant="outline" className="text-slate-500">{status}</Badge>;
  };

  return (
    <tr className="hover:bg-slate-800/50 group border-b border-slate-800 last:border-0">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div>
            <div className="font-medium text-white">
              {req.project_name || req.bots?.name || 'Unknown Project'}
            </div>
            <div className="flex items-center gap-2 mt-1">
               <Badge variant="outline" className="text-[10px] border-slate-700 bg-slate-900/50 px-1.5 py-0">
                  {req.platform}
               </Badge>
               {req.project_name && req.bots?.name && req.project_name !== req.bots.name && (
                  <span className="text-xs text-slate-500">from {req.bots.name}</span>
               )}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-slate-300">{req.users?.email}</div>
        <div className="text-xs text-slate-500 font-mono mt-0.5">{req.created_at.substring(0, 10)}</div>
      </td>
      <td className="px-6 py-4">
        {getStatusBadge(req.status)}
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex justify-end gap-2">
          {/* ⭐ DETAILS BUTTON */}
          <Button 
            size="sm" 
            variant="ghost" 
            className="text-slate-400 hover:text-white" 
            onClick={() => setShowDetails(true)}
            title="View Strategy Details"
          >
            <Eye className="w-4 h-4" />
          </Button>

          {req.status === 'pending' ? (
            <div className="flex justify-end relative">
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                onChange={handleFileUpload} 
                disabled={uploading}
              />
              <Button 
                size="sm" 
                variant="outline" 
                className="cursor-pointer gap-2 border-dashed border-slate-600 hover:border-slate-400 hover:bg-slate-800" 
                disabled={uploading} 
                onClick={handleUploadClick}
              >
                {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileUp className="w-3 h-3" />}
                {uploading ? 'Uploading...' : 'Upload Bot'}
              </Button>
            </div>
          ) : (
            <div className="flex justify-end">
               {req.file_url ? (
                 <a href={req.file_url} target="_blank" rel="noreferrer">
                   <Button size="sm" variant="ghost" className="text-emerald-400 hover:text-emerald-300 gap-2">
                     <CheckCircle className="w-3 h-3" /> Done
                   </Button>
                 </a>
               ) : (
                  <span className="text-xs text-slate-500">No File</span>
               )}
            </div>
          )}
        </div>

        {/* ⭐ FIX 1: MOVE DIALOG INSIDE TD TO PREVENT HYDRATION ERROR */}
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="bg-slate-950 border-slate-800 text-slate-200 max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <FileCode className="w-5 h-5 text-blue-500" />
                Build Request Details
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Review strategy requirements before building.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-500 uppercase font-bold block mb-1">Target Platform</span>
                  <span className="text-white font-medium">{req.platform}</span>
                </div>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-500 uppercase font-bold block mb-1">User Email</span>
                  <span className="text-white font-medium">{req.users?.email}</span>
                </div>
              </div>

              <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-500 uppercase font-bold block mb-2">Strategy Logic / Explanation</span>
                <div className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed font-mono bg-black/50 p-3 rounded border border-slate-800/50">
                  {req.bots?.logic_explanation || "No specific logic explanation provided by the AI."}
                </div>
              </div>

              <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-500 uppercase font-bold block mb-2">Admin Actions</span>
                <div className="flex gap-3">
                   <Button 
                      variant="outline" 
                      className="w-full gap-2 border-slate-700 hover:bg-slate-800"
                      onClick={() => {
                          setShowDetails(false);
                          handleUploadClick();
                      }}
                   >
                      <Upload className="w-4 h-4" /> Upload Build File
                   </Button>
                   <Button variant="ghost" onClick={() => setShowDetails(false)}>
                      Close
                   </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </td>
    </tr>
  );
};

// --- MAIN COMPONENT ---

export default function AdminDashboardClient({ data }: AdminDashboardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [managedUser, setManagedUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false); 

  useEffect(() => {
    console.log("Client Received Data:", data);
    console.log("Deployments Array:", data.deployments);
  }, [data]);

  const setTab = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.push(`?${params.toString()}`);
  };

  const filteredUsers = (data.allUsers || []).filter((u) => {
    const term = searchTerm.toLowerCase();
    const email = u.email?.toLowerCase() || '';
    const name = u.full_name?.toLowerCase() || '';
    return email.includes(term) || name.includes(term);
  });

  const sortedDeployments = [...(data.deployments || [])].sort((a, b) => {
    const aPending = a.status === 'pending';
    const bPending = b.status === 'pending';
    if (aPending && !bPending) return -1;
    if (!aPending && bPending) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const handleRefresh = () => {
    router.refresh();
    toast.success('Refreshing data...');
  };

  const handleSyncDatabase = async () => {
    setIsSyncing(true);
    try {
        const result = await syncUsers();
        toast.success(`Synced ${result.count} users from Auth to Database!`);
        router.refresh();
    } catch (error: any) {
        toast.error("Sync Failed", { description: error.message });
    } finally {
        setIsSyncing(false);
    }
  };

  const handleEnsureSelf = async () => {
    setIsSyncing(true);
    try {
        await ensureSelf();
        toast.success("You have been added to the database.");
        router.refresh();
    } catch (error: any) {
        toast.error("Failed to add self", { description: error.message });
    } finally {
        setIsSyncing(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      await createUser(formData);
      toast.success('User created successfully');
      setIsCreateOpen(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBan = async (userId: string) => {
    if (!confirm('Ban this user?')) return;
    try {
      await banUser(userId);
      toast.success('User banned');
      router.refresh();
    } catch (e) { toast.error('Failed to ban'); }
  };

  const handleChangePlan = async (planId: string) => {
    if (!managedUser) return;
    setIsLoading(true);
    try {
      await changeUserPlan(managedUser.id, planId);
      toast.success('Plan updated');
      setManagedUser(null);
      router.refresh();
    } catch (e) { toast.error('Failed to update plan'); }
    finally { setIsLoading(false); }
  };

  const handleCancelSub = async () => {
    if (!managedUser || !confirm('Cancel this subscription?')) return;
    setIsLoading(true);
    try {
      await cancelUserSubscription(managedUser.id);
      toast.success('Subscription canceled');
      setManagedUser(null);
      router.refresh();
    } catch (e) { toast.error('Failed to cancel'); }
    finally { setIsLoading(false); }
  };

  const KpiCard = ({ title, value, sub, icon: Icon, color }: any) => (
    <Card className="p-5 bg-slate-900 border-slate-800 relative overflow-hidden">
      <div className={`absolute top-0 right-0 p-4 opacity-10 text-${color}-500`}>
        <Icon className="w-16 h-16" />
      </div>
      <div className="text-slate-400 text-xs font-mono uppercase tracking-wider mb-1">{title}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className={`text-xs mt-2 flex items-center gap-1 text-${color}-400`}>
        {sub}
      </div>
    </Card>
  );

  return (
    <div className="space-y-8 text-slate-200 max-w-7xl mx-auto pb-20">
      
      {/* HEADER & ACTIONS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Mission Control</h1>
          <p className="text-slate-400">Platform analytics and operations.</p>
        </div>
        
        <div className="flex items-center gap-4">
           {currentTab === 'users' && (
             <Button onClick={handleSyncDatabase} disabled={isSyncing} variant="secondary" className="gap-2 border-slate-700">
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Syncing...' : 'Sync DB'}
             </Button>
           )}

           <Button onClick={() => setIsCreateOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
             <Plus className="w-4 h-4" /> Add User
           </Button>

           <div className="bg-slate-900 p-1 rounded-lg border border-slate-800 flex">
            {['overview', 'users', 'deployments', 'subscriptions'].map((tab) => (
              <button
                key={tab}
                onClick={() => setTab(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-md capitalize transition-all ${
                  currentTab === tab ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* === OVERVIEW TAB === */}
      {currentTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <KpiCard title="Monthly Revenue" value={`$${data.stats.mrr.toLocaleString()}`} sub={`${data.stats.payingCount} paying subscribers`} icon={DollarSign} color="emerald" />
            <KpiCard title="Total Users" value={data.stats.totalUsers} sub="+15% vs last month" icon={Users} color="blue" />
            <KpiCard title="Active Bots" value={data.stats.activeBots} sub="99% Uptime" icon={Activity} color="purple" />
            <KpiCard title="Total Deployments" value={data.deployments?.length || 0} sub="Requests" icon={FileCode} color="orange" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 p-6 bg-slate-900 border-slate-800">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-white font-bold">Revenue Growth</h3>
                <Badge variant="outline" className="border-green-500 text-green-400">Last 12 Months</Badge>
              </div>
              <GrowthChart />
            </Card>
            <Card className="p-6 bg-slate-900 border-slate-800">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2"><MapPin className="w-4 h-4 text-orange-500" /> Top Locations</h3>
              <div className="space-y-3">
                {data.topLocations.length === 0 ? <p className="text-slate-500 text-sm">No data yet</p> : 
                 data.topLocations.map((loc, i) => (
                    <div key={loc.country} className="flex justify-between text-sm"><span className="text-slate-300">{i+1}. {loc.country}</span><span className="text-slate-500">{loc.count} users</span></div>
                 ))
                }
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* === USERS TAB === */}
      {currentTab === 'users' && (
        <Card className="bg-slate-900 border-slate-800 animate-in fade-in duration-500">
          <div className="p-4 border-b border-slate-800 flex gap-4 bg-slate-950/50">
            <Search className="w-4 h-4 text-slate-500 my-auto" />
            <input placeholder="Search users..." className="bg-transparent border-none focus:outline-none text-white w-full" onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950 text-slate-400 font-mono text-xs uppercase">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Subscription</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-800/50 group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{user.full_name || 'No Name'}</div>
                      <div className="text-xs text-slate-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={user.banned_until ? 'destructive' : 'success'}>{user.banned_until ? 'Banned' : 'Active'}</Badge>
                    </td>
                    <td className="px-6 py-4">
                       <Badge variant="outline" className="border-slate-700">{user.subscriptions?.[0]?.status === 'active' ? 'Premium' : 'Free'}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                         <Button variant="outline" size="sm" onClick={() => setManagedUser(user)}><CreditCard className="w-3 h-3" /></Button>
                         <Button variant="destructive" size="sm" onClick={() => handleBan(user.id)}><Ban className="w-3 h-3" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-12 text-slate-500">
                      <div className="flex flex-col items-center gap-4 max-w-2xl mx-auto">
                        <Users className="w-12 h-12 text-slate-700" />
                        <div>
                            <p className="text-lg font-medium text-white">No users found</p>
                            <p className="text-sm text-slate-500">
                            Fetched {data.allUsers?.length || 0} records from DB
                            </p>
                        </div>

                        <div className="flex gap-4 mt-2">
                            <Button onClick={handleSyncDatabase} disabled={isSyncing} className="bg-blue-600 hover:bg-blue-500">
                                <Wrench className="w-4 h-4 mr-2" /> {isSyncing ? 'Repairing...' : 'Run Auto-Repair'}
                            </Button>
                            <Button onClick={handleEnsureSelf} disabled={isSyncing} variant="outline" className="border-slate-700 hover:bg-slate-800">
                                <User className="w-4 h-4 mr-2" /> Restore My Admin Profile
                            </Button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* === DEPLOYMENTS TAB === */}
      {currentTab === 'deployments' && (
        <Card className="bg-slate-900 border-slate-800 animate-in fade-in duration-500">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
            <h3 className="font-bold text-white flex items-center gap-2">
              <FileCode className="w-4 h-4 text-blue-400" /> Export Requests
            </h3>
            <Badge variant="secondary">{sortedDeployments.length} Total</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950 text-slate-400 font-mono text-xs uppercase">
                <tr>
                  <th className="px-6 py-4">Project & Logic</th>
                  <th className="px-6 py-4">User & Platform</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Upload Build</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {sortedDeployments.map((req) => (
                  <DeploymentRow key={req.id} req={req} />
                ))}

                {sortedDeployments.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-2">
                        <FileCode className="w-8 h-8 text-slate-700" />
                        <p>No deployment requests found.</p>
                        <p className="text-xs text-slate-600">
                           Server reported {data.deployments?.length} records.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* === SUBSCRIPTIONS TAB === */}
      {currentTab === 'subscriptions' && (
        <Card className="p-10 bg-slate-900 border-slate-800 text-center animate-in fade-in duration-500">
           <DollarSign className="w-12 h-12 text-slate-600 mx-auto mb-4" />
           <h3 className="text-white font-bold">Subscription Management</h3>
           <p className="text-slate-400">Live transaction feed coming in next update.</p>
        </Card>
      )}

      {/* --- MODALS --- */}
      
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New User">
         <form onSubmit={handleCreateUser} className="space-y-4 mt-4">
            <div><label className="text-sm font-medium mb-1 block">Full Name</label><Input name="fullName" required placeholder="John Doe" /></div>
            <div><label className="text-sm font-medium mb-1 block">Email</label><Input name="email" type="email" required placeholder="john@example.com" /></div>
            <div><label className="text-sm font-medium mb-1 block">Password</label><Input name="password" type="password" required placeholder="••••••••" minLength={6} /></div>
            <div className="flex justify-end gap-2 mt-6">
               <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
               <Button type="submit" disabled={isLoading}>{isLoading ? 'Creating...' : 'Create User'}</Button>
            </div>
         </form>
      </Modal>

      <Modal isOpen={!!managedUser} onClose={() => setManagedUser(null)} title="Manage Subscription">
         {managedUser && (
           <div className="space-y-6 mt-4">
              <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-lg">
                 <p className="font-bold">{managedUser.email}</p>
                 <p className="text-sm text-blue-500 uppercase">{managedUser.subscriptions?.[0]?.status || 'Free'}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                 <Button variant="outline" onClick={() => handleChangePlan('builder')} disabled={isLoading}>Set "Builder"</Button>
                 <Button variant="outline" onClick={() => handleChangePlan('live_trader')} disabled={isLoading}>Set "Live Trader"</Button>
                 <Button variant="outline" onClick={() => handleChangePlan('automation_pro')} disabled={isLoading}>Set "Pro"</Button>
                 <Button variant="outline" onClick={() => handleChangePlan('free')} disabled={isLoading}>Remove Plan</Button>
              </div>
              <Button variant="destructive" className="w-full" onClick={handleCancelSub} disabled={isLoading}>
                 <Trash2 className="w-4 h-4 mr-2" /> Cancel Stripe Sub
              </Button>
           </div>
         )}
      </Modal>

    </div>
  );
}