'use client'

import { cn } from '@/components/ui/utils'
import type { FilterOption } from './types'

interface FilterStatusButtonsProps {
  options: FilterOption[]
  value: string
  onChange: (value: string) => void
  includeAll?: boolean
  allLabel?: string
}

const colorClasses: Record<string, string> = {
  slate: 'bg-slate-500/20 text-slate-300',
  blue: 'bg-blue-500/20 text-blue-400',
  emerald: 'bg-emerald-500/20 text-emerald-400',
  amber: 'bg-amber-500/20 text-amber-400',
  rose: 'bg-rose-500/20 text-rose-400',
  cyan: 'bg-cyan-500/20 text-cyan-400',
}

export function FilterStatusButtons({
  options,
  value,
  onChange,
  includeAll = true,
  allLabel = 'All',
}: FilterStatusButtonsProps) {
  const allOptions = includeAll
    ? [{ value: 'all', label: allLabel }, ...options]
    : options

  return (
    <div className="flex gap-1 bg-slate-800/50 p-1 rounded-lg overflow-x-auto scrollbar-hide">
      {allOptions.map((option) => {
        const isActive = value === option.value
        const activeColor = option.color ? colorClasses[option.color] : colorClasses.cyan

        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              'px-2.5 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0',
              isActive
                ? activeColor
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
