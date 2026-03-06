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
    bgColor: 'bg-primary-600/20',
    dotColor: 'bg-primary-400',
  },
  sent: {
    icon: Send,
    color: 'text-primary-300',
    bgColor: 'bg-primary-500/20',
    dotColor: 'bg-primary-300',
  },
  paid: {
    icon: CheckCircle,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20',
    dotColor: 'bg-emerald-400',
  },
  overdue: {
    icon: AlertCircle,
    color: 'text-quotla-orange',
    bgColor: 'bg-quotla-orange/20',
    dotColor: 'bg-quotla-orange',
  },
  cancelled: {
    icon: XCircle,
    color: 'text-primary-400',
    bgColor: 'bg-primary-700/20',
    dotColor: 'bg-primary-500',
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
      className="w-full text-left p-3 rounded-lg bg-primary-700/30 hover:bg-primary-700/50 transition-colors border border-primary-600/50 hover:border-primary-600"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`w-2 h-2 rounded-full flex-shrink-0 ${config.dotColor}`}
            title={invoice.status}
          />
          <span className="text-sm text-primary-100 font-medium truncate">
            {invoice.invoice_number}
          </span>
        </div>
        <span className={`text-sm flex-shrink-0 ${invoice.status === 'paid' ? 'text-emerald-400' : 'text-primary-300'}`}>
          {formatCurrency(invoice.total, currency)}
        </span>
      </div>
      <div className="flex items-center justify-between mt-1 pl-4">
        <span className="text-xs text-primary-400 truncate">
          {invoice.client_name}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-primary-400">
            {formatDate(invoice.due_date)}
          </span>
          <StatusIcon className={`w-3.5 h-3.5 flex-shrink-0 ${config.color}`} />
        </div>
      </div>
    </button>
  )
}
