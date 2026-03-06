'use client'

import { formatCurrency } from '@/lib/utils/currency'
import { AlertCircle, CheckCircle, Clock, XCircle, Send } from 'lucide-react'

interface InvoicePreviewCardProps {
  invoice: {
    id: string
    invoice_number: string
    client_name: string
    total: number
    status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
    due_date: string | null
  }
  currency: string
  onClick: () => void
}

const statusConfig = {
  draft: {
    icon: Clock,
    color: 'text-primary-400',
    accent: 'border-l-primary-500/40',
    amount: 'text-primary-300',
  },
  sent: {
    icon: Send,
    color: 'text-blue-400',
    accent: 'border-l-blue-400/50',
    amount: 'text-blue-300',
  },
  paid: {
    icon: CheckCircle,
    color: 'text-emerald-400',
    accent: 'border-l-emerald-400/70',
    amount: 'text-emerald-400',
  },
  overdue: {
    icon: AlertCircle,
    color: 'text-quotla-orange',
    accent: 'border-l-quotla-orange/70',
    amount: 'text-quotla-orange',
  },
  cancelled: {
    icon: XCircle,
    color: 'text-primary-500',
    accent: 'border-l-primary-600/40',
    amount: 'text-primary-400',
  },
}

export function InvoicePreviewCard({ invoice, currency, onClick }: InvoicePreviewCardProps) {
  const config = statusConfig[invoice.status]
  const StatusIcon = config.icon

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'No due date'
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-lg border-l-4 ${config.accent} bg-quotla-dark/60 hover:bg-quotla-dark/80 border border-primary-600/30 hover:border-quotla-green/30 transition-colors`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm text-primary-100 font-medium truncate">
          {invoice.invoice_number}
        </span>
        <span className={`text-sm font-semibold flex-shrink-0 ${config.amount}`}>
          {formatCurrency(invoice.total, currency)}
        </span>
      </div>
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs text-primary-400 truncate">
          {invoice.client_name}
        </span>
        <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
          <span className="text-xs text-primary-500">
            {formatDate(invoice.due_date)}
          </span>
          <StatusIcon className={`w-3.5 h-3.5 ${config.color}`} />
        </div>
      </div>
    </button>
  )
}