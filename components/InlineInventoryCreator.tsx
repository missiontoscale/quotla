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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
          },
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
          quantity_on_hand: '0',
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
      {/* Background overlay */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gray-900 bg-opacity-50 transition-opacity" onClick={onClose}></div>

        {/* Slide-over panel */}
        <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
          <div className="w-screen max-w-md">
            <div className="h-full flex flex-col bg-white dark:bg-primary-700 shadow-xl">
              {/* Header */}
              <div className="px-4 py-6 bg-quotla-green">
                <div className="flex items-start justify-between">
                  <h2 className="text-lg font-heading font-bold text-white" id="slide-over-title">
                    Add Inventory Item
                  </h2>
                  <button
                    type="button"
                    className="text-white hover:text-gray-200 transition-colors"
                    onClick={onClose}
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="mt-1 text-sm text-white/90">
                  Quickly add a new inventory item
                </p>
              </div>

              {/* Form */}
              <div className="flex-1 overflow-y-auto px-4 py-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
                      {error}
                    </div>
                  )}

                  {/* Basic Information */}
                  <div>
                    <label htmlFor="name" className="label">
                      Item Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      className="input"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Premium Widget"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="sku" className="label">
                        SKU
                      </label>
                      <input
                        type="text"
                        id="sku"
                        name="sku"
                        className="input"
                        value={formData.sku}
                        onChange={handleChange}
                        placeholder="WIDGET-001"
                      />
                    </div>

                    <div>
                      <label htmlFor="category" className="label">
                        Category
                      </label>
                      <input
                        type="text"
                        id="category"
                        name="category"
                        className="input"
                        value={formData.category}
                        onChange={handleChange}
                        placeholder="Products"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="description" className="label">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={2}
                      className="input"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Brief description of the item..."
                    />
                  </div>

                  {/* Pricing */}
                  <div className="border-t border-gray-200 dark:border-primary-600 pt-4">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-primary-300 mb-3">
                      Pricing
                    </h3>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2">
                        <label htmlFor="unit_price" className="label">
                          Unit Price *
                        </label>
                        <input
                          type="number"
                          id="unit_price"
                          name="unit_price"
                          required
                          min="0"
                          step="0.01"
                          className="input"
                          value={formData.unit_price}
                          onChange={handleChange}
                          placeholder="99.99"
                        />
                      </div>

                      <div>
                        <label htmlFor="currency" className="label">
                          Currency
                        </label>
                        <select
                          id="currency"
                          name="currency"
                          className="input"
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

                    <div className="mt-4">
                      <label htmlFor="cost_price" className="label">
                        Cost Price
                      </label>
                      <input
                        type="number"
                        id="cost_price"
                        name="cost_price"
                        min="0"
                        step="0.01"
                        className="input"
                        value={formData.cost_price}
                        onChange={handleChange}
                        placeholder="50.00"
                      />
                      <p className="text-xs text-gray-500 dark:text-primary-400 mt-1">
                        Your cost for this item (used for profit calculations)
                      </p>
                    </div>
                  </div>

                  {/* Inventory Tracking */}
                  <div className="border-t border-gray-200 dark:border-primary-600 pt-4">
                    <div className="flex items-center gap-3 mb-4">
                      <input
                        type="checkbox"
                        id="track_inventory"
                        name="track_inventory"
                        className="w-4 h-4 text-quotla-orange rounded focus:ring-quotla-orange"
                        checked={formData.track_inventory}
                        onChange={handleChange}
                      />
                      <label htmlFor="track_inventory" className="label mb-0">
                        Track inventory for this item
                      </label>
                    </div>

                    {formData.track_inventory && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="quantity_on_hand" className="label">
                            Initial Quantity
                          </label>
                          <input
                            type="number"
                            id="quantity_on_hand"
                            name="quantity_on_hand"
                            min="0"
                            className="input"
                            value={formData.quantity_on_hand}
                            onChange={handleChange}
                          />
                        </div>

                        <div>
                          <label htmlFor="low_stock_threshold" className="label">
                            Low Stock Alert
                          </label>
                          <input
                            type="number"
                            id="low_stock_threshold"
                            name="low_stock_threshold"
                            min="0"
                            className="input"
                            value={formData.low_stock_threshold}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    )}

                    {!formData.track_inventory && (
                      <p className="text-sm text-gray-600 dark:text-primary-400">
                        This item will be treated as a service (no stock tracking)
                      </p>
                    )}
                  </div>
                </form>
              </div>

              {/* Footer */}
              <div className="flex-shrink-0 px-4 py-4 border-t border-gray-200 dark:border-primary-600 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-primary-600 text-gray-700 dark:text-primary-300 hover:bg-gray-50 dark:hover:bg-primary-600 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-5 py-2 rounded-lg bg-quotla-green text-white font-semibold hover:opacity-90 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Item'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
