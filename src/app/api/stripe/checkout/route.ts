import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(req: Request) {
  try {
    // 1. Init Supabase (Async)
    const supabase = await createClient(); 
    
    // 2. Check for User (But don't block if missing)
    const { data: { user } } = await supabase.auth.getUser();

    // 3. Parse Body
    const body = await req.json();
    const { botId, planType, priceId: directPriceId, planName, mode = 'payment' } = body; 

    // 4. Resolve Price ID
    let finalPriceId = directPriceId;

    // Fallback for Expert Reviews or other mapped plans
    if (!finalPriceId && planType) {
      const expertPriceId = process.env.STRIPE_PRICE_ID_EXPERT_REVIEW;
      const PRICES: Record<string, string | undefined> = {
        expert_review: expertPriceId,
      };
      finalPriceId = PRICES[planType];
    }

    if (!finalPriceId) {
      return NextResponse.json({ 
        error: `Price ID missing for '${planName || planType}'` 
      }, { status: 400 });
    }

    // 5. Create Session
    const origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    // Logic: If user is logged in, use their email. If not, Stripe will ask for it.
    const customerEmail = user?.email || undefined;

    const session = await stripe.checkout.sessions.create({
      customer_email: customerEmail, 
      line_items: [{ price: finalPriceId, quantity: 1 }],
      mode: mode, 
      
      // ✅ CRITICAL CHANGE: Redirect to the special "Claim Account" page
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      
      cancel_url: `${origin}/pricing?checkout=cancelled`,
      
      metadata: {
        // ✅ CRITICAL CHANGE: Mark as 'guest' if not logged in
        userId: user?.id || 'guest', 
        botId: botId || 'N/A',
        planName: planName || 'N/A',
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });

  } catch (error: any) {
    console.error('🔥 [API] Stripe Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}