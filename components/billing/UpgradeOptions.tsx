'use client'

import { useState } from 'react'
import { Check, Loader2, Sparkles } from 'lucide-react'
import { SUBSCRIPTION_PLANS, getUpgradePlans, type SubscriptionPlan } from '@/lib/constants/plans'

interface UpgradeOptionsProps {
  currentPlanId: string
  onUpgrade: (planId: string) => Promise<string | null>
}

export function UpgradeOptions({ currentPlanId, onUpgrade }: UpgradeOptionsProps) {
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null)

  const upgradePlans = getUpgradePlans(currentPlanId)

  const handleUpgrade = async (planId: string) => {
    setLoadingPlanId(planId)
    try {
      const url = await onUpgrade(planId)
      if (url) {
        window.location.href = url
      }
    } finally {
      setLoadingPlanId(null)
    }
  }

  if (upgradePlans.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500" />
          <h3 className="text-lg font-semibold text-gray-900">You're on our top plan!</h3>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Enjoy all the premium features included in your subscription.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-amber-500" />
        <h3 className="text-lg font-semibold text-gray-900">Upgrade Your Plan</h3>
      </div>
      <p className="mt-1 text-sm text-gray-600">
        Unlock more features and higher limits with a premium plan.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {upgradePlans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isLoading={loadingPlanId === plan.id}
            isCurrentPlan={plan.id === currentPlanId}
            onUpgrade={() => handleUpgrade(plan.id)}
          />
        ))}
      </div>
    </div>
  )
}

interface PlanCardProps {
  plan: SubscriptionPlan
  isLoading: boolean
  isCurrentPlan: boolean
  onUpgrade: () => void
}

function PlanCard({ plan, isLoading, isCurrentPlan, onUpgrade }: PlanCardProps) {
  return (
    <div
      className={`relative rounded-lg border p-4 ${
        plan.popular ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200'
      }`}
    >
      {plan.popular && (
        <span className="absolute -top-2.5 left-4 rounded-full bg-blue-500 px-2 py-0.5 text-xs font-medium text-white">
          Most Popular
        </span>
      )}

      <div className="mb-4">
        <h4 className="text-lg font-semibold text-gray-900">{plan.name}</h4>
        <p className="mt-1">
          <span className="text-2xl font-bold text-gray-900">${plan.priceUSD}</span>
          <span className="text-sm text-gray-500">/month</span>
        </p>
      </div>

      <ul className="mb-4 space-y-2">
        {plan.features.slice(0, 4).map((feature, index) => (
          <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
            <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
            <span>{feature}</span>
          </li>
        ))}
        {plan.features.length > 4 && (
          <li className="text-sm text-gray-500">+{plan.features.length - 4} more</li>
        )}
      </ul>

      <button
        onClick={onUpgrade}
        disabled={isLoading || isCurrentPlan}
        className={`w-full rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
          plan.popular
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-900 text-white hover:bg-gray-800'
        }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </span>
        ) : isCurrentPlan ? (
          'Current Plan'
        ) : (
          plan.cta
        )}
      </button>
    </div>
  )
}
