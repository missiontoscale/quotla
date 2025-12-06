'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { Quote } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { format } from 'date-fns'
import { formatCurrency } from '@/lib/utils/validation'
import SlideOver from './SlideOver'

interface QuotesSlideOverProps {
  isOpen: boolean
  onClose: () => void
}

export default function QuotesSlideOver({ isOpen, onClose }: QuotesSlideOverProps) {
  const { user } = useAuth()
  const [quotes, setQuotes] = useState<Quote[]>([])
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
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('draft')}
              className={`px-4 py-2 rounded text-sm font-medium ${
                filter === 'draft'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Draft
            </button>
            <button
              onClick={() => setFilter('sent')}
              className={`px-4 py-2 rounded text-sm font-medium ${
                filter === 'sent'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Sent
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-4 py-2 rounded text-sm font-medium ${
                filter === 'approved'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
            <p className="text-gray-500 mb-4">No quotes found</p>
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
                            ? 'bg-blue-100 text-blue-800'
                            : quote.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : quote.status === 'expired'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {quote.status}
                      </span>
                    </div>
                    {quote.title && <p className="text-gray-600 mt-1">{quote.title}</p>}
                    <div className="mt-2 text-sm text-gray-500">
                      <span>Issue Date: {format(new Date(quote.issue_date), 'MMM d, yyyy')}</span>
                      {quote.valid_until && (
                        <span className="ml-4">
                          Valid Until: {format(new Date(quote.valid_until), 'MMM d, yyyy')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatCurrency(quote.total, quote.currency)}
                    </div>
                    <div className="mt-4 flex gap-2">
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
