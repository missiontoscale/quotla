'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { Client, LineItem, CURRENCIES, INVOICE_STATUSES } from '@/types'
import { calculateTax, calculateTotal } from '@/lib/utils/validation'
import InventoryItemSelector from '@/components/InventoryItemSelector'
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

interface AddInvoiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AddInvoiceDialog({ open, onOpenChange, onSuccess }: AddInvoiceDialogProps) {
  const router = useRouter()
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [clients, setClients] = useState<Client[]>([])

  const [formData, setFormData] = useState({
    client_id: '',
    invoice_number: `INV-${Date.now()}`,
    title: '',
    status: 'draft' as const,
    issue_date: new Date().toISOString().split('T')[0],
    due_date: '',
    currency: profile?.default_currency || 'USD',
    tax_rate: 0,
    notes: '',
    payment_terms: '',
  })

  const [items, setItems] = useState<LineItem[]>([
    { name: '', description: '', quantity: 1, unit_price: 0, amount: 0, sort_order: 0 },
  ])

  useEffect(() => {
    if (open && user) {
      loadClients()
      // Reset form when dialog opens
      setFormData({
        client_id: '',
        invoice_number: `INV-${Date.now()}`,
        title: '',
        status: 'draft',
        issue_date: new Date().toISOString().split('T')[0],
        due_date: '',
        currency: profile?.default_currency || 'USD',
        tax_rate: 0,
        notes: '',
        payment_terms: '',
      })
      setItems([
        { name: '', description: '', quantity: 1, unit_price: 0, amount: 0, sort_order: 0 },
      ])
      setError('')
    }
  }, [open, user, profile])

  const loadClients = async () => {
    if (!user) return

    const { data } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', user.id)
      .order('name', { ascending: true })

    if (data) setClients(data)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleItemChange = (index: number, field: keyof LineItem, value: string | number) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }

    if (field === 'quantity' || field === 'unit_price') {
      const qty = field === 'quantity' ? Number(value) : newItems[index].quantity
      const price = field === 'unit_price' ? Number(value) : newItems[index].unit_price
      newItems[index].amount = Number((qty * price).toFixed(2))
    }

    setItems(newItems)
  }

  const addItem = () => {
    setItems([
      ...items,
      { name: '', description: '', quantity: 1, unit_price: 0, amount: 0, sort_order: items.length },
    ])
  }

  const removeItem = (index: number) => {
    if (items.length === 1) return
    setItems(items.filter((_, i) => i !== index))
  }

  const handleInventoryItemSelected = (index: number) => (item: any) => {
    const newItems = [...items]
    const currentItem = newItems[index]

    // Check if this is a blank item (no name filled yet)
    const isBlankItem = !currentItem.name || currentItem.name.trim() === ''

    if (isBlankItem) {
      // Fill the current blank item
      newItems[index] = {
        ...newItems[index],
        name: item.name,
        description: item.description || '',
        unit_price: item.unit_price,
        quantity: 1,
        amount: item.unit_price * 1,
        inventory_item_id: item.id
      }
      setItems(newItems)
    } else {
      // Check if this product is already in the list
      const existingIndex = newItems.findIndex(
        lineItem => lineItem.inventory_item_id === item.id
      )

      if (existingIndex >= 0) {
        // Product already exists, increment its quantity
        const existingItem = newItems[existingIndex]
        const newQty = existingItem.quantity + 1
        newItems[existingIndex] = {
          ...existingItem,
          quantity: newQty,
          amount: Number((newQty * existingItem.unit_price).toFixed(2))
        }
        setItems(newItems)
      } else {
        // Add as a new line item
        const newItem: LineItem = {
          name: item.name,
          description: item.description || '',
          unit_price: item.unit_price,
          quantity: 1,
          amount: item.unit_price * 1,
          sort_order: items.length,
          inventory_item_id: item.id
        }
        setItems([...newItems, newItem])
      }
    }
  }

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0)
    const taxAmount = calculateTax(subtotal, formData.tax_rate)
    const total = calculateTotal(subtotal, taxAmount)
    return { subtotal, taxAmount, total }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!user) {
      setError('You must be logged in')
      setLoading(false)
      return
    }

    if (items.some((item) => !item.name || !item.name.trim())) {
      setError('All line items must have a product/service name')
      setLoading(false)
      return
    }

    try {
      const { subtotal, taxAmount, total } = calculateTotals()

      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          user_id: user.id,
          client_id: formData.client_id || null,
          invoice_number: formData.invoice_number,
          title: formData.title || null,
          status: formData.status,
          issue_date: formData.issue_date,
          due_date: formData.due_date || null,
          currency: formData.currency,
          subtotal,
          tax_rate: formData.tax_rate,
          tax_amount: taxAmount,
          total,
          notes: formData.notes || null,
          payment_terms: formData.payment_terms || null,
        })
        .select()
        .single()

      if (invoiceError) throw invoiceError

      const itemsToInsert = items.map((item, index) => ({
        invoice_id: invoice.id,
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        amount: item.amount,
        sort_order: index,
      }))

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(itemsToInsert)

      if (itemsError) throw itemsError

      onSuccess()
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create invoice')
    } finally {
      setLoading(false)
    }
  }

  const { subtotal, taxAmount, total } = calculateTotals()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-3xl max-h-[95vh] overflow-y-auto w-[95vw] p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Create Invoice</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 py-2 sm:py-4">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-3 py-2 rounded text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="invoice_number" className="text-xs">Invoice # *</Label>
              <Input
                id="invoice_number"
                name="invoice_number"
                required
                value={formData.invoice_number}
                onChange={handleChange}
                className="bg-slate-800 border-slate-700 h-9 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="client_id" className="text-xs">Client</Label>
              <Select
                value={formData.client_id}
                onValueChange={(value) => setFormData({ ...formData, client_id: value })}
              >
                <SelectTrigger id="client_id" className="bg-slate-800 border-slate-700 h-9 text-sm">
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800">
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-xs">Title (Optional)</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Monthly Services"
              className="bg-slate-800 border-slate-700 h-9 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="issue_date" className="text-xs">Issue *</Label>
              <Input
                type="date"
                id="issue_date"
                name="issue_date"
                required
                value={formData.issue_date}
                onChange={handleChange}
                className="bg-slate-800 border-slate-700 h-9 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="due_date" className="text-xs">Due</Label>
              <Input
                type="date"
                id="due_date"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                className="bg-slate-800 border-slate-700 h-9 text-sm"
              />
            </div>

            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <Label htmlFor="currency" className="text-xs">Currency *</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData({ ...formData, currency: value })}
              >
                <SelectTrigger id="currency" className="bg-slate-800 border-slate-700 h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 max-h-60">
                  {CURRENCIES.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3 border-t border-slate-700 pt-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Line Items</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
                className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs h-7"
              >
                + Add Item
              </Button>
            </div>

            {items.map((item, index) => (
              <div key={index} className="border border-slate-700 rounded-lg p-2.5 sm:p-3 space-y-2.5 sm:space-y-3 bg-slate-800/30">
                {/* Inventory Item Selector - Collapsible on mobile */}
                <details className="space-y-2">
                  <summary className="text-xs text-slate-300 cursor-pointer hover:text-cyan-400 list-none flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    Select from Inventory (Optional)
                  </summary>
                  <InventoryItemSelector
                    onSelect={handleInventoryItemSelected(index)}
                    currency={formData.currency}
                  />
                </details>

                <div className="space-y-1.5">
                  <Label htmlFor={`name-${index}`} className="text-xs flex items-center gap-1.5">
                    Product/Service *
                    {item.inventory_item_id && <span className="text-[10px] text-cyan-400">📦</span>}
                  </Label>
                  <Input
                    id={`name-${index}`}
                    value={item.name || ''}
                    onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                    placeholder="e.g., Consulting Service"
                    required
                    readOnly={!!item.inventory_item_id}
                    disabled={!!item.inventory_item_id}
                    className={`bg-slate-800 border-slate-700 h-9 text-sm ${item.inventory_item_id ? 'cursor-not-allowed opacity-75' : ''}`}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor={`description-${index}`} className="text-xs">
                    Description {item.inventory_item_id && <span className="text-[10px] text-cyan-400">(Inventory)</span>}
                  </Label>
                  <Textarea
                    id={`description-${index}`}
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    placeholder="Details..."
                    rows={2}
                    readOnly={!!item.inventory_item_id}
                    disabled={!!item.inventory_item_id}
                    className={`bg-slate-800 border-slate-700 min-h-14 text-sm resize-none ${item.inventory_item_id ? 'cursor-not-allowed opacity-75' : ''}`}
                  />
                </div>

                <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                  <div className="space-y-1.5">
                    <Label htmlFor={`quantity-${index}`} className="text-[10px] sm:text-xs">Qty</Label>
                    <Input
                      id={`quantity-${index}`}
                      type="number"
                      step="0.01"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      required
                      className="bg-slate-800 border-slate-700 h-9 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor={`unit-price-${index}`} className="text-[10px] sm:text-xs">Price</Label>
                    <Input
                      id={`unit-price-${index}`}
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.unit_price}
                      onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                      required
                      className="bg-slate-800 border-slate-700 h-9 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] sm:text-xs">Total</Label>
                    <div className="h-9 px-2 rounded-md border border-slate-700 bg-slate-700/50 flex items-center justify-end text-xs sm:text-sm font-semibold text-cyan-400">
                      {item.amount.toFixed(2)}
                    </div>
                  </div>
                </div>

                {items.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeItem(index)}
                    className="border-red-500/50 text-red-400 hover:bg-red-500/20 text-[11px] sm:text-xs h-8 w-full"
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-4 border-t border-slate-700 pt-3">
            <div className="space-y-1.5">
              <Label htmlFor="tax_rate" className="text-xs">Tax (%)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max="100"
                id="tax_rate"
                name="tax_rate"
                value={formData.tax_rate}
                onChange={handleChange}
                className="bg-slate-800 border-slate-700 h-9 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="status" className="text-xs">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as typeof formData.status })}
              >
                <SelectTrigger id="status" className="bg-slate-800 border-slate-700 h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800">
                  {INVOICE_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-3 sm:p-4 space-y-1.5 sm:space-y-2">
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-slate-400">Subtotal:</span>
              <span className="font-medium">{subtotal.toFixed(2)} {formData.currency}</span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-slate-400">Tax ({formData.tax_rate}%):</span>
              <span className="font-medium">{taxAmount.toFixed(2)} {formData.currency}</span>
            </div>
            <div className="flex justify-between text-base sm:text-lg font-bold border-t border-slate-700 pt-2">
              <span>Total:</span>
              <span className="text-cyan-400">{total.toFixed(2)} {formData.currency}</span>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2 sm:pt-4 flex-col-reverse sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-slate-700 text-slate-300 hover:bg-slate-800 text-sm h-10 w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-cyan-500 hover:bg-cyan-600 text-white text-sm h-10 w-full sm:w-auto"
            >
              {loading ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
