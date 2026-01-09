import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/config';
import { supabase } from '@/lib/supabase/client';

export async function POST(req: NextRequest) {
  try {
    const {
      amount,
      currency = 'usd',
      metadata = {},
      description,
      receipt_email,
    } = await req.json();

    // Validate amount
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata,
      description,
      receipt_email,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Store payment intent in database
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      await supabase.from('stripe_payment_intents').insert({
        user_id: user.id,
        stripe_payment_intent_id: paymentIntent.id,
        amount,
        currency,
        status: paymentIntent.status,
        client_secret: paymentIntent.client_secret,
        metadata,
      });
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
