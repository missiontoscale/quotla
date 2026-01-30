'use client'

import { FilterDateRange } from './FilterDateRange'
import { useDateFilter } from '@/hooks/useDateFilter'
import { Button } from '@/components/ui/button'
import { X, Calendar } from 'lucide-react'
import { cn } from '@/components/ui/utils'
import type { DateRangePreset } from './types'

// ============================================================================
// TYPES
// ============================================================================

interface PageDateFilterProps {
  className?: string
  showPresets?: boolean
  showClearButton?: boolean
  placeholder?: string
  presets?: DateRangePreset[]
}

// ============================================================================
// DEFAULT PRESETS
// ============================================================================

const defaultPresets: DateRangePreset[] = [
  {
    label: 'Today',
    getValue: () => {
      const today = new Date()
      return { from: today, to: today }
    },
  },
  {
    label: 'Last 7 days',
    getValue: () => {
      const today = new Date()
      const lastWeek = new Date(today)
      lastWeek.setDate(today.getDate() - 6)
      return { from: lastWeek, to: today }
    },
  },
  {
    label: 'Last 30 days',
    getValue: () => {
      const today = new Date()
      const lastMonth = new Date(today)
      lastMonth.setDate(today.getDate() - 29)
      return { from: lastMonth, to: today }
    },
  },
  {
    label: 'This month',
    getValue: () => {
      const today = new Date()
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      return { from: startOfMonth, to: today }
    },
  },
  {
    label: 'Last month',
    getValue: () => {
      const today = new Date()
      const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0)
      return { from: startOfLastMonth, to: endOfLastMonth }
    },
  },
  {
    label: 'This year',
    getValue: () => {
      const today = new Date()
      const startOfYear = new Date(today.getFullYear(), 0, 1)
      return { from: startOfYear, to: today }
    },
  },
]

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Page-wide date filter component that connects to DateFilterContext.
 * Place this in your page header to provide date filtering for all data on the page.
 */
export function PageDateFilter({
  className,
  showPresets = true,
  showClearButton = true,
  placeholder = 'Filter by date',
  presets = defaultPresets,
}: PageDateFilterProps) {
  const { dateRange, setDateRange, clearDateRange, isFilterActive, formattedDateRange } = useDateFilter()

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <FilterDateRange
        value={dateRange}
        onChange={setDateRange}
        presets={showPresets ? presets : []}
        placeholder={placeholder}
      />

      {showClearButton && isFilterActive && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearDateRange}
          className="h-8 px-2 text-primary-400 hover:text-primary-100 hover:bg-primary-700"
          title="Clear date filter"
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  )
}

// ============================================================================
// COMPACT VARIANT
// ============================================================================

interface CompactDateFilterProps {
  className?: string
}

/**
 * Compact version showing just the current filter status.
 * Useful for mobile or when space is limited.
 */
export function CompactDateFilter({ className }: CompactDateFilterProps) {
  const { isFilterActive, formattedDateRange, clearDateRange } = useDateFilter()

  if (!isFilterActive) return null

  return (
    <div className={cn(
      'flex items-center gap-2 px-3 py-1.5 rounded-lg',
      'bg-quotla-green/10 border border-quotla-green/20 text-quotla-green',
      'text-sm',
      className
    )}>
      <Calendar className="w-3.5 h-3.5" />
      <span>{formattedDateRange}</span>
      <button
        onClick={clearDateRange}
        className="ml-1 hover:text-quotla-green/80 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}