import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getStripe, getOrCreateStripeCustomer, STRIPE_PRICE_IDS } from '@/lib/stripe';

/**
 * POST /api/checkout
 * Creates a Stripe Checkout Session for a subscription upgrade.
 * Expects JSON body: { plan: 'pro' | 'enterprise' }
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { plan } = body;

    if (!plan || !STRIPE_PRICE_IDS[plan]) {
      return NextResponse.json(
        { error: 'Invalid plan. Must be "pro" or "enterprise".' },
        { status: 400 },
      );
    }

    const priceId = STRIPE_PRICE_IDS[plan];
    if (!priceId) {
      return NextResponse.json(
        { error: 'Stripe Price ID not configured for this plan.' },
        { status: 500 },
      );
    }

    // Get or create the Stripe customer
    const customerId = await getOrCreateStripeCustomer(user.id, user.email!);

    // Get the user's subscription ID for metadata
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .single();

    const stripe = getStripe();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/dashboard/billing?success=true`,
      cancel_url: `${appUrl}/dashboard/billing?canceled=true`,
      metadata: {
        user_id: user.id,
        supabase_subscription_id: subscription?.id || '',
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          supabase_subscription_id: subscription?.id || '',
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 },
    );
  }
}
