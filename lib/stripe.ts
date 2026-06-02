import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase/admin';
import type { SubscriptionPlan } from '@/lib/types';

// ─── Stripe Server Client (singleton) ─────────────────────────────────────────
// Defaults to TEST MODE — use sk_test_ / pk_test_ keys during development.
// Switch to sk_live_ / pk_live_ keys for production.

let stripeInstance: Stripe | null = null;

/**
 * Returns true if the Stripe secret key is a test-mode key (sk_test_*).
 */
export function isStripeTestMode(): boolean {
  const key = process.env.STRIPE_SECRET_KEY || '';
  return key.startsWith('sk_test_');
}

export function getStripe(): Stripe {
  if (!stripeInstance) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }
    stripeInstance = new Stripe(key, {
      typescript: true,
    });
    console.log(
      `[Stripe] Initialized in ${key.startsWith('sk_test_') ? '🧪 TEST' : '🔴 LIVE'} mode`,
    );
  }
  return stripeInstance;
}

// ─── Price ID ↔ Plan Mapping ──────────────────────────────────────────────────

export const STRIPE_PRICE_IDS: Record<string, string> = {
  pro: process.env.STRIPE_PRO_PRICE_ID || '',
  enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID || '',
};

/**
 * Reverse-lookup: given a Stripe Price ID, return the corresponding plan name.
 * Falls back to 'free' if no match is found.
 */
export function priceIdToPlan(priceId: string): SubscriptionPlan {
  for (const [plan, id] of Object.entries(STRIPE_PRICE_IDS)) {
    if (id === priceId) return plan as SubscriptionPlan;
  }
  return 'free';
}

// ─── Customer Management ──────────────────────────────────────────────────────

/**
 * Gets or creates a Stripe Customer for the given user.
 * Stores the `stripe_customer_id` in the subscriptions table.
 */
export async function getOrCreateStripeCustomer(
  userId: string,
  email: string,
): Promise<string> {
  // 1. Check if user already has a Stripe customer ID
  const { data: subscription } = await supabaseAdmin
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', userId)
    .single();

  if (subscription?.stripe_customer_id) {
    return subscription.stripe_customer_id;
  }

  // 2. Create a new Stripe customer
  const stripe = getStripe();
  const customer = await stripe.customers.create({
    email,
    metadata: {
      supabase_user_id: userId,
    },
  });

  // 3. Persist the customer ID
  await supabaseAdmin
    .from('subscriptions')
    .update({ stripe_customer_id: customer.id })
    .eq('user_id', userId);

  return customer.id;
}
