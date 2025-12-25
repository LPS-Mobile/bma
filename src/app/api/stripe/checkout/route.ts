import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

export async function POST(req: Request) {
  try {
    // 1. Validate Server Configuration
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("❌ STRIPE_SECRET_KEY missing");
      return NextResponse.json({ error: "Server Misconfiguration" }, { status: 500 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-06-20' as any,
    });

    const supabase = await createClient(); 
    const { data: { user } } = await supabase.auth.getUser();

    // 2. Parse Request
    const body = await req.json();
    const { planType, mode } = body; 

    console.log(`[API] Checkout Request for Plan: ${planType}`);

    // 3. SERVER-SIDE ID LOOKUP
    // The server reads the .env variables (securely)
    let finalPriceId = '';

    if (planType === 'builder') {
      finalPriceId = process.env.STRIPE_PRICE_BUILDER || process.env.NEXT_PUBLIC_STRIPE_PRICE_BUILDER || '';
    } else if (planType === 'live_trader') {
      finalPriceId = process.env.STRIPE_PRICE_LIVE_TRADER || process.env.NEXT_PUBLIC_STRIPE_PRICE_LIVE || '';
    } else if (planType === 'expert_review') {
      finalPriceId = process.env.STRIPE_PRICE_ID_EXPERT_REVIEW || '';
    }

    // 4. Validate Price ID Found
    if (!finalPriceId) {
      console.error(`❌ Price ID not found for plan: ${planType}`);
      return NextResponse.json({ 
        error: `Configuration Error: Price ID missing for '${planType}'. Check server env vars.` 
      }, { status: 500 });
    }

    // 5. Force Mode based on Plan
    const finalMode = (planType === 'builder' || planType === 'live_trader') ? 'subscription' : (mode || 'payment');

    // 6. Create Session
    const origin = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://your-app.vercel.app';
    
    const session = await stripe.checkout.sessions.create({
      customer_email: user?.email, 
      line_items: [{ price: finalPriceId, quantity: 1 }],
      mode: finalMode,
      success_url: `${origin}/dashboard/builder?success=true`,
      cancel_url: `${origin}/dashboard/builder?canceled=true`,
      metadata: {
        userId: user?.id || 'guest', 
        planType: planType || 'N/A',
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });

  } catch (error: any) {
    console.error('🔥 Stripe API Error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}