import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

export async function POST(req: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Server Misconfiguration: Missing Stripe Key" }, { status: 500 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-06-20' as any,
    });

    const supabase = await createClient(); 
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Parse Body
    const body = await req.json();
    const { botId, planType, mode } = body; // We ignore 'priceId' from client

    console.log(`[API] Plan Request: ${planType}`);

    // 2. SERVER-SIDE LOOKUP (Secure & Reliable)
    // The server has access to private .env variables. The client does not.
    let finalPriceId = '';

    if (planType === 'builder') {
      finalPriceId = process.env.STRIPE_PRICE_BUILDER || '';
    } else if (planType === 'live_trader') {
      finalPriceId = process.env.STRIPE_PRICE_LIVE_TRADER || ''; // Check if your env var is named LIVE or LIVE_TRADER
    } else if (planType === 'expert_review') {
      finalPriceId = process.env.STRIPE_PRICE_ID_EXPERT_REVIEW || '';
    }

    // 3. Validation
    if (!finalPriceId) {
      console.error(`❌ [API] Error: Price ID not found for plan '${planType}'`);
      return NextResponse.json({ 
        error: `Configuration Error: No Price ID configured for ${planType}` 
      }, { status: 400 });
    }

    // 4. Force Subscription Mode for Plans
    // If it's a known plan, force subscription mode
    const finalMode = (planType === 'builder' || planType === 'live_trader') 
      ? 'subscription' 
      : (mode || 'payment');

    // 5. Create Session
    const origin = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
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
    console.error('🔥 [API] Stripe Error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}