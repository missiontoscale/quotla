'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { Quote } from '@/types'
import { format } from 'date-fns'
import { formatCurrency } from '@/lib/utils/validation'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function QuotesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'draft' | 'sent' | 'approved' | 'rejected' | 'expired'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (user) {
      loadQuotes()
    }
  }, [user, filter])

  const loadQuotes = async () => {
    if (!user) return

    setLoading(true)
    let query = supabase
      .from('quotes')
      .select('*, customer:customers!client_id(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (filter !== 'all') {
      query = query.eq('status', filter)
    }

    const { data, error } = await query

    if (!error && data) {
      setQuotes(data)
    }
    setLoading(false)
  }

  const filteredQuotes = quotes.filter(quote => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      quote.quote_number?.toLowerCase().includes(search) ||
      quote.title?.toLowerCase().includes(search) ||
      quote.client?.name?.toLowerCase().includes(search)
    )
  })

  const stats = {
    total: quotes.length,
    draft: quotes.filter(q => q.status === 'draft').length,
    sent: quotes.filter(q => q.status === 'sent').length,
    approved: quotes.filter(q => q.status === 'approved').length,
    rejected: quotes.filter(q => q.status === 'rejected').length,
    expired: quotes.filter(q => q.status === 'expired').length,
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-quotla-light/30 to-quotla-green/10 dark:from-primary-800 dark:via-quotla-dark dark:to-primary-800 transition-colors">
      <div className="absolute inset-0 bg-[url('/images/patterns/grid/Quotla%20grid%20pattern%20light.svg')] bg-cover bg-center opacity-5 dark:opacity-[0.05] pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-quotla-dark dark:text-primary-50">
              Quotes
            </h1>
            <p className="font-sans text-sm text-gray-600 dark:text-primary-400 mt-1">
              Manage all your quotes in one place
            </p>
          </div>
          <button
            onClick={() => router.push('/create')}
            className="px-5 py-2.5 rounded-xl bg-quotla-orange text-white text-sm font-semibold hover:bg-secondary-600 transition-all shadow-lg shadow-quotla-orange/30 hover:shadow-xl hover:-translate-y-0.5"
          >
            + New Quote
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6">
          {[
            { label: 'All', value: stats.total, filter: 'all', color: 'bg-quotla-green' },
            { label: 'Draft', value: stats.draft, filter: 'draft', color: 'bg-gray-500' },
            { label: 'Sent', value: stats.sent, filter: 'sent', color: 'bg-blue-500' },
            { label: 'Approved', value: stats.approved, filter: 'approved', color: 'bg-green-500' },
            { label: 'Rejected', value: stats.rejected, filter: 'rejected', color: 'bg-red-500' },
            { label: 'Expired', value: stats.expired, filter: 'expired', color: 'bg-orange-500' },
          ].map((stat) => (
            <button
              key={stat.filter}
              onClick={() => setFilter(stat.filter as typeof filter)}
              className={`p-3 sm:p-4 rounded-xl border-2 transition-all ${
                filter === stat.filter
                  ? 'border-quotla-orange bg-quotla-orange/10 dark:bg-quotla-orange/20'
                  : 'border-primary-200 dark:border-primary-600 bg-white dark:bg-primary-700 hover:border-quotla-orange/50'
              }`}
            >
              <div className="flex items-center gap-2 justify-center mb-1">
                <div className={`w-2 h-2 rounded-full ${stat.color}`}></div>
                <div className="font-sans text-xs font-semibold text-gray-600 dark:text-primary-400 uppercase">
                  {stat.label}
                </div>
              </div>
              <div className="font-heading text-xl sm:text-2xl font-bold text-quotla-dark dark:text-primary-50">
                {stat.value}
              </div>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search quotes by number, title, or client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-primary-200 dark:border-primary-600 bg-white dark:bg-primary-700 text-quotla-dark dark:text-primary-50 focus:border-quotla-orange focus:outline-none transition-all"
          />
        </div>

        {/* Quotes List */}
        {filteredQuotes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredQuotes.map((quote) => (
              <Link
                key={quote.id}
                href={`/quotes/${quote.id}`}
                className="group bg-white dark:bg-primary-700 rounded-2xl p-5 sm:p-6 border-2 border-primary-200 dark:border-quotla-light/20 hover:border-quotla-orange dark:hover:border-quotla-orange hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-quotla-green"></div>
                    <span className="font-sans text-xs font-bold text-gray-600 dark:text-primary-400 uppercase">
                      Quote
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                      quote.status === 'approved'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : quote.status === 'sent'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        : quote.status === 'rejected'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        : quote.status === 'expired'
                        ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                        : 'bg-gray-100 text-gray-700 dark:bg-primary-600 dark:text-primary-100'
                    }`}
                  >
                    {quote.status}
                  </span>
                </div>

                <div className="font-heading font-bold text-lg text-quotla-dark dark:text-primary-50 mb-1 group-hover:text-quotla-orange transition-colors">
                  {quote.quote_number}
                </div>

                {quote.title && (
                  <div className="font-sans text-sm text-gray-600 dark:text-primary-400 mb-3">
                    {quote.title}
                  </div>
                )}

                {quote.client && (
                  <div className="font-sans text-sm text-gray-700 dark:text-primary-300 mb-3 font-medium">
                    {quote.client.name}
                  </div>
                )}

                <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-primary-600">
                  <div className="font-heading font-bold text-lg text-quotla-orange">
                    {formatCurrency(quote.total, quote.currency)}
                  </div>
                  <div className="font-sans text-xs text-gray-500 dark:text-primary-400">
                    {format(new Date(quote.created_at), 'MMM d, yyyy')}
                  </div>
                </div>

                {quote.valid_until && (
                  <div className="font-sans text-xs text-gray-500 dark:text-primary-400 mt-2">
                    Valid until: {format(new Date(quote.valid_until), 'MMM d, yyyy')}
                  </div>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-primary-700 rounded-2xl border-2 border-dashed border-primary-300 dark:border-primary-600">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-quotla-orange to-quotla-green mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="font-heading text-xl font-bold text-quotla-dark dark:text-primary-50 mb-2">
              {searchTerm ? 'No quotes found' : 'No quotes yet'}
            </h3>
            <p className="font-sans text-sm text-gray-600 dark:text-primary-400 mb-6">
              {searchTerm
                ? 'Try adjusting your search terms'
                : 'Start by creating your first quote'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => router.push('/create')}
                className="inline-block px-5 py-2.5 rounded-xl bg-quotla-orange text-white text-sm font-semibold hover:bg-secondary-600 transition-all shadow-lg shadow-quotla-orange/30 hover:shadow-xl hover:-translate-y-0.5"
              >
                Create Your First Quote
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
