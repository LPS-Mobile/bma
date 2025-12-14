'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
// ✅ Ensure lowercase 'button' matches your file system
import { Button } from '@/components/ui/button'; 
import { createClient } from '@/lib/supabase/client';
import { LogOut, Plus } from 'lucide-react';

export default function DashboardNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const isActive = (path: string) => pathname === path;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleNewBot = () => {
    router.push('/bots/new');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'My Bots', path: '/bots' },
    { name: 'Builder', path: '/bots/new' },
    { name: 'Settings', path: '/settings' },
  ];

  return (
    <nav className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Left - Brand */}
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                <span className="text-white font-black text-sm">B</span>
              </div>
              <span className="text-lg font-bold text-white hidden sm:block">Botman AI</span>
            </Link>
            
            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-1 text-sm">
              {navItems.map((item) => (
                <Link 
                  key={item.name} 
                  href={item.path}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    isActive(item.path) 
                      ? 'text-white bg-gray-800 font-medium' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right - Actions */}
          <div className="flex items-center gap-3">
            {/* System Status Indicator */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-lg text-xs border border-gray-700">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </div>
              <span className="text-gray-400">System Online</span>
            </div>

            {/* ✅ Admin Link Added Here */}
            <Link href="/admin" className="hidden sm:block text-xs text-emerald-500 hover:text-emerald-400 font-medium mr-2 transition-colors">
              [Admin]
            </Link>

            <Button 
              variant="default" // Changed to default/primary
              size="sm" 
              onClick={handleNewBot}
              className="bg-blue-600 hover:bg-blue-500 text-white border-0"
            >
              <Plus className="w-4 h-4 mr-1" />
              New Bot
            </Button>

            {/* Sign Out Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="text-gray-400 hover:text-white hover:bg-gray-800"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}