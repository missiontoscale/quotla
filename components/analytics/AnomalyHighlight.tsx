'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import type { AnomalySeverity, Anomaly } from '@/lib/analytics/anomaly-detection'

// ============================================================================
// TYPES
// ============================================================================

export interface AnomalyPoint {
  index: number
  value: number
  severity: AnomalySeverity
  label?: string
}

interface AnomalyDotProps {
  cx?: number
  cy?: number
  payload?: { anomaly?: AnomalyPoint }
  dataKey?: string
  anomalyPoints?: AnomalyPoint[]
}

interface AnomalyReferenceLineProps {
  value: number
  type: 'upper' | 'lower'
  label?: string
}

// ============================================================================
// STYLE MAPS
// ============================================================================

const severityColors: Record<AnomalySeverity, { fill: string; stroke: string; glow: string }> = {
  info: {
    fill: '#3b82f6',
    stroke: '#60a5fa',
    glow: 'rgba(59, 130, 246, 0.3)',
  },
  warning: {
    fill: '#f59e0b',
    stroke: '#fbbf24',
    glow: 'rgba(245, 158, 11, 0.3)',
  },
  critical: {
    fill: '#ef4444',
    stroke: '#f87171',
    glow: 'rgba(239, 68, 68, 0.4)',
  },
}

// ============================================================================
// CUSTOM DOT COMPONENT FOR RECHARTS
// ============================================================================

/**
 * Custom dot component for Recharts that highlights anomaly points
 * Use as the dot prop on Line or Area components
 *
 * @example
 * <Line
 *   dataKey="revenue"
 *   dot={(props) => <AnomalyDot {...props} anomalyPoints={anomalyPoints} />}
 * />
 */
export function AnomalyDot({
  cx,
  cy,
  payload,
  dataKey,
  anomalyPoints = [],
}: AnomalyDotProps) {
  if (cx === undefined || cy === undefined) return null

  // Check if this point is an anomaly
  const anomaly = payload?.anomaly || anomalyPoints.find(
    (a) => a.value === payload?.[dataKey as keyof typeof payload]
  )

  if (!anomaly) {
    // Regular dot
    return (
      <circle
        cx={cx}
        cy={cy}
        r={3}
        fill="#445642"
        stroke="#445642"
        strokeWidth={1}
      />
    )
  }

  const colors = severityColors[anomaly.severity]

  return (
    <g>
      {/* Glow effect */}
      <circle
        cx={cx}
        cy={cy}
        r={10}
        fill={colors.glow}
        className="animate-pulse"
      />
      {/* Outer ring */}
      <circle
        cx={cx}
        cy={cy}
        r={6}
        fill="transparent"
        stroke={colors.stroke}
        strokeWidth={2}
        strokeOpacity={0.5}
      />
      {/* Inner dot */}
      <circle cx={cx} cy={cy} r={4} fill={colors.fill} stroke={colors.stroke} strokeWidth={1} />
    </g>
  )
}

// ============================================================================
// ACTIVE DOT COMPONENT
// ============================================================================

/**
 * Custom active dot component for Recharts that shows enhanced anomaly highlight on hover
 */
export function AnomalyActiveDot({
  cx,
  cy,
  payload,
  anomalyPoints = [],
}: AnomalyDotProps) {
  if (cx === undefined || cy === undefined) return null

  const anomaly = payload?.anomaly || anomalyPoints.find(
    (a) => a.index === payload?.index
  )

  if (!anomaly) {
    // Regular active dot
    return (
      <circle
        cx={cx}
        cy={cy}
        r={5}
        fill="#445642"
        stroke="#fffad6"
        strokeWidth={2}
      />
    )
  }

  const colors = severityColors[anomaly.severity]

  return (
    <g>
      {/* Large glow */}
      <circle
        cx={cx}
        cy={cy}
        r={16}
        fill={colors.glow}
        className="animate-pulse"
      />
      {/* Outer ring */}
      <circle
        cx={cx}
        cy={cy}
        r={10}
        fill="transparent"
        stroke={colors.stroke}
        strokeWidth={2}
      />
      {/* Middle ring */}
      <circle
        cx={cx}
        cy={cy}
        r={6}
        fill={colors.fill}
        stroke={colors.stroke}
        strokeWidth={2}
      />
      {/* Center dot */}
      <circle cx={cx} cy={cy} r={3} fill="#ffffff" />
    </g>
  )
}

// ============================================================================
// ANOMALY REFERENCE AREA (for showing statistical bounds on chart)
// ============================================================================

interface AnomalyBoundsProps {
  upperBound: number
  lowerBound: number
  mean: number
}

/**
 * SVG defs for anomaly bound styling
 * Add this inside your ResponsiveContainer or chart component
 */
export function AnomalyBoundsDefs() {
  return (
    <defs>
      <linearGradient id="anomalyBoundsGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.1} />
        <stop offset="50%" stopColor="#f59e0b" stopOpacity={0.05} />
        <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.1} />
      </linearGradient>
      <pattern
        id="anomalyBoundsPattern"
        patternUnits="userSpaceOnUse"
        width="8"
        height="8"
        patternTransform="rotate(45)"
      >
        <line x1="0" y1="0" x2="0" y2="8" stroke="#f59e0b" strokeWidth="1" strokeOpacity="0.1" />
      </pattern>
    </defs>
  )
}

// ============================================================================
// ANOMALY LEGEND ITEM
// ============================================================================

interface AnomalyLegendItemProps {
  severity: AnomalySeverity
  count: number
  label?: string
}

export function AnomalyLegendItem({ severity, count, label }: AnomalyLegendItemProps) {
  const colors = severityColors[severity]

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: colors.fill }}
        />
        <div
          className="absolute inset-0 w-3 h-3 rounded-full animate-ping"
          style={{ backgroundColor: colors.glow }}
        />
      </div>
      <span className="text-xs text-primary-400">
        {count} {label || severity} anomal{count === 1 ? 'y' : 'ies'}
      </span>
    </div>
  )
}

// ============================================================================
// ANOMALY CHART LEGEND
// ============================================================================

interface AnomalyChartLegendProps {
  anomalies: Anomaly[]
  className?: string
}

export function AnomalyChartLegend({ anomalies, className }: AnomalyChartLegendProps) {
  const counts = useMemo(() => {
    const result = { critical: 0, warning: 0, info: 0 }
    anomalies.forEach((a) => result[a.severity]++)
    return result
  }, [anomalies])

  if (anomalies.length === 0) return null

  return (
    <div className={cn('flex items-center gap-4', className)}>
      {counts.critical > 0 && (
        <AnomalyLegendItem severity="critical" count={counts.critical} />
      )}
      {counts.warning > 0 && (
        <AnomalyLegendItem severity="warning" count={counts.warning} />
      )}
      {counts.info > 0 && (
        <AnomalyLegendItem severity="info" count={counts.info} />
      )}
    </div>
  )
}

// ============================================================================
// TOOLTIP CONTENT FOR ANOMALY POINTS
// ============================================================================

interface AnomalyTooltipProps {
  anomaly: Anomaly
  formatValue?: (value: number) => string
}

export function AnomalyTooltipContent({ anomaly, formatValue }: AnomalyTooltipProps) {
  const colors = severityColors[anomaly.severity]
  const format = formatValue || ((v: number) => v.toFixed(2))

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: colors.fill }}
        />
        <span className="text-xs font-medium text-primary-100">
          {anomaly.title}
        </span>
      </div>
      <div className="text-[10px] text-primary-400">
        <p>Value: {format(anomaly.value)}</p>
        <p>Expected: {format(anomaly.expectedValue)}</p>
        <p
          className={cn(
            anomaly.deviation > 0 ? 'text-emerald-400' : 'text-rose-400'
          )}
        >
          Deviation: {anomaly.deviation > 0 ? '+' : ''}
          {anomaly.deviation.toFixed(1)}%
        </p>
      </div>
    </div>
  )
}

// ============================================================================
// HELPER: PREPARE DATA FOR CHARTS
// ============================================================================

/**
 * Enriches chart data with anomaly information for easy rendering
 */
export function enrichChartDataWithAnomalies<T extends Record<string, any>>(
  data: T[],
  anomalies: Anomaly[],
  indexKey: string = 'index'
): (T & { anomaly?: AnomalyPoint })[] {
  const anomalyMap = new Map<number, Anomaly>()
  anomalies.forEach((a) => anomalyMap.set(a.index, a))

  return data.map((item, idx) => {
    const index = typeof item[indexKey] === 'number' ? item[indexKey] : idx
    const anomaly = anomalyMap.get(index)

    if (anomaly) {
      return {
        ...item,
        anomaly: {
          index: anomaly.index,
          value: anomaly.value,
          severity: anomaly.severity,
          label: anomaly.title,
        },
      }
    }

    return item
  })
}

// ============================================================================
// CHART REFERENCE LINE LABEL
// ============================================================================

interface BoundLabelProps {
  viewBox?: { x: number; y: number }
  value: number
  type: 'upper' | 'lower'
}

export function BoundLabel({ viewBox, value, type }: BoundLabelProps) {
  if (!viewBox) return null

  const { x, y } = viewBox
  const label = type === 'upper' ? 'Upper Bound' : 'Lower Bound'

  return (
    <text
      x={x + 5}
      y={y - 5}
      fill="#f59e0b"
      fontSize={10}
      opacity={0.7}
    >
      {label}
    </text>
  )
}