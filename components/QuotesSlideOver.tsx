'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { Quote, QuoteWithItems } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { format } from 'date-fns'
import { formatCurrency } from '@/lib/utils/validation'
import SlideOver from './SlideOver'
import DownloadDropdown from './DownloadDropdown'

interface QuotesSlideOverProps {
  isOpen: boolean
  onClose: () => void
}

export default function QuotesSlideOver({ isOpen, onClose }: QuotesSlideOverProps) {
  const { user, profile } = useAuth()
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [quotesWithItems, setQuotesWithItems] = useState<Record<string, QuoteWithItems>>({})
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    if (isOpen) {
      loadQuotes()
    }
  }, [user, isOpen])

  const loadQuotes = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setQuotes(data)
    }
    setLoading(false)
  }

  const loadQuoteWithItems = async (quoteId: string) => {
    if (quotesWithItems[quoteId]) return quotesWithItems[quoteId]

    const { data: quoteData } = await supabase
      .from('quotes')
      .select('*, client:clients(*)')
      .eq('id', quoteId)
      .maybeSingle()

    if (!quoteData) return null

    const { data: itemsData } = await supabase
      .from('quote_items')
      .select('*')
      .eq('quote_id', quoteId)
      .order('sort_order', { ascending: true })

    const fullQuote = {
      ...(quoteData as any),
      items: itemsData || [],
    } as QuoteWithItems

    setQuotesWithItems(prev => ({ ...prev, [quoteId]: fullQuote }))
    return fullQuote
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this quote?')) return

    const { error } = await supabase.from('quotes').delete().eq('id', id)

    if (!error) {
      setQuotes(quotes.filter((q) => q.id !== id))
    }
  }

  const filteredQuotes = filter === 'all'
    ? quotes
    : quotes.filter((q) => q.status === filter)

  return (
    <SlideOver isOpen={isOpen} onClose={onClose} title="Quotes" size="xl">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Link
            href="/quotes/new"
            className="btn btn-primary"
            onClick={onClose}
          >
            Create Quote
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
              onClick={() => setFilter('approved')}
              className={`px-4 py-2 rounded text-sm font-medium ${
                filter === 'approved'
                  ? 'bg-primary-600 text-white'
                  : 'bg-primary-600 text-primary-200 hover:bg-primary-600'
              }`}
            >
              Approved
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredQuotes.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-primary-400 mb-4">No quotes found</p>
            <Link
              href="/quotes/new"
              className="btn btn-primary inline-block"
              onClick={onClose}
            >
              Create Your First Quote
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredQuotes.map((quote) => (
              <div key={quote.id} className="card hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold">{quote.quote_number}</h3>
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          quote.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : quote.status === 'sent'
                            ? 'bg-quotla-green/10 text-quotla-dark'
                            : quote.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : quote.status === 'expired'
                            ? 'bg-primary-600 text-primary-100'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {quote.status}
                      </span>
                    </div>
                    {quote.title && <p className="text-primary-300 mt-1">{quote.title}</p>}
                    <div className="mt-2 text-sm text-primary-400">
                      <span>Issue Date: {format(new Date(quote.issue_date), 'MMM d, yyyy')}</span>
                      {quote.valid_until && (
                        <span className="ml-4">
                          Valid Until: {format(new Date(quote.valid_until), 'MMM d, yyyy')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary-50">
                      {formatCurrency(quote.total, quote.currency)}
                    </div>
                    <div className="mt-4 flex gap-2 flex-wrap">
                      <Link
                        href={`/quotes/${quote.id}`}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                        onClick={onClose}
                      >
                        View
                      </Link>
                      <Link
                        href={`/quotes/${quote.id}/edit`}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                        onClick={onClose}
                      >
                        Edit
                      </Link>
                      <DownloadDropdown
                        type="quote"
                        data={quotesWithItems[quote.id] || { ...quote, items: [], client: null }}
                        profile={profile}
                      />
                      <button
                        onClick={() => handleDelete(quote.id)}
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
