'use client'

import { MetricsCardSkeleton } from '@/components/dashboard/MetricsCardSkeleton'
import { cn } from '@/hooks/use-dashboard-theme'

interface DashboardSkeletonProps {
  className?: string
  /** Number of metric card skeletons to show (default: 2) */
  cardCount?: number
}

/**
 * DashboardSkeleton
 *
 * Unified skeleton component that wraps MetricsCardSkeleton usage.
 * Reduces repeated skeleton imports across pages.
 *
 * @example
 * // Default usage with 2 cards
 * <DashboardSkeleton />
 *
 * // Custom card count
 * <DashboardSkeleton cardCount={3} />
 */
export function DashboardSkeleton({ className, cardCount = 2 }: DashboardSkeletonProps) {
  return (
    <div className={cn('space-y-4 max-w-[1400px] mx-auto px-3 md:px-4', className)}>
      {Array.from({ length: cardCount }).map((_, index) => (
        <MetricsCardSkeleton key={index} />
      ))}
    </div>
  )
}

export default DashboardSkeleton
