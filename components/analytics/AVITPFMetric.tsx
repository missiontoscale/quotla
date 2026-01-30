'use client'

import { useMemo } from 'react'
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCompactCurrency, getCurrencySymbol } from '@/lib/utils/currency'

// ============================================================================
// TYPES
// ============================================================================

export interface AVITPFMetricProps {
  /** The label for the metric */
  label: string
  /** The current value */
  value: number
  /** Change value - percentage for currency, absolute for integers */
  change: number | null
  /** If true, shows +/- absolute change instead of percentage */
  isInteger?: boolean
  /** Currency code for formatting (required if not isInteger) */
  currency?: string
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Color scheme for the metric */
  colorScheme?: 'green' | 'orange' | 'emerald' | 'rose' | 'teal'
  /** If true, inverts colors (up = bad, down = good) - useful for expenses */
  invertColors?: boolean
  /** Additional class names */
  className?: string
}

// ============================================================================
// STYLE MAPS
// ============================================================================

const sizeMap = {
  sm: {
    container: 'min-w-[100px]',
    label: 'text-xs',
    value: 'text-lg font-semibold',
    change: 'text-[10px]',
    icon: 'w-3 h-3',
    gap: 'gap-0.5',
  },
  md: {
    container: 'min-w-[140px]',
    label: 'text-sm',
    value: 'text-2xl font-bold',
    change: 'text-xs',
    icon: 'w-3.5 h-3.5',
    gap: 'gap-1',
  },
  lg: {
    container: 'min-w-[180px]',
    label: 'text-sm',
    value: 'text-3xl font-bold',
    change: 'text-sm',
    icon: 'w-4 h-4',
    gap: 'gap-1',
  },
}

const colorSchemeMap = {
  green: {
    label: 'text-green-400',
    value: 'text-green-50',
  },
  orange: {
    label: 'text-orange-400',
    value: 'text-orange-50',
  },
  emerald: {
    label: 'text-emerald-400',
    value: 'text-emerald-50',
  },
  rose: {
    label: 'text-rose-400',
    value: 'text-rose-50',
  },
  teal: {
    label: 'text-teal-400',
    value: 'text-teal-50',
  },
}

// ============================================================================
// COMPONENT
// ============================================================================

export function AVITPFMetric({
  label,
  value,
  change,
  isInteger = false,
  currency = 'USD',
  size = 'md',
  colorScheme = 'emerald',
  invertColors = false,
  className,
}: AVITPFMetricProps) {
  const styles = sizeMap[size]
  const colors = colorSchemeMap[colorScheme]

  // Determine if change is positive, negative, or neutral
  const changeDirection = useMemo(() => {
    if (change === null || change === 0) return 'neutral'
    return change > 0 ? 'up' : 'down'
  }, [change])

  // Get the appropriate icon
  const ChangeIcon = useMemo(() => {
    switch (changeDirection) {
      case 'up':
        return ArrowUpRight
      case 'down':
        return ArrowDownRight
      default:
        return Minus
    }
  }, [changeDirection])

  // Determine change color based on direction and invertColors
  const changeColorClass = useMemo(() => {
    if (changeDirection === 'neutral') return 'text-primary-400'

    const isPositive = invertColors
      ? changeDirection === 'down'
      : changeDirection === 'up'

    return isPositive ? 'text-emerald-400' : 'text-rose-400'
  }, [changeDirection, invertColors])

  // Format the value
  const formattedValue = useMemo(() => {
    if (isInteger) {
      return value.toLocaleString()
    }
    return formatCompactCurrency(value, currency)
  }, [value, isInteger, currency])

  // Format the change
  const formattedChange = useMemo(() => {
    if (change === null) return null

    if (isInteger) {
      // For integers, show absolute change with +/-
      const sign = change >= 0 ? '+' : ''
      return `${sign}${Math.abs(change).toLocaleString()}`
    }

    // For percentages
    const sign = change >= 0 ? '+' : ''
    return `${sign}${change.toFixed(1)}%`
  }, [change, isInteger])

  return (
    <div className={cn('flex flex-col', styles.container, className)}>
      {/* Label */}
      <span className={cn(styles.label, 'text-primary-400 font-medium')}>
        {label}
      </span>

      {/* Value with superscript change */}
      <div className="flex items-baseline">
        <span className={cn(styles.value, 'text-white')}>
          {formattedValue}
        </span>

        {/* Change indicator as superscript */}
        {formattedChange !== null && (
          <sup
            className={cn(
              'ml-1 flex items-center font-medium',
              styles.change,
              styles.gap,
              changeColorClass
            )}
          >
            <ChangeIcon className={cn(styles.icon, '-mb-0.5')} />
            <span>{formattedChange}</span>
          </sup>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// COMPACT VARIANT
// ============================================================================

export interface CompactAVITPFMetricProps extends Omit<AVITPFMetricProps, 'size'> {}

export function CompactAVITPFMetric(props: CompactAVITPFMetricProps) {
  return <AVITPFMetric {...props} size="sm" />
}

// ============================================================================
// LARGE VARIANT
// ============================================================================

export interface LargeAVITPFMetricProps extends Omit<AVITPFMetricProps, 'size'> {}

export function LargeAVITPFMetric(props: LargeAVITPFMetricProps) {
  return <AVITPFMetric {...props} size="lg" />
}