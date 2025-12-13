'use client';

import React, { useState, useEffect } from 'react';

// ----------------------------------------------------------------------
// ⚠️ FOR PRODUCTION: Move 'DashboardNavbar' to src/components/dashboard/DashboardNavbar.tsx
// and import it here. I have inlined it to fix the preview build error.
// ----------------------------------------------------------------------

// ==============================
// START PREVIEW COMPATIBILITY
// ==============================
// We use these lightweight shims so the UI works in the preview window
// without needing the full Next.js build server.

const Link = ({ href, children, className }: any) => (
  <a href={href} className={className} onClick={(e) => {
    // In production, Next.js handles this. 
    // Here we force a location change to make the buttons work.
    if(typeof window !== 'undefined') window.location.href = href;
  }}>
    {children}
  </a>
);

const useRouter = () => ({
  push: (path: string) => {
    if (typeof window !== 'undefined') window.location.href = path;
  }
});

const usePathname = () => {
  if (typeof window !== 'undefined') return window.location.pathname;
  return '/dashboard';
};

const createClient = () => ({ auth: { signOut: async () => console.log('Sign out') } });

const Button = ({ variant = 'primary', size = 'md', className = '', children, onClick, ...props }: any) => {
  const base = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none";
  const variants: any = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-800 text-white hover:bg-gray-700",
    outline: "border border-gray-700 bg-transparent hover:bg-gray-800 text-gray-300 hover:text-white",
    ghost: "hover:bg-gray-800 text-gray-400 hover:text-white",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };
  const sizes: any = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 py-2 text-sm",
    icon: "h-10 w-10",
  };
  return (
    <button 
      onClick={onClick}
      className={`${base} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
// ==============================
// END PREVIEW COMPATIBILITY
// ==============================

function DashboardNavbar() {
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
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-sm">B</span>
              </div>
              <span className="text-lg font-bold text-white">Botman AI</span>
            </Link>
            
            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-1 text-sm">
              {navItems.map((item) => (
                <Link 
                  key={item.name} 
                  href={item.path}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${isActive(item.path) ? 'text-white bg-gray-800 font-medium' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right - Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-lg text-xs">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </div>
              <span className="text-gray-400">System Online</span>
            </div>

            <Button variant="primary" size="sm" onClick={handleNewBot}>
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Bot
            </Button>

            {/* User Avatar / Sign Out */}
            <div 
              onClick={handleSignOut}
              title="Sign Out"
              className="w-8 h-8 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center text-xs font-bold cursor-pointer hover:scale-105 transition-transform text-white"
            >
              U
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black">
      <DashboardNavbar />
      <main>
        {children}
      </main>
    </div>
  );
}