'use client'

import { useRouter } from 'next/navigation'
import { Lock, Sparkles, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  type GatedFeature,
  getFeatureDisplayName,
  getFeatureDescription,
  getUpgradePlanForFeature,
} from '@/lib/permissions/feature-gates'

interface UpgradePromptProps {
  feature: GatedFeature
  currentPlanId: string
  compact?: boolean
  inline?: boolean
  title?: string
  description?: string
}

export function UpgradePrompt({
  feature,
  currentPlanId,
  compact = false,
  inline = false,
  title,
  description,
}: UpgradePromptProps) {
  const router = useRouter()
  const upgradePlan = getUpgradePlanForFeature(currentPlanId, feature)
  const featureName = getFeatureDisplayName(feature)
  const featureDescription = getFeatureDescription(feature)

  const handleUpgrade = () => {
    router.push('/pricing')
  }

  // Inline variant - minimal, fits within text
  if (inline) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
        <Lock className="h-3.5 w-3.5" />
        <span>
          {featureName} requires{' '}
          <button
            onClick={handleUpgrade}
            className="text-primary hover:underline font-medium"
          >
            {upgradePlan?.name || 'upgrade'}
          </button>
        </span>
      </span>
    )
  }

  // Compact variant - for overlays
  if (compact) {
    return (
      <div className="text-center p-4 max-w-xs">
        <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
          <Lock className="h-5 w-5 text-primary" />
        </div>
        <h4 className="font-semibold mb-1">{title || featureName}</h4>
        <p className="text-sm text-muted-foreground mb-4">
          {description || featureDescription}
        </p>
        <Button onClick={handleUpgrade} size="sm" className="gap-2">
          <Sparkles className="h-4 w-4" />
          Upgrade to {upgradePlan?.name || 'Pro'}
        </Button>
      </div>
    )
  }

  // Full card variant
  return (
    <Card className="border-dashed">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shrink-0">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg">
              {title || `Unlock ${featureName}`}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {description || featureDescription}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg bg-muted/50">
          <div>
            <p className="text-sm font-medium">
              Available on {upgradePlan?.name || 'higher'} plan
            </p>
            {upgradePlan && (
              <p className="text-sm text-muted-foreground">
                Starting at ${upgradePlan.priceUSD}/month
              </p>
            )}
          </div>
          <Button onClick={handleUpgrade} className="gap-2 shrink-0">
            View Plans
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Simple locked badge for use in lists/tables
export function LockedBadge({ feature }: { feature: GatedFeature }) {
  const upgradePlan = getUpgradePlanForFeature('free', feature)

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-xs font-medium text-muted-foreground">
      <Lock className="h-3 w-3" />
      {upgradePlan?.name || 'Pro'}
    </span>
  )
}