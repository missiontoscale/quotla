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
      <span className="text-xs text-slate-400 shrink-0">Filters:</span>

      <div className="flex items-center gap-1.5 flex-nowrap">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onRemove(filter.id)}
            className="group flex items-center gap-1.5 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 rounded-full px-2.5 py-1 min-h-[32px] sm:min-h-[28px] transition-colors shrink-0"
          >
            <span className="text-xs text-slate-300 max-w-[120px] truncate">
              <span className="text-slate-400">{filter.label}:</span>{' '}
              <span className="text-slate-100">{filter.value}</span>
            </span>
            <X className="w-3 h-3 text-slate-400 group-hover:text-slate-200 shrink-0" />
          </button>
        ))}
      </div>

      {onClearAll && filters.length > 1 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="text-slate-400 hover:text-slate-200 h-7 px-2 text-xs shrink-0"
        >
          Clear all
        </Button>
      )}
    </div>
  )
}
