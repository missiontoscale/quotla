'use client'

import { Card } from '@/components/ui/card'
import { cn } from '@/hooks/use-dashboard-theme'

interface MetricsCardSkeletonProps {
  className?: string
}

export function MetricsCardSkeleton({ className }: MetricsCardSkeletonProps) {
  return (
    <Card className={cn(
      'p-6 border shadow-lg animate-pulse',
      'bg-gradient-to-br from-quotla-dark/95 to-primary-800/50',
      'border-primary-600/20',
      'shadow-quotla-dark/50',
      className
    )}>
      {/* Header skeleton */}
      <div className="flex items-start justify-between mb-5">
        <div className="h-3 w-32 bg-primary-700/50 rounded" />
      </div>

      {/* Metrics row skeleton */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Large metric */}
        <div className="flex-1 p-4 rounded-xl border bg-primary-700/30 border-primary-600/20">
          <div className="h-3 w-16 bg-primary-600/50 rounded mb-3" />
          <div className="h-8 w-32 bg-primary-600/50 rounded mb-2" />
          <div className="h-3 w-20 bg-primary-600/50 rounded" />
        </div>

        {/* Stacked metrics */}
        <div className="flex flex-col gap-3">
          <div className="p-3 rounded-xl border bg-primary-700/30 border-primary-600/20">
            <div className="h-3 w-20 bg-primary-600/50 rounded mb-2" />
            <div className="h-5 w-24 bg-primary-600/50 rounded" />
          </div>
          <div className="p-3 rounded-xl border bg-primary-700/30 border-primary-600/20">
            <div className="h-3 w-16 bg-primary-600/50 rounded mb-2" />
            <div className="h-5 w-16 bg-primary-600/50 rounded" />
          </div>
        </div>
      </div>

      {/* Second row skeleton */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 p-4 rounded-xl border bg-primary-700/30 border-primary-600/20">
          <div className="h-3 w-12 bg-primary-600/50 rounded mb-3" />
          <div className="h-8 w-20 bg-primary-600/50 rounded" />
        </div>
        <div className="flex flex-col gap-3">
          <div className="p-3 rounded-xl border bg-primary-700/30 border-primary-600/20">
            <div className="h-3 w-20 bg-primary-600/50 rounded mb-2" />
            <div className="h-5 w-24 bg-primary-600/50 rounded" />
          </div>
          <div className="p-3 rounded-xl border bg-primary-700/30 border-primary-600/20">
            <div className="h-3 w-16 bg-primary-600/50 rounded mb-2" />
            <div className="h-5 w-12 bg-primary-600/50 rounded" />
          </div>
        </div>
      </div>

      {/* Chart skeleton */}
      <div className="h-[200px] mt-2 bg-primary-700/20 rounded-lg flex items-end justify-around px-4 pb-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="w-8 bg-primary-600/30 rounded-t"
            style={{ height: `${30 + Math.random() * 70}%` }}
          />
        ))}
      </div>

      {/* Legend skeleton */}
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-primary-600/50 rounded-full" />
          <div className="h-3 w-16 bg-primary-600/50 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-primary-600/50" />
          <div className="h-3 w-12 bg-primary-600/50 rounded" />
        </div>
      </div>
    </Card>
  )
}

export function SmallMetricCardSkeleton() {
  return (
    <Card className="bg-quotla-dark/90 border-primary-600 p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-primary-600/30 rounded-xl" />
        <div>
          <div className="h-3 w-24 bg-primary-600/50 rounded mb-2" />
          <div className="h-6 w-16 bg-primary-600/50 rounded" />
        </div>
      </div>
      <div className="pt-3 border-t border-primary-600">
        <div className="flex items-center justify-between">
          <div className="h-3 w-20 bg-primary-600/50 rounded" />
          <div className="h-4 w-16 bg-primary-600/50 rounded" />
        </div>
      </div>
    </Card>
  )
}
