'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { QuoteWithItems } from '@/types'
import { format } from 'date-fns'
import { formatCurrency } from '@/lib/utils/validation'
import ExportButtons from '@/components/ExportButtons'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function ViewQuotePage() {
  const router = useRouter()
  const params = useParams()
  const { user, profile } = useAuth()
  const [quote, setQuote] = useState<QuoteWithItems | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && params.id) {
      loadQuote()
    }
  }, [user, params.id])

  const loadQuote = async () => {
    if (!user) return

    const { data: quoteData, error: quoteError } = await supabase
      .from('quotes')
      .select('*, client:clients(*)')
      .eq('id', params.id as string)
      .eq('user_id', user.id)
      .single()

    if (quoteError || !quoteData) {
      router.push('/quotes')
      return
    }

    const { data: itemsData } = await supabase
      .from('quote_items')
      .select('*')
      .eq('quote_id', quoteData.id)
      .order('sort_order', { ascending: true })

    setQuote({
      ...quoteData,
      items: itemsData || [],
    })
    setLoading(false)
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!quote) return

    const { error } = await supabase.from('quotes').update({ status: newStatus }).eq('id', quote.id)

    if (!error) {
      setQuote({ ...quote, status: newStatus as QuoteWithItems['status'] })
    }
  }

  const handleConvertToInvoice = async () => {
    if (!quote || !user) return

    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        user_id: user.id,
        client_id: quote.client_id,
        invoice_number: `INV-${Date.now()}`,
        title: quote.title,
        status: 'draft',
        issue_date: new Date().toISOString().split('T')[0],
        due_date: null,
        currency: quote.currency,
        subtotal: quote.subtotal,
        tax_rate: quote.tax_rate,
        tax_amount: quote.tax_amount,
        total: quote.total,
        notes: quote.notes,
        payment_terms: quote.terms,
      })
      .select()
      .single()

    if (invoiceError || !invoice) return

    const itemsToInsert = quote.items.map((item, index) => ({
      invoice_id: invoice.id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      amount: item.amount,
      sort_order: index,
    }))

    await supabase.from('invoice_items').insert(itemsToInsert)

    router.push(`/invoices/${invoice.id}`)
  }

  if (loading || !quote) {
    return <LoadingSpinner />
  }

  return (
    <div className="max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary-50">Quote #{quote.quote_number}</h1>
          {quote.title && <p className="text-primary-300 mt-1">{quote.title}</p>}
        </div>
        <div className="flex gap-2">
          <ExportButtons type="quote" data={quote} profile={profile} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h2 className="text-lg font-bold mb-4">Quote Details</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-primary-300">Status:</span>
              <select
                value={quote.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="input w-auto text-sm"
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="expired">Expired</option>
              </select>
            </div>
            <div className="flex justify-between">
              <span className="text-primary-300">Issue Date:</span>
              <span>{format(new Date(quote.issue_date), 'MMM d, yyyy')}</span>
            </div>
            {quote.valid_until && (
              <div className="flex justify-between">
                <span className="text-primary-300">Valid Until:</span>
                <span>{format(new Date(quote.valid_until), 'MMM d, yyyy')}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-primary-300">Currency:</span>
              <span>{quote.currency}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-bold mb-4">Client</h2>
          {quote.client ? (
            <div className="space-y-2">
              <div className="font-medium">{quote.client.name}</div>
              {quote.client.email && <div className="text-primary-300">{quote.client.email}</div>}
              {quote.client.phone && <div className="text-primary-300">{quote.client.phone}</div>}
              {quote.client.address && (
                <div className="text-primary-300">
                  {quote.client.address}
                  <br />
                  {quote.client.city} {quote.client.state} {quote.client.postal_code}
                  <br />
                  {quote.client.country}
                </div>
              )}
            </div>
          ) : (
            <p className="text-primary-400">No client assigned</p>
          )}
        </div>
      </div>

      <div className="card mb-8">
        <h2 className="text-lg font-bold mb-4">Line Items</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Description</th>
                <th className="text-center py-3 px-4">Qty</th>
                <th className="text-right py-3 px-4">Unit Price</th>
                <th className="text-right py-3 px-4">Amount</th>
              </tr>
            </thead>
            <tbody>
              {quote.items.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="py-3 px-4">{item.description}</td>
                  <td className="text-center py-3 px-4">{item.quantity}</td>
                  <td className="text-right py-3 px-4">{formatCurrency(item.unit_price, quote.currency)}</td>
                  <td className="text-right py-3 px-4">{formatCurrency(item.amount, quote.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 border-t pt-4">
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(quote.subtotal, quote.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax ({quote.tax_rate}%):</span>
                <span>{formatCurrency(quote.tax_amount, quote.currency)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold border-t pt-2">
                <span>Total:</span>
                <span>{formatCurrency(quote.total, quote.currency)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {quote.notes && (
        <div className="card mb-8">
          <h2 className="text-lg font-bold mb-4">Notes</h2>
          <p className="text-primary-200 whitespace-pre-wrap">{quote.notes}</p>
        </div>
      )}

      {quote.terms && (
        <div className="card mb-8">
          <h2 className="text-lg font-bold mb-4">Terms & Conditions</h2>
          <p className="text-primary-200 whitespace-pre-wrap">{quote.terms}</p>
        </div>
      )}

      <div className="flex justify-between items-center">
        <Link href="/quotes" className="btn btn-secondary">
          Back to Quotes
        </Link>
        <div className="flex gap-2">
          <Link href={`/quotes/${quote.id}/edit`} className="btn btn-secondary">
            Edit Quote
          </Link>
          <button onClick={handleConvertToInvoice} className="btn btn-primary">
            Convert to Invoice
          </button>
        </div>
      </div>
    </div>
  )
}
