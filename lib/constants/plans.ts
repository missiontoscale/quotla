export interface UsageStats {
  aiQuotesUsed: number
  manualQuotesUsed: number
  manualInvoicesUsed: number
  period: string
}

export interface QuotaInfo {
  aiQuotes: {
    used: number
    total: number
    remaining: number
    percentage: number
  }
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
    aiQuotes: number
    quotes: number
    invoices: number
  }
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    priceUSD: 0,
    features: [
      '3 AI-generated quotes per month',
      '10 manual quotes',
      '5 manual invoices',
      'Basic templates',
      'Email support',
    ],
    cta: 'Get Started',
    limits: {
      aiQuotes: 3,
      quotes: 10,
      invoices: 5,
    },
  },
  {
    id: 'professional',
    name: 'Professional',
    priceUSD: 19,
    popular: true,
    features: [
      '50 AI-generated quotes per month',
      'Unlimited manual quotes',
      'Unlimited invoices',
      'Premium templates',
      'Priority support',
      'Custom branding',
    ],
    cta: 'Upgrade to Professional',
    limits: {
      aiQuotes: 50,
      quotes: Infinity,
      invoices: Infinity,
    },
  },
  {
    id: 'business',
    name: 'Business',
    priceUSD: 49,
    features: [
      'Unlimited AI-generated quotes',
      'Unlimited manual quotes',
      'Unlimited invoices',
      'All premium templates',
      '24/7 priority support',
      'Custom branding',
      'Team collaboration',
      'Advanced analytics',
    ],
    cta: 'Upgrade to Business',
    limits: {
      aiQuotes: Infinity,
      quotes: Infinity,
      invoices: Infinity,
    },
  },
]

export function getRemainingQuota(
  planId: string,
  usageStats: UsageStats
): QuotaInfo | null {
  const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId)
  if (!plan) return null

  const aiQuotesUsed = usageStats.aiQuotesUsed
  const quotesUsed = usageStats.manualQuotesUsed
  const invoicesUsed = usageStats.manualInvoicesUsed

  const aiQuotesTotal = plan.limits.aiQuotes
  const quotesTotal = plan.limits.quotes
  const invoicesTotal = plan.limits.invoices

  return {
    aiQuotes: {
      used: aiQuotesUsed,
      total: aiQuotesTotal,
      remaining:
        aiQuotesTotal === Infinity
          ? Infinity
          : Math.max(0, aiQuotesTotal - aiQuotesUsed),
      percentage:
        aiQuotesTotal === Infinity
          ? 0
          : (aiQuotesUsed / aiQuotesTotal) * 100,
    },
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
