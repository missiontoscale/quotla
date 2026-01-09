'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { Invoice, InvoiceWithItems } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { format } from 'date-fns'
import { formatCurrency } from '@/lib/utils/validation'
import SlideOver from './SlideOver'
import DownloadDropdown from './DownloadDropdown'

interface InvoicesSlideOverProps {
  isOpen: boolean
  onClose: () => void
}

export default function InvoicesSlideOver({ isOpen, onClose }: InvoicesSlideOverProps) {
  const { user, profile } = useAuth()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [invoicesWithItems, setInvoicesWithItems] = useState<Record<string, InvoiceWithItems>>({})
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    if (isOpen) {
      loadInvoices()
    }
  }, [user, isOpen])

  const loadInvoices = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setInvoices(data)
    }
    setLoading(false)
  }

  const loadInvoiceWithItems = async (invoiceId: string) => {
    if (invoicesWithItems[invoiceId]) return invoicesWithItems[invoiceId]

    const { data: invoiceData } = await supabase
      .from('invoices')
      .select('*, client:clients(*)')
      .eq('id', invoiceId)
      .maybeSingle()

    if (!invoiceData) return null

    const { data: itemsData } = await supabase
      .from('invoice_items')
      .select('*')
      .eq('invoice_id', invoiceId)
      .order('sort_order', { ascending: true })

    const fullInvoice = {
      ...(invoiceData as any),
      items: itemsData || [],
    } as InvoiceWithItems

    setInvoicesWithItems(prev => ({ ...prev, [invoiceId]: fullInvoice }))
    return fullInvoice
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return

    const { error } = await supabase.from('invoices').delete().eq('id', id)

    if (!error) {
      setInvoices(invoices.filter((i) => i.id !== id))
    }
  }

  const filteredInvoices = filter === 'all'
    ? invoices
    : invoices.filter((i) => i.status === filter)

  return (
    <SlideOver isOpen={isOpen} onClose={onClose} title="Invoices" size="xl">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Link
            href="/business/invoices"
            className="btn btn-primary"
            onClick={onClose}
          >
            Create Invoice
          </Link>
        </div>

        <div className="card">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded text-sm font-medium ${
                filter === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-primary-600 text-primary-200 hover:bg-primary-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('draft')}
              className={`px-4 py-2 rounded text-sm font-medium ${
                filter === 'draft'
                  ? 'bg-primary-600 text-white'
                  : 'bg-primary-600 text-primary-200 hover:bg-primary-600'
              }`}
            >
              Draft
            </button>
            <button
              onClick={() => setFilter('sent')}
              className={`px-4 py-2 rounded text-sm font-medium ${
                filter === 'sent'
                  ? 'bg-primary-600 text-white'
                  : 'bg-primary-600 text-primary-200 hover:bg-primary-600'
              }`}
            >
              Sent
            </button>
            <button
              onClick={() => setFilter('paid')}
              className={`px-4 py-2 rounded text-sm font-medium ${
                filter === 'paid'
                  ? 'bg-primary-600 text-white'
                  : 'bg-primary-600 text-primary-200 hover:bg-primary-600'
              }`}
            >
              Paid
            </button>
            <button
              onClick={() => setFilter('overdue')}
              className={`px-4 py-2 rounded text-sm font-medium ${
                filter === 'overdue'
                  ? 'bg-primary-600 text-white'
                  : 'bg-primary-600 text-primary-200 hover:bg-primary-600'
              }`}
            >
              Overdue
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-primary-400 mb-4">No invoices found</p>
            <Link
              href="/business/invoices"
              className="btn btn-primary inline-block"
              onClick={onClose}
            >
              Create Your First Invoice
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredInvoices.map((invoice) => (
              <div key={invoice.id} className="card hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold">{invoice.invoice_number}</h3>
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          invoice.status === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : invoice.status === 'sent'
                            ? 'bg-quotla-green/10 text-quotla-dark'
                            : invoice.status === 'overdue'
                            ? 'bg-red-100 text-red-800'
                            : invoice.status === 'cancelled'
                            ? 'bg-primary-600 text-primary-100'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </div>
                    {invoice.title && <p className="text-primary-300 mt-1">{invoice.title}</p>}
                    <div className="mt-2 text-sm text-primary-400">
                      <span>Issue Date: {format(new Date(invoice.issue_date), 'MMM d, yyyy')}</span>
                      {invoice.due_date && (
                        <span className="ml-4">
                          Due Date: {format(new Date(invoice.due_date), 'MMM d, yyyy')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary-50">
                      {formatCurrency(invoice.total, invoice.currency)}
                    </div>
                    <div className="mt-4 flex gap-2 flex-wrap">
                      <Link
                        href={`/invoices/${invoice.id}`}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                        onClick={onClose}
                      >
                        View
                      </Link>
                      <Link
                        href={`/invoices/${invoice.id}/edit`}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                        onClick={onClose}
                      >
                        Edit
                      </Link>
                      <DownloadDropdown
                        type="invoice"
                        data={invoicesWithItems[invoice.id] || { ...invoice, items: [], client: null }}
                        profile={profile}
                      />
                      <button
                        onClick={() => handleDelete(invoice.id)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </SlideOver>
  )
}
