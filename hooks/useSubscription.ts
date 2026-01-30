'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase/client'
import {
  SUBSCRIPTION_PLANS,
  getPlanById,
  canAccessFeature,
  type SubscriptionPlan,
} from '@/lib/constants/plans'
import type { StripeSubscription, StripeInvoice } from '@/types'

interface PaymentMethod {
  id: string
  brand: string
  last4: string
  expMonth: number
  expYear: number
  isDefault: boolean
}

interface SubscriptionState {
  subscription: StripeSubscription | null
  plan: SubscriptionPlan
  invoices: StripeInvoice[]
  paymentMethods: PaymentMethod[]
  loading: boolean
  error: string | null
}

interface UseSubscriptionReturn extends SubscriptionState {
  refresh: () => Promise<void>
  canAccess: (feature: keyof SubscriptionPlan['analytics']) => boolean
  isFreePlan: boolean
  isPaidPlan: boolean
  isActive: boolean
  isCanceling: boolean
  daysUntilRenewal: number | null
  createCheckoutSession: (planId: string) => Promise<string | null>
  createPortalSession: () => Promise<string | null>
  cancelSubscription: () => Promise<boolean>
  reactivateSubscription: () => Promise<boolean>
}

const DEFAULT_PLAN = SUBSCRIPTION_PLANS[0] // Free plan

export function useSubscription(): UseSubscriptionReturn {
  const { user, profile } = useAuth()
  const [state, setState] = useState<SubscriptionState>({
    subscription: null,
    plan: DEFAULT_PLAN,
    invoices: [],
    paymentMethods: [],
    loading: true,
    error: null,
  })

  const fetchSubscriptionData = useCallback(async () => {
    if (!user) {
      setState((prev) => ({
        ...prev,
        loading: false,
        subscription: null,
        plan: DEFAULT_PLAN,
      }))
      return
    }

    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      // Fetch active subscription
      const { data: subscriptionData, error: subError } = await supabase
        .from('stripe_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['active', 'trialing', 'past_due'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (subError && subError.code !== 'PGRST116') {
        throw subError
      }

      // Determine plan from profile or subscription
      const planId = profile?.subscription_plan || 'free'
      const plan = getPlanById(planId) || DEFAULT_PLAN

      // Fetch recent invoices
      const { data: invoicesData } = await supabase
        .from('stripe_invoices')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      setState({
        subscription: subscriptionData as StripeSubscription | null,
        plan,
        invoices: (invoicesData as StripeInvoice[]) || [],
        paymentMethods: [],
        loading: false,
        error: null,
      })
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load subscription',
      }))
    }
  }, [user, profile?.subscription_plan])

  useEffect(() => {
    fetchSubscriptionData()
  }, [fetchSubscriptionData])

  const canAccess = useCallback(
    (feature: keyof SubscriptionPlan['analytics']): boolean => {
      return canAccessFeature(state.plan.id, feature)
    },
    [state.plan.id]
  )

  const createCheckoutSession = useCallback(
    async (planId: string): Promise<string | null> => {
      if (!user) return null

      try {
        const response = await fetch('/api/billing/subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create_checkout',
            planId,
          }),
        })

        const data = await response.json()
        if (!response.ok) throw new Error(data.error)

        return data.url
      } catch (err) {
        console.error('Failed to create checkout session:', err)
        return null
      }
    },
    [user]
  )

  const createPortalSession = useCallback(async (): Promise<string | null> => {
    if (!user) return null

    try {
      const response = await fetch('/api/billing/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      return data.url
    } catch (err) {
      console.error('Failed to create portal session:', err)
      return null
    }
  }, [user])

  const cancelSubscription = useCallback(async (): Promise<boolean> => {
    if (!state.subscription) return false

    try {
      const response = await fetch('/api/billing/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'cancel',
          subscriptionId: state.subscription.stripe_subscription_id,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error)
      }

      await fetchSubscriptionData()
      return true
    } catch (err) {
      console.error('Failed to cancel subscription:', err)
      return false
    }
  }, [state.subscription, fetchSubscriptionData])

  const reactivateSubscription = useCallback(async (): Promise<boolean> => {
    if (!state.subscription) return false

    try {
      const response = await fetch('/api/billing/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reactivate',
          subscriptionId: state.subscription.stripe_subscription_id,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error)
      }

      await fetchSubscriptionData()
      return true
    } catch (err) {
      console.error('Failed to reactivate subscription:', err)
      return false
    }
  }, [state.subscription, fetchSubscriptionData])

  // Calculate days until renewal
  const daysUntilRenewal = state.subscription
    ? Math.ceil(
        (new Date(state.subscription.current_period_end).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24)
      )
    : null

  return {
    ...state,
    refresh: fetchSubscriptionData,
    canAccess,
    isFreePlan: state.plan.id === 'free',
    isPaidPlan: state.plan.priceUSD > 0,
    isActive: state.subscription?.status === 'active' || state.subscription?.status === 'trialing',
    isCanceling: state.subscription?.cancel_at_period_end || false,
    daysUntilRenewal,
    createCheckoutSession,
    createPortalSession,
    cancelSubscription,
    reactivateSubscription,
  }
}