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

interface AlertsBannerProps {
  anomalies: (Anomaly | BusinessMetricAnomaly)[]
  onDismiss?: (id: string) => void
  onDismissAll?: () => void
  maxVisible?: number
  className?: string
  collapsible?: boolean
  defaultExpanded?: boolean
}

interface AlertItemProps {
  anomaly: Anomaly | BusinessMetricAnomaly
  onDismiss?: (id: string) => void
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
// ALERT ITEM COMPONENT
// ============================================================================

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
            <p className="text-xs text-primary-400 mt-0.5">
              {anomaly.description}
            </p>
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
              aria-label="Dismiss alert"
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
            <span
              className={cn(
                anomaly.deviation > 0 ? 'text-emerald-400' : 'text-rose-400'
              )}
            >
              {anomaly.deviation > 0 ? '+' : ''}
              {anomaly.deviation.toFixed(1)}%
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

export function AlertsBanner({
  anomalies,
  onDismiss,
  onDismissAll,
  maxVisible = 3,
  className,
  collapsible = true,
  defaultExpanded = true,
}: AlertsBannerProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [showAll, setShowAll] = useState(false)

  // Sort anomalies by severity (critical first)
  const sortedAnomalies = useMemo(() => {
    const severityOrder: Record<AnomalySeverity, number> = {
      critical: 0,
      warning: 1,
      info: 2,
    }
    return [...anomalies].sort(
      (a, b) => severityOrder[a.severity] - severityOrder[b.severity]
    )
  }, [anomalies])

  const visibleAnomalies = showAll
    ? sortedAnomalies
    : sortedAnomalies.slice(0, maxVisible)

  const remainingCount = sortedAnomalies.length - maxVisible

  // Count by severity for summary
  const severityCounts = useMemo(() => {
    const counts = { critical: 0, warning: 0, info: 0 }
    anomalies.forEach((a) => counts[a.severity]++)
    return counts
  }, [anomalies])

  const handleDismiss = useCallback(
    (id: string) => {
      onDismiss?.(id)
    },
    [onDismiss]
  )

  if (anomalies.length === 0) {
    return null
  }

  // Determine banner severity based on highest severity anomaly
  const bannerSeverity = severityCounts.critical > 0
    ? 'critical'
    : severityCounts.warning > 0
      ? 'warning'
      : 'info'
  const bannerStyles = severityStyles[bannerSeverity]
  const BannerIcon = severityIcons[bannerSeverity]

  return (
    <Card
      className={cn(
        'border transition-all',
        bannerStyles.bg,
        bannerStyles.border,
        className
      )}
    >
      {/* Header */}
      <div
        className={cn(
          'flex items-center justify-between p-4',
          collapsible && 'cursor-pointer'
        )}
        onClick={collapsible ? () => setExpanded(!expanded) : undefined}
      >
        <div className="flex items-center gap-3">
          <div className={cn('p-2 rounded-lg', bannerStyles.bg)}>
            <BannerIcon className={cn('w-5 h-5', bannerStyles.icon)} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-primary-100">
              {anomalies.length} Anomal{anomalies.length === 1 ? 'y' : 'ies'} Detected
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              {severityCounts.critical > 0 && (
                <span className="text-[10px] text-rose-400">
                  {severityCounts.critical} critical
                </span>
              )}
              {severityCounts.warning > 0 && (
                <span className="text-[10px] text-amber-400">
                  {severityCounts.warning} warning
                </span>
              )}
              {severityCounts.info > 0 && (
                <span className="text-[10px] text-blue-400">
                  {severityCounts.info} info
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onDismissAll && anomalies.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onDismissAll()
              }}
              className="h-7 px-2 text-xs text-primary-400 hover:text-primary-200"
            >
              Dismiss all
            </Button>
          )}
          {collapsible && (
            <div className="text-primary-400">
              {expanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {expanded && (
        <div className="px-4 pb-4 space-y-2">
          {visibleAnomalies.map((anomaly) => (
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
              Show {remainingCount} more alert{remainingCount > 1 ? 's' : ''}
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
// COMPACT VARIANT
// ============================================================================

interface CompactAlertsBannerProps {
  anomalies: Anomaly[]
  onViewAll?: () => void
  className?: string
}

export function CompactAlertsBanner({
  anomalies,
  onViewAll,
  className,
}: CompactAlertsBannerProps) {
  if (anomalies.length === 0) return null

  const criticalCount = anomalies.filter((a) => a.severity === 'critical').length
  const warningCount = anomalies.filter((a) => a.severity === 'warning').length

  const bannerSeverity = criticalCount > 0 ? 'critical' : 'warning'
  const styles = severityStyles[bannerSeverity]
  const Icon = severityIcons[bannerSeverity]

  return (
    <div
      className={cn(
        'flex items-center justify-between p-3 rounded-lg border',
        styles.bg,
        styles.border,
        className
      )}
    >
      <div className="flex items-center gap-2">
        <Icon className={cn('w-4 h-4', styles.icon)} />
        <span className="text-sm text-primary-200">
          {anomalies.length} anomal{anomalies.length === 1 ? 'y' : 'ies'} detected
        </span>
        {criticalCount > 0 && (
          <span className="text-xs text-rose-400">({criticalCount} critical)</span>
        )}
      </div>
      {onViewAll && (
        <button
          onClick={onViewAll}
          className="text-xs text-primary-400 hover:text-primary-200 flex items-center gap-1"
        >
          View all <ChevronRight className="w-3 h-3" />
        </button>
      )}
    </div>
  )
}

// ============================================================================
// HELPERS
// ============================================================================

function formatValue(value: number): string {
  if (Math.abs(value) >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`
  }
  if (Math.abs(value) >= 1000) {
    return `${(value / 1000).toFixed(1)}K`
  }
  return value.toFixed(2)
}