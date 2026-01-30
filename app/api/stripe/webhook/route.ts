import { NextRequest, NextResponse } from 'next/server';
import { stripe, STRIPE_CONFIG } from '@/lib/stripe/config';
import { supabase } from '@/lib/supabase/client';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    if (!STRIPE_CONFIG.webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET is not configured');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        STRIPE_CONFIG.webhookSecret
      );
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'invoice.paid':
      case 'invoice.payment_succeeded':
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case 'customer.created':
      case 'customer.updated':
        await handleCustomerUpdated(event.data.object as Stripe.Customer);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error handling webhook:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment succeeded:', paymentIntent.id);

  // Update payment intent status in database
  await supabase
    .from('stripe_payment_intents')
    .update({ status: 'succeeded', updated_at: new Date().toISOString() })
    .eq('stripe_payment_intent_id', paymentIntent.id);

  // Update related invoice or quote if metadata contains IDs
  if (paymentIntent.metadata.invoice_id) {
    await supabase
      .from('invoices')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentIntent.metadata.invoice_id);
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment failed:', paymentIntent.id);

  // Update payment intent status in database
  await supabase
    .from('stripe_payment_intents')
    .update({ status: 'failed', updated_at: new Date().toISOString() })
    .eq('stripe_payment_intent_id', paymentIntent.id);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Subscription updated:', subscription.id);

  const userId = subscription.metadata.user_id;

  if (!userId) {
    console.error('No user_id in subscription metadata');
    return;
  }

  // Upsert subscription in database
  await supabase.from('stripe_subscriptions').upsert({
    user_id: userId,
    stripe_subscription_id: subscription.id,
    stripe_customer_id: subscription.customer as string,
    stripe_price_id: subscription.items.data[0]?.price.id,
    status: subscription.status,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
    metadata: subscription.metadata,
    updated_at: new Date().toISOString(),
  });

  // Update user's subscription plan in profiles table
  const planId = subscription.metadata.plan_id || 'free';
  await supabase
    .from('profiles')
    .update({
      subscription_plan: planId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Subscription deleted:', subscription.id);

  const userId = subscription.metadata.user_id;

  if (!userId) {
    console.error('No user_id in subscription metadata');
    return;
  }

  // Update subscription status in database
  await supabase
    .from('stripe_subscriptions')
    .update({ status: 'canceled', updated_at: new Date().toISOString() })
    .eq('stripe_subscription_id', subscription.id);

  // Downgrade user to free plan
  await supabase
    .from('profiles')
    .update({
      subscription_plan: 'free',
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('Checkout session completed:', session.id);

  const userId = session.metadata?.user_id;

  if (!userId) {
    console.error('No user_id in session metadata');
    return;
  }

  // Store customer mapping if available
  if (session.customer) {
    await supabase.from('stripe_customers').upsert({
      user_id: userId,
      stripe_customer_id: session.customer as string,
      email: session.customer_email,
      updated_at: new Date().toISOString(),
    });
  }

  // Handle subscription or one-time payment based on mode
  if (session.mode === 'subscription') {
    // Subscription will be handled by subscription.created event
    console.log('Subscription checkout completed');
  } else if (session.mode === 'payment') {
    // Handle one-time payment
    console.log('One-time payment checkout completed');
  }
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  console.log('Invoice paid:', invoice.id);

  const customerId = invoice.customer as string;

  // Get user_id from customer mapping
  const { data: customerData } = await supabase
    .from('stripe_customers')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .maybeSingle();

  if (!customerData) {
    console.error('No user found for customer:', customerId);
    return;
  }

  // Upsert invoice record
  await supabase.from('stripe_invoices').upsert({
    user_id: customerData.user_id,
    stripe_invoice_id: invoice.id,
    stripe_customer_id: customerId,
    stripe_subscription_id: invoice.subscription as string | null,
    amount_due: invoice.amount_due,
    amount_paid: invoice.amount_paid,
    currency: invoice.currency,
    status: 'paid',
    invoice_pdf: invoice.invoice_pdf,
    hosted_invoice_url: invoice.hosted_invoice_url,
    period_start: new Date((invoice.period_start || 0) * 1000).toISOString(),
    period_end: new Date((invoice.period_end || 0) * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  });
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Invoice payment failed:', invoice.id);

  const customerId = invoice.customer as string;

  // Get user_id from customer mapping
  const { data: customerData } = await supabase
    .from('stripe_customers')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .maybeSingle();

  if (!customerData) {
    console.error('No user found for customer:', customerId);
    return;
  }

  // Update invoice status
  await supabase
    .from('stripe_invoices')
    .update({
      status: 'open',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_invoice_id', invoice.id);

  // Optionally create a notification for the user
  await supabase.from('notifications').insert({
    user_id: customerData.user_id,
    type: 'system',
    title: 'Payment Failed',
    message: 'Your subscription payment failed. Please update your payment method.',
    priority: 'high',
    action_url: '/billing',
  });
}

async function handleCustomerUpdated(customer: Stripe.Customer) {
  console.log('Customer updated:', customer.id);

  const userId = customer.metadata.user_id;

  if (!userId) {
    // Customer might exist from before metadata was added
    return;
  }

  // Update customer record
  await supabase.from('stripe_customers').upsert({
    user_id: userId,
    stripe_customer_id: customer.id,
    email: customer.email,
    name: customer.name,
    updated_at: new Date().toISOString(),
  });
}
