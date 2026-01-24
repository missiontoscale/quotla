'use client'

import { X } from 'lucide-react'
import { cn } from '@/components/ui/utils'
import { Button } from '@/components/ui/button'
import { FilterActivePills } from './FilterActivePills'
import type { ActiveFilter } from './types'

interface FilterBarProps {
  children: React.ReactNode
  onClear?: () => void
  hasActiveFilters?: boolean
  resultCount?: number
  activePills?: ActiveFilter[]
  onRemovePill?: (id: string) => void
  className?: string
}

export function FilterBar({
  children,
  onClear,
  hasActiveFilters,
  resultCount,
  activePills,
  onRemovePill,
  className,
}: FilterBarProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {/* Filter controls row */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        {/* Scrollable filter controls on mobile */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 sm:pb-0 flex-1">
          {children}
        </div>

        {/* Clear and result count */}
        <div className="flex items-center gap-2 shrink-0">
          {hasActiveFilters && onClear && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="text-slate-400 hover:text-slate-200 h-8 px-2"
            >
              <X className="w-3.5 h-3.5 mr-1" />
              Clear
            </Button>
          )}
          {resultCount !== undefined && (
            <span className="text-xs text-slate-400">
              {resultCount} {resultCount === 1 ? 'result' : 'results'}
            </span>
          )}
        </div>
      </div>

      {/* Active filter pills */}
      {activePills && activePills.length > 0 && onRemovePill && (
        <FilterActivePills
          filters={activePills}
          onRemove={onRemovePill}
          onClearAll={onClear}
        />
      )}
    </div>
  )
}
