'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { Invoice, InvoiceItem, Client, InvoiceWithItems } from '@/types'
import { format } from 'date-fns'
import { formatCurrency, validateImageUrl } from '@/lib/utils/validation'
import ExportButtons from '@/components/ExportButtons'
import LoadingSpinner from '@/components/LoadingSpinner'
import { ScheduleMeetingModal } from '@/components/ScheduleMeetingModal'

export default function ViewInvoicePage() {
  const params = useParams()
  const router = useRouter()
  const { user, profile } = useAuth()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [items, setItems] = useState<InvoiceItem[]>([])
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [showScheduleModal, setShowScheduleModal] = useState(false)

  useEffect(() => {
    loadInvoice()
  }, [params.id, user])

  const loadInvoice = async () => {
    if (!user || !params.id) return

    const { data: invoiceData, error: invoiceError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', params.id as string)
      .eq('user_id', user.id)
      .single()

    if (invoiceError || !invoiceData) {
      router.push('/invoices')
      return
    }

    setInvoice(invoiceData)

    const { data: itemsData } = await supabase
      .from('invoice_items')
      .select('*')
      .eq('invoice_id', invoiceData.id)
      .order('sort_order', { ascending: true })

    if (itemsData) setItems(itemsData)

    if (invoiceData.client_id) {
      const { data: clientData } = await supabase
        .from('clients')
        .select('*')
        .eq('id', invoiceData.client_id)
        .single()

      if (clientData) setClient(clientData)
    }

    setLoading(false)
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (!invoice) {
    return null
  }

  return (
    <div className="min-h-screen bg-primary-700 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-between items-center">
          <Link href="/business/invoices" className="text-primary-600 hover:text-primary-700">
            ← Back to Invoices
          </Link>
          <div className="flex gap-2">
            {client?.email && (
              <button
                onClick={() => setShowScheduleModal(true)}
                className="btn btn-secondary flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Schedule Follow-up
              </button>
            )}
            <ExportButtons
              type="invoice"
              data={{
                ...invoice,
                items,
                client,
              } as InvoiceWithItems}
              profile={profile}
            />
            <Link href={`/invoices/${invoice.id}/edit`} className="btn btn-secondary">
              Edit Invoice
            </Link>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              {profile?.logo_url && validateImageUrl(profile.logo_url) && (
                <img src={validateImageUrl(profile.logo_url)!} alt="Logo" className="h-16 mb-4" />
              )}
              <h1 className="text-3xl font-bold text-primary-50">INVOICE</h1>
              <p className="text-primary-300">{invoice.invoice_number}</p>
            </div>
            <div className="text-right">
              {profile?.company_name && (
                <div className="font-bold text-lg mb-1">{profile.company_name}</div>
              )}
              {profile?.address && <div className="text-sm text-primary-300">{profile.address}</div>}
              {profile?.city && profile?.state && (
                <div className="text-sm text-primary-300">
                  {profile.city}, {profile.state} {profile.postal_code}
                </div>
              )}
              {profile?.phone && <div className="text-sm text-primary-300">{profile.phone}</div>}
              {profile?.email && <div className="text-sm text-primary-300">{profile.email}</div>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b">
            <div>
              <h3 className="font-bold text-primary-50 mb-2">Bill To:</h3>
              {client ? (
                <div className="text-sm text-primary-300">
                  <div className="font-medium text-primary-50">{client.name}</div>
                  {client.company_name && <div>{client.company_name}</div>}
                  {client.address && <div>{client.address}</div>}
                  {client.city && client.state && (
                    <div>
                      {client.city}, {client.state} {client.postal_code}
                    </div>
                  )}
                  {client.email && <div>{client.email}</div>}
                  {client.phone && <div>{client.phone}</div>}
                </div>
              ) : (
                <div className="text-sm text-primary-300">No client specified</div>
              )}
            </div>

            <div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-primary-300">Issue Date:</span>
                  <span className="font-medium">{format(new Date(invoice.issue_date), 'MMM d, yyyy')}</span>
                </div>
                {invoice.due_date && (
                  <div className="flex justify-between">
                    <span className="text-primary-300">Due Date:</span>
                    <span className="font-medium">{format(new Date(invoice.due_date), 'MMM d, yyyy')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-primary-300">Status:</span>
                  <span className={`font-medium capitalize ${
                    invoice.status === 'paid' ? 'text-green-600' :
                    invoice.status === 'overdue' ? 'text-red-600' :
                    'text-primary-50'
                  }`}>
                    {invoice.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {invoice.title && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-primary-50">{invoice.title}</h2>
            </div>
          )}

          <table className="w-full mb-8">
            <thead>
              <tr className="border-b-2 border-primary-500">
                <th className="text-left py-3 px-2">Description</th>
                <th className="text-right py-3 px-2 w-24">Quantity</th>
                <th className="text-right py-3 px-2 w-32">Unit Price</th>
                <th className="text-right py-3 px-2 w-32">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="py-3 px-2">{item.description}</td>
                  <td className="text-right py-3 px-2">{item.quantity}</td>
                  <td className="text-right py-3 px-2">{formatCurrency(item.unit_price, invoice.currency)}</td>
                  <td className="text-right py-3 px-2">{formatCurrency(item.amount, invoice.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end mb-8">
            <div className="w-64 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(invoice.subtotal, invoice.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax ({invoice.tax_rate}%):</span>
                <span>{formatCurrency(invoice.tax_amount, invoice.currency)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold border-t pt-2">
                <span>Total:</span>
                <span>{formatCurrency(invoice.total, invoice.currency)}</span>
              </div>
            </div>
          </div>

          {invoice.notes && (
            <div className="mb-6">
              <h3 className="font-bold text-primary-50 mb-2">Notes:</h3>
              <p className="text-sm text-primary-300 whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          )}

          {invoice.payment_terms && (
            <div>
              <h3 className="font-bold text-primary-50 mb-2">Payment Terms:</h3>
              <p className="text-sm text-primary-300 whitespace-pre-wrap">{invoice.payment_terms}</p>
            </div>
          )}
        </div>
      </div>

      {/* Schedule Meeting Modal */}
      <ScheduleMeetingModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        clientId={client?.id}
        clientEmail={client?.email || ''}
        clientName={client?.name || ''}
        invoiceId={invoice.id}
      />
    </div>
  )
}
