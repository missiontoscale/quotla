'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { Client, LineItem, CURRENCIES, INVOICE_STATUSES, Invoice } from '@/types'
import { calculateTax, calculateTotal } from '@/lib/utils/validation'
import AIDescriptionGenerator from '@/components/AIDescriptionGenerator'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function EditInvoicePage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [clients, setClients] = useState<Client[]>([])
  const [invoice, setInvoice] = useState<Invoice | null>(null)

  const [formData, setFormData] = useState({
    client_id: '',
    invoice_number: '',
    title: '',
    status: 'draft' as const,
    issue_date: '',
    due_date: '',
    currency: 'USD',
    tax_rate: 0,
    notes: '',
    payment_terms: '',
  })

  const [items, setItems] = useState<LineItem[]>([
    { description: '', quantity: 1, unit_price: 0, amount: 0, sort_order: 0 },
  ])

  useEffect(() => {
    if (user && params.id) {
      loadData()
    }
  }, [user, params.id])

  const loadData = async () => {
    if (!user) return

    const [clientsRes, invoiceRes] = await Promise.all([
      supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true }),
      supabase
        .from('invoices')
        .select('*')
        .eq('id', params.id as string)
        .eq('user_id', user.id)
        .single(),
    ])

    if (clientsRes.data) setClients(clientsRes.data)

    if (invoiceRes.error || !invoiceRes.data) {
      router.push('/business/invoices')
      return
    }

    const invoiceData = invoiceRes.data
    setInvoice(invoiceData)

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

    const { data: itemsData } = await supabase
      .from('invoice_items')
      .select('*')
      .eq('invoice_id', invoiceData.id)
      .order('sort_order', { ascending: true })

    if (itemsData && itemsData.length > 0) {
      setItems(
        itemsData.map((item) => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          amount: item.amount,
          sort_order: item.sort_order,
        }))
      )
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    // Auto-update title when client is selected
    if (name === 'client_id' && value) {
      const client = clients.find((c) => c.id === value)
      if (client) {
        setFormData((prev) => ({
          ...prev,
          client_id: value,
          title: `Invoice for ${client.name}`,
        }))
        return
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: name === 'tax_rate' ? Number(value) : value,
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
      { description: '', quantity: 1, unit_price: 0, amount: 0, sort_order: items.length },
    ])
  }

  const removeItem = (index: number) => {
    if (items.length === 1) return
    setItems(items.filter((_, i) => i !== index))
  }

  const handleAIGenerate = (index: number) => (description: string) => {
    handleItemChange(index, 'description', description)
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

    if (!user || !invoice) {
      setError('You must be logged in')
      setLoading(false)
      return
    }

    if (items.some((item) => !item.description.trim())) {
      setError('All line items must have a description')
      setLoading(false)
      return
    }

    try {
      const { subtotal, taxAmount, total } = calculateTotals()

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
        .eq('id', invoice.id)

      if (invoiceError) throw invoiceError

      // Delete old items
      await supabase.from('invoice_items').delete().eq('invoice_id', invoice.id)

      // Insert new items
      const itemsToInsert = items.map((item, index) => ({
        invoice_id: invoice.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        amount: item.amount,
        sort_order: index,
      }))

      const { error: itemsError } = await supabase.from('invoice_items').insert(itemsToInsert)

      if (itemsError) throw itemsError

      router.push('/business/invoices')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update invoice')
    } finally {
      setLoading(false)
    }
  }

  if (!invoice) {
    return <LoadingSpinner />
  }

  const { subtotal, taxAmount, total } = calculateTotals()
  const selectedClient = clients.find((c) => c.id === formData.client_id)

  return (
    <div className="max-w-5xl">
      <h1 className="text-3xl font-bold text-primary-50 mb-8">Edit Invoice</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="card">
          <h2 className="text-xl font-bold mb-4">Invoice Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="invoice_number" className="label">
                Invoice Number
              </label>
              <input
                type="text"
                id="invoice_number"
                name="invoice_number"
                required
                className="input"
                value={formData.invoice_number}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="client_id" className="label">
                Client
              </label>
              {selectedClient ? (
                <div className="input bg-primary-700 flex items-center justify-between">
                  <span>{selectedClient.name}</span>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, client_id: '' }))}
                    className="text-sm text-accent-400 hover:text-accent-300"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <select
                  id="client_id"
                  name="client_id"
                  className="input"
                  value={formData.client_id}
                  onChange={handleChange}
                >
                  <option value="">Select a client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="md:col-span-2">
              <label htmlFor="title" className="label">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                className="input"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="issue_date" className="label">
                Issue Date
              </label>
              <input
                type="date"
                id="issue_date"
                name="issue_date"
                required
                className="input"
                value={formData.issue_date}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="due_date" className="label">
                Due Date
              </label>
              <input
                type="date"
                id="due_date"
                name="due_date"
                className="input"
                value={formData.due_date}
                onChange={handleChange}
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
                {CURRENCIES.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.code} - {currency.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="status" className="label">
                Status
              </label>
              <select
                id="status"
                name="status"
                className="input"
                value={formData.status}
                onChange={handleChange}
              >
                {INVOICE_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Line Items</h2>
            <button type="button" onClick={addItem} className="btn btn-secondary text-sm">
              Add Item
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="border rounded p-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-6">
                    <label className="label">Description</label>
                    <div className="flex gap-2">
                      <textarea
                        className="input resize-none flex-1"
                        rows={2}
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        required
                      />
                      <AIDescriptionGenerator onGenerate={handleAIGenerate(index)} />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="label">Quantity</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="input"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="label">Unit Price</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="input"
                      value={item.unit_price}
                      onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="label">Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      className="input bg-primary-700"
                      value={item.amount}
                      readOnly
                    />
                  </div>
                </div>

                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium mt-2"
                  >
                    Remove Item
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-4">Additional Details</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="tax_rate" className="label">
                Tax Rate (%)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                id="tax_rate"
                name="tax_rate"
                className="input"
                value={formData.tax_rate}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="notes" className="label">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                className="input resize-none"
                rows={3}
                value={formData.notes}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="payment_terms" className="label">
                Payment Terms
              </label>
              <textarea
                id="payment_terms"
                name="payment_terms"
                className="input resize-none"
                rows={3}
                value={formData.payment_terms}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="card bg-primary-700">
          <div className="space-y-2">
            <div className="flex justify-between text-lg">
              <span>Subtotal:</span>
              <span className="font-medium">{subtotal.toFixed(2)} {formData.currency}</span>
            </div>
            <div className="flex justify-between text-lg">
              <span>Tax ({formData.tax_rate}%):</span>
              <span className="font-medium">{taxAmount.toFixed(2)} {formData.currency}</span>
            </div>
            <div className="flex justify-between text-2xl font-bold border-t pt-2">
              <span>Total:</span>
              <span>{total.toFixed(2)} {formData.currency}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Updating...' : 'Update Invoice'}
          </button>
        </div>
      </form>
    </div>
  )
}
