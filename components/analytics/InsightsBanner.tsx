'use client'

import { useState, useCallback, useMemo } from 'react'
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  X,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Info,
  AlertCircle,
  AlertOctagon,
  CheckCircle2,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type {
  Anomaly,
  AnomalySeverity,
  AnomalyType,
  BusinessMetricAnomaly,
} from '@/lib/analytics/anomaly-detection'

// ============================================================================
// TYPES
// ============================================================================

export interface InsightsBannerProps {
  anomalies: (Anomaly | BusinessMetricAnomaly)[]
  title?: string
  onDismiss?: (id: string) => void
  onDismissAll?: () => void
  maxVisible?: number
  className?: string
  defaultExpanded?: boolean
}

// ============================================================================
// STYLE MAPS
// ============================================================================

const severityStyles: Record<
  AnomalySeverity,
  { bg: string; border: string; icon: string; badge: string }
> = {
  info: {
    bg: 'bg-blue-950/30',
    border: 'border-blue-500/20',
    icon: 'text-blue-400',
    badge: 'bg-blue-500/20 text-blue-300',
  },
  warning: {
    bg: 'bg-amber-950/30',
    border: 'border-amber-500/20',
    icon: 'text-amber-400',
    badge: 'bg-amber-500/20 text-amber-300',
  },
  critical: {
    bg: 'bg-rose-950/30',
    border: 'border-rose-500/20',
    icon: 'text-rose-400',
    badge: 'bg-rose-500/20 text-rose-300',
  },
}

const typeIcons: Record<AnomalyType, typeof TrendingUp> = {
  spike: TrendingUp,
  drop: TrendingDown,
  unusual_pattern: AlertTriangle,
  missing_data: Info,
  threshold_breach: AlertCircle,
}

const severityIcons: Record<AnomalySeverity, typeof Info> = {
  info: Info,
  warning: AlertTriangle,
  critical: AlertOctagon,
}

// ============================================================================
// ALERT ITEM
// ============================================================================

interface AlertItemProps {
  anomaly: Anomaly | BusinessMetricAnomaly
  onDismiss?: (id: string) => void
}

function AlertItem({ anomaly, onDismiss }: AlertItemProps) {
  const styles = severityStyles[anomaly.severity]
  const TypeIcon = typeIcons[anomaly.type]
  const isBusinessAnomaly = 'recommendation' in anomaly

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg border transition-all',
        styles.bg,
        styles.border
      )}
    >
      <div className={cn('mt-0.5', styles.icon)}>
        <TypeIcon className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-primary-100">
                {anomaly.title}
              </span>
              <span
                className={cn(
                  'px-1.5 py-0.5 rounded text-[10px] font-medium uppercase',
                  styles.badge
                )}
              >
                {anomaly.severity}
              </span>
            </div>
            <p className="text-xs text-primary-400 mt-0.5">{anomaly.description}</p>
            {isBusinessAnomaly && (anomaly as BusinessMetricAnomaly).recommendation && (
              <p className="text-xs text-primary-300 mt-1.5 flex items-start gap-1">
                <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0" />
                {(anomaly as BusinessMetricAnomaly).recommendation}
              </p>
            )}
          </div>

          {onDismiss && (
            <button
              onClick={() => onDismiss(anomaly.id)}
              className="p-1 rounded hover:bg-primary-700/50 transition-colors text-primary-400 hover:text-primary-200"
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 mt-2 text-[10px] text-primary-500">
          <span>
            Actual: <span className="text-primary-300">{formatValue(anomaly.value)}</span>
          </span>
          <span>
            Expected: <span className="text-primary-300">{formatValue(anomaly.expectedValue)}</span>
          </span>
          <span>
            Deviation:{' '}
            <span className={cn(anomaly.deviation > 0 ? 'text-emerald-400' : 'text-rose-400')}>
              {anomaly.deviation > 0 ? '+' : ''}{anomaly.deviation.toFixed(1)}%
            </span>
          </span>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function InsightsBanner({
  anomalies,
  title = 'Anomaly Insights',
  onDismiss,
  onDismissAll,
  maxVisible = 3,
  className,
  defaultExpanded = true,
}: InsightsBannerProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [showAll, setShowAll] = useState(false)

  const sortedAnomalies = useMemo(() => {
    const order: Record<AnomalySeverity, number> = { critical: 0, warning: 1, info: 2 }
    return [...anomalies].sort((a, b) => order[a.severity] - order[b.severity])
  }, [anomalies])

  const visibleAnomalies = showAll ? sortedAnomalies : sortedAnomalies.slice(0, maxVisible)
  const remainingCount = sortedAnomalies.length - maxVisible

  const severityCounts = useMemo(() => {
    const counts = { critical: 0, warning: 0, info: 0 }
    anomalies.forEach(a => counts[a.severity]++)
    return counts
  }, [anomalies])

  const handleDismiss = useCallback((id: string) => onDismiss?.(id), [onDismiss])

  const hasAnomalies = anomalies.length > 0
  const bannerSeverity: AnomalySeverity = severityCounts.critical > 0
    ? 'critical'
    : severityCounts.warning > 0 ? 'warning' : 'info'
  const bannerStyles = hasAnomalies ? severityStyles[bannerSeverity] : null
  const BannerIcon = hasAnomalies ? severityIcons[bannerSeverity] : CheckCircle2

  const subtitleText = hasAnomalies
    ? `${anomalies.length} insight${anomalies.length !== 1 ? 's' : ''} · ${
        severityCounts.critical > 0
          ? `${severityCounts.critical} critical`
          : severityCounts.warning > 0
            ? `${severityCounts.warning} warning`
            : 'informational'
      }`
    : 'No anomalies detected'

  return (
    <Card
      className={cn(
        'border transition-all overflow-hidden',
        bannerStyles
          ? cn(bannerStyles.bg, bannerStyles.border)
          : 'bg-quotla-green/5 border-quotla-green/20',
        className
      )}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <BannerIcon
            className={cn(
              'w-4 h-4',
              bannerStyles ? bannerStyles.icon : 'text-quotla-green'
            )}
          />
          <div>
            <h3 className="text-sm font-medium text-primary-100">{title}</h3>
            <p className="text-[10px] text-primary-400 mt-0.5">{subtitleText}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onDismissAll && anomalies.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={e => { e.stopPropagation(); onDismissAll() }}
              className="h-7 px-2 text-xs text-primary-400 hover:text-primary-200"
            >
              Clear all
            </Button>
          )}
          {expanded
            ? <ChevronUp className="w-4 h-4 text-primary-400" />
            : <ChevronDown className="w-4 h-4 text-primary-400" />
          }
        </div>
      </div>

      {/* Content */}
      {expanded && hasAnomalies && (
        <div className="px-4 pb-4 space-y-2">
          {visibleAnomalies.map(anomaly => (
            <AlertItem
              key={anomaly.id}
              anomaly={anomaly}
              onDismiss={onDismiss ? handleDismiss : undefined}
            />
          ))}

          {remainingCount > 0 && !showAll && (
            <button
              onClick={() => setShowAll(true)}
              className="w-full p-2 text-xs text-primary-400 hover:text-primary-200 hover:bg-primary-800/30 rounded-lg transition-colors"
            >
              Show {remainingCount} more
            </button>
          )}

          {showAll && remainingCount > 0 && (
            <button
              onClick={() => setShowAll(false)}
              className="w-full p-2 text-xs text-primary-400 hover:text-primary-200 hover:bg-primary-800/30 rounded-lg transition-colors"
            >
              Show less
            </button>
          )}
        </div>
      )}
    </Card>
  )
}

// ============================================================================
// HELPERS
// ============================================================================

function formatValue(value: number): string {
  if (Math.abs(value) >= 1000000) return `${(value / 1000000).toFixed(1)}M`
  if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(1)}K`
  return value.toFixed(2)
}