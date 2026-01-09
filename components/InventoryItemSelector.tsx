'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { InventoryItem } from '@/types/inventory'
import InlineInventoryCreator from './InlineInventoryCreator'

interface InventoryItemSelectorProps {
  onSelect: (item: InventoryItem) => void
  currency: string
  disabled?: boolean
}

export default function InventoryItemSelector({ onSelect, currency, disabled }: InventoryItemSelectorProps) {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [showCreator, setShowCreator] = useState(false)

  useEffect(() => {
    loadInventoryItems()
  }, [])

  const loadInventoryItems = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) throw error

      setItems(data || [])
    } catch (error) {
      console.error('Error loading inventory items:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredItems = items.filter(item => {
    if (!searchQuery) return true
    const search = searchQuery.toLowerCase()
    return (
      item.name.toLowerCase().includes(search) ||
      item.sku?.toLowerCase().includes(search) ||
      item.description?.toLowerCase().includes(search)
    )
  })

  const handleSelectItem = (item: InventoryItem) => {
    onSelect(item)
    setSearchQuery('')
    setShowDropdown(false)
  }

  const handleItemCreated = (newItem: InventoryItem) => {
    setItems([...items, newItem])
    onSelect(newItem)
  }

  const getStockStatus = (item: InventoryItem) => {
    if (!item.track_inventory) return { text: 'Service', color: 'text-purple-600', bg: 'bg-purple-50' }
    if (item.quantity_on_hand === 0) return { text: 'Out of stock', color: 'text-red-600', bg: 'bg-red-50' }
    if (item.quantity_on_hand <= item.low_stock_threshold) return { text: 'Low stock', color: 'text-orange-600', bg: 'bg-orange-50' }
    return { text: 'In stock', color: 'text-green-600', bg: 'bg-green-50' }
  }

  return (
    <>
      <div className="relative">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setShowDropdown(true)
            }}
            onFocus={() => setShowDropdown(true)}
            placeholder="Search items..."
            disabled={disabled || loading}
            className="flex-1 px-2.5 sm:px-3 py-2 border border-slate-600 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm bg-slate-800 dark:bg-slate-800 text-slate-100 dark:text-slate-100 placeholder-slate-400"
          />
          <button
            type="button"
            onClick={() => setShowCreator(true)}
            disabled={disabled || loading}
            className="px-2.5 sm:px-3 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white text-xs sm:text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap h-[38px] flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">New</span>
          </button>
        </div>

      {/* Click outside to close */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}

      {/* Dropdown */}
      {showDropdown && filteredItems.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-h-72 sm:max-h-96 overflow-y-auto">
          {filteredItems.map((item) => {
            const status = getStockStatus(item)
            const showPriceWarning = item.currency !== currency

            return (
              <button
                key={item.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleSelectItem(item)
                }}
                className="w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-slate-700 border-b border-slate-700 last:border-b-0 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 sm:gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                      <p className="font-medium text-slate-100 truncate text-sm">{item.name}</p>
                      {item.sku && (
                        <span className="text-[10px] sm:text-xs text-slate-400 px-1.5 py-0.5 bg-slate-700 rounded">
                          {item.sku}
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-xs sm:text-sm text-slate-400 truncate mb-1">{item.description}</p>
                    )}
                    <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs flex-wrap">
                      <span className={`px-1.5 py-0.5 rounded-full ${status.bg.replace('bg-', 'bg-').replace('-50', '-900/30')} ${status.color.replace('text-', 'text-').replace('-600', '-400')} font-medium`}>
                        {status.text}
                      </span>
                      {item.track_inventory && (
                        <span className="text-slate-400">
                          {item.quantity_on_hand} avail
                        </span>
                      )}
                      {showPriceWarning && (
                        <span className="text-orange-400 font-medium text-[10px]">
                          ⚠️ {item.currency}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs sm:text-sm font-semibold text-cyan-400">
                      {item.currency} {item.unit_price.toFixed(2)}
                    </p>
                    <p className="text-[10px] sm:text-xs text-slate-500">
                      Cost: {item.cost_price.toFixed(2)}
                    </p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* No results */}
      {showDropdown && searchQuery && filteredItems.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-3 sm:p-4 text-center">
          <p className="text-xs sm:text-sm text-slate-400">No items found matching "{searchQuery}"</p>
        </div>
      )}
      </div>

      {/* Inline Creator Modal */}
      <InlineInventoryCreator
        isOpen={showCreator}
        onClose={() => setShowCreator(false)}
        onItemCreated={handleItemCreated}
        defaultCurrency={currency}
      />
    </>
  )
}
