'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useUserCurrency } from '@/hooks/useUserCurrency'
import { deductStockForInvoice, restoreStockForInvoice, hasStockBeenDeducted } from '@/lib/inventory/stock-operations'
import { FileText, User, Calendar, DollarSign, Plus, Trash2, Package, Check, ChevronsUpDown, UserPlus, Save, Download, X, Loader2 } from 'lucide-react'
import { exportToPDF, exportToWord, exportToPNG } from '@/lib/export'
import type { Profile, InvoiceWithItems } from '@/types'
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
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { FormSection } from '@/components/ui/form-section'
import { formatCurrency, CURRENCIES } from '@/lib/utils/currency'

interface LineItem {
  id: string
  description: string
  quantity: number
  unit_price: number
  amount: number
  inventory_item_id?: string
  isCustomItem?: boolean // True if typed manually (not from inventory)
  savedToInventory?: boolean // True if user chose to save to inventory
}

interface Customer {
  id: string
  name: string
  company_name: string | null
  isTemporary?: boolean // True if typed manually (not yet saved to DB)
}

interface InventoryItem {
  id: string
  name: string
  unit_price: number
}

interface AddInvoiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  invoiceId?: string
  mode?: 'create' | 'edit' | 'view'
}

interface InvoiceFormData {
  client_id: string
  invoice_number: string
  title: string
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  issue_date: string
  due_date: string
  currency: string
  tax_rate: number
  notes: string
  payment_terms: string
}

function generateInvoiceNumber(): string {
  const date = new Date()
  const year = date.getFullYear().toString().slice(-2)
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `INV-${year}${month}-${random}`
}

export function AddInvoiceDialog({
  open,
  onOpenChange,
  onSuccess,
  invoiceId,
  mode = 'create'
}: AddInvoiceDialogProps) {
  const { currency: userCurrency } = useUserCurrency()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [customerComboboxOpen, setCustomerComboboxOpen] = useState(false)
  const [customerSearchValue, setCustomerSearchValue] = useState('')
    const customerDropdownRef = useRef<HTMLDivElement>(null)
  const [savingCustomer, setSavingCustomer] = useState(false)
  const [savingItemId, setSavingItemId] = useState<string | null>(null)
  const [lineItemSearchValues, setLineItemSearchValues] = useState<Record<string, string>>({})
  const [openLineItemDropdown, setOpenLineItemDropdown] = useState<string | null>(null)
  const lineItemDropdownRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const [profile, setProfile] = useState<Profile | null>(null)
  const [showDownloadOptions, setShowDownloadOptions] = useState(false)
  const [exporting, setExporting] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isConverting, setIsConverting] = useState(false)

  // Track original status for stock operations on status change
  const [originalStatus, setOriginalStatus] = useState<'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | null>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target as Node)) {
        setCustomerComboboxOpen(false)
      }
      // Close line item dropdown if clicking outside
      if (openLineItemDropdown) {
        const ref = lineItemDropdownRefs.current[openLineItemDropdown]
        if (ref && !ref.contains(event.target as Node)) {
          setOpenLineItemDropdown(null)
        }
      }
    }

    if (customerComboboxOpen || openLineItemDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [customerComboboxOpen, openLineItemDropdown])

  const today = new Date().toISOString().split('T')[0]
  const defaultDueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const [formData, setFormData] = useState<InvoiceFormData>({
    client_id: '',
    invoice_number: generateInvoiceNumber(),
    title: '',
    status: 'draft',
    issue_date: today,
    due_date: defaultDueDate,
    currency: userCurrency || 'NGN',
    tax_rate: 0,
    notes: '',
    payment_terms: 'Payment due within 30 days of invoice date.',
  })

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: crypto.randomUUID(), description: '', quantity: 1, unit_price: 0, amount: 0 }
  ])

  const isViewMode = mode === 'view'
  const isEditMode = !!invoiceId

  // Calculate totals
  const subtotal = useMemo(() => {
    return lineItems.reduce((sum, item) => sum + item.amount, 0)
  }, [lineItems])

  const taxAmount = useMemo(() => {
    return subtotal * (formData.tax_rate / 100)
  }, [subtotal, formData.tax_rate])

  const total = useMemo(() => {
    return subtotal + taxAmount
  }, [subtotal, taxAmount])

  useEffect(() => {
    if (open) {
      // Reset editing state when dialog opens
      setIsEditing(false)
      fetchCustomers()
      fetchInventoryItems()
      if (invoiceId) {
        loadInvoice()
      } else {
        resetForm()
      }
      // Fetch profile when opening in view mode
      if (mode === 'view') {
        fetchProfile()
      }
    }
  }, [open, invoiceId, mode])

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (err) {
      console.error('Error fetching profile:', err)
    }
  }

  const resetForm = () => {
    setFormData({
      client_id: '',
      invoice_number: generateInvoiceNumber(),
      title: '',
      status: 'draft',
      issue_date: today,
      due_date: defaultDueDate,
      currency: userCurrency || 'NGN',
      tax_rate: 0,
      notes: '',
      payment_terms: 'Payment due within 30 days of invoice date.',
    })
    setLineItems([
      { id: crypto.randomUUID(), description: '', quantity: 1, unit_price: 0, amount: 0 }
    ])
    setOriginalStatus(null)
    setError(null)
  }

  const fetchCustomers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('customers')
        .select('id, full_name, company_name')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('full_name')

      if (error) throw error
      setCustomers((data || []).map(c => ({
        id: c.id,
        name: c.full_name,
        company_name: c.company_name
      })))
    } catch (err) {
      console.error('Error fetching customers:', err)
    }
  }

  const fetchInventoryItems = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('inventory_items')
        .select('id, name, unit_price')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      setInventoryItems(data || [])
    } catch (err) {
      console.error('Error fetching inventory items:', err)
    }
  }

  // Use a customer name temporarily without saving to DB
  const useTemporaryCustomer = (name: string) => {
    if (!name.trim()) return

    const tempId = `temp-${crypto.randomUUID()}`
    const tempCustomer: Customer = {
      id: tempId,
      name: name.trim(),
      company_name: null,
      isTemporary: true,
    }
    setCustomers(prev => [...prev, tempCustomer])
    setFormData({ ...formData, client_id: tempId })
    setCustomerSearchValue('')
    setCustomerComboboxOpen(false)
  }

  // Save a temporary customer to the database
  const saveCustomerToDB = async (customerId: string) => {
    const customer = customers.find(c => c.id === customerId)
    if (!customer || !customer.isTemporary) return

    setSavingCustomer(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: newCustomer, error } = await supabase
        .from('customers')
        .insert({
          user_id: user.id,
          full_name: customer.name,
          is_active: true,
        })
        .select('id, full_name, company_name')
        .single()

      if (error) throw error

      if (newCustomer) {
        // Replace the temporary customer with the saved one
        setCustomers(prev => prev.map(c =>
          c.id === customerId
            ? { id: newCustomer.id, name: newCustomer.full_name, company_name: newCustomer.company_name, isTemporary: false }
            : c
        ))
        // Update form data with the real customer ID
        if (formData.client_id === customerId) {
          setFormData({ ...formData, client_id: newCustomer.id })
        }
      }
    } catch (err) {
      console.error('Error saving customer:', err)
      setError('Unable to save customer. Please try again.')
    } finally {
      setSavingCustomer(false)
    }
  }

  // Save a custom line item to inventory
  const saveLineItemToInventory = async (lineItemId: string) => {
    const lineItem = lineItems.find(item => item.id === lineItemId)
    if (!lineItem || !lineItem.isCustomItem || lineItem.savedToInventory) return

    setSavingItemId(lineItemId)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: newItem, error } = await supabase
        .from('inventory_items')
        .insert({
          user_id: user.id,
          name: lineItem.description,
          unit_price: lineItem.unit_price,
          quantity: 0, // Start with 0 stock
          is_active: true,
        })
        .select('id, name, unit_price')
        .single()

      if (error) throw error

      if (newItem) {
        // Add to inventory items list
        setInventoryItems(prev => [...prev, newItem])
        // Mark the line item as saved and link to inventory
        setLineItems(items => items.map(item =>
          item.id === lineItemId
            ? { ...item, inventory_item_id: newItem.id, savedToInventory: true, isCustomItem: false }
            : item
        ))
      }
    } catch (err) {
      console.error('Error saving item to inventory:', err)
      setError('Unable to save item to inventory. Please try again.')
    } finally {
      setSavingItemId(null)
    }
  }

  // Use a custom item description (not from inventory)
  const useCustomLineItem = (lineItemId: string, description: string) => {
    setLineItems(items => items.map(item => {
      if (item.id !== lineItemId) return item
      return {
        ...item,
        description,
        inventory_item_id: undefined,
        isCustomItem: true,
        savedToInventory: false,
      }
    }))
    setLineItemSearchValues(prev => ({ ...prev, [lineItemId]: '' }))
    setOpenLineItemDropdown(null)
  }

  // Get filtered inventory items for a line item
  const getFilteredInventoryItems = (lineItemId: string) => {
    const searchValue = lineItemSearchValues[lineItemId] || ''
    if (!searchValue) return inventoryItems
    return inventoryItems.filter(item =>
      item.name.toLowerCase().includes(searchValue.toLowerCase())
    )
  }

  // Check if search value matches an existing inventory item
  const searchMatchesInventory = (lineItemId: string) => {
    const searchValue = lineItemSearchValues[lineItemId] || ''
    if (!searchValue) return false
    return inventoryItems.some(item =>
      item.name.toLowerCase() === searchValue.toLowerCase()
    )
  }

  // Get selected customer display name
  const selectedCustomer = customers.find(c => c.id === formData.client_id)
  const selectedCustomerDisplay = selectedCustomer
    ? (selectedCustomer.company_name || selectedCustomer.name)
    : null

  // Filter customers based on search and check if search matches any existing
  const filteredCustomers = customers.filter(customer => {
    const displayName = customer.company_name || customer.name
    return displayName.toLowerCase().includes(customerSearchValue.toLowerCase())
  })

  const searchMatchesExisting = customers.some(customer => {
    const displayName = customer.company_name || customer.name
    return displayName.toLowerCase() === customerSearchValue.toLowerCase()
  })

  const loadInvoice = async () => {
    if (!invoiceId) return

    setLoading(true)
    setError(null)
    try {
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .single()

      if (invoiceError) throw invoiceError

      const { data: items, error: itemsError } = await supabase
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('sort_order')

      if (itemsError) throw itemsError

      if (invoice) {
        // Track original status for stock operations
        setOriginalStatus(invoice.status)

        setFormData({
          client_id: invoice.client_id || '',
          invoice_number: invoice.invoice_number,
          title: invoice.title || '',
          status: invoice.status,
          issue_date: invoice.issue_date,
          due_date: invoice.due_date || '',
          currency: invoice.currency,
          tax_rate: invoice.tax_rate || 0,
          notes: invoice.notes || '',
          payment_terms: invoice.payment_terms || '',
        })

        if (items && items.length > 0) {
          setLineItems(items.map(item => ({
            id: item.id,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            amount: item.amount,
            inventory_item_id: item.inventory_item_id || undefined,
          })))
        }
      }
    } catch (err) {
      console.error('Error loading invoice:', err)
      setError('Unable to load invoice. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const updateLineItem = (id: string, field: keyof LineItem, value: any) => {
    setLineItems(items => items.map(item => {
      if (item.id !== id) return item

      const updated = { ...item, [field]: value }

      // Recalculate amount when quantity or unit_price changes
      if (field === 'quantity' || field === 'unit_price') {
        updated.amount = updated.quantity * updated.unit_price
      }

      return updated
    }))
  }

  const addLineItem = () => {
    setLineItems(items => [
      ...items,
      { id: crypto.randomUUID(), description: '', quantity: 1, unit_price: 0, amount: 0 }
    ])
  }

  const removeLineItem = (id: string) => {
    if (lineItems.length <= 1) return
    setLineItems(items => items.filter(item => item.id !== id))
  }

  const selectInventoryItem = (lineItemId: string, inventoryItemId: string) => {
    const inventoryItem = inventoryItems.find(i => i.id === inventoryItemId)
    if (!inventoryItem) return

    setLineItems(items => items.map(item => {
      if (item.id !== lineItemId) return item
      return {
        ...item,
        inventory_item_id: inventoryItemId,
        description: inventoryItem.name,
        unit_price: inventoryItem.unit_price,
        amount: item.quantity * inventoryItem.unit_price,
      }
    }))
  }

  const handleCurrencyChange = async (newCurrency: string) => {
    const oldCurrency = formData.currency
    if (oldCurrency === newCurrency) return

    // If there are no line items with prices, just update the currency
    const hasItemsWithPrices = lineItems.some(item => item.unit_price > 0)
    if (!hasItemsWithPrices) {
      setFormData({ ...formData, currency: newCurrency })
      return
    }

    setIsConverting(true)
    try {
      const response = await fetch('/api/currency/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 1, from: oldCurrency, to: newCurrency }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch exchange rate')
      }

      const data = await response.json()
      const rate = data.convertedAmount // Since amount is 1, convertedAmount is the rate

      // Convert all line item prices
      setLineItems(items => items.map(item => ({
        ...item,
        unit_price: Math.round(item.unit_price * rate * 100) / 100,
        amount: Math.round(item.quantity * item.unit_price * rate * 100) / 100,
      })))

      setFormData({ ...formData, currency: newCurrency })
    } catch (err) {
      console.error('Currency conversion failed:', err)
      setError('Failed to convert currency. Please try again.')
    } finally {
      setIsConverting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isViewMode && !isEditing) return

    // Validation
    if (!formData.client_id) {
      setError('Please select a customer')
      return
    }


    const validItems = lineItems.filter(item => item.description && item.quantity > 0)
    if (validItems.length === 0) {
      setError('Please add at least one line item with a description')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Check if the selected customer is temporary (not saved to DB)
      const selectedCustomer = customers.find(c => c.id === formData.client_id)
      const isTemporaryCustomer = selectedCustomer?.isTemporary === true

      // If customer is temporary, save them to the database first
      let finalClientId: string | null = formData.client_id
      if (isTemporaryCustomer && selectedCustomer) {
        const { data: newCustomer, error: customerError } = await supabase
          .from('customers')
          .insert({
            user_id: user.id,
            full_name: selectedCustomer.name,
            is_active: true,
          })
          .select('id')
          .single()

        if (customerError) {
          console.error('Error saving customer:', customerError)
          // Set to null if customer save fails - invoice can still be created without a customer
          finalClientId = null
        } else if (newCustomer) {
          finalClientId = newCustomer.id
          // Update the customers list with the real ID
          setCustomers(prev => prev.map(c =>
            c.id === formData.client_id
              ? { ...c, id: newCustomer.id, isTemporary: false }
              : c
          ))
        }
      }

      const invoiceData = {
        user_id: user.id,
        client_id: finalClientId && !finalClientId.startsWith('temp-') ? finalClientId : null,
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
      }

      let savedInvoiceId = invoiceId

      if (invoiceId) {
        // Update existing invoice
        const { error: updateError } = await supabase
          .from('invoices')
          .update(invoiceData)
          .eq('id', invoiceId)
          .eq('user_id', user.id)

        if (updateError) throw updateError

        // Delete existing line items
        await supabase
          .from('invoice_items')
          .delete()
          .eq('invoice_id', invoiceId)
      } else {
        // Create new invoice
        const { data: newInvoice, error: insertError } = await supabase
          .from('invoices')
          .insert(invoiceData)
          .select()
          .single()

        if (insertError) throw insertError
        savedInvoiceId = newInvoice.id
      }

      // Insert line items
      const itemsToInsert = validItems.map((item, index) => ({
        invoice_id: savedInvoiceId,
        description: item.description,
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

      // Handle stock operations based on status transitions
      const newStatus = formData.status
      const prevStatus = originalStatus // null for new invoices

      // Determine if stock should be deducted or restored
      const wasStockDeducted = prevStatus === 'sent' || prevStatus === 'paid'
      const shouldDeductStock = newStatus === 'sent' || newStatus === 'paid'
      const isCancelling = newStatus === 'cancelled'

      if (savedInvoiceId) {
        // Deduct stock when transitioning to 'sent' or 'paid' from a non-deducted state
        if (shouldDeductStock && !wasStockDeducted) {
          const result = await deductStockForInvoice(savedInvoiceId, user.id)
          if (!result.success) {
            console.error('Stock deduction failed:', result.error)
            // Don't fail the invoice save, just log the error
          }
        }
        // Restore stock when cancelling from a deducted state
        else if (isCancelling && wasStockDeducted) {
          const result = await restoreStockForInvoice(savedInvoiceId, user.id)
          if (!result.success) {
            console.error('Stock restoration failed:', result.error)
          }
        }
      }

      onSuccess()
      onOpenChange(false)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message :
        (typeof err === 'object' && err !== null && 'message' in err) ? String((err as { message: unknown }).message) :
        'Unknown error'
      console.error(`Error ${invoiceId ? 'updating' : 'creating'} invoice:`, errorMessage, err)
      setError(`Unable to ${invoiceId ? 'update' : 'create'} invoice: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  // Build export data for download functions
  const getExportData = () => {
    return {
      type: 'invoice' as const,
      data: {
        ...formData,
        id: invoiceId || '',
        user_id: '',
        created_at: '',
        updated_at: '',
        subtotal,
        tax_amount: taxAmount,
        total,
        items: lineItems.map(item => ({
          ...item,
          invoice_id: invoiceId || '',
          created_at: '',
          sort_order: 0
        })),
        client: customers.find(c => c.id === formData.client_id) ? {
          id: formData.client_id,
          name: customers.find(c => c.id === formData.client_id)?.name || '',
          email: null,
          phone: null,
          address: null,
          city: null,
          state: null,
          postal_code: null,
          country: null,
          full_name: customers.find(c => c.id === formData.client_id)?.name || '',
          company_name: customers.find(c => c.id === formData.client_id)?.company_name || null,
          user_id: '',
          is_active: true,
          created_at: '',
          updated_at: ''
        } : null
      } as InvoiceWithItems,
      profile
    }
  }

  const handleExport = async (format: 'pdf' | 'word' | 'png') => {
    setExporting(format)
    setShowDownloadOptions(false)

    try {
      const exportData = getExportData()

      switch (format) {
        case 'pdf':
          await exportToPDF(exportData)
          break
        case 'word':
          await exportToWord(exportData)
          break
        case 'png':
          await exportToPNG(exportData)
          break
      }
    } catch (err) {
      console.error('Export failed:', err)
    } finally {
      setExporting(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-xl md:max-w-3xl max-h-[90vh] overflow-y-auto px-3 md:px-4">
        <DialogHeader className="sticky top-0 z-10 bg-slate-900 border-b border-slate-800 pb-3 -mx-3 md:-mx-4 px-3 md:px-4 pt-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">
              {isViewMode ? 'View Invoice' : isEditMode ? 'Edit Invoice' : 'Create Invoice'}
            </DialogTitle>
            {isViewMode && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowDownloadOptions(!showDownloadOptions)}
                  disabled={exporting !== null}
                  className="p-2 rounded-md text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors disabled:opacity-50"
                  aria-label="Download options"
                >
                  <Download className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="p-2 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
          {/* Inline download options row */}
          {isViewMode && showDownloadOptions && (
            <div className="flex gap-2 mt-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => handleExport('png')}
                disabled={exporting !== null}
                className="flex-1 px-3 py-2 text-sm font-medium rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors disabled:opacity-50"
              >
                {exporting === 'png' ? 'Exporting...' : 'PNG'}
              </button>
              <button
                type="button"
                onClick={() => handleExport('pdf')}
                disabled={exporting !== null}
                className="flex-1 px-3 py-2 text-sm font-medium rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors disabled:opacity-50"
              >
                {exporting === 'pdf' ? 'Exporting...' : 'PDF'}
              </button>
              <button
                type="button"
                onClick={() => handleExport('word')}
                disabled={exporting !== null}
                className="flex-1 px-3 py-2 text-sm font-medium rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors disabled:opacity-50"
              >
                {exporting === 'word' ? 'Exporting...' : 'DOCX'}
              </button>
            </div>
          )}
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/50 rounded-lg p-3">
              <p className="text-sm text-rose-400">{error}</p>
            </div>
          )}

          {/* Customer & Invoice Info - Most important, at top */}
          <FormSection title="Invoice Details" icon={FileText} description="Basic invoice information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invoice-number" className="text-xs">Invoice Number *</Label>
                <Input
                  id="invoice-number"
                  value={formData.invoice_number}
                  onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                  required
                  disabled={isViewMode && !isEditing}
                  className="bg-slate-800 border-slate-700 h-8 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-xs">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                  disabled={isViewMode && !isEditing}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700 h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800">
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title" className="text-xs">Title (optional)</Label>
              <Input
                id="title"
                placeholder="e.g., Website Development Services"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                disabled={isViewMode && !isEditing}
                className="bg-slate-800 border-slate-700 h-8 text-sm"
              />
            </div>
          </FormSection>

          {/* Customer Selection */}
          <FormSection title="Customer" icon={User} description="Who is this invoice for?">
            <div className="space-y-2">
              <Label htmlFor="customer" className="text-xs">Select Customer *</Label>
              <div className="relative" ref={customerDropdownRef}>
                <Input
                  placeholder="Search or add a customer..."
                  value={customerSearchValue || selectedCustomerDisplay || ''}
                  onChange={(e) => {
                    setCustomerSearchValue(e.target.value)
                    if (formData.client_id && e.target.value !== selectedCustomerDisplay) {
                      setFormData({ ...formData, client_id: '' })
                    }
                  }}
                  onFocus={() => setCustomerComboboxOpen(true)}
                  disabled={isViewMode && !isEditing}
                  className="bg-slate-800 border-slate-700 h-8 text-sm pr-8"
                />
                <ChevronsUpDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
                {customerComboboxOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-slate-900 border border-slate-800 rounded-md shadow-lg">
                    <Command className="bg-slate-900" shouldFilter={false}>
                      <CommandList className="max-h-60">
                        {filteredCustomers.length === 0 && !customerSearchValue && (
                          <div className="py-6 text-center text-sm text-slate-400">No customers found.</div>
                        )}
                        {filteredCustomers.length === 0 && customerSearchValue && !searchMatchesExisting && (
                          <div className="p-2">
                            <Button
                              type="button"
                              variant="ghost"
                              className="w-full justify-start text-sm text-cyan-400 hover:text-cyan-300 hover:bg-slate-800"
                              onClick={() => useTemporaryCustomer(customerSearchValue)}
                            >
                              <UserPlus className="mr-2 h-4 w-4" />
                              Use "{customerSearchValue}"
                            </Button>
                          </div>
                        )}
                        <CommandGroup>
                          {filteredCustomers.map((customer) => (
                            <CommandItem
                              key={customer.id}
                              value={customer.id}
                              onSelect={() => {
                                setFormData({ ...formData, client_id: customer.id })
                                setCustomerSearchValue('')
                                setCustomerComboboxOpen(false)
                              }}
                              className="text-sm cursor-pointer hover:bg-slate-800"
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  formData.client_id === customer.id ? "opacity-100" : "opacity-0"
                                }`}
                              />
                              {customer.company_name || customer.name}
                              {customer.isTemporary && (
                                <span className="ml-2 text-xs text-amber-400">(unsaved)</span>
                              )}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                        {customerSearchValue && !searchMatchesExisting && filteredCustomers.length > 0 && (
                          <CommandGroup className="border-t border-slate-800">
                            <CommandItem
                              onSelect={() => useTemporaryCustomer(customerSearchValue)}
                              className="text-sm cursor-pointer text-cyan-400 hover:text-cyan-300 hover:bg-slate-800"
                            >
                              <UserPlus className="mr-2 h-4 w-4" />
                              Use "{customerSearchValue}"
                            </CommandItem>
                          </CommandGroup>
                        )}
                      </CommandList>
                    </Command>
                  </div>
                )}
              </div>
              {/* Save as Customer button - shows when a temporary customer is selected */}
              {selectedCustomer?.isTemporary && (!isViewMode || isEditing) && (
                <div className="flex items-center gap-2 p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <span className="text-xs text-amber-400 flex-1">
                    "{selectedCustomer.name}" is not saved to your customers list
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => saveCustomerToDB(selectedCustomer.id)}
                    disabled={savingCustomer}
                    className="text-xs h-7 text-amber-400 hover:text-amber-300 hover:bg-amber-500/20"
                  >
                    <Save className="mr-1 h-3 w-3" />
                    {savingCustomer ? 'Saving...' : 'Save as Customer'}
                  </Button>
                </div>
              )}
            </div>
          </FormSection>

          {/* Dates */}
          <FormSection title="Dates" icon={Calendar} description="Issue and due dates">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="issue-date" className="text-xs">Issue Date *</Label>
                <Input
                  id="issue-date"
                  type="date"
                  value={formData.issue_date}
                  onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                  required
                  disabled={isViewMode && !isEditing}
                  className="bg-slate-800 border-slate-700 h-8 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="due-date" className="text-xs">Due Date</Label>
                <Input
                  id="due-date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  disabled={isViewMode && !isEditing}
                  className="bg-slate-800 border-slate-700 h-8 text-sm"
                />
              </div>
            </div>
          </FormSection>

          {/* Line Items */}
          <FormSection title="Line Items" icon={Package} description="Products or services being invoiced">
            <div className="space-y-3">
              {lineItems.map((item, index) => {
                const filteredItems = getFilteredInventoryItems(item.id)
                const searchValue = lineItemSearchValues[item.id] || ''
                const matchesInventory = searchMatchesInventory(item.id)

                return (
                  <div key={item.id} className="space-y-2">
                    <div className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-12 sm:col-span-5 space-y-1">
                        {index === 0 && <Label className="text-xs">Item / Description</Label>}
                        <div
                          className="relative"
                          ref={(el) => { lineItemDropdownRefs.current[item.id] = el }}
                        >
                          <Input
                            placeholder="Search inventory or type custom item..."
                            value={searchValue || item.description}
                            onChange={(e) => {
                              setLineItemSearchValues(prev => ({ ...prev, [item.id]: e.target.value }))
                              // If they're typing, clear the linked inventory item
                              if (item.inventory_item_id && e.target.value !== item.description) {
                                updateLineItem(item.id, 'description', e.target.value)
                                updateLineItem(item.id, 'inventory_item_id', undefined)
                                setLineItems(items => items.map(i =>
                                  i.id === item.id ? { ...i, isCustomItem: true, savedToInventory: false } : i
                                ))
                              }
                            }}
                            onFocus={() => setOpenLineItemDropdown(item.id)}
                            disabled={isViewMode && !isEditing}
                            className="bg-slate-800 border-slate-700 h-8 text-sm pr-8"
                          />
                          <ChevronsUpDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
                          {openLineItemDropdown === item.id && (
                            <div className="absolute z-50 w-full mt-1 bg-slate-900 border border-slate-800 rounded-md shadow-lg">
                              <Command className="bg-slate-900" shouldFilter={false}>
                                <CommandList className="max-h-48">
                                  {filteredItems.length === 0 && !searchValue && (
                                    <div className="py-4 text-center text-sm text-slate-400">No inventory items found.</div>
                                  )}
                                  {filteredItems.length === 0 && searchValue && !matchesInventory && (
                                    <div className="p-2">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        className="w-full justify-start text-sm text-cyan-400 hover:text-cyan-300 hover:bg-slate-800"
                                        onClick={() => useCustomLineItem(item.id, searchValue)}
                                      >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Use "{searchValue}"
                                      </Button>
                                    </div>
                                  )}
                                  <CommandGroup>
                                    {filteredItems.map((inv) => (
                                      <CommandItem
                                        key={inv.id}
                                        value={inv.id}
                                        onSelect={() => {
                                          selectInventoryItem(item.id, inv.id)
                                          setLineItemSearchValues(prev => ({ ...prev, [item.id]: '' }))
                                          setOpenLineItemDropdown(null)
                                        }}
                                        className="text-sm cursor-pointer hover:bg-slate-800"
                                      >
                                        <Check
                                          className={`mr-2 h-4 w-4 ${
                                            item.inventory_item_id === inv.id ? "opacity-100" : "opacity-0"
                                          }`}
                                        />
                                        <span className="flex-1">{inv.name}</span>
                                        <span className="text-xs text-slate-400">
                                          {formatCurrency(inv.unit_price, formData.currency)}
                                        </span>
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                  {searchValue && !matchesInventory && filteredItems.length > 0 && (
                                    <CommandGroup className="border-t border-slate-800">
                                      <CommandItem
                                        onSelect={() => useCustomLineItem(item.id, searchValue)}
                                        className="text-sm cursor-pointer text-cyan-400 hover:text-cyan-300 hover:bg-slate-800"
                                      >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Use "{searchValue}"
                                      </CommandItem>
                                    </CommandGroup>
                                  )}
                                </CommandList>
                              </Command>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="col-span-4 sm:col-span-2 space-y-1">
                        {index === 0 && <Label className="text-xs">Qty</Label>}
                        <Input
                          type="number"
                          min="1"
                          step="1"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 1)}
                          disabled={isViewMode && !isEditing}
                          className="bg-slate-800 border-slate-700 h-8 text-sm"
                        />
                      </div>
                      <div className="col-span-4 sm:col-span-2 space-y-1">
                        {index === 0 && <Label className="text-xs">Price</Label>}
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unit_price}
                          onChange={(e) => updateLineItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                          disabled={isViewMode && !isEditing}
                          className="bg-slate-800 border-slate-700 h-8 text-sm"
                        />
                      </div>
                      <div className="col-span-3 sm:col-span-2 space-y-1">
                        {index === 0 && <Label className="text-xs">Amount</Label>}
                        <div className="h-8 flex items-center text-sm text-slate-300">
                          {formatCurrency(item.amount, formData.currency)}
                        </div>
                      </div>
                      <div className="col-span-1 space-y-1">
                        {index === 0 && <Label className="text-xs">&nbsp;</Label>}
                        {(!isViewMode || isEditing) && lineItems.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLineItem(item.id)}
                            className="h-8 w-8 p-0 text-slate-400 hover:text-rose-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    {/* Save to Inventory button - shows for custom items with description and price */}
                    {item.isCustomItem && !item.savedToInventory && item.description && item.unit_price > 0 && (!isViewMode || isEditing) && (
                      <div className="flex items-center gap-2 p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg ml-0 sm:ml-0">
                        <span className="text-xs text-amber-400 flex-1">
                          "{item.description}" is not in your inventory
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => saveLineItemToInventory(item.id)}
                          disabled={savingItemId === item.id}
                          className="text-xs h-7 text-amber-400 hover:text-amber-300 hover:bg-amber-500/20"
                        >
                          <Save className="mr-1 h-3 w-3" />
                          {savingItemId === item.id ? 'Saving...' : 'Save to Inventory'}
                        </Button>
                      </div>
                    )}
                  </div>
                )
              })}

              {(!isViewMode || isEditing) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addLineItem}
                  className="text-cyan-400 hover:text-cyan-300"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Line Item
                </Button>
              )}
            </div>
          </FormSection>

          {/* Pricing & Totals */}
          <FormSection title="Totals" icon={DollarSign} description="Currency and tax settings">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currency" className="text-xs">Currency</Label>
                <div className="relative">
                  <Select
                    value={formData.currency}
                    onValueChange={handleCurrencyChange}
                    disabled={(isViewMode && !isEditing) || isConverting}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700 h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 max-h-60">
                      {CURRENCIES.map((curr) => (
                        <SelectItem key={curr.code} value={curr.code}>
                          {curr.symbol} {curr.code} - {curr.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isConverting && (
                    <div className="absolute right-8 top-1/2 -translate-y-1/2">
                      <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tax-rate" className="text-xs">Tax Rate (%)</Label>
                <Input
                  id="tax-rate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.tax_rate}
                  onChange={(e) => setFormData({ ...formData, tax_rate: parseFloat(e.target.value) || 0 })}
                  disabled={isViewMode && !isEditing}
                  className="bg-slate-800 border-slate-700 h-8 text-sm"
                />
              </div>
            </div>

            {/* Totals Summary */}
            <div className="mt-4 p-3 bg-slate-800/50 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Subtotal</span>
                <span className="text-slate-200">{formatCurrency(subtotal, formData.currency)}</span>
              </div>
              {formData.tax_rate > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Tax ({formData.tax_rate}%)</span>
                  <span className="text-slate-200">{formatCurrency(taxAmount, formData.currency)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-medium border-t border-slate-700 pt-2">
                <span className="text-slate-200">Total</span>
                <span className="text-emerald-400">{formatCurrency(total, formData.currency)}</span>
              </div>
            </div>
          </FormSection>

          {/* Notes & Terms - Collapsible, less important */}
          <FormSection
            title="Notes & Terms"
            icon={FileText}
            description="Additional information"
            collapsible
            defaultOpen={false}
          >
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-xs">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any additional notes for the customer..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                disabled={isViewMode && !isEditing}
                className="bg-slate-800 border-slate-700 min-h-16 text-sm"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-terms" className="text-xs">Payment Terms (optional)</Label>
              <Textarea
                id="payment-terms"
                placeholder="e.g., Payment due within 30 days..."
                value={formData.payment_terms}
                onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                disabled={isViewMode && !isEditing}
                className="bg-slate-800 border-slate-700 min-h-16 text-sm"
                rows={2}
              />
            </div>
          </FormSection>

          <DialogFooter className="gap-2 pt-4 flex-col sm:flex-row">
            {isViewMode && !isEditing ? (
              <Button
                type="button"
                onClick={() => setIsEditing(true)}
                className="bg-cyan-500 hover:bg-cyan-600 text-white text-sm h-9"
              >
                Edit Invoice
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (isViewMode && isEditing) {
                      setIsEditing(false)
                    } else {
                      onOpenChange(false)
                    }
                  }}
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
                    ? ((isEditMode || isEditing) ? 'Updating...' : 'Creating...')
                    : ((isEditMode || isEditing) ? 'Update Invoice' : 'Create Invoice')
                  }
                </Button>
              </>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
