'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { Client, LineItem, CURRENCIES, QUOTE_STATUSES } from '@/types'
import { calculateTax, calculateTotal } from '@/lib/utils/validation'
import AIDescriptionGenerator from '@/components/AIDescriptionGenerator'
import CurrencyConverter from '@/components/CurrencyConverter'
import InlineClientCreator from '@/components/InlineClientCreator'
import InventoryItemSelector from '@/components/InventoryItemSelector'
import { v4 as uuidv4 } from 'uuid'
import { retrieveTransferData, getLegacyAIData, cleanupExpiredTransfers } from '@/lib/utils/secure-transfer'

export default function NewQuotePage() {
  const router = useRouter()
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [aiLoaded, setAiLoaded] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [showClientCreator, setShowClientCreator] = useState(false)

  const [formData, setFormData] = useState({
    client_id: '',
    quote_number: `QT-${Date.now()}`,
    title: '',
    status: 'draft' as const,
    issue_date: new Date().toISOString().split('T')[0],
    valid_until: '',
    currency: profile?.default_currency || 'USD',
    tax_rate: 0,
    notes: '',
    terms: '',
  })

  const [items, setItems] = useState<LineItem[]>([
    { name: '', description: '', quantity: 1, unit_price: 0, amount: 0, sort_order: 0 },
  ])

  useEffect(() => {
    loadClients()
    loadAIData()
  }, [user])

  const loadAIData = async () => {
    // Check if there's AI-generated data
    if (typeof window === 'undefined') return

    // Cleanup expired transfers on page load
    cleanupExpiredTransfers()

    const params = new URLSearchParams(window.location.search)

    // ✅ SECURE: Try new secure transfer method first
    const transferId = params.get('transfer')
    let aiData = null

    if (transferId) {
      // Retrieve from sessionStorage using transfer ID
      aiData = retrieveTransferData(transferId, 'quote')

      if (!aiData) {
        console.error('Failed to retrieve transfer data. It may have expired.')
        setError('The quote data has expired. Please generate a new quote.')
        return
      }
    } else {
      // ⚠️ LEGACY: Fallback to old URL-based method (for backward compatibility)
      aiData = getLegacyAIData(params)
    }

    if (aiData && user) {
      try {

        // Try to find matching client by name
        let matchedClientId = ''
        if (aiData.client_name) {
          const { data: existingClients } = await supabase
            .from('clients')
            .select('id, name')
            .eq('user_id', user.id)
            .ilike('name', `%${aiData.client_name}%`)
            .limit(1)

          if (existingClients && existingClients.length > 0) {
            matchedClientId = existingClients[0].id
          }
        }

        // Populate form with AI data
        setFormData(prev => ({
          ...prev,
          client_id: matchedClientId,
          title: aiData.title || `Quote for ${aiData.client_name}`,
          currency: aiData.currency || prev.currency,
          tax_rate: aiData.tax_rate || prev.tax_rate,
          notes: aiData.notes || prev.notes,
          valid_until: aiData.valid_until || prev.valid_until,
        }))

        // Populate items
        if (aiData.items && aiData.items.length > 0) {
          setItems(aiData.items.map((item: any, index: number) => ({
            description: item.description || '',
            quantity: item.quantity || 1,
            unit_price: item.unit_price || 0,
            amount: (item.quantity || 1) * (item.unit_price || 0),
            sort_order: index,
          })))
        }

        // Clear the URL parameter after loading
        window.history.replaceState({}, '', '/quotes/new')

        // Show success message
        setAiLoaded(true)
        setTimeout(() => setAiLoaded(false), 5000)
      } catch (err) {
        console.error('Error loading AI data:', err)
        setError('Failed to load AI-generated data')
      }
    }
  }

  const loadClients = async () => {
    if (!user) return

    const { data } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', user.id)
      .order('name', { ascending: true })

    if (data) setClients(data)
  }

  const handleClientCreated = (newClient: Client) => {
    setClients([...clients, newClient])
    setFormData((prev) => ({ ...prev, client_id: newClient.id }))
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

  const incrementQuantity = (index: number) => {
    const newItems = [...items]
    const newQty = newItems[index].quantity + 1
    newItems[index].quantity = newQty
    newItems[index].amount = Number((newQty * newItems[index].unit_price).toFixed(2))
    setItems(newItems)
  }

  const decrementQuantity = (index: number) => {
    const newItems = [...items]
    const newQty = Math.max(1, newItems[index].quantity - 1)
    newItems[index].quantity = newQty
    newItems[index].amount = Number((newQty * newItems[index].unit_price).toFixed(2))
    setItems(newItems)
  }

  const removeItem = (index: number) => {
    if (items.length === 1) return
    setItems(items.filter((_, i) => i !== index))
  }

  const handleAIGenerate = (index: number) => (description: string) => {
    handleItemChange(index, 'description', description)
  }

  const handleCurrencyConvert = (newAmount: number, newCurrency: string) => {
    const currentTotal = calculateTotals().total
    if (currentTotal === 0) return

    const ratio = newAmount / currentTotal

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

      const { data: quote, error: quoteError } = await supabase
        .from('quotes')
        .insert({
          user_id: user.id,
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
        .select()
        .single()

      if (quoteError) throw quoteError

      const itemsToInsert = items.map((item, index) => ({
        quote_id: quote.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        amount: item.amount,
        sort_order: index,
      }))

      const { error: itemsError } = await supabase
        .from('quote_items')
        .insert(itemsToInsert)

      if (itemsError) throw itemsError

      router.push('/quotes')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create quote')
    } finally {
      setLoading(false)
    }
  }

  const { subtotal, taxAmount, total } = calculateTotals()

  return (
    <div className="max-w-5xl">
      <h1 className="text-3xl font-bold text-primary-50 mb-8">Create New Quote</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {aiLoaded && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Quote successfully generated from AI! Review and adjust the details below, then save.</span>
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
              <div className="flex gap-2">
                <select
                  id="client_id"
                  name="client_id"
                  className="input flex-1"
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
                <button
                  type="button"
                  onClick={() => setShowClientCreator(true)}
                  className="px-3 py-2 rounded-lg bg-quotla-orange text-white text-sm font-semibold hover:bg-secondary-600 transition-all shadow-sm whitespace-nowrap"
                >
                  + Add Client
                </button>
              </div>
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
              <div key={index} className="border border-primary-600 rounded-lg p-5 bg-primary-800/30 hover:bg-primary-800/50 transition-colors">
                {/* Inventory Item Selector */}
                <div className="mb-4">
                  <label className="label">Select from Inventory (Optional)</label>
                  <InventoryItemSelector
                    onSelect={handleInventoryItemSelected(index)}
                    currency={formData.currency}
                  />
                </div>

                {/* Product Name */}
                <div className="mb-4">
                  <label htmlFor={`name-${index}`} className="label">
                    Product/Service Name {!item.inventory_item_id && <span className="text-red-500">*</span>}
                    {item.inventory_item_id && <span className="text-xs text-quotla-orange ml-2">📦 From Inventory</span>}
                  </label>
                  <input
                    type="text"
                    id={`name-${index}`}
                    className={`input ${item.inventory_item_id ? 'cursor-not-allowed opacity-75' : ''}`}
                    value={item.name || ''}
                    onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                    placeholder="e.g., Premium Widget, Consulting Service"
                    required={!item.inventory_item_id}
                    readOnly={!!item.inventory_item_id}
                    disabled={!!item.inventory_item_id}
                  />
                </div>

                {/* Description */}
                <div className="mb-4">
                  <label htmlFor={`description-${index}`} className="label">
                    {item.inventory_item_id ? 'Description (From Inventory)' : 'Description (Optional)'}
                  </label>
                  <div className="flex gap-2">
                    <textarea
                      id={`description-${index}`}
                      className={`input resize-none flex-1 ${item.inventory_item_id ? 'cursor-not-allowed opacity-75' : ''}`}
                      rows={2}
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      placeholder="Additional details about this item..."
                      readOnly={!!item.inventory_item_id}
                      disabled={!!item.inventory_item_id}
                    />
                    {!item.inventory_item_id && <AIDescriptionGenerator onGenerate={handleAIGenerate(index)} />}
                  </div>
                </div>

                {/* Quantity, Price, Amount Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                  {/* Quantity with +/- buttons */}
                  <div className="md:col-span-3">
                    <label className="label">Quantity</label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => decrementQuantity(index)}
                        className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary-600 hover:bg-primary-500 text-quotla-light font-bold text-xl transition-all active:scale-95"
                        title="Decrease quantity"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        step="0.01"
                        min="1"
                        className="input text-center font-semibold"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => incrementQuantity(index)}
                        className="w-10 h-10 flex items-center justify-center rounded-lg bg-quotla-green hover:opacity-90 text-white font-bold text-xl transition-all active:scale-95"
                        title="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Unit Price */}
                  <div className="md:col-span-3">
                    <label htmlFor={`unit-price-${index}`} className="label">
                      Unit Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-300 font-medium">
                        {formData.currency}
                      </span>
                      <input
                        type="number"
                        id={`unit-price-${index}`}
                        step="0.01"
                        min="0"
                        className="input pl-16"
                        value={item.unit_price}
                        onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Amount (calculated) */}
                  <div className="md:col-span-4">
                    <label className="label">Amount</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-quotla-orange font-semibold">
                        {formData.currency}
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        className="input bg-primary-700 pl-16 font-bold text-quotla-orange"
                        value={item.amount}
                        readOnly
                      />
                    </div>
                  </div>

                  {/* Remove Button */}
                  {items.length > 1 && (
                    <div className="md:col-span-2 flex items-end">
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="w-full h-10 flex items-center justify-center gap-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 font-medium transition-all active:scale-95"
                        title="Remove item"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Remove
                      </button>
                    </div>
                  )}
                </div>
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
            {loading ? 'Creating...' : 'Create Quote'}
          </button>
        </div>
      </form>

      {/* Inline Client Creator Modal */}
      <InlineClientCreator
        isOpen={showClientCreator}
        onClose={() => setShowClientCreator(false)}
        onClientCreated={handleClientCreated}
      />
    </div>
  )
}
