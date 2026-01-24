'use client'

import * as React from 'react'
import { Check, ChevronsUpDown, X } from 'lucide-react'
import { cn } from '@/components/ui/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import type { MultiSelectOption } from './types'

interface FilterMultiSelectProps {
  options: MultiSelectOption[]
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  maxDisplay?: number
  className?: string
}

export function FilterMultiSelect({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  emptyMessage = 'No results found.',
  maxDisplay = 2,
  className,
}: FilterMultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState('')

  const selectedOptions = React.useMemo(() => {
    return options.filter((opt) => value.includes(opt.id))
  }, [options, value])

  const filteredOptions = React.useMemo(() => {
    if (!searchValue) return options
    return options.filter((option) =>
      option.label.toLowerCase().includes(searchValue.toLowerCase())
    )
  }, [options, searchValue])

  const handleToggle = (optionId: string) => {
    if (value.includes(optionId)) {
      onChange(value.filter((id) => id !== optionId))
    } else {
      onChange([...value, optionId])
    }
  }

  const handleClear = () => {
    onChange([])
    setSearchValue('')
  }

  const displayText = React.useMemo(() => {
    if (selectedOptions.length === 0) return placeholder
    if (selectedOptions.length <= maxDisplay) {
      return selectedOptions.map((opt) => opt.label).join(', ')
    }
    return `${selectedOptions.slice(0, maxDisplay).map((opt) => opt.label).join(', ')} +${selectedOptions.length - maxDisplay}`
  }, [selectedOptions, placeholder, maxDisplay])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full sm:w-[160px] justify-between bg-slate-800 border-slate-700/50 h-10 sm:h-8 text-xs sm:text-sm hover:bg-slate-700/50 shrink-0',
            selectedOptions.length === 0 && 'text-slate-400',
            className
          )}
        >
          <span className="truncate flex-1 text-left">{displayText}</span>
          <div className="flex items-center gap-1 ml-2 shrink-0">
            {selectedOptions.length > 0 && (
              <span className="bg-cyan-500/20 text-cyan-400 text-xs px-1.5 py-0.5 rounded">
                {selectedOptions.length}
              </span>
            )}
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] min-w-[200px] p-0 bg-slate-900 border-slate-700"
        align="start"
      >
        <Command className="bg-slate-900" shouldFilter={false}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={searchValue}
            onValueChange={setSearchValue}
            className="h-10 sm:h-9 bg-slate-900 text-slate-100"
          />
          <CommandList className="bg-slate-900 max-h-[200px]">
            {filteredOptions.length > 0 ? (
              <CommandGroup>
                {filteredOptions.map((option) => {
                  const isSelected = value.includes(option.id)
                  return (
                    <CommandItem
                      key={option.id}
                      value={option.id}
                      onSelect={() => handleToggle(option.id)}
                      className="cursor-pointer hover:bg-slate-800 text-slate-100 min-h-[44px] sm:min-h-[36px] flex items-center gap-2"
                    >
                      <Checkbox
                        checked={isSelected}
                        className="border-slate-600 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
                      />
                      <span className="truncate">{option.label}</span>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            ) : (
              <CommandEmpty className="py-4 text-sm text-slate-400">
                {emptyMessage}
              </CommandEmpty>
            )}

            {value.length > 0 && (
              <>
                <CommandSeparator className="bg-slate-700" />
                <CommandGroup>
                  <CommandItem
                    onSelect={handleClear}
                    className="cursor-pointer hover:bg-slate-800 text-slate-400 min-h-[44px] sm:min-h-[36px] justify-center"
                  >
                    <X className="w-3.5 h-3.5 mr-1.5" />
                    Clear all
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
