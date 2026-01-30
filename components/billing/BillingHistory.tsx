'use client'

import { Receipt, Download, ExternalLink, FileText } from 'lucide-react'
import type { StripeInvoice } from '@/types'

interface BillingHistoryProps {
  invoices: StripeInvoice[]
  onManageBilling: () => void
}

export function BillingHistory({ invoices, onManageBilling }: BillingHistoryProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100)
  }

  const getStatusColor = (status: StripeInvoice['status']) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-700'
      case 'open':
        return 'bg-blue-100 text-blue-700'
      case 'draft':
        return 'bg-gray-100 text-gray-700'
      case 'uncollectible':
      case 'void':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">Billing History</h3>
        </div>
        <button
          onClick={onManageBilling}
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          View All
          <ExternalLink className="h-3 w-3" />
        </button>
      </div>

      {invoices.length === 0 ? (
        <div className="mt-4 rounded-lg border-2 border-dashed border-gray-200 p-6 text-center">
          <FileText className="mx-auto h-8 w-8 text-gray-300" />
          <p className="mt-2 text-sm text-gray-500">No billing history yet</p>
        </div>
      ) : (
        <div className="mt-4">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                <th className="pb-3">Date</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {invoices.slice(0, 5).map((invoice) => (
                <tr key={invoice.id} className="text-sm">
                  <td className="py-3 text-gray-900">{formatDate(invoice.period_start)}</td>
                  <td className="py-3 font-medium text-gray-900">
                    {formatAmount(invoice.amount_due, invoice.currency)}
                  </td>
                  <td className="py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${getStatusColor(
                        invoice.status
                      )}`}
                    >
                      {invoice.status}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    {invoice.invoice_pdf ? (
                      <a
                        href={invoice.invoice_pdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    ) : invoice.hosted_invoice_url ? (
                      <a
                        href={invoice.hosted_invoice_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
