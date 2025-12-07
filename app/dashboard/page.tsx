'use client'

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Quote, Invoice } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { format } from 'date-fns'
import { formatCurrency } from '@/lib/utils/validation'
import { getRandomGreeting } from '@/lib/greetings'
import CreateModal from '@/components/CreateModal'
import InvoicesSlideOver from '@/components/InvoicesSlideOver'
import QuotesSlideOver from '@/components/QuotesSlideOver'
import ClientsSlideOver from '@/components/ClientsSlideOver'

function DashboardContent() {
  const { user, profile } = useAuth()
  const searchParams = useSearchParams()
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isInvoicesSlideOverOpen, setIsInvoicesSlideOverOpen] = useState(false)
  const [isQuotesSlideOverOpen, setIsQuotesSlideOverOpen] = useState(false)
  const [isClientsSlideOverOpen, setIsClientsSlideOverOpen] = useState(false)
  const [displayedGreeting, setDisplayedGreeting] = useState('')
  const [fullGreeting, setFullGreeting] = useState('')

  useEffect(() => {
    loadData()
  }, [user])

  useEffect(() => {
    // Check URL params to open slide-overs
    if (searchParams.get('invoices') === 'open') {
      setIsInvoicesSlideOverOpen(true)
    }
    if (searchParams.get('quotes') === 'open') {
      setIsQuotesSlideOverOpen(true)
    }
    if (searchParams.get('clients') === 'open') {
      setIsClientsSlideOverOpen(true)
    }
  }, [searchParams])

  useEffect(() => {
    // Set a random greeting on mount
    const greeting = getRandomGreeting()
    setFullGreeting(greeting)
    setDisplayedGreeting('')

    // Typing animation
    let index = 0
    const typingInterval = setInterval(() => {
      if (index < greeting.length) {
        setDisplayedGreeting(greeting.substring(0, index + 1))
        index++
      } else {
        clearInterval(typingInterval)
      }
    }, 50) // 50ms per character

    return () => clearInterval(typingInterval)
  }, [])

  const loadData = async () => {
    if (!user) return

    const [quotesRes, invoicesRes] = await Promise.all([
      supabase
        .from('quotes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5),
    ])

    if (quotesRes.data) setQuotes(quotesRes.data)
    if (invoicesRes.data) setInvoices(invoicesRes.data)
    setLoading(false)
  }

  const stats = {
    totalQuotes: quotes.length,
    totalInvoices: invoices.length,
    totalRevenue: invoices.filter((i) => i.status === 'paid').reduce((sum, invoice) => sum + invoice.total, 0),
    paidInvoices: invoices.filter((i) => i.status === 'paid').length,
    pendingInvoices: invoices.filter((i) => i.status === 'sent').length,
    draftQuotes: quotes.filter((q) => q.status === 'draft').length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <>
      <div className="text-left mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-left mb-4">
          {displayedGreeting}{profile?.company_name ? `, ${profile.company_name}` : ''}
          {displayedGreeting.length < fullGreeting.length && <span className="animate-pulse">|</span>}
        </h1>
        <p className="text-gray-600 text-left">Here's what's up with your business . . . </p>
      </div>

      {/* Action Buttons */}
      <div className="card bg-gradient-to-br from-primary-50 to-white border-2 border-primary-200 mb-12">
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="w-full flex items-center gap-3 sm:gap-4 px-4 sm:px-8 py-4 sm:py-6 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl group mb-6"
        >
          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
            <svg className="w-5 h-5 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <div className="flex-1 text-left">
            <div className="font-bold text-base sm:text-xl">Intelligent generation in seconds</div>
            <div className="text-xs sm:text-sm opacity-90 mt-1">Create invoices and quotes through natural conversation</div>
          </div>
          <svg className="w-5 h-5 sm:w-6 sm:h-6 opacity-75 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Secondary Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            href="/quotes/new"
            className="flex items-center gap-3 px-4 py-3 bg-white border-2 border-primary-200 text-primary-600 rounded-lg hover:bg-primary-50 transition-all"
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div className="flex-1 text-left">
              <div className="font-semibold text-sm sm:text-base">New Quote</div>
              <div className="text-xs">Manual creation</div>
            </div>
          </Link>
          <Link
            href="/invoices/new"
            className="flex items-center gap-3 px-4 py-3 bg-white border-2 border-primary-200 text-primary-600 rounded-lg hover:bg-primary-50 transition-all"
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <div className="flex-1 text-left">
              <div className="font-semibold text-sm sm:text-base">New Invoice</div>
              <div className="text-xs">Manual creation</div>
            </div>
          </Link>
          <button
            onClick={() => setIsClientsSlideOverOpen(true)}
            className="flex items-center gap-3 px-4 py-3 bg-white border-2 border-primary-200 text-primary-600 rounded-lg hover:bg-primary-50 transition-all text-left"
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <div className="flex-1 text-left">
              <div className="font-semibold text-sm sm:text-base">Manage Clients</div>
              <div className="text-xs">View all clients</div>
            </div>
          </button>
        </div>
      </div>

      {/* Overview Card with Stats */}
      <div className="card">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-left mb-6">Overview</h2>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="text-xs text-gray-600 text-left">Total Quotes</div>
            <div className="text-2xl font-bold text-gray-900 mt-1 text-left">{stats.totalQuotes}</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="text-xs text-gray-600 text-left">Draft Quotes</div>
            <div className="text-2xl font-bold text-gray-500 mt-1 text-left">{stats.draftQuotes}</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="text-xs text-gray-600 text-left">Total Invoices</div>
            <div className="text-2xl font-bold text-gray-900 mt-1 text-left">{stats.totalInvoices}</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="text-xs text-gray-600 text-left">Pending Invoices</div>
            <div className="text-2xl font-bold text-blue-600 mt-1 text-left">{stats.pendingInvoices}</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="text-xs text-gray-600 text-left">Paid Invoices</div>
            <div className="text-2xl font-bold text-green-600 mt-1 text-left">{stats.paidInvoices}</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="text-xs text-gray-600 text-left">Total Revenue</div>
            <div className="text-xl font-bold text-primary-600 mt-1 text-left">{formatCurrency(stats.totalRevenue, invoices[0]?.currency || 'USD')}</div>
          </div>
        </div>

        {/* Recent Documents Section */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
            <h3 className="text-lg font-semibold text-gray-900 text-left">Recent Documents</h3>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => setIsQuotesSlideOverOpen(true)}
                className="text-primary-600 hover:text-primary-700 text-xs sm:text-sm font-medium px-3 py-1 rounded-lg border border-primary-200 hover:bg-primary-50 transition-colors flex-1 sm:flex-initial"
              >
                View Quotes
              </button>
              <button
                onClick={() => setIsInvoicesSlideOverOpen(true)}
                className="text-primary-600 hover:text-primary-700 text-xs sm:text-sm font-medium px-3 py-1 rounded-lg border border-primary-200 hover:bg-primary-50 transition-colors flex-1 sm:flex-initial"
              >
                View Invoices
              </button>
            </div>
          </div>

          {quotes.length === 0 && invoices.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <svg className="w-20 h-20 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg mb-2">No documents yet</p>
              <p className="text-sm text-gray-400 mb-6">Start by creating your first quote or invoice</p>
              <button onClick={() => setIsCreateModalOpen(true)} className="px-6 py-3 rounded-xl bg-gray-900 text-white hover:bg-gray-800 transition-all shadow-lg font-semibold">
                Create now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...quotes.map(q => ({...q, type: 'quote' as const})), ...invoices.map(i => ({...i, type: 'invoice' as const}))]
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .slice(0, 10)
                .map((doc) => (
                  <Link
                    key={`${doc.type}-${doc.id}`}
                    href={`/${doc.type}s/${doc.id}`}
                    className="block p-4 border-2 border-gray-100 rounded-lg hover:border-primary-200 hover:bg-gray-50 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${doc.type === 'quote' ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                        <span className="text-xs font-medium text-gray-500 uppercase">{doc.type}</span>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          doc.status === 'paid' || doc.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : doc.status === 'sent'
                            ? 'bg-blue-100 text-blue-800'
                            : doc.status === 'overdue'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {doc.status}
                      </span>
                    </div>
                    <div className="font-semibold text-gray-900">{doc.type === 'quote' ? (doc as any).quote_number : (doc as any).invoice_number}</div>
                    {doc.title && <div className="text-sm text-gray-600 mt-1">{doc.title}</div>}
                    {doc.client_name && <div className="text-xs text-gray-500 mt-1">{doc.client_name}</div>}
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                      <div className="font-bold text-gray-900">{formatCurrency(doc.total, doc.currency)}</div>
                      <div className="text-xs text-gray-500">
                        {format(new Date(doc.created_at), 'MMM d, yyyy')}
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals and Slide-Overs */}
      <CreateModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
      <InvoicesSlideOver isOpen={isInvoicesSlideOverOpen} onClose={() => setIsInvoicesSlideOverOpen(false)} />
      <QuotesSlideOver isOpen={isQuotesSlideOverOpen} onClose={() => setIsQuotesSlideOverOpen(false)} />
      <ClientsSlideOver isOpen={isClientsSlideOverOpen} onClose={() => setIsClientsSlideOverOpen(false)} />
    </>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}
