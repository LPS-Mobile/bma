'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { LogOut, Bell, Search, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminNavbar() {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="h-16 border-b border-slate-800 bg-slate-950 flex items-center justify-between px-8">
      
      {/* Left: Global Admin Search (Visual placeholder) */}
      <div className="hidden md:flex items-center relative w-96">
        <Search className="w-4 h-4 absolute left-3 text-slate-500" />
        <input 
          type="text" 
          placeholder="Global search (Users, Tx IDs, Logs)..." 
          className="w-full bg-slate-900 border border-slate-800 rounded-full pl-10 pr-4 py-1.5 text-sm text-slate-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
        />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        
        {/* Notifications */}
        <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-950"></span>
        </button>

        <div className="h-6 w-px bg-slate-800 mx-2"></div>

        {/* Exit Admin Mode */}
        <Link href="/dashboard">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 gap-2"
          >
            <LayoutDashboard className="w-4 h-4" />
            User View
          </Button>
        </Link>

        {/* Sign Out */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleSignOut}
          className="text-slate-400 hover:text-white hover:bg-red-900/20 hover:text-red-400"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}