'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { InventoryItem } from '@/types/inventory'
import InlineInventoryCreator from './InlineInventoryCreator'
import { formatCurrency } from '@/lib/utils/currency'

interface InventoryItemSelectorProps {
  onSelect: (item: InventoryItem, quantity?: number) => void
  currency: string
  disabled?: boolean
  selectedItems?: Array<{ inventory_item_id?: string; quantity: number }>
}

export default function InventoryItemSelector({ onSelect, currency, disabled, selectedItems = [] }: InventoryItemSelectorProps) {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [showCreator, setShowCreator] = useState(false)
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({})
  const [convertedPrices, setConvertedPrices] = useState<Record<string, { unit_price: number; cost_price: number }>>({})

  useEffect(() => {
    loadInventoryItems()
  }, [])

  // Convert prices when currency or items change
  useEffect(() => {
    if (items.length === 0) return

    const convertPrices = async () => {
      const conversions: Record<string, { unit_price: number; cost_price: number }> = {}

      for (const item of items) {
        if (item.currency === currency) {
          // No conversion needed
          conversions[item.id] = {
            unit_price: item.unit_price,
            cost_price: item.cost_price,
          }
        } else {
          // Convert both unit price and cost price via API
          try {
            const [unitPriceRes, costPriceRes] = await Promise.all([
              fetch('/api/currency/convert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: item.unit_price, from: item.currency, to: currency }),
              }),
              fetch('/api/currency/convert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: item.cost_price, from: item.currency, to: currency }),
              }),
            ])
            const [unitPriceData, costPriceData] = await Promise.all([unitPriceRes.json(), costPriceRes.json()])
            conversions[item.id] = {
              unit_price: unitPriceData.convertedAmount ?? item.unit_price,
              cost_price: costPriceData.convertedAmount ?? item.cost_price,
            }
          } catch (error) {
            console.error(`Failed to convert prices for ${item.name}:`, error)
            // Fallback to original prices if conversion fails
            conversions[item.id] = {
              unit_price: item.unit_price,
              cost_price: item.cost_price,
            }
          }
        }
      }

      setConvertedPrices(conversions)
    }

    convertPrices()
  }, [items, currency])

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
    const quantity = itemQuantities[item.id] || 1

    // If price was converted, create a modified item with the converted price
    const convertedPrice = convertedPrices[item.id]
    const itemToSelect = convertedPrice ? {
      ...item,
      unit_price: convertedPrice.unit_price,
      cost_price: convertedPrice.cost_price,
      currency: currency, // Update to target currency
      original_currency: item.currency, // Keep track of original currency
      original_unit_price: item.unit_price, // Keep track of original price
    } : item

    onSelect(itemToSelect as InventoryItem, quantity)
    setSearchQuery('')
    setShowDropdown(false)
    setItemQuantities({}) // Reset quantities
  }

  const handleQuantityChange = (itemId: string, delta: number) => {
    setItemQuantities(prev => {
      const current = prev[itemId] || 1
      const newQty = Math.max(1, current + delta)
      return { ...prev, [itemId]: newQty }
    })
  }

  const getItemQuantity = (itemId: string) => {
    return itemQuantities[itemId] || 1
  }

  const isItemSelected = (itemId: string) => {
    return selectedItems.some(item => item.inventory_item_id === itemId)
  }

  const handleItemCreated = (newItem: InventoryItem) => {
    setItems([...items, newItem])
    onSelect(newItem, 1)
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
            placeholder="Add from Inventory..."
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
        <div className="absolute z-50 w-full mt-1 bg-slate-800/95 backdrop-blur-sm border border-slate-700 rounded-lg shadow-2xl max-h-72 sm:max-h-96 overflow-y-auto">
          {filteredItems.map((item) => {
            const status = getStockStatus(item)
            const showPriceWarning = item.currency !== currency
            const isSelected = isItemSelected(item.id)
            const currentQty = getItemQuantity(item.id)

            const displayPrice = convertedPrices[item.id]?.unit_price ?? item.unit_price
            const displayCost = convertedPrices[item.id]?.cost_price ?? item.cost_price
            const isConverted = item.currency !== currency && convertedPrices[item.id]

            return (
              <div
                key={item.id}
                className={`px-3 py-2 border-b border-slate-700/50 last:border-b-0 hover:bg-slate-700/30 transition-colors ${isSelected ? 'bg-cyan-500/5 border-l-2 border-l-cyan-500' : ''}`}
              >
                {/* Top Row: Name, SKU, Price */}
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <p className="font-medium text-slate-100 truncate text-sm">{item.name}</p>
                    {item.sku && (
                      <span className="text-[10px] text-slate-400 px-1.5 py-0.5 bg-slate-700/50 rounded font-mono">
                        {item.sku}
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1.5 flex-shrink-0">
                    <p className="text-sm font-semibold text-cyan-400">
                      {formatCurrency(displayPrice, currency)}
                    </p>
                    {isConverted && (
                      <span className="text-[9px] text-green-400/70" title={`Converted from ${item.currency}`}>
                        ↻
                      </span>
                    )}
                  </div>
                </div>

                {/* Middle Row: Description (if exists) */}
                {item.description && (
                  <p className="text-xs text-slate-400 mb-1.5 line-clamp-1">{item.description}</p>
                )}

                {/* Bottom Row: Status, Stock, Actions */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className={`px-1.5 py-0.5 rounded ${status.bg.replace('bg-', 'bg-').replace('-50', '-900/30')} ${status.color.replace('text-', 'text-').replace('-600', '-400')} font-medium`}>
                      {status.text}
                    </span>
                    {item.track_inventory && (
                      <span className="text-slate-500">
                        {item.quantity_on_hand} left
                      </span>
                    )}
                  </div>

                  {/* Quantity + Add Button */}
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center bg-slate-900/50 rounded border border-slate-600">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleQuantityChange(item.id, -1)
                        }}
                        className="w-6 h-6 flex items-center justify-center hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={currentQty}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1
                          setItemQuantities(prev => ({ ...prev, [item.id]: Math.max(1, val) }))
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-10 text-center bg-transparent border-0 text-slate-100 text-xs focus:outline-none focus:ring-0 py-1"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleQuantityChange(item.id, 1)
                        }}
                        className="w-6 h-6 flex items-center justify-center hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSelectItem(item)
                      }}
                      disabled={isSelected}
                      className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                        isSelected
                          ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                          : 'bg-cyan-500 hover:bg-cyan-600 text-white shadow-sm'
                      }`}
                    >
                      {isSelected ? '✓ Added' : 'Add'}
                    </button>
                  </div>
                </div>
              </div>
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
