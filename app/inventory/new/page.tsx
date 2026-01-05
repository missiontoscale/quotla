'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Supplier, CreateInventoryItemInput, ItemType } from '@/types/inventory'
import LoadingSpinner from '@/components/LoadingSpinner'

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
      .eq('is_active', true as any)
      .order('name')

    if (!error && data) {
      setSuppliers(data as unknown as Supplier[])
    }

    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('inventory_items')
        .insert([{
          user_id: user.id,
          ...formData
        }])

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
    <div className="max-w-5xl">
      <h1 className="text-3xl font-bold text-primary-50 mb-8">Add Inventory Item</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Item Details</h2>

          {/* Item Type */}
          <div className="mb-6">
            <label className="label">
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
                  className="w-4 h-4 text-quotla-orange focus:ring-quotla-orange mr-2"
                />
                <span>Product (physical item)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="item_type"
                  value="service"
                  checked={formData.item_type === 'service'}
                  onChange={(e) => setFormData({ ...formData, item_type: e.target.value as ItemType, track_inventory: false })}
                  className="w-4 h-4 text-quotla-orange focus:ring-quotla-orange mr-2"
                />
                <span>Service</span>
              </label>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="label">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="input"
                placeholder="e.g., Wireless Mouse, Consulting Service"
              />
            </div>

            <div>
              <label htmlFor="sku" className="label">
                SKU (Stock Keeping Unit)
              </label>
              <input
                type="text"
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="input"
                placeholder="e.g., WM-001"
              />
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="description" className="label">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="input resize-none"
              placeholder="Describe this item..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label htmlFor="category" className="label">
                Category
              </label>
              <input
                type="text"
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input"
                placeholder="e.g., Electronics, Consulting"
              />
            </div>

            <div>
              <label htmlFor="currency" className="label">
                Currency
              </label>
              <select
                id="currency"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="input"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="NGN">NGN - Nigerian Naira</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-4">Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="unit_price" className="label">
                Selling Price <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="unit_price"
                step="0.01"
                min="0"
                value={formData.unit_price}
                onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) || 0 })}
                required
                className="input"
                placeholder="0.00"
              />
              <p className="text-xs text-primary-400 mt-1">What you charge customers</p>
            </div>

            <div>
              <label htmlFor="cost_price" className="label">
                Cost Price
              </label>
              <input
                type="number"
                id="cost_price"
                step="0.01"
                min="0"
                value={formData.cost_price}
                onChange={(e) => setFormData({ ...formData, cost_price: parseFloat(e.target.value) || 0 })}
                className="input"
                placeholder="0.00"
              />
              <p className="text-xs text-primary-400 mt-1">What you pay for it</p>
            </div>

            <div>
              <label htmlFor="tax_rate" className="label">
                Tax Rate (%)
              </label>
              <input
                type="number"
                id="tax_rate"
                step="0.01"
                min="0"
                max="100"
                value={formData.tax_rate}
                onChange={(e) => setFormData({ ...formData, tax_rate: parseFloat(e.target.value) || 0 })}
                className="input"
                placeholder="0.00"
              />
              <p className="text-xs text-primary-400 mt-1">e.g., 7.5 for 7.5%</p>
            </div>
          </div>

          {formData.unit_price > 0 && formData.cost_price && formData.cost_price > 0 && (
            <div className="mt-4 p-4 bg-quotla-green/20 border border-quotla-green/40 rounded-lg">
              <p className="text-sm text-quotla-light">
                <strong>Profit Margin:</strong> {formData.currency} {((formData.unit_price || 0) - (formData.cost_price || 0)).toFixed(2)}
                {' '}({((((formData.unit_price || 0) - (formData.cost_price || 0)) / (formData.unit_price || 1)) * 100).toFixed(1)}%)
              </p>
            </div>
          )}
        </div>

        {/* Inventory Tracking (Products Only) */}
        {formData.item_type === 'product' && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Inventory Tracking</h2>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.track_inventory}
                  onChange={(e) => setFormData({ ...formData, track_inventory: e.target.checked })}
                  className="w-4 h-4 text-quotla-orange rounded focus:ring-quotla-orange"
                />
                <span className="text-sm">Track stock levels</span>
              </label>
            </div>

            {formData.track_inventory && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="quantity_on_hand" className="label">
                    Quantity on Hand
                  </label>
                  <input
                    type="number"
                    id="quantity_on_hand"
                    min="0"
                    value={formData.quantity_on_hand}
                    onChange={(e) => setFormData({ ...formData, quantity_on_hand: parseInt(e.target.value) || 0 })}
                    className="input"
                    placeholder="0"
                  />
                  <p className="text-xs text-primary-400 mt-1">Current stock level</p>
                </div>

                <div>
                  <label htmlFor="low_stock_threshold" className="label">
                    Low Stock Alert
                  </label>
                  <input
                    type="number"
                    id="low_stock_threshold"
                    min="0"
                    value={formData.low_stock_threshold}
                    onChange={(e) => setFormData({ ...formData, low_stock_threshold: parseInt(e.target.value) || 0 })}
                    className="input"
                    placeholder="10"
                  />
                  <p className="text-xs text-primary-400 mt-1">Alert when below this</p>
                </div>

                <div>
                  <label htmlFor="reorder_quantity" className="label">
                    Reorder Quantity
                  </label>
                  <input
                    type="number"
                    id="reorder_quantity"
                    min="0"
                    value={formData.reorder_quantity}
                    onChange={(e) => setFormData({ ...formData, reorder_quantity: parseInt(e.target.value) || 0 })}
                    className="input"
                    placeholder="20"
                  />
                  <p className="text-xs text-primary-400 mt-1">Suggested order amount</p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="card">
          <h2 className="text-xl font-bold mb-4">Supplier (Optional)</h2>
          <select
            id="supplier"
            value={formData.default_supplier_id || ''}
            onChange={(e) => setFormData({ ...formData, default_supplier_id: e.target.value || undefined })}
            className="input"
          >
            <option value="">No supplier</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
          {suppliers.length === 0 && (
            <p className="text-sm text-primary-400 mt-2">
              No suppliers yet. <a href="/inventory/suppliers/new" className="text-quotla-orange hover:underline">Add one</a>
            </p>
          )}
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.push('/inventory')}
            className="btn btn-secondary"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary"
          >
            {saving ? 'Creating...' : 'Create Item'}
          </button>
        </div>
      </form>
    </div>
  )
}
