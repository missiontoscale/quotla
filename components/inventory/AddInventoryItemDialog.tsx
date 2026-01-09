'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { CreateInventoryItemInput, Supplier } from '@/types/inventory'
import { DEFAULT_BUSINESS_CURRENCY } from '@/lib/utils/currency'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'

interface AddInventoryItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AddInventoryItemDialog({ open, onOpenChange, onSuccess }: AddInventoryItemDialogProps) {
  const [loading, setLoading] = useState(false)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [formData, setFormData] = useState<CreateInventoryItemInput>({
    name: '',
    sku: '',
    description: '',
    category: '',
    item_type: 'product',
    unit_price: 0,
    cost_price: 0,
    currency: DEFAULT_BUSINESS_CURRENCY,
    track_inventory: true,
    quantity_on_hand: 0,
    low_stock_threshold: 10,
    reorder_quantity: 50,
    default_supplier_id: undefined,
    tax_rate: 0,
    image_url: '',
  })

  useEffect(() => {
    if (open) {
      loadSuppliers()
    }
  }, [open])

  const loadSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      setSuppliers(data || [])
    } catch (error) {
      console.error('Error loading suppliers:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase.from('inventory_items').insert({
        user_id: user.id,
        name: formData.name,
        sku: formData.sku || null,
        description: formData.description || null,
        category: formData.category || null,
        item_type: formData.item_type,
        unit_price: formData.unit_price,
        cost_price: formData.cost_price || 0,
        currency: formData.currency || DEFAULT_BUSINESS_CURRENCY,
        track_inventory: formData.track_inventory ?? true,
        quantity_on_hand: formData.quantity_on_hand || 0,
        low_stock_threshold: formData.low_stock_threshold || 0,
        reorder_quantity: formData.reorder_quantity || 0,
        default_supplier_id: formData.default_supplier_id || null,
        tax_rate: formData.tax_rate || 0,
        image_url: formData.image_url || null,
        is_active: true,
      })

      if (error) throw error

      // Reset form
      setFormData({
        name: '',
        sku: '',
        description: '',
        category: '',
        item_type: 'product',
        unit_price: 0,
        cost_price: 0,
        currency: DEFAULT_BUSINESS_CURRENCY,
        track_inventory: true,
        quantity_on_hand: 0,
        low_stock_threshold: 10,
        reorder_quantity: 50,
        default_supplier_id: undefined,
        tax_rate: 0,
        image_url: '',
      })

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error('Error creating item:', error)
      alert('Failed to create item')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Add New Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="item-type" className="text-xs">Product Type *</Label>
              <Select
                value={formData.item_type}
                onValueChange={(value) => setFormData({ ...formData, item_type: value as 'product' | 'service' })}
              >
                <SelectTrigger id="item-type" className="bg-slate-800 border-slate-700 h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800">
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku" className="text-xs">SKU</Label>
              <Input
                id="sku"
                placeholder="PROD-XXX"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="bg-slate-800 border-slate-700 h-8 text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs">Product Name *</Label>
            <Input
              id="name"
              placeholder="Enter product name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="bg-slate-800 border-slate-700 h-8 text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-xs">Description</Label>
            <Textarea
              id="description"
              placeholder="Product description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-slate-800 border-slate-700 min-h-20 text-sm"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-xs">Category</Label>
            <Input
              id="category"
              placeholder="e.g., Electronics, Furniture"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="bg-slate-800 border-slate-700 h-8 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cost-price" className="text-xs">Cost Price *</Label>
              <Input
                id="cost-price"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.cost_price}
                onChange={(e) => setFormData({ ...formData, cost_price: parseFloat(e.target.value) || 0 })}
                required
                className="bg-slate-800 border-slate-700 h-8 text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit-price" className="text-xs">Selling Price *</Label>
              <Input
                id="unit-price"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.unit_price}
                onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) || 0 })}
                required
                className="bg-slate-800 border-slate-700 h-8 text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax-rate" className="text-xs">Tax Rate (%)</Label>
              <Input
                id="tax-rate"
                type="number"
                step="0.01"
                placeholder="0"
                value={formData.tax_rate}
                onChange={(e) => setFormData({ ...formData, tax_rate: parseFloat(e.target.value) || 0 })}
                className="bg-slate-800 border-slate-700 h-8 text-sm"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 py-2">
            <Checkbox
              id="track-inventory"
              checked={formData.track_inventory}
              onCheckedChange={(checked) => setFormData({ ...formData, track_inventory: checked as boolean })}
            />
            <Label htmlFor="track-inventory" className="text-xs cursor-pointer">
              Track inventory for this item
            </Label>
          </div>

          {formData.track_inventory && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-xs">Initial Stock</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="0"
                  value={formData.quantity_on_hand}
                  onChange={(e) => setFormData({ ...formData, quantity_on_hand: parseInt(e.target.value) || 0 })}
                  className="bg-slate-800 border-slate-700 h-8 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="low-stock" className="text-xs">Low Stock Alert</Label>
                <Input
                  id="low-stock"
                  type="number"
                  placeholder="10"
                  value={formData.low_stock_threshold}
                  onChange={(e) => setFormData({ ...formData, low_stock_threshold: parseInt(e.target.value) || 0 })}
                  className="bg-slate-800 border-slate-700 h-8 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reorder-qty" className="text-xs">Reorder Quantity</Label>
                <Input
                  id="reorder-qty"
                  type="number"
                  placeholder="50"
                  value={formData.reorder_quantity}
                  onChange={(e) => setFormData({ ...formData, reorder_quantity: parseInt(e.target.value) || 0 })}
                  className="bg-slate-800 border-slate-700 h-8 text-sm"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="supplier" className="text-xs">Default Supplier</Label>
            <Select
              value={formData.default_supplier_id}
              onValueChange={(value) => setFormData({ ...formData, default_supplier_id: value })}
            >
              <SelectTrigger id="supplier" className="bg-slate-800 border-slate-700 h-8 text-sm">
                <SelectValue placeholder="Select a supplier" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800">
                <SelectItem value="none">None</SelectItem>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-slate-700 text-slate-300 hover:bg-slate-800 text-sm h-9"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-violet-500 hover:bg-violet-600 text-white text-sm h-9"
            >
              {loading ? 'Adding...' : 'Add Product'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
