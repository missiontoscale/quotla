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
    color: 'text-slate-400',
    bgColor: 'bg-slate-500/20',
    dotColor: 'bg-slate-400',
  },
  sent: {
    icon: Send,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    dotColor: 'bg-blue-400',
  },
  paid: {
    icon: CheckCircle,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20',
    dotColor: 'bg-emerald-400',
  },
  overdue: {
    icon: AlertCircle,
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/20',
    dotColor: 'bg-rose-400',
  },
  cancelled: {
    icon: XCircle,
    color: 'text-slate-500',
    bgColor: 'bg-slate-600/20',
    dotColor: 'bg-slate-500',
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
      className="w-full text-left p-3 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors border border-slate-700/50 hover:border-slate-600"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`w-2 h-2 rounded-full flex-shrink-0 ${config.dotColor}`}
            title={invoice.status}
          />
          <span className="text-sm text-slate-100 font-medium truncate">
            {invoice.invoice_number}
          </span>
        </div>
        <span className={`text-sm flex-shrink-0 ${invoice.status === 'paid' ? 'text-emerald-400' : 'text-slate-300'}`}>
          {formatCurrency(invoice.total, currency)}
        </span>
      </div>
      <div className="flex items-center justify-between mt-1 pl-4">
        <span className="text-xs text-slate-400 truncate">
          {invoice.client_name}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-500">
            {formatDate(invoice.due_date)}
          </span>
          <StatusIcon className={`w-3.5 h-3.5 flex-shrink-0 ${config.color}`} />
        </div>
      </div>
    </button>
  )
}
