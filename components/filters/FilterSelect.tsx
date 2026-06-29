'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { FilterOption } from './types'

interface FilterSelectProps {
  options: FilterOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  includeAll?: boolean
  allLabel?: string
  className?: string
}

export function FilterSelect({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  includeAll = true,
  allLabel = 'All',
  className,
}: FilterSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        className={`w-[140px] sm:w-[160px] bg-primary-800 border-primary-600/50 text-primary-50 h-8 text-xs sm:text-sm shrink-0 ${className || ''}`}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="bg-primary-800 border-primary-600">
        {includeAll && <SelectItem value="all">{allLabel}</SelectItem>}
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
