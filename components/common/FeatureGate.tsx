'use client'

import { ReactNode } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  isFeatureAvailable,
  type GatedFeature,
} from '@/lib/permissions/feature-gates'
import { UpgradePrompt } from './UpgradePrompt'

interface FeatureGateProps {
  feature: GatedFeature
  children: ReactNode
  fallback?: ReactNode
  showUpgradePrompt?: boolean
  blurContent?: boolean
  inline?: boolean
}

export function FeatureGate({
  feature,
  children,
  fallback,
  showUpgradePrompt = true,
  blurContent = false,
  inline = false,
}: FeatureGateProps) {
  const { subscriptionPlan } = useAuth()
  const hasAccess = isFeatureAvailable(subscriptionPlan.id, feature)

  if (hasAccess) {
    return <>{children}</>
  }

  // If blurContent is true, show blurred content with upgrade overlay
  if (blurContent) {
    return (
      <div className="relative">
        <div className="pointer-events-none select-none blur-sm opacity-50">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-[2px]">
          <UpgradePrompt
            feature={feature}
            currentPlanId={subscriptionPlan.id}
            compact
          />
        </div>
      </div>
    )
  }

  // Show custom fallback if provided
  if (fallback) {
    return <>{fallback}</>
  }

  // Show upgrade prompt
  if (showUpgradePrompt) {
    return (
      <UpgradePrompt
        feature={feature}
        currentPlanId={subscriptionPlan.id}
        inline={inline}
      />
    )
  }

  // Hide content entirely
  return null
}

// Higher-order component version
export function withFeatureGate<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  feature: GatedFeature,
  options?: Omit<FeatureGateProps, 'feature' | 'children'>
) {
  return function FeatureGatedComponent(props: P) {
    return (
      <FeatureGate feature={feature} {...options}>
        <WrappedComponent {...props} />
      </FeatureGate>
    )
  }
}

// Hook for programmatic feature checking
export function useFeatureGate(feature: GatedFeature): {
  hasAccess: boolean
  planId: string
} {
  const { subscriptionPlan } = useAuth()
  return {
    hasAccess: isFeatureAvailable(subscriptionPlan.id, feature),
    planId: subscriptionPlan.id,
  }
}