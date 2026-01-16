'use client'

import * as React from 'react'
import { Check, ChevronsUpDown, Store, Plus } from 'lucide-react'
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

interface Vendor {
  id: string
  name: string
}

interface VendorComboboxProps {
  vendors: Vendor[]
  selectedVendorId: string
  customVendorName: string
  onVendorSelect: (vendorId: string, vendorName: string) => void
  onCustomVendorChange: (vendorName: string) => void
  disabled?: boolean
}

export function VendorCombobox({
  vendors,
  selectedVendorId,
  customVendorName,
  onVendorSelect,
  onCustomVendorChange,
  disabled = false,
}: VendorComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState('')

  // Get the display value
  const displayValue = React.useMemo(() => {
    if (selectedVendorId) {
      const vendor = vendors.find((v) => v.id === selectedVendorId)
      return vendor?.name || ''
    }
    return customVendorName
  }, [selectedVendorId, customVendorName, vendors])

  // Filter vendors based on search
  const filteredVendors = React.useMemo(() => {
    if (!searchValue) return vendors
    return vendors.filter((vendor) =>
      vendor.name.toLowerCase().includes(searchValue.toLowerCase())
    )
  }, [vendors, searchValue])

  // Check if the search value matches an existing vendor exactly
  const exactMatch = React.useMemo(() => {
    return vendors.find(
      (v) => v.name.toLowerCase() === searchValue.toLowerCase()
    )
  }, [vendors, searchValue])

  // Handle selecting a vendor from the list
  const handleSelectVendor = (vendorId: string, vendorName: string) => {
    onVendorSelect(vendorId, vendorName)
    setSearchValue('')
    setOpen(false)
  }

  // Handle using custom vendor name
  const handleUseCustomVendor = () => {
    if (searchValue.trim()) {
      onCustomVendorChange(searchValue.trim())
      onVendorSelect('', searchValue.trim())
      setSearchValue('')
      setOpen(false)
    }
  }

  // Handle clearing selection
  const handleClear = () => {
    onVendorSelect('', '')
    onCustomVendorChange('')
    setSearchValue('')
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'w-full justify-between bg-slate-800 border-slate-700 h-8 text-sm hover:bg-slate-700/50',
            !displayValue && 'text-slate-400'
          )}
        >
          <span className="flex items-center gap-2 truncate">
            <Store className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            {displayValue || 'Select or type vendor name...'}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-slate-900 border-slate-700">
        <Command className="bg-slate-900" shouldFilter={false}>
          <CommandInput
            placeholder="Search or type vendor name..."
            value={searchValue}
            onValueChange={setSearchValue}
            className="h-9 bg-slate-900 text-slate-100"
          />
          <CommandList className="bg-slate-900">
            {/* Show option to use custom vendor name if there's input and no exact match */}
            {searchValue.trim() && !exactMatch && (
              <>
                <CommandGroup heading="Use custom vendor">
                  <CommandItem
                    onSelect={handleUseCustomVendor}
                    className="cursor-pointer hover:bg-slate-800 text-slate-100"
                  >
                    <Plus className="mr-2 h-4 w-4 text-cyan-400" />
                    <span>
                      Use &quot;{searchValue.trim()}&quot; as vendor
                    </span>
                  </CommandItem>
                </CommandGroup>
                <CommandSeparator className="bg-slate-700" />
              </>
            )}

            {/* Show existing vendors */}
            {filteredVendors.length > 0 ? (
              <CommandGroup heading="Existing vendors" className="text-slate-400">
                {filteredVendors.map((vendor) => (
                  <CommandItem
                    key={vendor.id}
                    value={vendor.id}
                    onSelect={() => handleSelectVendor(vendor.id, vendor.name)}
                    className="cursor-pointer hover:bg-slate-800 text-slate-100"
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        selectedVendorId === vendor.id
                          ? 'opacity-100 text-cyan-400'
                          : 'opacity-0'
                      )}
                    />
                    {vendor.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : (
              <CommandEmpty className="py-4 text-sm text-slate-400">
                {searchValue
                  ? 'No vendors found. Press Enter or click above to use as custom vendor.'
                  : 'No vendors available. Type to add a custom vendor.'}
              </CommandEmpty>
            )}

            {/* Clear option if there's a selection */}
            {(selectedVendorId || customVendorName) && (
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
