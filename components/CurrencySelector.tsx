'use client'

import { useState, useEffect, useRef } from 'react'
import { CURRENCIES, Currency, DEFAULT_BUSINESS_CURRENCY, getCurrency, getCurrencySymbol } from '@/lib/utils/currency'

interface CurrencySelectorProps {
  value: string
  onChange: (currency: string) => void
  className?: string
  showLabel?: boolean
}

export default function CurrencySelector({
  value,
  onChange,
  className = '',
  showLabel = true
}: CurrencySelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const selectedCurrency = getCurrency(value) || getCurrency(DEFAULT_BUSINESS_CURRENCY)!

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchQuery('')
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      // Focus search input when dropdown opens
      setTimeout(() => searchInputRef.current?.focus(), 50)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Filter currencies based on search
  const filteredCurrencies = CURRENCIES.filter(currency => {
    if (!searchQuery) return true

    const query = searchQuery.toLowerCase()
    return (
      currency.code.toLowerCase().includes(query) ||
      currency.name.toLowerCase().includes(query) ||
      currency.symbol.includes(query)
    )
  })

  // Popular currencies to show at top
  const popularCurrencies = ['USD', 'EUR', 'GBP', 'NGN']
  const popularCurrenciesData = popularCurrencies
    .map(code => getCurrency(code))
    .filter(Boolean) as Currency[]

  const handleSelect = (currencyCode: string) => {
    onChange(currencyCode)
    setIsOpen(false)
    setSearchQuery('')
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {showLabel && (
        <label className="relative flex items-center gap-3 mb-2">
          <div className="w-0.5 h-4 bg-[#445642]" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#d1d5db]">
            Currency
          </span>
        </label>
      )}

      {/* Selector Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#1a1f1f] border-2 border-[#445642] rounded-lg px-4 py-3
                   flex items-center justify-between hover:border-[#ce6203]
                   transition-colors duration-150 focus:outline-none focus:border-[#ce6203]"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{selectedCurrency.flag}</span>
          <div className="text-left">
            <div className="font-semibold text-[#fffad6] text-sm">
              {selectedCurrency.code}
            </div>
            <div className="text-xs text-[#9ca3af]">
              {selectedCurrency.name}
            </div>
          </div>
        </div>
        <svg
          className={`w-4 h-4 text-[#9ca3af] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-[#1a1f1f] border-2 border-[#445642]
                        rounded-lg shadow-[0_12px_24px_rgba(0,0,0,0.4)] overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-[#374151]">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search currencies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1a1f1f]/60 text-[#fffad6] border-0 border-b-2
                         border-[#374151] px-3 py-2 text-sm
                         focus:outline-none focus:border-[#ce6203]
                         transition-all duration-150 placeholder:text-[#6b7280]"
            />
          </div>

          {/* Currency List */}
          <div className="max-h-80 overflow-y-auto">
            {/* Popular Currencies Section */}
            {!searchQuery && (
              <>
                <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#6b7280] bg-[#1a1f1f]">
                  Popular
                </div>
                {popularCurrenciesData.map((currency) => (
                  <button
                    key={currency.code}
                    type="button"
                    onClick={() => handleSelect(currency.code)}
                    className={`w-full px-4 py-3 flex items-center gap-3
                               hover:bg-[#ce6203]/10 transition-colors text-left
                               ${currency.code === value ? 'bg-[#ce6203]/15 border-l-3 border-l-[#ce6203]' : ''}`}
                  >
                    <span className="text-lg">{currency.flag}</span>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-[#fffad6]">
                        {currency.code}
                      </div>
                      <div className="text-xs text-[#9ca3af]">
                        {currency.name}
                      </div>
                    </div>
                    <div className="text-xs text-[#6b7280]">
                      {currency.symbol}
                    </div>
                  </button>
                ))}

                {/* Separator */}
                <div className="h-px bg-[#374151] my-1" />

                <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#6b7280]">
                  All Currencies
                </div>
              </>
            )}

            {/* All Currencies or Search Results */}
            {filteredCurrencies.length > 0 ? (
              filteredCurrencies
                .filter(currency => !searchQuery || !popularCurrencies.includes(currency.code))
                .map((currency) => (
                  <button
                    key={currency.code}
                    type="button"
                    onClick={() => handleSelect(currency.code)}
                    className={`w-full px-4 py-3 flex items-center gap-3
                               hover:bg-[#ce6203]/10 transition-colors text-left
                               ${currency.code === value ? 'bg-[#ce6203]/15 border-l-3 border-l-[#ce6203]' : ''}`}
                  >
                    <span className="text-lg">{currency.flag}</span>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-[#fffad6]">
                        {currency.code}
                      </div>
                      <div className="text-xs text-[#9ca3af]">
                        {currency.name}
                      </div>
                    </div>
                    <div className="text-xs text-[#6b7280]">
                      {currency.symbol}
                    </div>
                  </button>
                ))
            ) : (
              <div className="px-4 py-8 text-center text-sm text-[#6b7280]">
                No currencies found matching "{searchQuery}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
