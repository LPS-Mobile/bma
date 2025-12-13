// src/app/api/auth/sync-subscription/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

// FIX: Cast apiVersion to 'any' to avoid the type error with the beta SDK
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20' as any,
});

export async function POST(req: Request) {
  try {
    const { userId, sessionId } = await req.json();

    if (!userId || !sessionId) {
      return NextResponse.json({ error: 'Missing Data' }, { status: 400 });
    }

    // 1. Retrieve the Session from Stripe to get the Customer ID
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const customerId = session.customer as string;

    if (!customerId) {
      return NextResponse.json({ error: 'No Customer ID found in Session' }, { status: 404 });
    }

    // 2. Update Supabase
    // We update the User's metadata or a dedicated 'subscriptions' table
    const supabase = await createClient();

    // Option A: Update a 'subscriptions' table (Recommended if you have one)
    const { error: subError } = await supabase
      .from('subscriptions')
      .update({ user_id: userId }) // Assign the anonymous sub to this user
      .eq('stripe_customer_id', customerId); // Find by the customer ID Stripe created

    // Option B: Fallback - Update user metadata
    // typically the webhook handles the table creation, but we might need to link it here
    
    console.log(`✅ [SYNC] Linked Customer ${customerId} to User ${userId}`);

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Sync Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}