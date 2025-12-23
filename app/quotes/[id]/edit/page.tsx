'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { Client, LineItem, CURRENCIES, QUOTE_STATUSES, Quote, QuoteItem } from '@/types'
import { calculateTax, calculateTotal } from '@/lib/utils/validation'
import AIDescriptionGenerator from '@/components/AIDescriptionGenerator'
import CurrencyConverter from '@/components/CurrencyConverter'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function EditQuotePage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [clients, setClients] = useState<Client[]>([])
  const [quote, setQuote] = useState<Quote | null>(null)

  const [formData, setFormData] = useState({
    client_id: '',
    quote_number: '',
    title: '',
    status: 'draft' as const,
    issue_date: '',
    valid_until: '',
    currency: 'USD',
    tax_rate: 0,
    notes: '',
    terms: '',
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

    const [clientsRes, quoteRes] = await Promise.all([
      supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true }),
      supabase
        .from('quotes')
        .select('*')
        .eq('id', params.id as string)
        .eq('user_id', user.id)
        .single(),
    ])

    if (clientsRes.data) setClients(clientsRes.data)

    if (quoteRes.error || !quoteRes.data) {
      router.push('/quotes')
      return
    }

    const quoteData = quoteRes.data
    setQuote(quoteData)

    setFormData({
      client_id: quoteData.client_id || '',
      quote_number: quoteData.quote_number,
      title: quoteData.title || '',
      status: quoteData.status,
      issue_date: quoteData.issue_date,
      valid_until: quoteData.valid_until || '',
      currency: quoteData.currency,
      tax_rate: quoteData.tax_rate,
      notes: quoteData.notes || '',
      terms: quoteData.terms || '',
    })

    const { data: itemsData } = await supabase
      .from('quote_items')
      .select('*')
      .eq('quote_id', quoteData.id)
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

  const handleCurrencyConvert = (newAmount: number, newCurrency: string) => {
    // Calculate the conversion ratio
    const currentTotal = calculateTotals().total
    if (currentTotal === 0) return

    const ratio = newAmount / currentTotal

    // Update all item prices proportionally
    const newItems = items.map((item) => ({
      ...item,
      unit_price: Number((item.unit_price * ratio).toFixed(2)),
      amount: Number((item.amount * ratio).toFixed(2)),
    }))

    setItems(newItems)
    setFormData((prev) => ({ ...prev, currency: newCurrency }))
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

    if (!user || !quote) {
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

      const { error: quoteError } = await supabase
        .from('quotes')
        .update({
          client_id: formData.client_id || null,
          quote_number: formData.quote_number,
          title: formData.title || null,
          status: formData.status,
          issue_date: formData.issue_date,
          valid_until: formData.valid_until || null,
          currency: formData.currency,
          subtotal,
          tax_rate: formData.tax_rate,
          tax_amount: taxAmount,
          total,
          notes: formData.notes || null,
          terms: formData.terms || null,
        })
        .eq('id', quote.id)

      if (quoteError) throw quoteError

      // Delete old items
      await supabase.from('quote_items').delete().eq('quote_id', quote.id)

      // Insert new items
      const itemsToInsert = items.map((item, index) => ({
        quote_id: quote.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        amount: item.amount,
        sort_order: index,
      }))

      const { error: itemsError } = await supabase.from('quote_items').insert(itemsToInsert)

      if (itemsError) throw itemsError

      router.push('/quotes')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update quote')
    } finally {
      setLoading(false)
    }
  }

  if (!quote) {
    return <LoadingSpinner />
  }

  const { subtotal, taxAmount, total } = calculateTotals()

  return (
    <div className="max-w-5xl">
      <h1 className="text-3xl font-bold text-primary-50 mb-8">Edit Quote</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="card">
          <h2 className="text-xl font-bold mb-4">Quote Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="quote_number" className="label">
                Quote Number
              </label>
              <input
                type="text"
                id="quote_number"
                name="quote_number"
                required
                className="input"
                value={formData.quote_number}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="client_id" className="label">
                Client
              </label>
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
              <label htmlFor="valid_until" className="label">
                Valid Until
              </label>
              <input
                type="date"
                id="valid_until"
                name="valid_until"
                className="input"
                value={formData.valid_until}
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
                {QUOTE_STATUSES.map((status) => (
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
              <label htmlFor="terms" className="label">
                Terms & Conditions
              </label>
              <textarea
                id="terms"
                name="terms"
                className="input resize-none"
                rows={3}
                value={formData.terms}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="card bg-primary-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Totals</h2>
            <CurrencyConverter
              currentAmount={total}
              currentCurrency={formData.currency}
              onConvert={handleCurrencyConvert}
            />
          </div>
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
            {loading ? 'Updating...' : 'Update Quote'}
          </button>
        </div>
      </form>
    </div>
  )
}
