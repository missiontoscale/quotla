import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/config';
import { supabase } from '@/lib/supabase/client';

export async function POST(req: NextRequest) {
  try {
    const {
      priceId,
      successUrl,
      cancelUrl,
      customerEmail,
      metadata = {},
      mode = 'subscription',
    } = await req.json();

    // Validate required fields
    if (!priceId || !successUrl || !cancelUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data: { user } } = await supabase.auth.getUser();

    // Get or create Stripe customer
    let customerId: string | undefined;

    if (user) {
      const { data: existingCustomer } = await supabase
        .from('stripe_customers')
        .select('stripe_customer_id')
        .eq('user_id', user.id)
        .single();

      if (existingCustomer) {
        customerId = existingCustomer.stripe_customer_id;
      } else if (customerEmail) {
        // Create new Stripe customer
        const customer = await stripe.customers.create({
          email: customerEmail,
          metadata: {
            user_id: user.id,
          },
        });

        customerId = customer.id;

        // Store customer in database
        await supabase.from('stripe_customers').insert({
          user_id: user.id,
          stripe_customer_id: customer.id,
          email: customerEmail,
          metadata: {},
        });
      }
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: mode as 'subscription' | 'payment',
      customer: customerId,
      customer_email: !customerId ? customerEmail : undefined,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        ...metadata,
        user_id: user?.id,
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
