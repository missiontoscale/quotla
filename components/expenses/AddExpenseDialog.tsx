'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { DollarSign, Tag, FileText, AlertCircle } from 'lucide-react'
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
import { DEFAULT_EXPENSE_CATEGORIES } from '@/types/expenses'
import { VendorCombobox } from './VendorCombobox'
import { useUserCurrency } from '@/hooks/useUserCurrency'
import { formatCurrency, CURRENCIES } from '@/lib/utils/currency'

interface AddExpenseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  expenseId?: string
  mode?: 'create' | 'edit'
}

interface ExpenseFormData {
  description: string
  amount: string
  currency: string
  category: string
  expense_date: string
  payment_method: string
  vendor_name: string
  supplier_id: string
  is_tax_deductible: boolean
  notes: string
  status: 'pending' | 'approved' | 'reimbursed' | 'rejected'
}

interface Vendor {
  id: string
  name: string
}

export function AddExpenseDialog({
  open,
  onOpenChange,
  onSuccess,
  expenseId,
  mode = 'create'
}: AddExpenseDialogProps) {
  const { currency: userDefaultCurrency } = useUserCurrency()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [formData, setFormData] = useState<ExpenseFormData>({
    description: '',
    amount: '',
    currency: userDefaultCurrency,
    category: '',
    expense_date: new Date().toISOString().split('T')[0],
    payment_method: 'card',
    vendor_name: '',
    supplier_id: '',
    is_tax_deductible: false,
    notes: '',
    status: 'pending',
  })

  // Track if input currency differs from user's default (for conversion notice)
  const needsConversion = formData.currency !== userDefaultCurrency && formData.amount

  useEffect(() => {
    if (open) {
      fetchVendors()
      if (expenseId) {
        loadExpense()
      } else {
        resetForm()
      }
    }
  }, [open, expenseId])

  const resetForm = () => {
    setFormData({
      description: '',
      amount: '',
      currency: userDefaultCurrency,
      category: '',
      expense_date: new Date().toISOString().split('T')[0],
      payment_method: 'card',
      vendor_name: '',
      supplier_id: '',
      is_tax_deductible: false,
      notes: '',
      status: 'pending',
    })
  }

  const fetchVendors = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('suppliers')
        .select('id, name')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      setVendors(data || [])
    } catch (err) {
      console.error('Error fetching vendors:', err)
    }
  }

  const loadExpense = async () => {
    if (!expenseId) return

    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await supabase
        .from('expenses')
        .select('*')
        .eq('id', expenseId)
        .single()

      if (fetchError) throw fetchError

      if (data) {
        setFormData({
          description: data.description || '',
          amount: data.amount?.toString() || '',
          currency: data.currency || userDefaultCurrency,
          category: data.category || '',
          expense_date: data.expense_date || new Date().toISOString().split('T')[0],
          payment_method: data.payment_method || 'card',
          vendor_name: data.vendor_name || '',
          supplier_id: data.supplier_id || '',
          is_tax_deductible: data.is_tax_deductible || false,
          notes: data.notes || '',
          status: data.status || 'pending',
        })
      }
    } catch (err) {
      console.error('Error loading expense:', err)
      setError('Unable to load expense. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const isEditMode = !!expenseId

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Convert amount to user's default currency if entered in a different currency
      let finalAmount = parseFloat(formData.amount)
      const inputCurrency = formData.currency

      if (inputCurrency !== userDefaultCurrency) {
        // Convert from input currency to user's default currency via API
        const response = await fetch('/api/currency/convert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: finalAmount,
            from: inputCurrency,
            to: userDefaultCurrency,
          }),
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Currency conversion failed')
        finalAmount = data.convertedAmount
      }

      // Always store expenses in user's default currency
      const expenseData = {
        description: formData.description,
        amount: finalAmount,
        currency: userDefaultCurrency,
        category: formData.category,
        expense_date: formData.expense_date,
        payment_method: formData.payment_method || null,
        vendor_name: formData.vendor_name || null,
        supplier_id: formData.supplier_id || null,
        is_tax_deductible: formData.is_tax_deductible,
        notes: inputCurrency !== userDefaultCurrency
          ? `${formData.notes ? formData.notes + ' | ' : ''}Original: ${formatCurrency(parseFloat(formData.amount), inputCurrency)}`
          : formData.notes || null,
        status: formData.status,
      }

      if (expenseId) {
        const { error: updateError } = await supabase
          .from('expenses')
          .update(expenseData)
          .eq('id', expenseId)
          .eq('user_id', user.id)

        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase.from('expenses').insert({
          user_id: user.id,
          ...expenseData,
        })

        if (insertError) throw insertError
      }

      resetForm()
      onSuccess()
      onOpenChange(false)
    } catch (err) {
      console.error(`Error ${expenseId ? 'updating' : 'creating'} expense:`, err)
      setError(`Unable to ${expenseId ? 'update' : 'create'} expense. Please try again.`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isEditMode ? 'Edit Expense' : 'Add New Expense'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/50 rounded-lg p-3">
              <p className="text-sm text-rose-400">{error}</p>
            </div>
          )}

          {needsConversion && (
            <div className="bg-amber-500/10 border border-amber-500/50 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-400">
                This expense will be converted from {formData.currency} to {userDefaultCurrency} (your default currency) when saved.
              </p>
            </div>
          )}

          <FormSection title="Expense Details" icon={DollarSign} description="Basic expense information">
            <div className="space-y-2">
              <Label htmlFor="description" className="text-xs">Description *</Label>
              <Input
                id="description"
                placeholder="What was this expense for?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                className="bg-slate-800 border-slate-700 h-8 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-xs">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                  className="bg-slate-800 border-slate-700 h-8 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency" className="text-xs">Input Currency</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData({ ...formData, currency: value })}
                >
                  <SelectTrigger id="currency" className="bg-slate-800 border-slate-700 h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 max-h-60">
                    {CURRENCIES.map((curr) => (
                      <SelectItem key={curr.code} value={curr.code}>
                        {curr.symbol} {curr.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expense_date" className="text-xs">Date *</Label>
                <Input
                  id="expense_date"
                  type="date"
                  value={formData.expense_date}
                  onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                  required
                  className="bg-slate-800 border-slate-700 h-8 text-sm"
                />
              </div>
            </div>
          </FormSection>

          <FormSection title="Categorization" icon={Tag} description="Category and vendor">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-xs">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger id="category" className="bg-slate-800 border-slate-700 h-8 text-sm">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800">
                    {DEFAULT_EXPENSE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.name} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment_method" className="text-xs">Payment Method</Label>
                <Select
                  value={formData.payment_method}
                  onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
                >
                  <SelectTrigger id="payment_method" className="bg-slate-800 border-slate-700 h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800">
                    <SelectItem value="card">Credit/Debit Card</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vendor" className="text-xs">Vendor / Supplier</Label>
              <VendorCombobox
                vendors={vendors}
                selectedVendorId={formData.supplier_id}
                customVendorName={formData.vendor_name}
                onVendorSelect={(vendorId, vendorName) => {
                  if (vendorId) {
                    setFormData({ ...formData, supplier_id: vendorId, vendor_name: '' })
                  } else {
                    setFormData({ ...formData, supplier_id: '', vendor_name: vendorName })
                  }
                }}
                onCustomVendorChange={(vendorName) => {
                  setFormData({ ...formData, vendor_name: vendorName, supplier_id: '' })
                }}
              />
              <p className="text-xs text-slate-500">
                Type to search existing vendors or enter a new vendor name
              </p>
            </div>
          </FormSection>

          <FormSection title="Additional Info" icon={FileText} description="Status and notes" collapsible defaultOpen={false}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status" className="text-xs">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as ExpenseFormData['status'] })}
                >
                  <SelectTrigger id="status" className="bg-slate-800 border-slate-700 h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800">
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="reimbursed">Reimbursed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2 pt-6">
                <input
                  type="checkbox"
                  id="is_tax_deductible"
                  checked={formData.is_tax_deductible}
                  onChange={(e) => setFormData({ ...formData, is_tax_deductible: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-800"
                />
                <Label htmlFor="is_tax_deductible" className="text-xs">Tax Deductible</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-xs">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="bg-slate-800 border-slate-700 min-h-20 text-sm"
                rows={2}
              />
            </div>
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
                : (isEditMode ? 'Update Expense' : 'Add Expense')
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
