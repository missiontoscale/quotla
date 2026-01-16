'use client'

import { formatCurrency } from '@/lib/utils/currency'

interface CustomerPreviewCardProps {
  customer: {
    id: string
    name: string
    phone: string
    totalEarnings: number
    balance: number
    hasActiveQuotes: boolean
  }
  currency: string
  onClick: () => void
}

export function CustomerPreviewCard({ customer, currency, onClick }: CustomerPreviewCardProps) {
  const isOwing = customer.balance > 0

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-3 rounded-lg hover:bg-slate-800/50 transition-colors"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${
            isOwing ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-700 text-slate-300'
          }`}>
            {customer.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm text-slate-200 truncate">{customer.name}</p>
            <p className="text-xs text-slate-500 truncate">{customer.phone || 'No phone'}</p>
          </div>
        </div>
        <span className="text-sm text-slate-400 flex-shrink-0">
          {formatCurrency(customer.totalEarnings, currency)}
        </span>
      </div>
    </button>
  )
}
