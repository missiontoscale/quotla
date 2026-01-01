'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Supplier, CreateInventoryItemInput, ItemType } from '@/types/inventory'
import Navbar from '@/components/Navbar'
import LoadingSpinner from '@/components/LoadingSpinner'
import SubmitButton from '@/components/dashboard/SubmitButton'

export default function NewInventoryItemPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [formData, setFormData] = useState<CreateInventoryItemInput>({
    name: '',
    sku: '',
    description: '',
    category: '',
    item_type: 'product',
    unit_price: 0,
    cost_price: 0,
    currency: 'USD',
    track_inventory: true,
    quantity_on_hand: 0,
    low_stock_threshold: 10,
    reorder_quantity: 20,
    tax_rate: 0,
  })

  useEffect(() => {
    checkAuthAndLoadSuppliers()
  }, [])

  const checkAuthAndLoadSuppliers = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
      return
    }

    // Load suppliers
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (!error && data) {
      setSuppliers(data)
    }

    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('inventory_items')
        .insert([{
          user_id: user.id,
          ...formData
        }])
        .select()
        .single()

      if (error) throw error

      router.push('/inventory')
    } catch (error) {
      console.error('Error creating inventory item:', error)
      alert('Failed to create inventory item. Please try again.')
      setSaving(false)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-quotla-light relative">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[url('/images/patterns/grid/Quotla%20grid%20pattern%20light.svg')] bg-center opacity-[0.02] pointer-events-none" style={{backgroundSize: '150%'}}></div>

      <Navbar />

      <main className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Add Inventory Item</h1>
          <p className="text-gray-600 mt-1">Create a new product or service for your inventory</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Item Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Type <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="item_type"
                  value="product"
                  checked={formData.item_type === 'product'}
                  onChange={(e) => setFormData({ ...formData, item_type: e.target.value as ItemType })}
                  className="mr-2"
                />
                <span className="text-gray-700">Product (physical item)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="item_type"
                  value="service"
                  checked={formData.item_type === 'service'}
                  onChange={(e) => setFormData({ ...formData, item_type: e.target.value as ItemType, track_inventory: false })}
                  className="mr-2"
                />
                <span className="text-gray-700">Service</span>
              </label>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-quotla-orange focus:border-transparent"
                placeholder="e.g., Wireless Mouse, Consulting Service"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SKU (Stock Keeping Unit)
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-quotla-orange focus:border-transparent"
                placeholder="e.g., WM-001"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-quotla-orange focus:border-transparent"
              placeholder="Describe this item..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-quotla-orange focus:border-transparent"
                placeholder="e.g., Electronics, Consulting"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-quotla-orange focus:border-transparent"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="NGN">NGN - Nigerian Naira</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
              </select>
            </div>
          </div>

          {/* Pricing */}
          <div className="border-t border-gray-200 pt-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selling Price <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.unit_price}
                  onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) || 0 })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-quotla-orange focus:border-transparent"
                  placeholder="0.00"
                />
                <p className="text-xs text-gray-500 mt-1">What you charge customers</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cost Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.cost_price}
                  onChange={(e) => setFormData({ ...formData, cost_price: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-quotla-orange focus:border-transparent"
                  placeholder="0.00"
                />
                <p className="text-xs text-gray-500 mt-1">What you pay for it</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.tax_rate}
                  onChange={(e) => setFormData({ ...formData, tax_rate: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-quotla-orange focus:border-transparent"
                  placeholder="0.00"
                />
                <p className="text-xs text-gray-500 mt-1">e.g., 7.5 for 7.5%</p>
              </div>
            </div>

            {formData.unit_price > 0 && formData.cost_price > 0 && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-800">
                  <strong>Profit Margin:</strong> {formData.currency} {(formData.unit_price - formData.cost_price).toFixed(2)}
                  ({(((formData.unit_price - formData.cost_price) / formData.unit_price) * 100).toFixed(1)}%)
                </p>
              </div>
            )}
          </div>

          {/* Inventory Tracking (Products Only) */}
          {formData.item_type === 'product' && (
            <div className="border-t border-gray-200 pt-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Inventory Tracking</h3>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.track_inventory}
                    onChange={(e) => setFormData({ ...formData, track_inventory: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Track stock levels</span>
                </label>
              </div>

              {formData.track_inventory && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity on Hand
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.quantity_on_hand}
                      onChange={(e) => setFormData({ ...formData, quantity_on_hand: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-quotla-orange focus:border-transparent"
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">Current stock level</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Low Stock Alert
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.low_stock_threshold}
                      onChange={(e) => setFormData({ ...formData, low_stock_threshold: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-quotla-orange focus:border-transparent"
                      placeholder="10"
                    />
                    <p className="text-xs text-gray-500 mt-1">Alert when below this</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reorder Quantity
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.reorder_quantity}
                      onChange={(e) => setFormData({ ...formData, reorder_quantity: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-quotla-orange focus:border-transparent"
                      placeholder="20"
                    />
                    <p className="text-xs text-gray-500 mt-1">Suggested order amount</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Supplier */}
          <div className="border-t border-gray-200 pt-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Supplier (Optional)</h3>
            <select
              value={formData.default_supplier_id || ''}
              onChange={(e) => setFormData({ ...formData, default_supplier_id: e.target.value || undefined })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-quotla-orange focus:border-transparent"
            >
              <option value="">No supplier</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
            {suppliers.length === 0 && (
              <p className="text-sm text-gray-500 mt-2">
                No suppliers yet. <a href="/inventory/suppliers/new" className="text-quotla-orange hover:underline">Add one</a>
              </p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 border-t border-gray-200 pt-6">
            <button
              type="button"
              onClick={() => router.push('/inventory')}
              className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-semibold"
              disabled={saving}
            >
              Cancel
            </button>
            <SubmitButton loading={saving} loadingText="Creating...">
              Create Item
            </SubmitButton>
          </div>
        </form>
      </main>
    </div>
  )
}
