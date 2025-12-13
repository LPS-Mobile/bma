'use client';

import React, { useState } from 'react';
import { Check, Zap, HelpCircle, Shield, X, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation'; // Use real router for production

// ==========================================
// 1. UI COMPONENTS 
// ==========================================

const Button = ({ variant = 'primary', size = 'md', className = '', children, onClick, disabled, isLoading, ...props }: any) => {
  const base = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed";
  const variants: any = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-900/20",
    secondary: "bg-gray-800 text-white hover:bg-gray-700 border border-gray-700",
    outline: "border border-gray-700 text-white hover:bg-gray-800",
    premium: "bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 shadow-lg shadow-orange-900/20 border-0",
  };
  const sizes: any = { sm: "h-8 px-3 text-xs", md: "h-10 px-4 py-2 text-sm", lg: "h-12 px-6 text-base", icon: "h-10 w-10" };
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

const Badge = ({ children, variant = 'default' }: any) => {
  const styles: any = {
    default: "bg-gray-800 text-gray-300",
    success: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    blue: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    gold: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  };
  return <span className={`px-2 py-1 rounded-full text-xs font-mono border ${styles[variant] || styles.default}`}>{children}</span>;
};

// ==========================================
// 2. NAVBAR (Local for Pricing Page Context)
// ==========================================

function LocalNavbar() {
  const router = useRouter();
  return (
    <nav className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-sm">B</span>
            </div>
            <span className="text-lg font-bold text-white">Botman AI</span>
          </div>
          <div className="hidden md:flex items-center gap-1">
            <button onClick={() => router.push('/dashboard')} className="px-3 py-1.5 text-sm text-gray-400 hover:text-white">Dashboard</button>
            <button onClick={() => router.push('/bots/new')} className="px-3 py-1.5 text-sm text-gray-400 hover:text-white">Builder</button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" variant="outline" onClick={() => router.push('/login')}>Log in</Button>
          <Button size="sm" onClick={() => router.push('/signup')}>Sign up</Button>
        </div>
      </div>
    </nav>
  );
}

// ==========================================
// 3. PRICING PAGE CONTENT
// ==========================================

export default function PricingPage() {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isRedirecting, setIsRedirecting] = useState<string | null>(null); 

  const plans = [
    {
      name: 'Free Trial',
      id: 'free_trial',
      price: 0,
      description: 'Perfect for testing the waters',
      highlight: false,
      cta: 'Start Free Trial',
      ctaVariant: 'outline',
      stripeIds: { monthly: null, yearly: null }, 
      features: [
        { text: '1 bot project', included: true },
        { text: '2 indicators max', included: true },
        { text: 'Sandbox backtesting', included: true },
        { text: 'TradingView export', included: false },
        { text: 'Live deployment', included: false },
      ],
    },
    {
      name: 'Builder',
      id: 'builder',
      price: 49, 
      period: 'month',
      description: 'For serious strategy developers',
      highlight: false,
      cta: 'Get Started',
      ctaVariant: 'primary',
      stripeIds: { 
        monthly: 'price_1SJd1hDATCpMStKajg0ByEXv', 
        yearly: null 
      },
      features: [
        { text: 'Unlimited bots', included: true },
        { text: 'Unlimited indicators', included: true },
        { text: 'Full backtesting suite', included: true },
        { text: 'Email support', included: true },
        { text: 'TradingView export', included: false },
      ],
    },
    {
      name: 'Live Trader',
      id: 'live_trader',
      price: 149,
      period: 'month',
      description: 'Deploy and monitor live bots',
      highlight: false, // Un-highlighted to emphasize Pro
      cta: 'Start Trading Live',
      ctaVariant: 'primary',
      stripeIds: { 
        monthly: 'price_1SJd29DATCpMStKa9wc05i4L', 
        yearly: null 
      },
      features: [
        { text: 'Everything in Builder', included: true },
        { text: 'Live bot deployment', included: true },
        { text: 'Real-time performance tracking', included: true },
        { text: 'Webhook alerts', included: true },
        { text: 'Priority support', included: true },
      ],
    },
    {
      name: 'Automation Pro',
      id: 'automation_pro',
      price: 249, // Price for Prop Firms
      period: 'month',
      description: 'Full automation across all platforms',
      highlight: true, // ✅ Now Highlighted
      badge: 'Best for Prop Firms',
      cta: 'Go Pro',
      ctaVariant: 'premium',
      comingSoon: false, // ✅ LIVE NOW
      stripeIds: { 
        monthly: 'price_1SJd96DATCpMStKavJ4b8avr', // Ensure this ID is correct in your env/stripe
        yearly: null 
      },
      features: [
        { text: 'Everything in Live Trader', included: true },
        { text: 'NinjaTrader 8 Export (DLL)', included: true },
        { text: 'MetaTrader 5 Export (EA)', included: true },
        { text: 'Server-side compilation', included: true },
        { text: 'White-glove onboarding', included: true },
        { text: '1 Free Expert Review / mo', included: true },
      ],
    },
  ];

  const handleCheckout = async (plan: any) => {
    if (plan.price === 0) {
      router.push('/dashboard');
      return;
    }

    setIsRedirecting(plan.id);

    try {
      const priceId = plan.stripeIds.monthly;
      
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          priceId, 
          mode: 'subscription', // Explicitly set subscription mode
          planName: plan.name 
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Checkout failed');

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error("Checkout Error:", error);
      alert("Failed to start checkout. Please try again.");
      setIsRedirecting(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <LocalNavbar />

      <div className="container mx-auto px-4 py-16">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="gold">Automation Pro is Live</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mt-4 mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
            Professional Algo Trading
          </h1>
          <p className="text-xl text-gray-400">
            From simple alerts to full prop-firm automation. Choose your weapon.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-20">
          {plans.map((plan) => (
            <div 
              key={plan.name}
              className={`
                relative flex flex-col p-6 rounded-2xl border transition-all duration-300
                ${plan.highlight 
                  ? 'bg-gray-900/80 border-amber-500 shadow-2xl shadow-amber-900/20 scale-105 z-10' 
                  : 'bg-gray-900/40 border-gray-800 hover:border-gray-700'
                }
              `}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-full text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg bg-gradient-to-r from-amber-500 to-orange-600 text-white`}>
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-6 mt-2">
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <p className="text-gray-400 text-sm mb-4 h-10 leading-tight">{plan.description}</p>
                
                <div className="flex items-baseline gap-1">
                   <span className="text-4xl font-bold">${plan.price}</span>
                   {plan.price > 0 && <span className="text-gray-500">/month</span>}
                </div>
              </div>

              <div className="flex-1 mb-8">
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className={`flex items-start gap-3 text-sm ${feature.included ? 'text-gray-300' : 'text-gray-600'}`}>
                      {feature.included ? (
                        <Check className={`w-4 h-4 flex-shrink-0 ${plan.highlight ? 'text-amber-400' : 'text-emerald-500'}`} />
                      ) : (
                        <X className="w-4 h-4 flex-shrink-0 text-gray-700" />
                      )}
                      <span className={!feature.included ? 'line-through decoration-gray-700' : ''}>{feature.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button 
                variant={plan.ctaVariant || 'secondary'} 
                size="lg" 
                className="w-full"
                onClick={() => handleCheckout(plan)}
                disabled={isRedirecting !== null && isRedirecting !== plan.id}
                isLoading={isRedirecting === plan.id}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto border-t border-gray-800 pt-16">
          <h2 className="text-2xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" /> Does Automation Pro work with Prop Firms?
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Yes. The NinjaTrader and MetaTrader exports are specifically compiled to work with major prop firms like Apex, Topstep, and FTMO that require local execution.
              </p>
            </div>
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-500" /> Can I upgrade later?
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Absolutely. You can start with the Builder plan to design your strategy, and upgrade to Automation Pro only when you are ready to deploy live.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}