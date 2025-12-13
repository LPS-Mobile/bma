import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import AdminNavbar from '@/components/admin/AdminNavbar'; // 🟢 Import the new navbar
import { 
  LayoutDashboard, Users, CreditCard 
} from 'lucide-react';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // ... (Sidebar navItems code remains the same) ...
  const navItems = [
    { name: 'Overview', href: '/admin?tab=overview', icon: LayoutDashboard },
    { name: 'User Management', href: '/admin?tab=users', icon: Users },
    { name: 'Revenue & Subs', href: '/admin?tab=subscriptions', icon: CreditCard },
  ];

  return (
    <div className="flex min-h-screen bg-black text-white font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-slate-800 flex flex-col fixed h-full bg-slate-950 z-50">
        {/* ... (Sidebar content remains the same) ... */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">B</div>
          <span className="font-bold text-lg tracking-tight">Botman Admin</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link 
              key={item.name} 
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition-all group"
            >
              <item.icon className="w-5 h-5 group-hover:text-blue-400 transition-colors" />
              <span className="font-medium text-sm">{item.name}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 ml-64 bg-black min-h-screen flex flex-col">
        {/* 🟢 ADD ADMIN NAVBAR HERE */}
        <AdminNavbar />
        
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}