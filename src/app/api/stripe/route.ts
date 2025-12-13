// src/app/api/stripe/route.ts
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server'; 

// Initialize Stripe (kept the 'any' fix from previous steps)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20' as any, 
});

export async function POST(req: Request) {
  const body = await req.text();
  
  // FIX: Await headers() because it returns a Promise in Next.js 15
  const signature = (await headers()).get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error(`Webhook signature verification failed.`, err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  // FIX: Await createClient() as well
  const supabase = await createClient();

  // HANDLE EVENTS
  try {
    switch (event.type) {
      
      // 1. User Successfully Paid
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // We stored user_id in metadata during checkout creation
        const userId = session.metadata?.userId;
        
        if (userId) {
          await supabase.from('subscriptions').upsert({
            user_id: userId,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            status: 'active',
            plan_id: session.amount_total === 9900 ? 'live_trader' : 'builder', 
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 days
          });
        }
        break;
      }

      // 2. Subscription Updated (or Canceled)
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        await supabase
          .from('subscriptions')
          .update({
            status: subscription.status,
            // FIX: Cast subscription to any to avoid strict type error on current_period_end
            current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);
        break;
      }
    }
  } catch (error) {
    console.error('Database update failed:', error);
    return NextResponse.json({ error: 'Database Error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}