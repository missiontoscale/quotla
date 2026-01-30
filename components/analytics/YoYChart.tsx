'use client'

import { useMemo } from 'react'
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { TrendBadge } from './TrendIndicator'
import { calculateYoYComparison } from '@/lib/analytics/yoy-comparisons'
import { analyzeTrend } from '@/lib/analytics/trend-analysis'
import type { YoYMonthlyDataPoint } from '@/lib/analytics/yoy-comparisons'

// ============================================================================
// TYPES
// ============================================================================

interface YoYChartProps {
  data: YoYMonthlyDataPoint[]
  title?: string
  subtitle?: string
  formatValue?: (value: number) => string
  height?: number
  showCard?: boolean
  showTrendBadge?: boolean
  showLegend?: boolean
  className?: string
  currentYearColor?: string
  previousYearColor?: string
}

// ============================================================================
// DEFAULT FORMATTER
// ============================================================================

const defaultFormatter = (value: number): string => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `${(value / 1000).toFixed(0)}k`
  return value.toFixed(0)
}

// ============================================================================
// COMPONENT
// ============================================================================

export function YoYChart({
  data,
  title = 'Year-over-Year Comparison',
  subtitle,
  formatValue = defaultFormatter,
  height = 280,
  showCard = true,
  showTrendBadge = true,
  showLegend = true,
  className,
  currentYearColor = '#445642',
  previousYearColor = '#8a8a66',
}: YoYChartProps) {
  const yoyMetrics = useMemo(() => {
    if (data.length === 0) return null

    const currentYearTotal = data.reduce((sum, d) => sum + d.currentYear, 0)
    const previousYearTotal = data.reduce((sum, d) => sum + d.previousYear, 0)

    const comparison = calculateYoYComparison(currentYearTotal, previousYearTotal)

    const currentYearValues = data.map((d) => d.currentYear)
    const trend = analyzeTrend(currentYearValues)

    return {
      comparison,
      trend,
      currentYearLabel: data[0]?.currentYearLabel || 'Current',
      previousYearLabel: data[0]?.previousYearLabel || 'Previous',
    }
  }, [data])

  const renderTooltip = ({ active, payload, label }: {
    active?: boolean
    payload?: Array<{ color: string; name: string; value: number }>
    label?: string
  }) => {
    if (!active || !payload || payload.length === 0) return null

    return (
      <div className="bg-quotla-dark border border-quotla-green/30 rounded-lg p-3 shadow-lg">
        <p className="text-primary-50 font-medium mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div
            key={index}
            className="flex items-center justify-between gap-4 text-sm"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-primary-300">{entry.name}:</span>
            </div>
            <span className="text-primary-50 font-medium">
              {formatValue(entry.value)}
            </span>
          </div>
        ))}
      </div>
    )
  }

  const chartContent = (
    <>
      {(title || showTrendBadge) && (
        <div className="flex items-start justify-between mb-4">
          <div>
            {title && (
              <h3 className="text-sm font-semibold text-primary-50">{title}</h3>
            )}
            {subtitle && (
              <p className="text-xs text-primary-400 mt-0.5">{subtitle}</p>
            )}
          </div>
          {showTrendBadge && yoyMetrics && (
            <TrendBadge
              direction={yoyMetrics.trend.direction}
              strength={yoyMetrics.trend.strength}
              percentageChange={yoyMetrics.comparison.percentageChange}
            />
          )}
        </div>
      )}

      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="currentYearGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={currentYearColor} stopOpacity={0.4} />
                <stop offset="95%" stopColor={currentYearColor} stopOpacity={0.05} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#8a8a66', fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#8a8a66', fontSize: 11 }}
              tickFormatter={formatValue}
            />
            <Tooltip content={renderTooltip} />

            <Area
              type="monotone"
              dataKey="currentYear"
              name={yoyMetrics?.currentYearLabel || 'Current Year'}
              stroke={currentYearColor}
              strokeWidth={2}
              fill="url(#currentYearGradient)"
            />

            <Line
              type="monotone"
              dataKey="previousYear"
              name={yoyMetrics?.previousYearLabel || 'Previous Year'}
              stroke={previousYearColor}
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: previousYearColor, r: 2 }}
              activeDot={{ r: 4 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {showLegend && yoyMetrics && (
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: currentYearColor, opacity: 0.5 }}
            />
            <span className="text-xs text-primary-300">
              {yoyMetrics.currentYearLabel}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-0.5 border-t-2 border-dashed"
              style={{ borderColor: previousYearColor }}
            />
            <span className="text-xs text-primary-300">
              {yoyMetrics.previousYearLabel}
            </span>
          </div>
        </div>
      )}
    </>
  )

  if (!showCard) {
    return <div className={className}>{chartContent}</div>
  }

  return (
    <Card
      className={cn(
        'p-5 border',
        'bg-gradient-to-br from-quotla-dark/95 to-primary-800/50',
        'border-quotla-green/20 hover:border-quotla-green/40 transition-all duration-300',
        className
      )}
    >
      {chartContent}
    </Card>
  )
}

// ============================================================================
// COMPACT VARIANT
// ============================================================================

interface CompactYoYChartProps {
  data: YoYMonthlyDataPoint[]
  height?: number
  formatValue?: (value: number) => string
  className?: string
}

export function CompactYoYChart({
  data,
  height = 150,
  formatValue = defaultFormatter,
  className,
}: CompactYoYChartProps) {
  return (
    <YoYChart
      data={data}
      height={height}
      formatValue={formatValue}
      showCard={false}
      showTrendBadge={false}
      showLegend={false}
      className={className}
    />
  )
}
