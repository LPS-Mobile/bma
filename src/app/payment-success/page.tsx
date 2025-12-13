'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client'; // ⭐ Use your Supabase Client
import { CheckCircle2, Loader2, Lock, Mail, User, Sparkles, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ----------------------------------------------------------------------
// 1. THE CONTENT COMPONENT
// ----------------------------------------------------------------------
function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id'); // ⭐ The key to linking payment
  const router = useRouter(); 
  const supabase = createClient();

  const [isLogin, setIsLogin] = useState(false); 
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // --- HELPER: Sync Subscription with Backend ---
  const syncSubscription = async (userId: string) => {
    if (!sessionId) return; // If no session, just a normal login/signup

    try {
      const res = await fetch('/api/auth/sync-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          sessionId: sessionId,
        }),
      });
      
      if (!res.ok) throw new Error("Failed to link subscription");
      
    } catch (syncErr) {
      console.warn('Sync warning (Webhook might have handled it):', syncErr);
    }
  };

  // --- HANDLER: Google Login ---
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?session_id=${sessionId}`,
        },
      });

      if (error) throw error;
      // Note: Redirect happens automatically, sync handled in callback or middleware
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      setLoading(false);
    }
  };

  // --- HANDLER: Email/Password ---
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let result;
      
      if (isLogin) {
        // LOGIN
        result = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
      } else {
        // SIGN UP
        result = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: { full_name: formData.name },
          }
        });
      }

      if (result.error) throw result.error;

      if (result.data.user) {
        // ⭐ Crucial Step: Link the Payment to this new User ID
        await syncSubscription(result.data.user.id);
        router.push('/dashboard');
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
      
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
        <div className="mx-auto bg-white/10 w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-sm mb-4 shadow-inner ring-1 ring-white/20 relative z-10">
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-3xl font-black text-white relative z-10">Payment Successful!</h2>
        <p className="text-blue-200 mt-2 font-medium relative z-10">
          {isLogin 
            ? 'Log in to claim your subscription.' 
            : 'Create your account to start trading.'}
        </p>
      </div>

      {/* Form Section */}
      <div className="p-8">
        
        {/* GOOGLE BUTTON */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-3 px-4 mb-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-900 border border-gray-200 shadow-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        {/* DIVIDER */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-800"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-gray-900 text-gray-500 font-medium">Or using email</span>
          </div>
        </div>

        <form className="space-y-5" onSubmit={handleEmailAuth}>
          
          {!isLogin && (
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-500" />
              </div>
              <input
                name="name"
                type="text"
                required={!isLogin}
                className="block w-full pl-10 pr-3 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-white placeholder-gray-500"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          )}

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-500" />
            </div>
            <input
              name="email"
              type="email"
              required
              className="block w-full pl-10 pr-3 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-white placeholder-gray-500"
              placeholder="Email Address"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-500" />
            </div>
            <input
              name="password"
              type="password"
              required
              className="block w-full pl-10 pr-3 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-white placeholder-gray-500"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-900/30 border border-red-800 rounded-lg text-sm text-red-300 font-medium animate-pulse">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={loading}
          >
            {isLogin ? 'Log In & Activate' : 'Create Account & Access'}
            {!loading && <ArrowRight className="ml-2 w-5 h-5" />}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="mt-4 flex items-center justify-center w-full px-4 py-3 border border-gray-700 rounded-xl text-gray-300 font-bold bg-gray-800/50 hover:bg-gray-800 hover:text-white transition-all"
          >
            {isLogin ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 text-amber-500" /> Create New Account
              </>
            ) : (
              'Log In Instead'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 2. THE MAIN PAGE COMPONENT
// ----------------------------------------------------------------------
export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black" />
        <div className="relative z-10">
          <Suspense fallback={
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
              <p className="text-gray-500 font-medium font-mono">Verifying Payment Data...</p>
            </div>
          }>
            <PaymentSuccessContent />
          </Suspense>
        </div>
    </div>
  );
}