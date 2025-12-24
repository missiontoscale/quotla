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
import QuotlaChat from '@/components/QuotlaChat'
import CreateModal from '@/components/CreateModal'

function DashboardContent() {
  const { user, profile } = useAuth()
  const searchParams = useSearchParams()
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isSealedDealsSlideOverOpen, setIsSealedDealsSlideOverOpen] = useState(false)
  const [displayedGreeting, setDisplayedGreeting] = useState('')
  const [fullGreeting, setFullGreeting] = useState('')

  useEffect(() => {
    loadData()
  }, [user])

  useEffect(() => {
    // Check URL params to open slide-over
    if (searchParams.get('deals') === 'open') {
      setIsSealedDealsSlideOverOpen(true)
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
        .limit(10),
      supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10),
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

  const dealsSealed = stats.totalQuotes + stats.totalInvoices
  const userStatus = dealsSealed > 100 ? 'Baller' : dealsSealed < 10 ? 'Growing' : 'Progressing'

  // Combine quotes and invoices for unified view
  const allDeals = [
    ...quotes.map(q => ({ ...q, type: 'quote' as const })),
    ...invoices.map(i => ({ ...i, type: 'invoice' as const }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

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
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-primary-50 mb-2">
          {displayedGreeting}{profile?.company_name ? `, ${profile.company_name}` : ''}
          {displayedGreeting.length < fullGreeting.length && <span className="animate-pulse">|</span>}
        </h1>
      </div>

      {/* Overview Section - First Pane */}
      <div className="card mb-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Status Badge (20% width on desktop) */}
          <div className="lg:w-1/5">
            <div className={`p-6 rounded-xl text-center ${
              userStatus === 'Baller' ? 'bg-gradient-to-br from-quotla-orange to-secondary-600' :
              userStatus === 'Growing' ? 'bg-gradient-to-br from-quotla-green to-primary-500' :
              'bg-gradient-to-br from-primary-600 to-primary-500'
            }`}>
              <div className="font-sans text-sm font-medium text-white/80 mb-2">Status</div>
              <div className="font-heading text-3xl font-bold text-white">{userStatus}</div>
            </div>
          </div>

          {/* Right: Deals Summary (80% width on desktop) */}
          <div className="lg:w-4/5 flex items-center">
            <div className="w-full">
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-primary-50 mb-3">
                Hey {profile?.company_name || profile?.email?.split('@')[0] || 'there'},
              </h2>
              <p className="font-sans text-lg text-primary-200 leading-relaxed mb-3">
                You have sealed <span className="font-bold text-quotla-orange">{dealsSealed}</span> deals, worth over{' '}
                <span className="font-bold text-quotla-orange">{formatCurrency(stats.totalRevenue, invoices[0]?.currency || 'USD')}</span>,
                creating <span className="font-semibold text-quotla-green">{stats.totalQuotes}</span> quotes and{' '}
                <span className="font-semibold text-quotla-green">{stats.totalInvoices}</span> invoices along the way.
              </p>
              <p className="font-sans text-base font-semibold text-primary-300">Good job!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Interface & Manual Creation - Second Pane */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Chat Interface (100% width, fits container) */}
          <div className="lg:col-span-12">
            <QuotlaChat />
          </div>
        </div>

        {/* Manual Creation Section */}
        <div className="mt-6 pt-6 border-t border-primary-600">
          <h3 className="font-heading text-lg font-semibold text-primary-50 mb-4">Do it my way</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/quotes/new"
              className="flex items-center gap-3 px-4 py-3 bg-white border-2 border-primary-200 text-primary-600 rounded-lg hover:bg-primary-50 transition-all"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div className="flex-1 text-left">
                <div className="font-heading font-semibold text-sm">New Quote</div>
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
                <div className="font-heading font-semibold text-sm">New Invoice</div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Sealed Deals - Unified Section */}
      {allDeals.length > 0 && (
        <div className="card mb-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-heading font-bold text-primary-50">Sealed Deals</h3>
            <Link
              href="/dashboard/deals"
              className="text-quotla-orange hover:text-secondary-600 text-sm font-medium px-4 py-2 rounded-lg border border-quotla-orange/30 hover:bg-quotla-orange/10 transition-colors"
            >
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allDeals.slice(0, 6).map((deal) => (
              <Link
                key={deal.id}
                href={deal.type === 'quote' ? `/quotes/${deal.id}` : `/invoices/${deal.id}`}
                className="block p-5 border-2 border-primary-600 rounded-lg hover:border-quotla-green hover:bg-primary-700 transition-all"
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
        </div>
      )}

      {/* Empty State */}
      {allDeals.length === 0 && (
        <div className="card">
          <div className="text-center py-16 text-primary-400">
            <svg className="w-20 h-20 mx-auto mb-4 text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-lg mb-2 font-heading">No documents yet</p>
            <p className="text-sm text-primary-400 mb-6">Start by creating your first quote or invoice</p>
            <button onClick={() => setIsCreateModalOpen(true)} className="px-6 py-3 rounded-xl bg-quotla-orange text-white hover:bg-secondary-600 transition-all shadow-lg shadow-quotla-orange/40 hover:shadow-quotla-orange/60 font-semibold">
              Create now
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
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
