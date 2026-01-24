'use client'

import * as React from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
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
import type { ComboboxOption } from './types'

interface FilterComboboxProps {
  options: ComboboxOption[]
  value: string | null
  onChange: (value: string | null) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  icon?: React.ReactNode
  className?: string
}

export function FilterCombobox({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  emptyMessage = 'No results found.',
  icon,
  className,
}: FilterComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState('')

  const selectedOption = React.useMemo(() => {
    return options.find((opt) => opt.id === value)
  }, [options, value])

  const filteredOptions = React.useMemo(() => {
    if (!searchValue) return options
    return options.filter((option) =>
      option.name.toLowerCase().includes(searchValue.toLowerCase())
    )
  }, [options, searchValue])

  const handleSelect = (optionId: string) => {
    onChange(optionId === value ? null : optionId)
    setSearchValue('')
    setOpen(false)
  }

  const handleClear = () => {
    onChange(null)
    setSearchValue('')
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-[140px] sm:w-[160px] justify-between bg-slate-800 border-slate-700/50 h-8 text-xs sm:text-sm hover:bg-slate-700/50 shrink-0',
            !selectedOption && 'text-slate-400',
            className
          )}
        >
          <span className="flex items-center gap-2 truncate">
            {icon}
            {selectedOption?.name || placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-slate-900 border-slate-700">
        <Command className="bg-slate-900" shouldFilter={false}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={searchValue}
            onValueChange={setSearchValue}
            className="h-9 bg-slate-900 text-slate-100"
          />
          <CommandList className="bg-slate-900">
            {filteredOptions.length > 0 ? (
              <CommandGroup>
                {filteredOptions.map((option) => (
                  <CommandItem
                    key={option.id}
                    value={option.id}
                    onSelect={() => handleSelect(option.id)}
                    className="cursor-pointer hover:bg-slate-800 text-slate-100"
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === option.id
                          ? 'opacity-100 text-cyan-400'
                          : 'opacity-0'
                      )}
                    />
                    {option.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : (
              <CommandEmpty className="py-4 text-sm text-slate-400">
                {emptyMessage}
              </CommandEmpty>
            )}

            {value && (
              <>
                <CommandSeparator className="bg-slate-700" />
                <CommandGroup>
                  <CommandItem
                    onSelect={handleClear}
                    className="cursor-pointer hover:bg-slate-800 text-slate-400"
                  >
                    Clear selection
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
