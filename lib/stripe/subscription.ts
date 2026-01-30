import { stripe } from './config'
import { SUBSCRIPTION_PLANS, getPlanById } from '@/lib/constants/plans'
import type Stripe from 'stripe'

export interface SubscriptionDetails {
  id: string
  status: Stripe.Subscription.Status
  planId: string
  planName: string
  priceUSD: number
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  canceledAt: Date | null
  stripeCustomerId: string
  stripePriceId: string
}

export async function createCheckoutSession({
  userId,
  email,
  priceId,
  planId,
  successUrl,
  cancelUrl,
}: {
  userId: string
  email: string
  priceId: string
  planId: string
  successUrl: string
  cancelUrl: string
}): Promise<Stripe.Checkout.Session> {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer_email: email,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      user_id: userId,
      plan_id: planId,
    },
    subscription_data: {
      metadata: {
        user_id: userId,
        plan_id: planId,
      },
    },
    allow_promotion_codes: true,
  })

  return session
}

export async function createCustomerPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string
  returnUrl: string
}): Promise<Stripe.BillingPortal.Session> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })

  return session
}

export async function getSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription | null> {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    return subscription
  } catch {
    return null
  }
}

export async function getCustomerSubscriptions(
  customerId: string
): Promise<Stripe.Subscription[]> {
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: 'all',
    limit: 10,
  })

  return subscriptions.data
}

export async function cancelSubscription(
  subscriptionId: string,
  cancelImmediately = false
): Promise<Stripe.Subscription> {
  if (cancelImmediately) {
    return stripe.subscriptions.cancel(subscriptionId)
  }

  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  })
}

export async function reactivateSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  })
}

export async function updateSubscription(
  subscriptionId: string,
  newPriceId: string
): Promise<Stripe.Subscription> {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)

  return stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: newPriceId,
      },
    ],
    proration_behavior: 'create_prorations',
  })
}

export async function getOrCreateCustomer({
  userId,
  email,
  name,
}: {
  userId: string
  email: string
  name?: string
}): Promise<Stripe.Customer> {
  // Search for existing customer by email
  const existingCustomers = await stripe.customers.list({
    email,
    limit: 1,
  })

  if (existingCustomers.data.length > 0) {
    const customer = existingCustomers.data[0]
    // Update metadata if user_id is different
    if (customer.metadata.user_id !== userId) {
      return stripe.customers.update(customer.id, {
        metadata: { user_id: userId },
      })
    }
    return customer
  }

  // Create new customer
  return stripe.customers.create({
    email,
    name,
    metadata: {
      user_id: userId,
    },
  })
}

export async function getCustomerInvoices(
  customerId: string,
  limit = 10
): Promise<Stripe.Invoice[]> {
  const invoices = await stripe.invoices.list({
    customer: customerId,
    limit,
  })

  return invoices.data
}

export async function getCustomerPaymentMethods(
  customerId: string
): Promise<Stripe.PaymentMethod[]> {
  const paymentMethods = await stripe.paymentMethods.list({
    customer: customerId,
    type: 'card',
  })

  return paymentMethods.data
}

export function mapSubscriptionToDetails(
  subscription: Stripe.Subscription
): SubscriptionDetails {
  const priceId = subscription.items.data[0]?.price.id || ''
  const planId = subscription.metadata.plan_id || 'free'
  const plan = getPlanById(planId) || SUBSCRIPTION_PLANS[0]

  return {
    id: subscription.id,
    status: subscription.status,
    planId,
    planName: plan.name,
    priceUSD: plan.priceUSD,
    currentPeriodStart: new Date(subscription.current_period_start * 1000),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    canceledAt: subscription.canceled_at
      ? new Date(subscription.canceled_at * 1000)
      : null,
    stripeCustomerId: subscription.customer as string,
    stripePriceId: priceId,
  }
}

export function formatSubscriptionStatus(status: Stripe.Subscription.Status): string {
  const statusMap: Record<Stripe.Subscription.Status, string> = {
    active: 'Active',
    canceled: 'Canceled',
    incomplete: 'Incomplete',
    incomplete_expired: 'Expired',
    past_due: 'Past Due',
    paused: 'Paused',
    trialing: 'Trial',
    unpaid: 'Unpaid',
  }

  return statusMap[status] || status
}

export function isSubscriptionActive(status: Stripe.Subscription.Status): boolean {
  return ['active', 'trialing'].includes(status)
}