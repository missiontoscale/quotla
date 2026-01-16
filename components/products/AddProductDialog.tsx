'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useUserCurrency } from '@/hooks/useUserCurrency'
import { Package, DollarSign, Warehouse } from 'lucide-react'
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
import { FormSection } from '@/components/ui/form-section'
import { FieldGroup } from '@/components/ui/field-group'

interface AddProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  productId?: string // If provided, this is edit mode
  mode?: 'create' | 'edit' // Operation mode
}

interface ProductFormData {
  sku: string
  name: string
  description: string
  category: string
  price: number
  cost_price: number
  stock: number
  low_stock_threshold: number
}

export function AddProductDialog({
  open,
  onOpenChange,
  onSuccess,
  productId,
  mode = 'create'
}: AddProductDialogProps) {
  const { currency: userCurrency } = useUserCurrency()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentMode, setCurrentMode] = useState(mode)
  const [formData, setFormData] = useState<ProductFormData>({
    sku: '',
    name: '',
    description: '',
    category: '',
    price: 0,
    cost_price: 0,
    stock: 0,
    low_stock_threshold: 10,
  })

  useEffect(() => {
    if (open && productId) {
      loadProduct()
    } else if (open && !productId) {
      // Reset form for create mode
      setFormData({
        sku: '',
        name: '',
        description: '',
        category: '',
        price: 0,
        cost_price: 0,
        stock: 0,
        low_stock_threshold: 10,
      })
      setCurrentMode('create')
    }
  }, [open, productId])

  const loadProduct = async () => {
    if (!productId) return

    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('id', productId)
        .single()

      if (fetchError) throw fetchError

      if (data) {
        setFormData({
          sku: data.sku || '',
          name: data.name || '',
          description: data.description || '',
          category: data.category || '',
          price: data.unit_price || 0,
          cost_price: data.cost_price || 0,
          stock: data.quantity_on_hand || 0,
          low_stock_threshold: data.low_stock_threshold || 10,
        })
      }
    } catch (err) {
      console.error('Error loading product:', err)
      setError('Unable to load product. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const isEditMode = !!productId

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      if (productId) {
        // Update existing product
        const { error: updateError } = await supabase
          .from('inventory_items')
          .update({
            name: formData.name,
            sku: formData.sku || null,
            description: formData.description || null,
            category: formData.category || null,
            unit_price: formData.price,
            cost_price: formData.cost_price || 0,
            low_stock_threshold: formData.low_stock_threshold || 10,
          })
          .eq('id', productId)
          .eq('user_id', user.id)

        if (updateError) throw updateError
      } else {
        // Insert new inventory item
        const { data: newItem, error: itemError } = await supabase
          .from('inventory_items')
          .insert({
            user_id: user.id,
            name: formData.name,
            sku: formData.sku || null,
            description: formData.description || null,
            category: formData.category || null,
            item_type: 'product',
            unit_price: formData.price,
            cost_price: formData.cost_price || 0,
            currency: userCurrency,
            track_inventory: true,
            quantity_on_hand: formData.stock || 0,
            low_stock_threshold: formData.low_stock_threshold || 10,
            reorder_quantity: 50,
            tax_rate: 0,
            is_active: true,
          })
          .select()
          .single()

        if (itemError) throw itemError

        // Create stock movement record for initial stock if quantity > 0
        if (formData.stock > 0) {
          const { error: movementError } = await supabase
            .from('stock_movements')
            .insert({
              user_id: user.id,
              inventory_item_id: newItem.id,
              movement_type: 'purchase',
              quantity_change: formData.stock,
              quantity_before: 0,
              quantity_after: formData.stock,
              reference_type: 'manual',
              unit_value: formData.cost_price || 0,
              total_value: (formData.cost_price || 0) * formData.stock,
              notes: 'Initial stock - Product created',
              performed_by: user.id,
            })

          if (movementError) {
            console.error('Error creating stock movement:', movementError)
            // Don't throw error - the product was created successfully
          }
        }
      }

      // Reset form
      setFormData({
        sku: '',
        name: '',
        description: '',
        category: '',
        price: 0,
        cost_price: 0,
        stock: 0,
        low_stock_threshold: 10,
      })

      onSuccess()
      onOpenChange(false)
    } catch (err) {
      console.error(`Error ${productId ? 'updating' : 'creating'} product:`, err)
      setError(`Unable to ${productId ? 'update' : 'create'} product. Please try again.`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isEditMode ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/50 rounded-lg p-3">
              <p className="text-sm text-rose-400">{error}</p>
            </div>
          )}

          <FormSection title="Basic Info" icon={Package} description="Product identification">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sku" className="text-xs">SKU *</Label>
                <Input
                  id="sku"
                  placeholder="PROD-XXX"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  required
                    className="bg-slate-800 border-slate-700 h-8 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-xs">Category *</Label>
                <Input
                  id="category"
                  placeholder="e.g., Electronics"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                    className="bg-slate-800 border-slate-700 h-8 text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-xs">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Product description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-slate-800 border-slate-700 min-h-20 text-sm"
                rows={3}
              />
            </div>
          </FormSection>

          <FormSection title="Pricing" icon={DollarSign} description="Cost and selling prices">
            <FieldGroup label="Price Configuration">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <Label htmlFor="price" className="text-xs">Selling Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    required
                        className="bg-slate-800 border-slate-700 h-8 text-sm"
                  />
                </div>
              </div>
            </FieldGroup>
          </FormSection>

          <FormSection title="Inventory" icon={Warehouse} description="Stock management">
            {!productId && (
              <FieldGroup label="Initial Stock Setup">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stock" className="text-xs">Initial Stock *</Label>
                    <Input
                      id="stock"
                      type="number"
                      placeholder="0"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                      required
                      className="bg-slate-800 border-slate-700 h-8 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="low-stock" className="text-xs">Low Stock Alert (optional)</Label>
                    <Input
                      id="low-stock"
                      type="number"
                      placeholder="10"
                      value={formData.low_stock_threshold}
                      onChange={(e) => setFormData({ ...formData, low_stock_threshold: parseInt(e.target.value) || 0 })}
                      className="bg-slate-800 border-slate-700 h-8 text-sm"
                    />
                  </div>
                </div>
              </FieldGroup>
            )}

            {productId && (
              <div className="space-y-2">
                <Label htmlFor="low-stock" className="text-xs">Low Stock Alert (optional)</Label>
                <Input
                  id="low-stock"
                  type="number"
                  placeholder="10"
                  value={formData.low_stock_threshold}
                  onChange={(e) => setFormData({ ...formData, low_stock_threshold: parseInt(e.target.value) || 0 })}
                    className="bg-slate-800 border-slate-700 h-8 text-sm"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Current Stock: {formData.stock} (Stock changes are tracked separately)
                </p>
              </div>
            )}
          </FormSection>

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
              className="bg-cyan-500 hover:bg-cyan-600 text-white text-sm h-9"
            >
              {loading
                ? (isEditMode ? 'Updating...' : 'Adding...')
                : (isEditMode ? 'Update Product' : 'Add Product')
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
