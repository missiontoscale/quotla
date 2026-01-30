import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import {
  createCheckoutSession,
  cancelSubscription,
  reactivateSubscription,
  updateSubscription,
  getOrCreateCustomer,
} from '@/lib/stripe/subscription'
import { SUBSCRIPTION_PLANS, getPlanById } from '@/lib/constants/plans'

type ActionType = 'create_checkout' | 'cancel' | 'reactivate' | 'update'

interface RequestBody {
  action: ActionType
  planId?: string
  subscriptionId?: string
  newPriceId?: string
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: RequestBody = await req.json()
    const { action } = body

    switch (action) {
      case 'create_checkout': {
        const { planId } = body
        if (!planId) {
          return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 })
        }

        const plan = getPlanById(planId)
        if (!plan || !plan.stripePriceId) {
          return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
        }

        // Get or create Stripe customer
        const customer = await getOrCreateCustomer({
          userId: user.id,
          email: user.email!,
        })

        // Store customer in database
        await supabase.from('stripe_customers').upsert({
          user_id: user.id,
          stripe_customer_id: customer.id,
          email: user.email,
          updated_at: new Date().toISOString(),
        })

        const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || ''

        const session = await createCheckoutSession({
          userId: user.id,
          email: user.email!,
          priceId: plan.stripePriceId,
          planId: plan.id,
          successUrl: `${origin}/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${origin}/billing?canceled=true`,
        })

        return NextResponse.json({ url: session.url, sessionId: session.id })
      }

      case 'cancel': {
        const { subscriptionId } = body
        if (!subscriptionId) {
          return NextResponse.json({ error: 'Subscription ID is required' }, { status: 400 })
        }

        // Verify subscription belongs to user
        const { data: subData } = await supabase
          .from('stripe_subscriptions')
          .select('stripe_subscription_id')
          .eq('user_id', user.id)
          .eq('stripe_subscription_id', subscriptionId)
          .maybeSingle()

        if (!subData) {
          return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
        }

        const subscription = await cancelSubscription(subscriptionId, false)

        // Update database
        await supabase
          .from('stripe_subscriptions')
          .update({
            cancel_at_period_end: true,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscriptionId)

        return NextResponse.json({
          success: true,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
        })
      }

      case 'reactivate': {
        const { subscriptionId } = body
        if (!subscriptionId) {
          return NextResponse.json({ error: 'Subscription ID is required' }, { status: 400 })
        }

        // Verify subscription belongs to user
        const { data: subData } = await supabase
          .from('stripe_subscriptions')
          .select('stripe_subscription_id')
          .eq('user_id', user.id)
          .eq('stripe_subscription_id', subscriptionId)
          .maybeSingle()

        if (!subData) {
          return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
        }

        const subscription = await reactivateSubscription(subscriptionId)

        // Update database
        await supabase
          .from('stripe_subscriptions')
          .update({
            cancel_at_period_end: false,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscriptionId)

        return NextResponse.json({
          success: true,
          status: subscription.status,
        })
      }

      case 'update': {
        const { subscriptionId, newPriceId } = body
        if (!subscriptionId || !newPriceId) {
          return NextResponse.json(
            { error: 'Subscription ID and new price ID are required' },
            { status: 400 }
          )
        }

        // Verify subscription belongs to user
        const { data: subData } = await supabase
          .from('stripe_subscriptions')
          .select('stripe_subscription_id')
          .eq('user_id', user.id)
          .eq('stripe_subscription_id', subscriptionId)
          .maybeSingle()

        if (!subData) {
          return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
        }

        const subscription = await updateSubscription(subscriptionId, newPriceId)

        return NextResponse.json({
          success: true,
          subscription: {
            id: subscription.id,
            status: subscription.status,
            priceId: subscription.items.data[0]?.price.id,
          },
        })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Subscription API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch subscription data
    const { data: subscription } = await supabase
      .from('stripe_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['active', 'trialing', 'past_due'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    // Fetch invoices
    const { data: invoices } = await supabase
      .from('stripe_invoices')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    // Get user's plan from profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_plan')
      .eq('id', user.id)
      .maybeSingle()

    const planId = profile?.subscription_plan || 'free'
    const plan = getPlanById(planId) || SUBSCRIPTION_PLANS[0]

    return NextResponse.json({
      subscription,
      invoices: invoices || [],
      plan: {
        id: plan.id,
        name: plan.name,
        priceUSD: plan.priceUSD,
        features: plan.features,
        limits: plan.limits,
        analytics: plan.analytics,
      },
    })
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch subscription' },
      { status: 500 }
    )
  }
}
