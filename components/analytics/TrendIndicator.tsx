'use client'

import { useMemo } from 'react'
import {
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type {
  TrendDirection,
  TrendStrength,
  TrendAnalysisResult,
} from '@/lib/analytics'

// ============================================================================
// TYPES
// ============================================================================

interface TrendIndicatorProps {
  direction: TrendDirection
  strength: TrendStrength
  percentageChange?: number | null
  size?: 'sm' | 'md' | 'lg'
  showPercentage?: boolean
  showLabel?: boolean
  className?: string
  invertColors?: boolean
}

interface TrendIndicatorFromResultProps {
  result: TrendAnalysisResult
  size?: 'sm' | 'md' | 'lg'
  showPercentage?: boolean
  showLabel?: boolean
  className?: string
  invertColors?: boolean
}

// ============================================================================
// STYLE MAPS
// ============================================================================

const sizeMap = {
  sm: {
    icon: 'w-3 h-3',
    text: 'text-xs',
    gap: 'gap-0.5',
  },
  md: {
    icon: 'w-4 h-4',
    text: 'text-sm',
    gap: 'gap-1',
  },
  lg: {
    icon: 'w-5 h-5',
    text: 'text-base',
    gap: 'gap-1.5',
  },
}

const strengthOpacityMap: Record<TrendStrength, string> = {
  weak: 'opacity-60',
  moderate: 'opacity-80',
  strong: 'opacity-100',
}

// ============================================================================
// COMPONENT
// ============================================================================

export function TrendIndicator({
  direction,
  strength,
  percentageChange,
  size = 'sm',
  showPercentage = true,
  showLabel = false,
  className,
  invertColors = false,
}: TrendIndicatorProps) {
  const styles = sizeMap[size]

  const colorClasses = useMemo(() => {
    if (direction === 'flat') {
      return {
        text: 'text-primary-400',
        bg: 'bg-primary-600/20',
      }
    }

    const isPositive = invertColors
      ? direction === 'down'
      : direction === 'up'

    return isPositive
      ? { text: 'text-emerald-400', bg: 'bg-emerald-500/10' }
      : { text: 'text-rose-400', bg: 'bg-rose-500/10' }
  }, [direction, invertColors])

  const Icon = useMemo(() => {
    switch (direction) {
      case 'up':
        return ArrowUpRight
      case 'down':
        return ArrowDownRight
      default:
        return Minus
    }
  }, [direction])

  const formattedPercentage = useMemo(() => {
    if (percentageChange === null || percentageChange === undefined) return null
    const sign = percentageChange >= 0 ? '+' : ''
    return `${sign}${Math.abs(percentageChange).toFixed(1)}%`
  }, [percentageChange])

  const label = useMemo(() => {
    if (!showLabel) return null
    if (direction === 'flat') return 'stable'
    return `${strength} ${direction === 'up' ? 'growth' : 'decline'}`
  }, [showLabel, direction, strength])

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium transition-all',
        styles.gap,
        styles.text,
        colorClasses.text,
        strengthOpacityMap[strength],
        className
      )}
    >
      <Icon className={styles.icon} />
      {showPercentage && formattedPercentage && (
        <span>{formattedPercentage}</span>
      )}
      {label && <span className="text-primary-400 font-normal">{label}</span>}
    </span>
  )
}

// ============================================================================
// CONVENIENCE COMPONENT
// ============================================================================

export function TrendIndicatorFromResult({
  result,
  ...props
}: TrendIndicatorFromResultProps) {
  return (
    <TrendIndicator
      direction={result.direction}
      strength={result.strength}
      percentageChange={result.percentageChange}
      {...props}
    />
  )
}

// ============================================================================
// INLINE VARIANT (for metric pills)
// ============================================================================

interface InlineTrendProps {
  value: number
  invertColors?: boolean
  className?: string
}

export function InlineTrend({
  value,
  invertColors = false,
  className,
}: InlineTrendProps) {
  if (value === 0) return null

  const isUp = value > 0
  const isPositive = invertColors ? !isUp : isUp
  const Icon = isUp ? ArrowUpRight : ArrowDownRight

  return (
    <span
      className={cn(
        'flex items-center gap-0.5 text-xs font-medium',
        isPositive ? 'text-emerald-400' : 'text-rose-400',
        className
      )}
    >
      <Icon className="w-3 h-3" />
      {Math.abs(value).toFixed(1)}%
    </span>
  )
}

// ============================================================================
// TREND BADGE (for cards/headers)
// ============================================================================

interface TrendBadgeProps {
  direction: TrendDirection
  strength: TrendStrength
  percentageChange?: number | null
  className?: string
}

export function TrendBadge({
  direction,
  strength,
  percentageChange,
  className,
}: TrendBadgeProps) {
  const isPositive = direction === 'up'
  const Icon =
    direction === 'up'
      ? TrendingUp
      : direction === 'down'
        ? TrendingDown
        : Minus

  const bgColor =
    direction === 'flat'
      ? 'bg-primary-600/20 border-primary-600/30'
      : isPositive
        ? 'bg-emerald-500/10 border-emerald-500/20'
        : 'bg-rose-500/10 border-rose-500/20'

  const textColor =
    direction === 'flat'
      ? 'text-primary-400'
      : isPositive
        ? 'text-emerald-400'
        : 'text-rose-400'

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border',
        bgColor,
        textColor,
        strengthOpacityMap[strength],
        className
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {percentageChange !== null && percentageChange !== undefined && (
        <span className="text-xs font-medium">
          {percentageChange >= 0 ? '+' : ''}
          {percentageChange.toFixed(1)}%
        </span>
      )}
      <span className="text-xs capitalize">{strength}</span>
    </div>
  )
}
