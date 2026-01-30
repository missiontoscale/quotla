'use client'

import { useState } from 'react'
import { Crown, Calendar, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import type { SubscriptionPlan } from '@/lib/constants/plans'
import type { StripeSubscription } from '@/types'

interface CurrentPlanCardProps {
  plan: SubscriptionPlan
  subscription: StripeSubscription | null
  isCanceling: boolean
  daysUntilRenewal: number | null
  onManageBilling: () => void
  onReactivate: () => Promise<boolean>
  isLoading?: boolean
}

export function CurrentPlanCard({
  plan,
  subscription,
  isCanceling,
  daysUntilRenewal,
  onManageBilling,
  onReactivate,
  isLoading,
}: CurrentPlanCardProps) {
  const [reactivating, setReactivating] = useState(false)

  const handleReactivate = async () => {
    setReactivating(true)
    try {
      await onReactivate()
    } finally {
      setReactivating(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getStatusBadge = () => {
    if (!subscription) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
          Free Plan
        </span>
      )
    }

    if (isCanceling) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
          <AlertCircle className="h-3 w-3" />
          Cancels {formatDate(subscription.current_period_end)}
        </span>
      )
    }

    if (subscription.status === 'active') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
          <CheckCircle className="h-3 w-3" />
          Active
        </span>
      )
    }

    if (subscription.status === 'trialing') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
          Trial
        </span>
      )
    }

    if (subscription.status === 'past_due') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
          <AlertCircle className="h-3 w-3" />
          Past Due
        </span>
      )
    }

    return null
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-500" />
            <h3 className="text-lg font-semibold text-gray-900">Current Plan</h3>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <span className="text-2xl font-bold text-gray-900">{plan.name}</span>
            {getStatusBadge()}
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-gray-900">
            ${plan.priceUSD}
            <span className="text-base font-normal text-gray-500">/mo</span>
          </p>
        </div>
      </div>

      {subscription && (
        <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          {isCanceling ? (
            <span>Access until {formatDate(subscription.current_period_end)}</span>
          ) : daysUntilRenewal !== null ? (
            <span>
              Renews in {daysUntilRenewal} {daysUntilRenewal === 1 ? 'day' : 'days'}
            </span>
          ) : null}
        </div>
      )}

      <div className="mt-6 border-t pt-4">
        <h4 className="mb-3 text-sm font-medium text-gray-900">Plan Features</h4>
        <ul className="space-y-2">
          {plan.features.slice(0, 5).map((feature, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
              <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
              {feature}
            </li>
          ))}
          {plan.features.length > 5 && (
            <li className="text-sm text-gray-500">+{plan.features.length - 5} more features</li>
          )}
        </ul>
      </div>

      <div className="mt-6 flex gap-3">
        {isCanceling ? (
          <button
            onClick={handleReactivate}
            disabled={reactivating}
            className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {reactivating ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Reactivating...
              </span>
            ) : (
              'Reactivate Subscription'
            )}
          </button>
        ) : subscription ? (
          <button
            onClick={onManageBilling}
            className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Manage Billing
          </button>
        ) : null}
      </div>
    </div>
  )
}
