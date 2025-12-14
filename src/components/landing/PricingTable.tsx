'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Check, X, Loader2, Sparkles } from 'lucide-react'

export function PricingTable() {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const getButtonStyle = (tier: string) => {
    switch (tier) {
      case 'Builder':
        return "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25 ring-1 ring-blue-500/50"
      case 'Live Trader':
        return "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-indigo-500/25 ring-1 ring-indigo-500/50"
      case 'Automation Pro':
        return "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-lg shadow-orange-500/25 ring-1 ring-orange-500/50 transform transition-all hover:scale-105"
      default:
        return ""
    }
  }

  const plans = [
    {
      name: 'Free Trial',
      id: 'free_trial',
      price: 0,
      period: '7 days',
      description: 'Perfect for testing the waters',
      highlight: false,
      cta: 'Start Free Trial',
      ctaVariant: 'outline' as const, // ✅ Valid
      stripeId: null,
      features: [
        { text: '1 bot project', included: true },
        { text: '2 indicators max', included: true },
        { text: 'Sandbox backtesting', included: true },
        { text: 'TradingView export', included: false },
        { text: 'Live deployment', included: false },
      ],
      limitations: 'Great for learning the platform',
    },
    {
      name: 'Builder',
      id: 'builder',
      price: 49,
      period: 'month',
      description: 'For serious strategy developers',
      highlight: false,
      cta: 'Get Started',
      ctaVariant: 'default' as const, // ✅ FIXED: Changed 'primary' to 'default'
      stripeId: process.env.NEXT_PUBLIC_STRIPE_PRICE_BUILDER || 'price_1SJd1hDATCpMStKajg0ByEXv',
      features: [
        { text: 'Unlimited bots', included: true },
        { text: 'Unlimited indicators', included: true },
        { text: 'Full backtesting suite', included: true },
        { text: 'TradingView export', included: false },
        { text: 'License key protection', included: false },
        { text: 'Email support', included: true },
      ],
      limitations: null,
    },
    {
      name: 'Live Trader',
      id: 'live_trader',
      price: 149,
      period: 'month',
      description: 'Deploy and monitor live bots',
      highlight: false,
      badge: 'Most Popular',
      cta: 'Start Trading Live',
      ctaVariant: 'default' as const, // ✅ FIXED: Changed 'primary' to 'default'
      stripeId: process.env.NEXT_PUBLIC_STRIPE_PRICE_LIVE || 'price_1SJd29DATCpMStKa9wc05i4L',
      features: [
        { text: 'Everything in Builder', included: true },
        { text: 'Unlimited bots', included: true },
        { text: 'TradingView export', included: true },
        { text: 'Live bot deployment', included: true },
        { text: 'Real-time performance', included: true },
        { text: 'Webhook alerts', included: true },
        { text: 'Priority support', included: true },
      ],
      limitations: null,
    },
    {
      name: 'Automation Pro',
      id: 'automation_pro',
      price: 249,
      period: 'month',
      description: 'Full automation for Prop Firms',
      highlight: true,
      badge: 'Prop Firm Ready',
      cta: 'Go Pro',
      ctaVariant: 'default' as const, // ✅ FIXED: Changed 'primary' to 'default'
      comingSoon: false,
      stripeId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || 'price_1SJd96DATCpMStKavJ4b8avr',
      features: [
        { text: 'Everything in Live Trader', included: true },
        { text: 'Unlimited bots', included: true },
        { text: 'NinjaTrader 8 Bots', included: true },
        { text: 'MetaTrader 5 Bots', included: true },
        { text: 'Server-side compilation', included: true },
        { text: 'White-glove onboarding', included: true },
        { text: 'Dedicated support channel', included: true },
      ],
      limitations: null,
    },
  ]

  const handleCheckout = async (plan: typeof plans[0]) => {
    setLoadingId(plan.id)

    if (plan.price === 0) {
      router.push('/signup?plan=free_trial')
      return
    }

    if (!plan.stripeId) {
      console.error(`Missing Stripe Price ID for plan: ${plan.name}`)
      alert(`Configuration Error: Price ID missing for ${plan.name}.`)
      setLoadingId(null)
      return
    }

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          priceId: plan.stripeId,
          mode: 'subscription', 
          planName: plan.name 
        }),
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error || 'Checkout failed')

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL returned')
      }
    } catch (error: any) {
      console.error("Checkout Error:", error)
      alert(error.message || "Failed to start checkout")
      setLoadingId(null)
    }
  }

  return (
    <section className="py-24 px-4 relative overflow-hidden" id="pricing">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-black to-gray-900" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Start free. Scale as you grow. No hidden fees.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-2xl p-8 transition-all duration-300 flex flex-col ${
                plan.highlight
                  ? 'bg-gradient-to-b from-blue-900/20 to-gray-900 border-2 border-blue-500 shadow-2xl shadow-blue-500/20 scale-105 z-10'
                  : 'bg-gray-900/50 border border-gray-800 hover:border-gray-700'
              } ${plan.comingSoon ? 'opacity-75' : ''}`}
            >
              {plan.badge && (
                <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-semibold shadow-lg whitespace-nowrap flex items-center gap-1 ${
                  plan.highlight
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-orange-900/50'
                    : 'bg-gray-700 text-gray-300'
                }`}>
                  {plan.highlight && <Sparkles className="w-3 h-3 fill-white" />}
                  {plan.badge}
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-sm text-gray-400 mb-6 h-10 leading-snug">{plan.description}</p>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-5xl font-bold text-white">${plan.price}</span>
                  <span className="text-gray-400">/ {plan.period}</span>
                </div>
                {plan.limitations && <p className="text-xs text-gray-500">{plan.limitations}</p>}
              </div>

              <div className="space-y-4 mb-8 flex-grow">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start gap-3">
                    {feature.included ? (
                      <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.highlight ? 'text-amber-400' : 'text-emerald-500'}`} />
                    ) : (
                      <X className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                    )}
                    <span className={`text-sm ${feature.included ? 'text-gray-300' : 'text-gray-600 line-through decoration-gray-700'}`}>
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>

              <Button
                variant={plan.ctaVariant}
                size="lg"
                className={`w-full font-semibold tracking-wide ${getButtonStyle(plan.name)}`}
                disabled={loadingId !== null && loadingId !== plan.id}
                onClick={() => handleCheckout(plan)}
              >
                {loadingId === plan.id ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {plan.price === 0 ? 'Redirecting...' : 'Processing...'}
                  </>
                ) : (
                  plan.cta
                )}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}