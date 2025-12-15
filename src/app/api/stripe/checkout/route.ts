import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

export async function POST(req: Request) {
  try {
    // --- DEBUGGING CHECKS ---
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("❌ CRITICAL: STRIPE_SECRET_KEY is missing in .env");
      return NextResponse.json({ error: "Server Misconfiguration: Missing Stripe Key" }, { status: 500 });
    }

    // Initialize Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-06-20' as any,
    });

    // 1. Init Supabase
    const supabase = await createClient(); 
    const { data: { user } } = await supabase.auth.getUser();

    // 2. Parse Body
    const body = await req.json();
    const { botId, planType, priceId: directPriceId, planName, mode = 'payment' } = body; 

    console.log(`[API] Processing checkout for: ${planType || 'Direct Price'}`);

    // 3. Resolve Price ID
    let finalPriceId = directPriceId;

    if (!finalPriceId && planType) {
      // Map plans here
      if (planType === 'expert_review') {
        finalPriceId = process.env.STRIPE_PRICE_ID_EXPERT_REVIEW;
      }
      // Add other plans here if needed
    }

    if (!finalPriceId) {
      console.error(`❌ Error: No Price ID found for '${planType}'. Check STRIPE_PRICE_ID_EXPERT_REVIEW in .env`);
      return NextResponse.json({ 
        error: `Configuration Error: Price ID missing for '${planName || planType}'` 
      }, { status: 400 });
    }

    // 4. Create Session
    const origin = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
    const session = await stripe.checkout.sessions.create({
      customer_email: user?.email, 
      line_items: [{ price: finalPriceId, quantity: 1 }],
      mode: mode, 
      success_url: `${origin}/dashboard/builder?success=true&bot_id=${botId}`,
      cancel_url: `${origin}/dashboard/builder?canceled=true`,
      metadata: {
        userId: user?.id || 'guest', 
        botId: botId || 'N/A',
        planType: planType || 'N/A',
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });

  } catch (error: any) {
    console.error('🔥 [API] Stripe Fatal Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}