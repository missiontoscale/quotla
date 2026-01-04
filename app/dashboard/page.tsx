'use client'

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
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
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [displayedGreeting, setDisplayedGreeting] = useState('')
  const [fullGreeting, setFullGreeting] = useState('')
  const [inventoryStats, setInventoryStats] = useState({
    total_items: 0,
    low_stock_count: 0,
    total_value: 0
  })
  const [expenseStats, setExpenseStats] = useState({
    month_total: 0,
    tax_deductible: 0,
    expense_count: 0
  })

  useEffect(() => {
    loadData()
  }, [user])

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

    // Get current month dates
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()

    const [quotesRes, invoicesRes, inventoryRes, expensesRes] = await Promise.all([
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
      supabase
        .from('inventory_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true),
      supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .gte('expense_date', startOfMonth)
        .lte('expense_date', endOfMonth)
    ])

    if (quotesRes.data) setQuotes(quotesRes.data)
    if (invoicesRes.data) setInvoices(invoicesRes.data)

    // Calculate inventory stats
    if (inventoryRes.data) {
      const items = inventoryRes.data
      setInventoryStats({
        total_items: items.length,
        low_stock_count: items.filter(item =>
          item.track_inventory && item.quantity_on_hand <= item.low_stock_threshold
        ).length,
        total_value: items.reduce((sum, item) =>
          sum + (item.quantity_on_hand * item.cost_price), 0
        )
      })
    }

    // Calculate expense stats
    if (expensesRes.data) {
      const expenses = expensesRes.data
      setExpenseStats({
        month_total: expenses.reduce((sum, exp) => sum + exp.amount, 0),
        tax_deductible: expenses.filter(exp => exp.is_tax_deductible).reduce((sum, exp) => sum + exp.amount, 0),
        expense_count: expenses.length
      })
    }

    setLoading(false)
  }

  const stats = {
    totalQuotes: quotes.length,
    totalInvoices: invoices.length,
    totalRevenue: invoices.filter((i) => i.status === 'paid').reduce((sum, invoice) => sum + invoice.total, 0),
    paidInvoices: invoices.filter((i) => i.status === 'paid').length,
    pendingInvoices: invoices.filter((i) => i.status === 'sent').length,
    draftQuotes: quotes.filter((q) => q.status === 'draft').length,
    outstandingRevenue: invoices.filter((i) => i.status === 'sent').reduce((sum, invoice) => sum + invoice.total, 0),
    overdueInvoices: invoices.filter((i) => i.status === 'overdue').length,
  }

  const dealsSealed = stats.totalQuotes + stats.totalInvoices

  // Combine quotes and invoices for unified view
  const allDeals = [
    ...quotes.map(q => ({ ...q, type: 'quote' as const })),
    ...invoices.map(i => ({ ...i, type: 'invoice' as const }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-quotla-orange border-t-transparent"></div>
      </div>
    )
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-white via-quotla-light/30 to-quotla-green/10 dark:from-primary-800 dark:via-quotla-dark dark:to-primary-800 transition-colors">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-[url('/images/patterns/grid/Quotla%20grid%20pattern%20light.svg')] bg-cover bg-center opacity-5 dark:opacity-[0.05] pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Hero Section with Greeting */}
        <section className="mb-8 sm:mb-10">
          <div className="text-left">
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-quotla-dark dark:text-primary-50 transition-colors leading-tight">
              {displayedGreeting}{profile?.company_name ? `, ${profile.company_name}` : ''}
              {displayedGreeting.length < fullGreeting.length && <span className="animate-pulse">|</span>}
            </h1>
          </div>
        </section>

        {/* Pane 1: AI Chat Interface - Full Width */}
        <section className="mb-8 sm:mb-10 w-full">
          <div className="bg-white dark:bg-primary-700 rounded-2xl sm:rounded-3xl shadow-lg border border-primary-200 dark:border-quotla-light/20 overflow-hidden transition-colors">
            <QuotlaChat />
          </div>
        </section>

        {/* Pane 2: Sealed Deals (Left) + Insights (Right) - Responsive Grid */}
        <section className="mb-10 sm:mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Card 1: Sealed Deals - Left Side */}
            <div className="bg-white dark:bg-primary-700 rounded-2xl shadow-lg border border-primary-200 dark:border-quotla-light/20 overflow-hidden transition-colors">
              <div className="p-5 sm:p-6">
                <div className="flex items-center justify-between mb-0">
                  <h3 className="font-heading text-lg sm:text-xl font-bold text-quotla-dark dark:text-primary-50">
                    Your Deals
                  </h3>
                  {allDeals.length > 0 && (
                    <Link
                      href="/dashboard/deals"
                      className="text-quotla-orange hover:text-secondary-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  )}
                  
                </div>
                <p className="font-sans text-sm sm:text-base text-gray-600 dark:text-primary-400">Your latest quotes and invoices</p>
                  
                <div className="border-t border-gray-200 dark:border-primary-600"></div>

                {allDeals.length > 0 ? (
                  <div className="mt-4 space-y-3 max-h-[400px] overflow-y-auto">
                    {allDeals.slice(0, 6).map((deal) => (
                      <Link
                        key={deal.id}
                        href={deal.type === 'quote' ? `/quotes/${deal.id}` : `/invoices/${deal.id}`}
                        className="group block p-3 sm:p-4 border border-primary-200 dark:border-primary-600 rounded-xl hover:border-quotla-orange dark:hover:border-quotla-orange hover:shadow-md transition-all"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${deal.type === 'quote' ? 'bg-quotla-green' : 'bg-purple-500'}`}></div>
                            <span className="font-sans text-xs font-bold text-gray-600 dark:text-primary-400 uppercase">
                              {deal.type}
                            </span>
                          </div>
                          <span
                            className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                              deal.status === 'approved' || deal.status === 'paid'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : deal.status === 'sent'
                                ? 'bg-quotla-green/10 text-quotla-dark dark:bg-quotla-green/20 dark:text-quotla-light'
                                : deal.status === 'overdue'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                : 'bg-gray-100 text-gray-700 dark:bg-primary-600 dark:text-primary-100'
                            }`}
                          >
                            {deal.status}
                          </span>
                        </div>
                        <div className="font-heading font-bold text-sm text-quotla-dark dark:text-primary-50 mb-1 group-hover:text-quotla-orange transition-colors">
                          {deal.type === 'quote' ? (deal as any).quote_number : (deal as any).invoice_number}
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="font-heading font-bold text-sm text-quotla-orange">
                            {formatCurrency(deal.total, deal.currency)}
                          </div>
                          <div className="font-sans text-xs text-gray-500 dark:text-primary-400">
                            {format(new Date(deal.created_at), 'MMM d, yyyy')}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 text-center py-10">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-quotla-orange to-quotla-green mb-4 shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="font-heading text-lg font-bold text-quotla-dark dark:text-primary-50 mb-2">
                      No deals yet
                    </h3>
                    <p className="font-sans text-sm text-gray-600 dark:text-primary-400 mb-4">
                      Start your journey by creating your first quote or invoice using AI or manual forms
                    </p>
                    <button
                      onClick={() => setIsCreateModalOpen(true)}
                      className="px-5 py-2.5 rounded-xl bg-quotla-orange text-white text-sm font-semibold hover:bg-secondary-600 transition-all shadow-lg shadow-quotla-orange/30 hover:shadow-xl hover:-translate-y-0.5"
                    >
                      Create Your First Deal
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Card 2: Insights - Right Side */}
            <div className="bg-white dark:bg-primary-700 rounded-2xl shadow-lg border border-primary-200 dark:border-quotla-light/20 overflow-hidden transition-colors">
              <div className="p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading text-lg sm:text-xl font-bold text-quotla-dark dark:text-primary-50">
                    Insights
                  </h3>
                  <Link
                    href="/dashboard/analytics"
                    className="text-quotla-orange hover:text-secondary-600 transition-colors"
                    aria-label="View detailed analytics"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
                <div className="border-t border-gray-200 dark:border-primary-600"></div>

                {/* Chart Placeholder - Using simple bar representation */}
                <div className="mt-4 h-[280px] flex items-end justify-around gap-2 px-2">
                  {[
                    { label: 'Quotes', value: stats.totalQuotes, color: 'bg-quotla-green' },
                    { label: 'Invoices', value: stats.totalInvoices, color: 'bg-purple-500' },
                    { label: 'Paid', value: stats.paidInvoices, color: 'bg-quotla-orange' },
                    { label: 'Pending', value: stats.pendingInvoices, color: 'bg-yellow-500' }
                  ].map((item, index) => {
                    const maxValue = Math.max(stats.totalQuotes, stats.totalInvoices, stats.paidInvoices, stats.pendingInvoices, 1)
                    const heightPercent = (item.value / maxValue) * 75
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full flex flex-col justify-end items-center" style={{ height: '220px' }}>
                          <div className="font-heading font-bold text-base text-quotla-dark dark:text-primary-50 mb-2">
                            {item.value}
                          </div>
                          <div
                            className={`w-full ${item.color} rounded-t-lg transition-all shadow-sm`}
                            style={{ height: `${heightPercent}%`, minHeight: item.value > 0 ? '30px' : '0px' }}
                          ></div>
                        </div>
                        <div className="font-sans text-xs font-semibold text-gray-600 dark:text-primary-400 text-center">
                          {item.label}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Business Overview - Overview Row */}
        <section className="mb-10 sm:mb-12">
          <h2 className="font-heading text-2xl font-bold text-quotla-dark dark:text-quotla-light mb-6">Business Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
            {/* Total Revenue Card - Most important metric first */}
            <div className="group relative bg-white dark:bg-primary-700 rounded-2xl p-5 sm:p-6 border border-primary-200 dark:border-quotla-light/20 shadow-sm hover:border-quotla-green dark:hover:border-quotla-green hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="font-sans text-xs sm:text-sm font-semibold text-gray-600 dark:text-primary-400 uppercase tracking-wide">Total Revenue</div>
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-quotla-green flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-md">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="font-heading text-2xl sm:text-3xl font-bold text-quotla-dark dark:text-quotla-light mb-1">
                {formatCurrency(stats.totalRevenue, invoices[0]?.currency || 'USD')}
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-quotla-green/10 text-quotla-green dark:bg-quotla-green/20">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {stats.paidInvoices} paid
                </span>
                <span className="text-gray-600 dark:text-primary-400">of {stats.totalInvoices} invoices</span>
              </div>
            </div>

            {/* Outstanding Revenue Card - Context for cash flow */}
            <div className="group relative bg-white dark:bg-primary-700 rounded-2xl p-5 sm:p-6 border border-primary-200 dark:border-quotla-light/20 shadow-sm hover:border-quotla-orange dark:hover:border-quotla-orange hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="font-sans text-xs sm:text-sm font-semibold text-gray-600 dark:text-primary-400 uppercase tracking-wide">Outstanding</div>
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-quotla-orange flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-md">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="font-heading text-2xl sm:text-3xl font-bold text-quotla-dark dark:text-quotla-light mb-1">
                {formatCurrency(stats.outstandingRevenue, invoices[0]?.currency || 'USD')}
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-quotla-orange/10 text-quotla-orange dark:bg-quotla-orange/20">
                  {stats.pendingInvoices} pending
                </span>
                {stats.overdueInvoices > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {stats.overdueInvoices} overdue
                  </span>
                )}
              </div>
            </div>

            {/* Activity Summary Card */}
            <div className="group relative bg-white dark:bg-primary-700 rounded-2xl p-5 sm:p-6 border border-primary-200 dark:border-quotla-light/20 shadow-sm hover:border-primary-400 dark:hover:border-primary-400 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="font-sans text-xs sm:text-sm font-semibold text-gray-600 dark:text-primary-400 uppercase tracking-wide">Activity</div>
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary-600 flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-md">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div className="font-heading text-2xl sm:text-3xl font-bold text-quotla-dark dark:text-quotla-light mb-1">
                {dealsSealed}
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <span className="text-gray-600 dark:text-primary-400">Total deals:</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-quotla-green/10 text-quotla-green dark:bg-quotla-green/20">
                  {stats.totalQuotes} quotes
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary-200 text-primary-800 dark:bg-primary-600 dark:text-primary-100">
                  {stats.totalInvoices} invoices
                </span>
              </div>
            </div>

            {/* Inventory Card */}
            <Link href="/inventory" className="group relative bg-white dark:bg-primary-700 rounded-2xl p-5 sm:p-6 border border-primary-200 dark:border-quotla-light/20 shadow-sm hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="font-sans text-xs sm:text-sm font-semibold text-gray-600 dark:text-primary-400 uppercase tracking-wide">Inventory</div>
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-500 flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-md">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
              <div className="font-heading text-2xl sm:text-3xl font-bold text-quotla-dark dark:text-quotla-light mb-1">
                {inventoryStats.total_items}
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                {inventoryStats.low_stock_count > 0 ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {inventoryStats.low_stock_count} low stock
                  </span>
                ) : (
                  <span className="text-gray-600 dark:text-primary-400">All items stocked</span>
                )}
              </div>
            </Link>

            {/* Monthly Expenses Card */}
            <Link href="/dashboard/analytics" className="group relative bg-white dark:bg-primary-700 rounded-2xl p-5 sm:p-6 border border-primary-200 dark:border-quotla-light/20 shadow-sm hover:border-red-500 dark:hover:border-red-400 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="font-sans text-xs sm:text-sm font-semibold text-gray-600 dark:text-primary-400 uppercase tracking-wide">Expenses (MTD)</div>
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-red-500 flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-md">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
                  </svg>
                </div>
              </div>
              <div className="font-heading text-2xl sm:text-3xl font-bold text-quotla-dark dark:text-quotla-light mb-1">
                {formatCurrency(expenseStats.month_total, invoices[0]?.currency || 'USD')}
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                {expenseStats.expense_count > 0 ? (
                  <>
                    <span className="text-gray-600 dark:text-primary-400">{expenseStats.expense_count} this month</span>
                    {expenseStats.tax_deductible > 0 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-quotla-green/10 text-quotla-green dark:bg-quotla-green/20">
                        {formatCurrency(expenseStats.tax_deductible, invoices[0]?.currency || 'USD')} deductible
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-gray-600 dark:text-primary-400">No expenses yet</span>
                )}
              </div>
            </Link>
          </div>
        </section>

        {/* Modals */}
        <CreateModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-white via-quotla-light/30 to-quotla-green/10">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-quotla-orange border-t-transparent"></div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}
