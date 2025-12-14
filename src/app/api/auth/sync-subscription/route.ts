// src/app/api/auth/sync-subscription/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

export async function POST(req: Request) {
  try {
    // 1. Move Stripe initialization INSIDE the handler (or use a singleton pattern)
    // This prevents build crashes if the key is missing in CI/CD
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is missing');
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-06-20' as any,
    });

    const { userId, sessionId } = await req.json();

    if (!userId || !sessionId) {
      return NextResponse.json({ error: 'Missing Data' }, { status: 400 });
    }

    // 2. Retrieve the Session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const customerId = session.customer as string;

    if (!customerId) {
      return NextResponse.json({ error: 'No Customer ID found in Session' }, { status: 404 });
    }

    // 3. Update Supabase
    const supabase = await createClient();

    const { error: subError } = await supabase
      .from('subscriptions')
      .update({ user_id: userId })
      .eq('stripe_customer_id', customerId);

    if (subError) {
      console.error('Supabase Update Error:', subError);
      // Depending on logic, you might want to return an error or just log it
    }

    console.log(`✅ [SYNC] Linked Customer ${customerId} to User ${userId}`);

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Sync Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}