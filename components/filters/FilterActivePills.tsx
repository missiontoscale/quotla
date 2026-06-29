'use client'

import { X } from 'lucide-react'
import { cn } from '@/components/ui/utils'
import { Button } from '@/components/ui/button'
import type { ActiveFilter } from './types'

interface FilterActivePillsProps {
  filters: ActiveFilter[]
  onRemove: (id: string) => void
  onClearAll?: () => void
  className?: string
}

export function FilterActivePills({
  filters,
  onRemove,
  onClearAll,
  className,
}: FilterActivePillsProps) {
  if (filters.length === 0) return null

  return (
    <div
      className={cn(
        'flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1',
        className
      )}
    >
      <span className="text-xs text-primary-400 shrink-0">Filters:</span>

      <div className="flex items-center gap-1.5 flex-nowrap">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onRemove(filter.id)}
            className="group flex items-center gap-1.5 bg-primary-600/50 hover:bg-primary-600 border border-primary-500/50 rounded-full px-2.5 py-1 min-h-[32px] sm:min-h-[28px] transition-colors shrink-0"
          >
            <span className="text-xs text-primary-200 max-w-[120px] truncate">
              <span className="text-primary-400">{filter.label}:</span>{' '}
              <span className="text-primary-50">{filter.value}</span>
            </span>
            <X className="w-3 h-3 text-primary-400 group-hover:text-primary-100 shrink-0" />
          </button>
        ))}
      </div>

      {onClearAll && filters.length > 1 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="text-primary-400 hover:text-primary-100 h-7 px-2 text-xs shrink-0"
        >
          Clear all
        </Button>
      )}
    </div>
  )
}
