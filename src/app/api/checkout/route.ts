// src/app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createCheckoutSession } from '@/lib/stripe/server';

export async function POST(request: NextRequest) {
  try {
    const { priceId } = await request.json();

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      );
    }

    // FIX: Await the client creation
    const supabase = await createClient();
    
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user email
    const userEmail = user.email || '';

    // Create Stripe checkout session
    const session = await createCheckoutSession(
      priceId,
      user.id,
      userEmail,
      {
        tier: determineTierFromPriceId(priceId),
      }
    );

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create checkout session',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

function determineTierFromPriceId(priceId: string): string {
  if (priceId === process.env.STRIPE_PRICE_BUILDER) return 'builder';
  if (priceId === process.env.STRIPE_PRICE_LIVE_TRADER) return 'live_trader';
  if (priceId === process.env.STRIPE_PRICE_AUTOMATION_PRO) return 'automation_pro';
  return 'builder';
}