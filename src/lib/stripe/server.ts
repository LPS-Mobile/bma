import Stripe from 'stripe';

// 1. Robust Check for API Key
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  // In production, this should crash. In build/dev, we might want a helpful error.
  if (process.env.NODE_ENV === 'production') {
    throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
  } else {
    console.warn('⚠️ STRIPE_SECRET_KEY is missing. Stripe features will fail.');
  }
}

// 2. Initialize Stripe
// We use 'as string' to satisfy TS (we checked it above) or fallback to empty string to prevent crash
export const stripe = new Stripe(stripeSecretKey || '', {
  // ✅ FIX: Cast to 'any' to allow using an older API version than the SDK default
  apiVersion: '2024-11-20.acacia' as any, 
  typescript: true,
});

/**
 * Create a Stripe checkout session for subscription OR one-time payment
 */
export async function createCheckoutSession(
  priceId: string,
  userId: string,
  userEmail: string,
  metadata?: Record<string, string>,
  mode: 'subscription' | 'payment' = 'subscription', 
  successUrl?: string, 
  cancelUrl?: string
): Promise<Stripe.Checkout.Session> {
  
  if (!stripeSecretKey) throw new Error('Stripe is not configured');

  const sessionConfig: Stripe.Checkout.SessionCreateParams = {
    mode: mode, 
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    customer_email: userEmail,
    client_reference_id: userId,
    metadata: {
      userId,
      ...metadata,
    },
    success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
    allow_promotion_codes: true,
    billing_address_collection: 'auto',
  };

  if (mode === 'subscription') {
    sessionConfig.subscription_data = {
      metadata: {
        userId,
      },
    };
  }

  const session = await stripe.checkout.sessions.create(sessionConfig);

  return session;
}

/**
 * Create a billing portal session
 */
export async function createPortalSession(
  customerId: string,
  returnUrl?: string
): Promise<Stripe.BillingPortal.Session> {
  if (!stripeSecretKey) throw new Error('Stripe is not configured');
  
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  });

  return session;
}

/**
 * Get subscription by ID
 */
export async function getSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.retrieve(subscriptionId);
}

/**
 * Get customer by ID
 */
export async function getCustomer(customerId: string): Promise<Stripe.Customer> {
  return await stripe.customers.retrieve(customerId) as Stripe.Customer;
}

/**
 * Update subscription tier
 */
export async function updateSubscription(
  subscriptionId: string,
  newPriceId: string
): Promise<Stripe.Subscription> {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  return await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: newPriceId,
      },
    ],
    proration_behavior: 'create_prorations',
  });
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
  cancelAtPeriodEnd: boolean = true
): Promise<Stripe.Subscription> {
  if (cancelAtPeriodEnd) {
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  } else {
    return await stripe.subscriptions.cancel(subscriptionId);
  }
}

/**
 * Reactivate subscription
 */
export async function reactivateSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });
}

/**
 * Get price details
 */
export async function getPrice(priceId: string): Promise<Stripe.Price> {
  return await stripe.prices.retrieve(priceId);
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(payload, signature, secret);
}