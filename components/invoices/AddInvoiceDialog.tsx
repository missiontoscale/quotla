'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { Client, LineItem, CURRENCIES, INVOICE_STATUSES } from '@/types'
import { calculateTax, calculateTotal } from '@/lib/utils/validation'
import InventoryItemSelector from '@/components/InventoryItemSelector'
import { useCurrencyConversion } from '@/hooks/useCurrencyConversion'
import { getCurrencySymbol } from '@/lib/utils/currency'
import { generateInvoiceNumber } from '@/lib/utils/invoice-generator'
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
  invoiceId?: string // If provided, this is view/edit mode
  mode?: 'create' | 'view' | 'edit' // Operation mode
}

export function AddInvoiceDialog({ open, onOpenChange, onSuccess, invoiceId, mode = 'create' }: AddInvoiceDialogProps) {
  const router = useRouter()
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [clients, setClients] = useState<Client[]>([])
  const [selectedCustomerCurrency, setSelectedCustomerCurrency] = useState<string | null>(null)
  const [currentMode, setCurrentMode] = useState(mode)

  const [formData, setFormData] = useState({
    client_id: '',
    invoice_number: '', // Will be auto-generated on dialog open
    title: '',
    status: 'draft' as const,
    issue_date: new Date().toISOString().split('T')[0],
    due_date: '',
    currency: profile?.default_currency || 'NGN',
    tax_rate: 0,
    notes: '',
    payment_terms: '',
  })

  const [items, setItems] = useState<LineItem[]>([
    { name: '', description: '', quantity: 1, unit_price: 0, amount: 0, sort_order: 0 },
  ])

  useEffect(() => {
    // Update currentMode when mode prop changes
    setCurrentMode(mode)
  }, [mode])

  useEffect(() => {
    if (!open) return

    if (open && user) {
      const initializeDialog = async () => {
        const loadedClients = await loadClients()

        if (invoiceId) {
          // View/Edit mode: Load existing invoice
          await loadInvoice(loadedClients)
        } else {
          // Create mode: Reset form with auto-generated invoice number
          const invoiceNumber = await generateInvoiceNumber(user.id)
          setFormData({
            client_id: '',
            invoice_number: invoiceNumber,
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
          setCurrentMode('create')
        }
        setError('')
      }

      initializeDialog()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user, profile?.default_currency, invoiceId])

  const loadClients = async () => {
    if (!user) return []

    const { data } = await supabase
      .from('customers')
      .select('id, full_name, company_name, email, preferred_currency')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('full_name', { ascending: true })

    if (data) {
      // Map customers to match Client interface with name field
      const mappedClients = data.map(customer => ({
        ...customer,
        name: customer.company_name || customer.full_name,
        id: customer.id,
        preferred_currency: customer.preferred_currency || 'NGN'
      }))
      setClients(mappedClients as Client[])
      return mappedClients as Client[]
    }
    return []
  }

  const isViewMode = currentMode === 'view'

  const loadInvoice = async (clientsList?: Client[]) => {
    if (!user || !invoiceId) return

    setLoading(true)
    setError('')

    try {
      // Load invoice data
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .eq('user_id', user.id)
        .single()

      if (invoiceError) throw new Error(`Failed to load invoice: ${invoiceError.message}`)
      if (!invoiceData) throw new Error('Invoice not found')

      // Load invoice items
      const { data: itemsData, error: itemsError } = await supabase
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('sort_order', { ascending: true })

      if (itemsError) throw new Error(`Failed to load invoice items: ${itemsError.message}`)

      if (itemsData && itemsData.length > 0) {
        const loadedItems = itemsData.map(item => ({
          name: item.description || '',
          description: '',
          quantity: item.quantity,
          unit_price: item.unit_price,
          amount: item.amount,
          sort_order: item.sort_order,
          inventory_item_id: item.inventory_item_id,
        }))
        setItems(loadedItems)
      } else {
        setItems([{ name: '', description: '', quantity: 1, unit_price: 0, amount: 0, sort_order: 0 }])
      }

      // Set form data
      setFormData({
        client_id: invoiceData.client_id || '',
        invoice_number: invoiceData.invoice_number,
        title: invoiceData.title || '',
        status: invoiceData.status,
        issue_date: invoiceData.issue_date,
        due_date: invoiceData.due_date || '',
        currency: invoiceData.currency,
        tax_rate: invoiceData.tax_rate,
        notes: invoiceData.notes || '',
        payment_terms: invoiceData.payment_terms || '',
      })

      // Set customer preferred currency if applicable
      const clientsToSearch = clientsList || clients
      if (invoiceData.client_id && clientsToSearch.length > 0) {
        const selectedClient = clientsToSearch.find(c => c.id === invoiceData.client_id)
        if (selectedClient && (selectedClient as any).preferred_currency) {
          setSelectedCustomerCurrency((selectedClient as any).preferred_currency)
        }
      }

      setLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invoice')
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleClientChange = (clientId: string) => {
    setFormData({ ...formData, client_id: clientId })

    // Find the selected client and set their preferred currency
    const selectedClient = clients.find(c => c.id === clientId)
    if (selectedClient && (selectedClient as any).preferred_currency) {
      setSelectedCustomerCurrency((selectedClient as any).preferred_currency)
    } else {
      setSelectedCustomerCurrency(null)
    }
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

  const handleInventoryItemSelected = (item: any, quantity: number = 1) => {
    const newItems = [...items]

    // Check if this product is already in the list
    const existingIndex = newItems.findIndex(
      lineItem => lineItem.inventory_item_id === item.id
    )

    if (existingIndex >= 0) {
      // Product already exists, add to its quantity
      const existingItem = newItems[existingIndex]
      const newQty = existingItem.quantity + quantity
      newItems[existingIndex] = {
        ...existingItem,
        quantity: newQty,
        amount: Number((newQty * existingItem.unit_price).toFixed(2))
      }
      setItems(newItems)
    } else {
      // Find the first blank item (no name filled yet)
      const blankIndex = newItems.findIndex(item => !item.name || item.name.trim() === '')

      if (blankIndex >= 0) {
        // Fill the first blank item
        newItems[blankIndex] = {
          ...newItems[blankIndex],
          name: item.name,
          description: item.description || '',
          unit_price: item.unit_price,
          quantity: quantity,
          amount: item.unit_price * quantity,
          inventory_item_id: item.id
        }
        setItems(newItems)
      } else {
        // Add as a new line item
        const newItem: LineItem = {
          name: item.name,
          description: item.description || '',
          unit_price: item.unit_price,
          quantity: quantity,
          amount: item.unit_price * quantity,
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

      if (invoiceId) {
        // Update existing invoice
        const { error: invoiceError } = await supabase
          .from('invoices')
          .update({
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
          .eq('id', invoiceId)
          .eq('user_id', user.id)

        if (invoiceError) throw invoiceError

        // Delete existing items
        await supabase
          .from('invoice_items')
          .delete()
          .eq('invoice_id', invoiceId)

        // Insert new items
        const itemsToInsert = items.map((item, index) => ({
          invoice_id: invoiceId,
          description: item.name || item.description, // Use name as description
          quantity: item.quantity,
          unit_price: item.unit_price,
          amount: item.amount,
          sort_order: index,
          inventory_item_id: item.inventory_item_id || null,
        }))

        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(itemsToInsert)

        if (itemsError) throw itemsError
      } else {
        // Create new invoice
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
          description: item.name || item.description, // Use name as description
          quantity: item.quantity,
          unit_price: item.unit_price,
          amount: item.amount,
          sort_order: index,
          inventory_item_id: item.inventory_item_id || null,
        }))

        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(itemsToInsert)

        if (itemsError) throw itemsError
      }

      onSuccess()
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${invoiceId ? 'update' : 'create'} invoice`)
    } finally {
      setLoading(false)
    }
  }

  const { subtotal, taxAmount, total } = useMemo(() => calculateTotals(), [items, formData.tax_rate])

  // Use currency conversion hook if customer currency differs
  // Memoize the target currency to prevent unnecessary conversions
  const targetCurrency = useMemo(() => selectedCustomerCurrency || formData.currency, [selectedCustomerCurrency, formData.currency])

  const { convertedAmount: convertedTotal, isConverting } = useCurrencyConversion(
    total,
    formData.currency,
    targetCurrency
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-3xl max-h-[95vh] overflow-y-auto w-[95vw] p-4 sm:p-6">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-lg sm:text-xl">
              {currentMode === 'view' ? 'View Invoice' : currentMode === 'edit' ? 'Edit Invoice' : 'Create Invoice'}
            </DialogTitle>
            {invoiceId && currentMode === 'view' && (
              <Button
                onClick={() => setCurrentMode('edit')}
                variant="outline"
                size="sm"
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Edit
              </Button>
            )}
          </div>
        </DialogHeader>

        {loading && invoiceId ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mx-auto mb-4"></div>
              <p className="text-slate-400">Loading invoice details...</p>
            </div>
          </div>
        ) : (
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
                disabled={isViewMode}
                className="bg-slate-800 border-slate-700 h-9 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="client_id" className="text-xs">Customer/Client</Label>
              <Select
                value={formData.client_id}
                onValueChange={handleClientChange}
                disabled={isViewMode}
              >
                <SelectTrigger id="client_id" className="bg-slate-800 border-slate-700 h-9 text-sm">
                  <SelectValue placeholder="Select customer/client" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800">
                  {clients.length > 0 ? (
                    clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-2 py-1.5 text-xs text-slate-400 text-center">
                      No customers/clients added yet
                    </div>
                  )}
                </SelectContent>
              </Select>
              {selectedCustomerCurrency && selectedCustomerCurrency !== formData.currency && (
                <p className="text-xs text-cyan-400 mt-1">
                  Customer prefers {getCurrencySymbol(selectedCustomerCurrency)} {selectedCustomerCurrency}. Prices will be converted.
                </p>
              )}
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
              disabled={isViewMode}
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
                disabled={isViewMode}
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
                disabled={isViewMode}
                className="bg-slate-800 border-slate-700 h-9 text-sm"
              />
            </div>

            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <Label htmlFor="currency" className="text-xs">Currency *</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData({ ...formData, currency: value })}
                disabled={isViewMode}
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
              {!isViewMode && (
                <div className="flex-1 ml-4">
                  <InventoryItemSelector
                    onSelect={handleInventoryItemSelected}
                    currency={formData.currency}
                    selectedItems={items}
                  />
                </div>
              )}
            </div>

            {items.map((item, index) => (
              <div key={index} className="border border-slate-700 rounded-lg p-2.5 sm:p-3 space-y-2.5 sm:space-y-3 bg-slate-800/30">

                {/* If item is from inventory, show simplified view */}
                {item.inventory_item_id ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-cyan-400 text-xs">📦</span>
                          <h4 className="text-slate-100 font-medium text-sm">{item.name}</h4>
                        </div>
                        {item.description && (
                          <p className="text-slate-400 text-xs">{item.description}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400">Unit Price</p>
                        <p className="text-sm font-semibold text-cyan-400">{formData.currency} {item.unit_price.toFixed(2)}</p>
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between bg-slate-900/50 rounded-lg p-3">
                      <span className="text-slate-300 text-sm">Quantity</span>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-slate-900 rounded-lg border border-slate-600 p-0.5">
                          {!isViewMode && (
                            <button
                              type="button"
                              onClick={() => {
                                const newQty = Math.max(1, item.quantity - 1)
                                handleItemChange(index, 'quantity', newQty)
                              }}
                              className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-700 text-slate-300 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                          )}
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                            disabled={isViewMode}
                            className="w-14 text-center bg-transparent border-0 text-slate-100 text-sm focus:outline-none focus:ring-0"
                          />
                          {!isViewMode && (
                            <button
                              type="button"
                              onClick={() => {
                                handleItemChange(index, 'quantity', item.quantity + 1)
                              }}
                              className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-700 text-slate-300 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Total Amount */}
                    <div className="flex items-center justify-between bg-cyan-500/10 rounded-lg p-3 border border-cyan-500/30">
                      <span className="text-slate-300 text-sm font-medium">Line Total</span>
                      <span className="text-cyan-400 text-lg font-bold">{formData.currency} {item.amount.toFixed(2)}</span>
                    </div>
                  </div>
                ) : (
                  /* Manual entry fields */
                  <div className="space-y-2.5">
                    <div className="space-y-1.5">
                      <Label htmlFor={`name-${index}`} className="text-xs">Product/Service *</Label>
                      <Input
                        id={`name-${index}`}
                        value={item.name || ''}
                        onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                        placeholder="e.g., Consulting Service"
                        required
                        disabled={isViewMode}
                        className="bg-slate-800 border-slate-700 h-9 text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor={`description-${index}`} className="text-xs">Description</Label>
                      <Textarea
                        id={`description-${index}`}
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        placeholder="Details..."
                        rows={2}
                        disabled={isViewMode}
                        className="bg-slate-800 border-slate-700 min-h-14 text-sm resize-none"
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
                          disabled={isViewMode}
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
                          disabled={isViewMode}
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
                  </div>
                )}

                {items.length > 1 && !isViewMode && (
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

            {/* Add Item button after all items */}
            {!isViewMode && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
                className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs h-9 w-full"
              >
                + Add Item
              </Button>
            )}
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
                disabled={isViewMode}
                className="bg-slate-800 border-slate-700 h-9 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="status" className="text-xs">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as typeof formData.status })}
                disabled={isViewMode}
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
              <span className="font-medium">{getCurrencySymbol(formData.currency)}{subtotal.toFixed(2)} {formData.currency}</span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-slate-400">Tax ({formData.tax_rate}%):</span>
              <span className="font-medium">{getCurrencySymbol(formData.currency)}{taxAmount.toFixed(2)} {formData.currency}</span>
            </div>
            <div className="flex justify-between text-base sm:text-lg font-bold border-t border-slate-700 pt-2">
              <span>Total ({formData.currency}):</span>
              <span className="text-cyan-400">{getCurrencySymbol(formData.currency)}{total.toFixed(2)}</span>
            </div>
            {selectedCustomerCurrency && selectedCustomerCurrency !== formData.currency && (
              <div className="flex justify-between text-base sm:text-lg font-bold border-t border-green-700/30 pt-2 bg-green-500/10 -mx-3 sm:-mx-4 px-3 sm:px-4 py-2 rounded-b-lg">
                <span className="text-green-400">Customer Total ({selectedCustomerCurrency}):</span>
                <span className="text-green-400">
                  {isConverting ? (
                    <span className="text-sm">Converting...</span>
                  ) : (
                    <span>{getCurrencySymbol(selectedCustomerCurrency)}{convertedTotal?.toFixed(2)}</span>
                  )}
                </span>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 pt-2 sm:pt-4 flex-col-reverse sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-slate-700 text-slate-300 hover:bg-slate-800 text-sm h-10 w-full sm:w-auto"
            >
              {isViewMode ? 'Close' : 'Cancel'}
            </Button>
            {!isViewMode && (
              <Button
                type="submit"
                disabled={loading}
                className="bg-cyan-500 hover:bg-cyan-600 text-white text-sm h-10 w-full sm:w-auto"
              >
                {loading ? (invoiceId ? 'Updating...' : 'Creating...') : (invoiceId ? 'Update Invoice' : 'Create Invoice')}
              </Button>
            )}
          </DialogFooter>
        </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
