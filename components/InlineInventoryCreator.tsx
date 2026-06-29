'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { InventoryItem } from '@/types/inventory'

interface InlineInventoryCreatorProps {
  isOpen: boolean
  onClose: () => void
  onItemCreated: (item: InventoryItem) => void
  defaultCurrency: string
}

export default function InlineInventoryCreator({ isOpen, onClose, onItemCreated, defaultCurrency }: InlineInventoryCreatorProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    unit_price: '',
    cost_price: '',
    currency: defaultCurrency,
    track_inventory: true,
    quantity_on_hand: '0',
    low_stock_threshold: '5',
    category: '',
  })

  const handleSubmit = async (e?: React.MouseEvent | React.FormEvent) => {
    e?.preventDefault()
    if (!user) return

    if (!formData.name.trim()) {
      setError('Item name is required')
      return
    }

    if (!formData.unit_price || parseFloat(formData.unit_price) <= 0) {
      setError('Unit price must be greater than 0')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { data, error: insertError } = await supabase
        .from('inventory_items')
        .insert([
          {
            user_id: user.id,
            name: formData.name,
            item_type: 'product',
            sku: formData.sku || null,
            description: formData.description || null,
            unit_price: parseFloat(formData.unit_price),
            cost_price: parseFloat(formData.cost_price || '0'),
            currency: formData.currency,
            track_inventory: formData.track_inventory,
            quantity_on_hand: formData.track_inventory ? parseInt(formData.quantity_on_hand) : 0,
            low_stock_threshold: formData.track_inventory ? parseInt(formData.low_stock_threshold) : 0,
            category: formData.category || null,
            is_active: true,
          } as never,
        ])
        .select()
        .single()

      if (insertError) throw insertError

      if (data) {
        onItemCreated(data)
        setFormData({
          name: '',
          sku: '',
          description: '',
          unit_price: '',
          cost_price: '',
          currency: defaultCurrency,
          track_inventory: true,
    quantity_on_hand: '1',
          low_stock_threshold: '5',
          category: '',
        })
        onClose()
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create inventory item')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const adjustField = (field: string, delta: number) => {
    const current = parseInt(formData[field as keyof typeof formData] as string) || 0
    setFormData({ ...formData, [field]: String(Math.max(0, current + delta)) })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { if (!loading) onClose() }}></div>

      {/* Modal panel */}
      <div className="relative w-full max-w-md max-h-[90vh] flex flex-col bg-primary-800 rounded-lg shadow-xl border border-primary-600">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-primary-600">
          <h2 className="text-sm font-medium text-primary-100" id="modal-title">
            Add Inventory Item
          </h2>
          <button
            type="button"
            className="text-primary-400 hover:text-primary-100 transition-colors"
            onClick={onClose}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          <div className="space-y-3">
            {error && (
              <div className="bg-red-900/30 border border-red-700/50 text-red-400 px-3 py-2 rounded text-xs">
                {error}
              </div>
            )}

            {/* Basic Information */}
            <div className="space-y-1">
              <label htmlFor="name" className="block text-xs text-primary-400">
                Item Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full px-2.5 py-2 bg-primary-800 border border-primary-600 rounded text-primary-50 placeholder-primary-500 focus:ring-1 focus:ring-quotla-orange focus:border-quotla-orange text-sm"
                value={formData.name}
                onChange={handleChange}
                placeholder="Premium Widget"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label htmlFor="sku" className="block text-xs text-primary-400">
                  SKU
                </label>
                <input
                  type="text"
                  id="sku"
                  name="sku"
                  className="w-full px-2.5 py-2 bg-primary-800 border border-primary-600 rounded text-primary-50 placeholder-primary-500 focus:ring-1 focus:ring-quotla-orange focus:border-quotla-orange text-sm"
                  value={formData.sku}
                  onChange={handleChange}
                  placeholder="WGT-001"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="category" className="block text-xs text-primary-400">
                  Category
                </label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  className="w-full px-2.5 py-2 bg-primary-800 border border-primary-600 rounded text-primary-50 placeholder-primary-500 focus:ring-1 focus:ring-quotla-orange focus:border-quotla-orange text-sm"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="Products"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="description" className="block text-xs text-primary-400">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={2}
                className="w-full px-2.5 py-2 bg-primary-800 border border-primary-600 rounded text-primary-50 placeholder-primary-500 focus:ring-1 focus:ring-quotla-orange focus:border-quotla-orange text-sm resize-none"
                value={formData.description}
                onChange={handleChange}
                placeholder="Item description..."
              />
            </div>

            {/* Pricing */}
            <div className="border-t border-primary-600/50 pt-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2 space-y-1">
                  <label htmlFor="unit_price" className="block text-xs text-primary-400">
                    Selling Price *
                  </label>
                  <input
                    type="number"
                    id="unit_price"
                    name="unit_price"
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-2.5 py-2 bg-primary-800 border border-primary-600 rounded text-primary-50 placeholder-primary-500 focus:ring-1 focus:ring-quotla-orange focus:border-quotla-orange text-sm"
                    value={formData.unit_price}
                    onChange={handleChange}
                    placeholder="99.99"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="currency" className="block text-xs text-primary-400">
                    Currency
                  </label>
                  <select
                    id="currency"
                    name="currency"
                    className="w-full px-2.5 py-2 bg-primary-800 border border-primary-600 rounded text-primary-50 focus:ring-1 focus:ring-quotla-orange focus:border-quotla-orange text-sm"
                    value={formData.currency}
                    onChange={handleChange}
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="CAD">CAD</option>
                    <option value="AUD">AUD</option>
                  </select>
                </div>
              </div>

              <div className="mt-2 space-y-1">
                <label htmlFor="cost_price" className="block text-xs text-primary-400">
                  Cost Price
                </label>
                <input
                  type="number"
                  id="cost_price"
                  name="cost_price"
                  min="0"
                  step="0.01"
                  className="w-full px-2.5 py-2 bg-primary-800 border border-primary-600 rounded text-primary-50 placeholder-primary-500 focus:ring-1 focus:ring-quotla-orange focus:border-quotla-orange text-sm"
                  value={formData.cost_price}
                  onChange={handleChange}
                  placeholder="50.00"
                />
              </div>
            </div>

            {/* Inventory Tracking */}
            <div className="border-t border-primary-600/50 pt-3">
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  id="track_inventory"
                  name="track_inventory"
                  className="w-3.5 h-3.5 text-primary-500 bg-primary-800 border-primary-600 rounded focus:ring-1 focus:ring-primary-500"
                  checked={formData.track_inventory}
                  onChange={handleChange}
                />
                <label htmlFor="track_inventory" className="text-xs text-primary-400 cursor-pointer">
                  Track inventory
                </label>
              </div>

              {formData.track_inventory && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label htmlFor="quantity_on_hand" className="block text-xs text-primary-400">
                      Initial Qty
                    </label>
                    <div className="flex items-center gap-0">
                      <button
                        type="button"
                        className="h-8 w-8 rounded-l border border-r-0 border-primary-600 bg-primary-800 text-primary-200 hover:bg-primary-700 flex items-center justify-center text-sm"
                        onClick={() => adjustField('quantity_on_hand', -1)}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        id="quantity_on_hand"
                        name="quantity_on_hand"
                        min="0"
                        className="h-8 w-14 bg-primary-800 border border-primary-600 text-primary-50 text-sm text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:ring-0 focus:border-primary-600"
                        value={formData.quantity_on_hand}
                        onChange={handleChange}
                      />
                      <button
                        type="button"
                        className="h-8 w-8 rounded-r border border-l-0 border-primary-600 bg-primary-800 text-primary-200 hover:bg-primary-700 flex items-center justify-center text-sm"
                        onClick={() => adjustField('quantity_on_hand', 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="low_stock_threshold" className="block text-xs text-primary-400">
                      Low Stock
                    </label>
                    <div className="flex items-center gap-0">
                      <button
                        type="button"
                        className="h-8 w-8 rounded-l border border-r-0 border-primary-600 bg-primary-800 text-primary-200 hover:bg-primary-700 flex items-center justify-center text-sm"
                        onClick={() => adjustField('low_stock_threshold', -1)}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        id="low_stock_threshold"
                        name="low_stock_threshold"
                        min="0"
                        className="h-8 w-14 bg-primary-800 border border-primary-600 text-primary-50 text-sm text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:ring-0 focus:border-primary-600"
                        value={formData.low_stock_threshold}
                        onChange={handleChange}
                      />
                      <button
                        type="button"
                        className="h-8 w-8 rounded-r border border-l-0 border-primary-600 bg-primary-800 text-primary-200 hover:bg-primary-700 flex items-center justify-center text-sm"
                        onClick={() => adjustField('low_stock_threshold', 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-4 py-3 border-t border-primary-600 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-3 py-1.5 rounded border border-primary-600 text-primary-200 hover:bg-primary-700 transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-1.5 rounded bg-primary-600 hover:bg-primary-600 text-primary-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {loading ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  )
}
