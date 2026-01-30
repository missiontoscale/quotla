import {
  type SubscriptionPlan,
  type PlanTier,
  getPlanById,
  getPlanByTier,
  SUBSCRIPTION_PLANS,
} from '@/lib/constants/plans'

// Feature keys that can be gated
export type GatedFeature =
  | keyof SubscriptionPlan['analytics']
  | 'customBranding'
  | 'prioritySupport'
  | 'premiumTemplates'
  | 'unlimitedQuotes'
  | 'unlimitedInvoices'

// Map features to minimum required tier
const FEATURE_TIER_MAP: Record<GatedFeature, PlanTier> = {
  basicAnalytics: 'free',
  yoyComparisons: 'essentials',
  forecasting: 'pro',
  anomalyDetection: 'pro',
  customBranding: 'essentials',
  prioritySupport: 'essentials',
  premiumTemplates: 'essentials',
  unlimitedQuotes: 'essentials',
  unlimitedInvoices: 'essentials',
}

// Tier hierarchy for comparison
const TIER_ORDER: PlanTier[] = ['free', 'starter', 'essentials', 'pro']

function getTierIndex(tier: PlanTier): number {
  return TIER_ORDER.indexOf(tier)
}

export function isFeatureAvailable(
  userPlanId: string,
  feature: GatedFeature
): boolean {
  const userPlan = getPlanById(userPlanId)
  if (!userPlan) return false

  // Check analytics features directly
  if (feature in userPlan.analytics) {
    return userPlan.analytics[feature as keyof SubscriptionPlan['analytics']]
  }

  // Check other features by tier
  const requiredTier = FEATURE_TIER_MAP[feature]
  return getTierIndex(userPlan.tier) >= getTierIndex(requiredTier)
}

export function getMinimumPlanForFeature(feature: GatedFeature): SubscriptionPlan | undefined {
  const requiredTier = FEATURE_TIER_MAP[feature]
  return getPlanByTier(requiredTier)
}

export function getUpgradePlanForFeature(
  currentPlanId: string,
  feature: GatedFeature
): SubscriptionPlan | undefined {
  const minimumPlan = getMinimumPlanForFeature(feature)
  if (!minimumPlan) return undefined

  const currentPlan = getPlanById(currentPlanId)
  if (!currentPlan) return minimumPlan

  // If current plan is below minimum, return minimum
  if (getTierIndex(currentPlan.tier) < getTierIndex(minimumPlan.tier)) {
    return minimumPlan
  }

  return undefined
}

export function getFeatureDisplayName(feature: GatedFeature): string {
  const names: Record<GatedFeature, string> = {
    basicAnalytics: 'Basic Analytics',
    yoyComparisons: 'Year-over-Year Comparisons',
    forecasting: 'Sales Forecasting',
    anomalyDetection: 'Anomaly Detection',
    customBranding: 'Custom Branding',
    prioritySupport: 'Priority Support',
    premiumTemplates: 'Premium Templates',
    unlimitedQuotes: 'Unlimited Quotes',
    unlimitedInvoices: 'Unlimited Invoices',
  }
  return names[feature]
}

export function getFeatureDescription(feature: GatedFeature): string {
  const descriptions: Record<GatedFeature, string> = {
    basicAnalytics: 'View basic sales and expense reports',
    yoyComparisons: 'Compare your performance against the same period last year',
    forecasting: 'Predict future revenue with AI-powered forecasting',
    anomalyDetection: 'Get alerts when unusual patterns are detected in your data',
    customBranding: 'Add your logo and colors to quotes and invoices',
    prioritySupport: 'Get faster responses from our support team',
    premiumTemplates: 'Access professionally designed templates',
    unlimitedQuotes: 'Create unlimited quotes with no monthly cap',
    unlimitedInvoices: 'Create unlimited invoices with no monthly cap',
  }
  return descriptions[feature]
}

// Check multiple features at once
export function checkFeatureAccess(
  userPlanId: string,
  features: GatedFeature[]
): Record<GatedFeature, boolean> {
  return features.reduce(
    (acc, feature) => {
      acc[feature] = isFeatureAvailable(userPlanId, feature)
      return acc
    },
    {} as Record<GatedFeature, boolean>
  )
}

// Get all features available for a plan
export function getPlanFeatures(planId: string): GatedFeature[] {
  const allFeatures: GatedFeature[] = [
    'basicAnalytics',
    'yoyComparisons',
    'forecasting',
    'anomalyDetection',
    'customBranding',
    'prioritySupport',
    'premiumTemplates',
    'unlimitedQuotes',
    'unlimitedInvoices',
  ]

  return allFeatures.filter((feature) => isFeatureAvailable(planId, feature))
}

// Get features user would gain by upgrading to a specific plan
export function getUpgradeFeatures(
  currentPlanId: string,
  targetPlanId: string
): GatedFeature[] {
  const currentFeatures = getPlanFeatures(currentPlanId)
  const targetFeatures = getPlanFeatures(targetPlanId)

  return targetFeatures.filter((f) => !currentFeatures.includes(f))
}