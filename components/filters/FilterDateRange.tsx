'use client'

import * as React from 'react'
import { CalendarIcon, X } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/components/ui/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import type { DateRangeValue, DateRangePreset } from './types'
import type { DateRange } from 'react-day-picker'

interface FilterDateRangeProps {
  value: DateRangeValue
  onChange: (value: DateRangeValue) => void
  presets?: DateRangePreset[]
  placeholder?: string
  className?: string
}

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
      lastWeek.setDate(today.getDate() - 7)
      return { from: lastWeek, to: today }
    },
  },
  {
    label: 'Last 30 days',
    getValue: () => {
      const today = new Date()
      const lastMonth = new Date(today)
      lastMonth.setDate(today.getDate() - 30)
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
]

export function FilterDateRange({
  value,
  onChange,
  presets = defaultPresets,
  placeholder = 'Pick a date range',
  className,
}: FilterDateRangeProps) {
  const [open, setOpen] = React.useState(false)

  const displayText = React.useMemo(() => {
    if (!value.from) return placeholder
    if (!value.to) return format(value.from, 'MMM d, yyyy')
    return `${format(value.from, 'MMM d')} - ${format(value.to, 'MMM d, yyyy')}`
  }, [value, placeholder])

  const handleSelect = (range: DateRange | undefined) => {
    onChange({
      from: range?.from || null,
      to: range?.to || null,
    })
  }

  const handlePresetClick = (preset: DateRangePreset) => {
    onChange(preset.getValue())
  }

  const handleClear = () => {
    onChange({ from: null, to: null })
  }

  const hasValue = value.from || value.to

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full sm:w-[200px] justify-start text-left bg-slate-800 border-slate-700/50 h-10 sm:h-8 text-xs sm:text-sm hover:bg-slate-700/50 shrink-0',
            !hasValue && 'text-slate-400',
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          <span className="truncate flex-1">{displayText}</span>
          {hasValue && (
            <X
              className="ml-2 h-4 w-4 shrink-0 opacity-50 hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation()
                handleClear()
              }}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 bg-slate-900 border-slate-700"
        align="start"
      >
        <div className="flex flex-col sm:flex-row">
          {/* Presets sidebar */}
          <div className="flex sm:flex-col gap-1 p-3 border-b sm:border-b-0 sm:border-r border-slate-700 overflow-x-auto sm:overflow-x-visible">
            {presets.map((preset) => (
              <Button
                key={preset.label}
                variant="ghost"
                size="sm"
                onClick={() => handlePresetClick(preset)}
                className="text-slate-300 hover:text-slate-100 hover:bg-slate-800 justify-start whitespace-nowrap h-9 min-h-[44px] sm:min-h-0 sm:h-8 px-3"
              >
                {preset.label}
              </Button>
            ))}
          </div>

          {/* Calendar */}
          <div className="p-3">
            <Calendar
              mode="range"
              defaultMonth={value.from || undefined}
              selected={{
                from: value.from || undefined,
                to: value.to || undefined,
              }}
              onSelect={handleSelect}
              numberOfMonths={1}
              className="bg-slate-900 text-slate-100"
              classNames={{
                months: 'flex flex-col',
                month: 'space-y-4',
                caption: 'flex justify-center pt-1 relative items-center text-slate-100',
                caption_label: 'text-sm font-medium',
                nav_button: 'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-slate-100',
                table: 'w-full border-collapse',
                head_cell: 'text-slate-400 rounded-md w-9 font-normal text-[0.8rem]',
                row: 'flex w-full mt-2',
                cell: 'h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20',
                day: 'h-9 w-9 p-0 font-normal text-slate-100 hover:bg-slate-700 rounded-md min-h-[44px] sm:min-h-0',
                day_selected: 'bg-cyan-500 text-white hover:bg-cyan-600',
                day_today: 'bg-slate-700 text-slate-100',
                day_outside: 'text-slate-600',
                day_disabled: 'text-slate-600 opacity-50',
                day_range_middle: 'bg-cyan-500/20 text-cyan-100',
                day_range_start: 'bg-cyan-500 text-white rounded-l-md',
                day_range_end: 'bg-cyan-500 text-white rounded-r-md',
              }}
            />
          </div>
        </div>

        {hasValue && (
          <div className="border-t border-slate-700 p-2 flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="text-slate-400 hover:text-slate-200 h-8"
            >
              <X className="w-3.5 h-3.5 mr-1" />
              Clear
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
