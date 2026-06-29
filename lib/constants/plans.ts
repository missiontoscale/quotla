export interface UsageStats {
  manualQuotesUsed: number
  manualInvoicesUsed: number
  period: string
}

export interface QuotaInfo {
  quotes: {
    used: number
    total: number
    remaining: number
    percentage: number
  }
  invoices: {
    used: number
    total: number
    remaining: number
    percentage: number
  }
}

export interface SubscriptionPlan {
  id: string
  name: string
  priceUSD: number
  popular?: boolean
  features: string[]
  cta: string
  limits: {
    quotes: number
    invoices: number
  }
  tier: 'free' | 'starter' | 'essentials' | 'pro'
  analytics: {
    basicAnalytics: boolean
    yoyComparisons: boolean
    forecasting: boolean
    anomalyDetection: boolean
  }
}

export type PlanTier = SubscriptionPlan['tier']

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    priceUSD: 0,
    tier: 'free',
    features: [
      '5 manual quotes',
      '3 manual invoices',
      'Basic templates',
      'Email support',
    ],
    cta: 'Get Started',
    limits: {
      quotes: 5,
      invoices: 3,
    },
    analytics: {
      basicAnalytics: true,
      yoyComparisons: false,
      forecasting: false,
      anomalyDetection: false,
    },
  },
  {
    id: 'starter',
    name: 'Starter',
    priceUSD: 1,
    tier: 'starter',
    features: [
      '25 manual quotes',
      '15 manual invoices',
      'Basic templates',
      'Email support',
      'Basic analytics',
    ],
    cta: 'Start for $1',
    limits: {
      quotes: 25,
      invoices: 15,
    },
    analytics: {
      basicAnalytics: true,
      yoyComparisons: false,
      forecasting: false,
      anomalyDetection: false,
    },
  },
  {
    id: 'essentials',
    name: 'Essentials',
    priceUSD: 5,
    tier: 'essentials',
    popular: true,
    features: [
      'Unlimited manual quotes',
      'Unlimited invoices',
      'Premium templates',
      'Priority support',
      'Custom branding',
      'Basic analytics',
      'Year-over-year comparisons',
    ],
    cta: 'Get Essentials',
    limits: {
      quotes: Infinity,
      invoices: Infinity,
    },
    analytics: {
      basicAnalytics: true,
      yoyComparisons: true,
      forecasting: false,
      anomalyDetection: false,
    },
  },
  {
    id: 'pro',
    name: 'Pro',
    priceUSD: 19,
    tier: 'pro',
    features: [
      'Unlimited manual quotes',
      'Unlimited invoices',
      'All premium templates',
      '24/7 priority support',
      'Custom branding',
      'Advanced analytics',
      'Year-over-year comparisons',
      'Sales forecasting',
      'Anomaly detection & alerts',
    ],
    cta: 'Go Pro',
    limits: {
      quotes: Infinity,
      invoices: Infinity,
    },
    analytics: {
      basicAnalytics: true,
      yoyComparisons: true,
      forecasting: true,
      anomalyDetection: true,
    },
  },
]

export function getPlanById(planId: string): SubscriptionPlan | undefined {
  return SUBSCRIPTION_PLANS.find((p) => p.id === planId)
}

export function getPlanByTier(tier: PlanTier): SubscriptionPlan | undefined {
  return SUBSCRIPTION_PLANS.find((p) => p.tier === tier)
}

export function canAccessFeature(
  planId: string,
  feature: keyof SubscriptionPlan['analytics']
): boolean {
  const plan = getPlanById(planId)
  return plan?.analytics[feature] ?? false
}

export function getUpgradePlans(currentPlanId: string): SubscriptionPlan[] {
  const currentPlan = getPlanById(currentPlanId)
  if (!currentPlan) return SUBSCRIPTION_PLANS.filter((p) => p.id !== 'free')
  return SUBSCRIPTION_PLANS.filter((p) => p.priceUSD > currentPlan.priceUSD)
}

export function getRemainingQuota(
  planId: string,
  usageStats: UsageStats
): QuotaInfo | null {
  const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId)
  if (!plan) return null

  const quotesUsed = usageStats.manualQuotesUsed
  const invoicesUsed = usageStats.manualInvoicesUsed

  const quotesTotal = plan.limits.quotes
  const invoicesTotal = plan.limits.invoices

  return {
    quotes: {
      used: quotesUsed,
      total: quotesTotal,
      remaining:
        quotesTotal === Infinity
          ? Infinity
          : Math.max(0, quotesTotal - quotesUsed),
      percentage:
        quotesTotal === Infinity ? 0 : (quotesUsed / quotesTotal) * 100,
    },
    invoices: {
      used: invoicesUsed,
      total: invoicesTotal,
      remaining:
        invoicesTotal === Infinity
          ? Infinity
          : Math.max(0, invoicesTotal - invoicesUsed),
      percentage:
        invoicesTotal === Infinity ? 0 : (invoicesUsed / invoicesTotal) * 100,
    },
  }
}

export function formatQuota(used: number, total: number): string {
  if (total === Infinity) {
    return `${used}/∞`
  }
  return `${used}/${total}`
}
