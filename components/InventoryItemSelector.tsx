'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { InventoryItem } from '@/types/inventory'

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

  const getStockStatus = (item: InventoryItem) => {
    if (!item.track_inventory) return { text: 'Service', color: 'text-purple-600', bg: 'bg-purple-50' }
    if (item.quantity_on_hand === 0) return { text: 'Out of stock', color: 'text-red-600', bg: 'bg-red-50' }
    if (item.quantity_on_hand <= item.low_stock_threshold) return { text: 'Low stock', color: 'text-orange-600', bg: 'bg-orange-50' }
    return { text: 'In stock', color: 'text-green-600', bg: 'bg-green-50' }
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2 mb-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            setShowDropdown(true)
          }}
          onFocus={() => setShowDropdown(true)}
          placeholder="Search inventory items..."
          disabled={disabled || loading}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-quotla-orange focus:border-transparent text-sm"
        />
        {loading && (
          <span className="text-sm text-gray-500">Loading...</span>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && filteredItems.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {filteredItems.map((item) => {
            const status = getStockStatus(item)
            const showPriceWarning = item.currency !== currency

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectItem(item)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-gray-900 truncate">{item.name}</p>
                      {item.sku && (
                        <span className="text-xs text-gray-500 px-2 py-0.5 bg-gray-100 rounded">
                          {item.sku}
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-sm text-gray-600 truncate mb-1">{item.description}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs">
                      <span className={`px-2 py-0.5 rounded-full ${status.bg} ${status.color} font-medium`}>
                        {status.text}
                      </span>
                      {item.track_inventory && (
                        <span className="text-gray-500">
                          {item.quantity_on_hand} available
                        </span>
                      )}
                      {showPriceWarning && (
                        <span className="text-orange-600 font-medium">
                          ⚠️ Different currency ({item.currency})
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {item.currency} {item.unit_price.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Cost: {item.currency} {item.cost_price.toFixed(2)}
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
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center">
          <p className="text-sm text-gray-500">No items found matching "{searchQuery}"</p>
        </div>
      )}

      {/* Click outside to close */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  )
}
