import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function GET(request: NextRequest) {
  const results: any = {
    success: true,
    timestamp: new Date().toISOString(),
    details: {}
  };

  try {
    // Check if API key is set
    if (!process.env.STRIPE_SECRET_KEY) {
      results.success = false;
      results.details.error = 'STRIPE_SECRET_KEY not set in environment variables';
      return NextResponse.json(results);
    }

    // Initialize Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia'
    });

    // Test 1: Retrieve account balance
    try {
      const balance = await stripe.balance.retrieve();
      results.details.balance = {
        success: true,
        available: balance.available,
        pending: balance.pending
      };
    } catch (error: any) {
      results.success = false;
      results.details.balance = {
        success: false,
        error: error.message
      };
    }

    // Test 2: List products
    try {
      const products = await stripe.products.list({ limit: 10 });
      results.details.products = {
        success: true,
        count: products.data.length,
        products: products.data.map(p => ({
          id: p.id,
          name: p.name,
          active: p.active
        }))
      };
    } catch (error: any) {
      results.success = false;
      results.details.products = {
        success: false,
        error: error.message
      };
    }

    // Test 3: List prices
    try {
      const prices = await stripe.prices.list({ limit: 10 });
      results.details.prices = {
        success: true,
        count: prices.data.length,
        prices: prices.data.map(p => ({
          id: p.id,
          product: p.product,
          unit_amount: p.unit_amount,
          currency: p.currency,
          recurring: p.recurring ? {
            interval: p.recurring.interval,
            interval_count: p.recurring.interval_count
          } : null
        }))
      };
    } catch (error: any) {
      results.success = false;
      results.details.prices = {
        success: false,
        error: error.message
      };
    }

    // Test 4: Check price ID configuration
    const priceIds = {
      builder: process.env.STRIPE_PRICE_BUILDER,
      live_trader: process.env.STRIPE_PRICE_LIVE_TRADER,
      automation_pro: process.env.STRIPE_PRICE_AUTOMATION_PRO
    };

    results.details.priceConfiguration = {
      configured: Object.values(priceIds).every(id => !!id),
      priceIds
    };

    if (!Object.values(priceIds).every(id => !!id)) {
      results.success = false;
      results.details.priceConfiguration.warning = 'Not all price IDs are configured';
    }

    // Test 5: Verify webhook secret
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    results.details.webhook = {
      configured: !!webhookSecret,
      secret: webhookSecret ? '••••' + webhookSecret.slice(-4) : 'Not configured'
    };

    if (!webhookSecret) {
      results.details.webhook.warning = 'Webhook secret not configured. Webhooks will not work.';
    }

    // Add warnings summary
    const warnings = [];
    if (!Object.values(priceIds).every(id => !!id)) {
      warnings.push('Price IDs not fully configured');
    }
    if (!webhookSecret) {
      warnings.push('Webhook secret not configured');
    }

    if (warnings.length > 0) {
      results.warnings = warnings;
    }

    return NextResponse.json(results);

  } catch (error: any) {
    results.success = false;
    results.details.error = error.message;
    return NextResponse.json(results, { status: 500 });
  }
}