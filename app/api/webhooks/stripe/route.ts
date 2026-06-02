import { NextResponse } from 'next/server';
import { getStripe, priceIdToPlan } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase/admin';
import type Stripe from 'stripe';

/**
 * POST /api/webhooks/stripe
 * Receives Stripe webhook events and updates subscription state in Supabase.
 *
 * Events handled:
 * - checkout.session.completed — user completed a checkout
 * - customer.subscription.updated — plan changed, status changed, etc.
 * - customer.subscription.deleted — subscription canceled
 * - invoice.payment_failed — payment failed
 */
export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 },
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 },
    );
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`Webhook signature verification failed: ${message}`);
    return NextResponse.json(
      { error: `Webhook Error: ${message}` },
      { status: 400 },
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      }
      case 'customer.subscription.updated': {
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      }
      case 'customer.subscription.deleted': {
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      }
      case 'invoice.payment_failed': {
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      }
      default:
        // Unhandled event type — acknowledge receipt
        break;
    }
  } catch (err) {
    console.error(`Error processing webhook event ${event.type}:`, err);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}

// ─── Event Handlers ───────────────────────────────────────────────────────────

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id;
  if (!userId) {
    console.error('checkout.session.completed: missing user_id in metadata');
    return;
  }

  const stripe = getStripe();
  const subscriptionId = session.subscription as string;

  // Retrieve the full subscription to get price info
  const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
  const priceId = stripeSubscription.items.data[0]?.price.id || '';
  const plan = priceIdToPlan(priceId);

  const { error } = await supabaseAdmin
    .from('subscriptions')
    .update({
      plan,
      status: 'active',
      stripe_subscription_id: subscriptionId,
      stripe_customer_id: session.customer as string,
      stripe_price_id: priceId,
      current_period_start: new Date(
        (stripeSubscription.items.data[0]?.current_period_start ?? Math.floor(Date.now() / 1000)) * 1000,
      ).toISOString(),
      current_period_end: new Date(
        (stripeSubscription.items.data[0]?.current_period_end ?? Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60) * 1000,
      ).toISOString(),
      cancel_at_period_end: false,
    })
    .eq('user_id', userId);

  if (error) {
    console.error('Failed to update subscription after checkout:', error);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.user_id;
  if (!userId) {
    // Try to find user by stripe_subscription_id
    const { data } = await supabaseAdmin
      .from('subscriptions')
      .select('user_id')
      .eq('stripe_subscription_id', subscription.id)
      .single();

    if (!data) {
      console.error('subscription.updated: cannot find user for subscription', subscription.id);
      return;
    }

    await updateSubscriptionInDb(data.user_id, subscription);
    return;
  }

  await updateSubscriptionInDb(userId, subscription);
}

async function updateSubscriptionInDb(userId: string, subscription: Stripe.Subscription) {
  const priceId = subscription.items.data[0]?.price.id || '';
  const plan = priceIdToPlan(priceId);

  // Map Stripe status to our status enum
  let status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'paused' = 'active';
  switch (subscription.status) {
    case 'active':
      status = 'active';
      break;
    case 'past_due':
      status = 'past_due';
      break;
    case 'canceled':
    case 'unpaid':
      status = 'canceled';
      break;
    case 'trialing':
      status = 'trialing';
      break;
    case 'paused':
      status = 'paused';
      break;
    default:
      status = 'active';
  }

  const { error } = await supabaseAdmin
    .from('subscriptions')
    .update({
      plan,
      status,
      stripe_price_id: priceId,
      current_period_start: new Date(
        (subscription.items.data[0]?.current_period_start ?? Math.floor(Date.now() / 1000)) * 1000,
      ).toISOString(),
      current_period_end: new Date(
        (subscription.items.data[0]?.current_period_end ?? Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60) * 1000,
      ).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
    })
    .eq('user_id', userId);

  if (error) {
    console.error('Failed to update subscription:', error);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.user_id;

  // Look up by stripe_subscription_id if metadata missing
  let targetUserId = userId;
  if (!targetUserId) {
    const { data } = await supabaseAdmin
      .from('subscriptions')
      .select('user_id')
      .eq('stripe_subscription_id', subscription.id)
      .single();

    if (!data) {
      console.error('subscription.deleted: cannot find user for subscription', subscription.id);
      return;
    }
    targetUserId = data.user_id;
  }

  // Revert to free plan
  const { error } = await supabaseAdmin
    .from('subscriptions')
    .update({
      plan: 'free',
      status: 'canceled',
      stripe_subscription_id: null,
      stripe_price_id: null,
      cancel_at_period_end: false,
    })
    .eq('user_id', targetUserId);

  if (error) {
    console.error('Failed to revert subscription to free:', error);
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  if (!customerId) return;

  // Find subscription by Stripe customer ID
  const { data } = await supabaseAdmin
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!data) {
    console.error('invoice.payment_failed: cannot find user for customer', customerId);
    return;
  }

  const { error } = await supabaseAdmin
    .from('subscriptions')
    .update({ status: 'past_due' })
    .eq('user_id', data.user_id);

  if (error) {
    console.error('Failed to mark subscription as past_due:', error);
  }
}
