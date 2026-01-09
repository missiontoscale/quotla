'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { Quote, Invoice } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { format } from 'date-fns'
import { formatCurrency } from '@/lib/utils/validation'

type Deal = (Quote | Invoice) & { type: 'quote' | 'invoice' }

export default function DealsPage() {
  const { user } = useAuth()
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'quotes' | 'invoices'>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    loadDeals()
  }, [user])

  const loadDeals = async () => {
    if (!user) return

    const [quotesRes, invoicesRes] = await Promise.all([
      supabase
        .from('quotes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
    ])

    const allDeals: Deal[] = [
      ...(quotesRes.data || []).map(q => ({ ...q, type: 'quote' as const })),
      ...(invoicesRes.data || []).map(i => ({ ...i, type: 'invoice' as const }))
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    setDeals(allDeals)
    setLoading(false)
  }

  const filteredDeals = deals.filter(deal => {
    if (filter !== 'all' && deal.type !== filter.slice(0, -1)) return false
    if (statusFilter !== 'all' && deal.status !== statusFilter) return false
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="font-heading text-3xl font-bold text-primary-50">All Sealed Deals</h1>
          <Link
            href="/business/dashboard"
            className="px-4 py-2 text-sm font-medium text-primary-200 hover:text-primary-50 transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'all'
                  ? 'bg-quotla-orange text-white shadow-md shadow-quotla-orange/40'
                  : 'bg-white border border-primary-200 text-primary-600 hover:bg-primary-50'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('quotes')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'quotes'
                  ? 'bg-quotla-orange text-white shadow-md shadow-quotla-orange/40'
                  : 'bg-white border border-primary-200 text-primary-600 hover:bg-primary-50'
              }`}
            >
              Quotes
            </button>
            <button
              onClick={() => setFilter('invoices')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'invoices'
                  ? 'bg-quotla-orange text-white shadow-md shadow-quotla-orange/40'
                  : 'bg-white border border-primary-200 text-primary-600 hover:bg-primary-50'
              }`}
            >
              Invoices
            </button>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-white border border-primary-200 text-primary-600 hover:bg-primary-50 transition-all"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="approved">Approved</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="rejected">Rejected</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Deals Grid */}
      {filteredDeals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDeals.map((deal) => (
            <Link
              key={deal.id}
              href={deal.type === 'quote' ? `/quotes/${deal.id}` : `/invoices/${deal.id}`}
              className="block p-5 border-2 border-primary-600 rounded-lg hover:border-quotla-green hover:bg-primary-700 transition-all card"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${deal.type === 'quote' ? 'bg-quotla-green' : 'bg-green-500'}`}></div>
                  <span className="text-xs font-medium text-primary-400 uppercase">{deal.type}</span>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded ${
                    deal.status === 'approved' || deal.status === 'paid'
                      ? 'bg-green-100 text-green-800'
                      : deal.status === 'sent'
                      ? 'bg-quotla-green/10 text-quotla-dark'
                      : deal.status === 'overdue'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-primary-600 text-primary-100'
                  }`}
                >
                  {deal.status}
                </span>
              </div>
              <div className="font-heading font-semibold text-lg text-primary-50 mb-2">
                {deal.type === 'quote' ? (deal as any).quote_number : (deal as any).invoice_number}
              </div>
              {deal.title && <div className="font-sans text-sm text-primary-300 mb-3">{deal.title}</div>}
              <div className="flex justify-between items-center pt-3 border-t border-primary-600">
                <div className="font-bold text-quotla-orange">{formatCurrency(deal.total, deal.currency)}</div>
                <div className="text-xs text-primary-400">
                  {format(new Date(deal.created_at), 'MMM d, yyyy')}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="text-center py-16 text-primary-400">
            <svg className="w-20 h-20 mx-auto mb-4 text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-lg mb-2 font-heading">No deals found</p>
            <p className="text-sm text-primary-400">Try adjusting your filters</p>
          </div>
        </div>
      )}
    </div>
  )
}
