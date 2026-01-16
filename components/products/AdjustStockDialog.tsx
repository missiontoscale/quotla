'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Plus, Minus, Package } from 'lucide-react'
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

interface AdjustStockDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  product: {
    id: string
    name: string
    sku: string
    stock: number
  } | null
}

type AdjustmentType = 'add' | 'remove' | 'set'

export function AdjustStockDialog({
  open,
  onOpenChange,
  onSuccess,
  product,
}: AdjustStockDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [adjustmentType, setAdjustmentType] = useState<AdjustmentType>('add')
  const [quantity, setQuantity] = useState<number>(0)
  const [notes, setNotes] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product) return

    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      let newQuantity: number
      let quantityChange: number
      let movementType: string

      switch (adjustmentType) {
        case 'add':
          newQuantity = product.stock + quantity
          quantityChange = quantity
          movementType = 'adjustment_in'
          break
        case 'remove':
          newQuantity = Math.max(0, product.stock - quantity)
          quantityChange = -Math.min(quantity, product.stock)
          movementType = 'adjustment_out'
          break
        case 'set':
          newQuantity = quantity
          quantityChange = quantity - product.stock
          movementType = quantityChange >= 0 ? 'adjustment_in' : 'adjustment_out'
          break
        default:
          throw new Error('Invalid adjustment type')
      }

      // Update inventory item
      const { error: updateError } = await supabase
        .from('inventory_items')
        .update({ quantity_on_hand: newQuantity })
        .eq('id', product.id)
        .eq('user_id', user.id)

      if (updateError) throw updateError

      // Create stock movement record
      if (quantityChange !== 0) {
        const { error: movementError } = await supabase
          .from('stock_movements')
          .insert({
            user_id: user.id,
            inventory_item_id: product.id,
            movement_type: movementType,
            quantity_change: Math.abs(quantityChange),
            quantity_before: product.stock,
            quantity_after: newQuantity,
            reference_type: 'manual',
            notes: notes || `Stock ${adjustmentType === 'set' ? 'set to' : adjustmentType === 'add' ? 'added' : 'removed'}: ${Math.abs(quantityChange)} units`,
            performed_by: user.id,
          })

        if (movementError) {
          console.error('Error creating stock movement:', movementError)
        }
      }

      // Reset form
      setQuantity(0)
      setNotes('')
      setAdjustmentType('add')

      onSuccess()
      onOpenChange(false)
    } catch (err) {
      console.error('Error adjusting stock:', err)
      setError('Unable to adjust stock. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getNewQuantity = () => {
    if (!product) return 0
    switch (adjustmentType) {
      case 'add':
        return product.stock + quantity
      case 'remove':
        return Math.max(0, product.stock - quantity)
      case 'set':
        return quantity
      default:
        return product.stock
    }
  }

  if (!product) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg flex items-center gap-2">
            <Package className="w-5 h-5 text-cyan-400" />
            Adjust Stock
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/50 rounded-lg p-3">
              <p className="text-sm text-rose-400">{error}</p>
            </div>
          )}

          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
            <p className="text-sm text-slate-400">Product</p>
            <p className="text-slate-100 font-medium">{product.name}</p>
            <p className="text-xs text-slate-500 mt-0.5">SKU: {product.sku}</p>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
            <p className="text-sm text-slate-400">Current Stock</p>
            <p className="text-2xl font-bold text-slate-100">{product.stock} <span className="text-sm font-normal text-slate-400">units</span></p>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-slate-400">Adjustment Type</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant={adjustmentType === 'add' ? 'default' : 'outline'}
                onClick={() => setAdjustmentType('add')}
                className={adjustmentType === 'add'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'border-slate-700 text-slate-300 hover:bg-slate-800'
                }
                size="sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
              <Button
                type="button"
                variant={adjustmentType === 'remove' ? 'default' : 'outline'}
                onClick={() => setAdjustmentType('remove')}
                className={adjustmentType === 'remove'
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'border-slate-700 text-slate-300 hover:bg-slate-800'
                }
                size="sm"
              >
                <Minus className="w-4 h-4 mr-1" />
                Remove
              </Button>
              <Button
                type="button"
                variant={adjustmentType === 'set' ? 'default' : 'outline'}
                onClick={() => setAdjustmentType('set')}
                className={adjustmentType === 'set'
                  ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
                  : 'border-slate-700 text-slate-300 hover:bg-slate-800'
                }
                size="sm"
              >
                Set To
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-xs text-slate-400">
              {adjustmentType === 'set' ? 'New Quantity' : 'Quantity'}
            </Label>
            <Input
              id="quantity"
              type="number"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value) || 0))}
              className="bg-slate-800 border-slate-700 h-10 text-lg font-medium"
              placeholder="0"
            />
          </div>

          {quantity > 0 && (
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
              <p className="text-sm text-slate-400">New Stock Level</p>
              <p className="text-2xl font-bold text-cyan-400">{getNewQuantity()} <span className="text-sm font-normal text-slate-400">units</span></p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-xs text-slate-400">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Reason for adjustment..."
              className="bg-slate-800 border-slate-700 min-h-16 text-sm"
              rows={2}
            />
          </div>

          <DialogFooter className="gap-2 pt-2">
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
              disabled={loading || quantity === 0}
              className="bg-cyan-500 hover:bg-cyan-600 text-white text-sm h-9"
            >
              {loading ? 'Updating...' : 'Update Stock'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
