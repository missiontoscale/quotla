'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { Invoice } from '@/types'
import { format } from 'date-fns'
import { formatCurrency } from '@/lib/utils/validation'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function InvoicesPage() {
  const { user } = useAuth()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (user) {
      loadInvoices()
    }
  }, [user, filter])

  const loadInvoices = async () => {
    if (!user) return

    setLoading(true)
    let query = supabase
      .from('invoices')
      .select('*, client:clients(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (filter !== 'all') {
      query = query.eq('status', filter)
    }

    const { data, error } = await query

    if (!error && data) {
      setInvoices(data)
    }
    setLoading(false)
  }

  const filteredInvoices = invoices.filter(invoice => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      invoice.invoice_number?.toLowerCase().includes(search) ||
      invoice.title?.toLowerCase().includes(search) ||
      invoice.client?.name?.toLowerCase().includes(search)
    )
  })

  const stats = {
    total: invoices.length,
    draft: invoices.filter(i => i.status === 'draft').length,
    sent: invoices.filter(i => i.status === 'sent').length,
    paid: invoices.filter(i => i.status === 'paid').length,
    overdue: invoices.filter(i => i.status === 'overdue').length,
    cancelled: invoices.filter(i => i.status === 'cancelled').length,
    totalRevenue: invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0),
    outstanding: invoices.filter(i => i.status === 'sent' || i.status === 'overdue').reduce((sum, i) => sum + i.total, 0),
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
              Invoices
            </h1>
            <p className="font-sans text-sm text-gray-600 dark:text-primary-400 mt-1">
              Manage all your invoices in one place
            </p>
          </div>
          <Link
            href="/invoices/new"
            className="px-5 py-2.5 rounded-xl bg-quotla-orange text-white text-sm font-semibold hover:bg-secondary-600 transition-all shadow-lg shadow-quotla-orange/30 hover:shadow-xl hover:-translate-y-0.5"
          >
            + New Invoice
          </Link>
        </div>

        {/* Revenue Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-white dark:bg-primary-700 rounded-2xl p-5 sm:p-6 border-2 border-primary-200 dark:border-quotla-light/20 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-quotla-green flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="font-sans text-xs font-semibold text-gray-600 dark:text-primary-400 uppercase">Total Revenue</div>
                <div className="font-heading text-2xl font-bold text-quotla-dark dark:text-quotla-light">
                  {formatCurrency(stats.totalRevenue, invoices[0]?.currency || 'USD')}
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-600 dark:text-primary-400">
              {stats.paid} paid invoices
            </div>
          </div>

          <div className="bg-white dark:bg-primary-700 rounded-2xl p-5 sm:p-6 border-2 border-primary-200 dark:border-quotla-light/20 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-quotla-orange flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="font-sans text-xs font-semibold text-gray-600 dark:text-primary-400 uppercase">Outstanding</div>
                <div className="font-heading text-2xl font-bold text-quotla-dark dark:text-quotla-light">
                  {formatCurrency(stats.outstanding, invoices[0]?.currency || 'USD')}
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-600 dark:text-primary-400">
              {stats.sent + stats.overdue} pending invoices
            </div>
          </div>
        </div>

        {/* Status Filter Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6">
          {[
            { label: 'All', value: stats.total, filter: 'all', color: 'bg-purple-500' },
            { label: 'Draft', value: stats.draft, filter: 'draft', color: 'bg-gray-500' },
            { label: 'Sent', value: stats.sent, filter: 'sent', color: 'bg-blue-500' },
            { label: 'Paid', value: stats.paid, filter: 'paid', color: 'bg-green-500' },
            { label: 'Overdue', value: stats.overdue, filter: 'overdue', color: 'bg-red-500' },
            { label: 'Cancelled', value: stats.cancelled, filter: 'cancelled', color: 'bg-orange-500' },
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
            placeholder="Search invoices by number, title, or client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-primary-200 dark:border-primary-600 bg-white dark:bg-primary-700 text-quotla-dark dark:text-primary-50 focus:border-quotla-orange focus:outline-none transition-all"
          />
        </div>

        {/* Invoices List */}
        {filteredInvoices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredInvoices.map((invoice) => (
              <Link
                key={invoice.id}
                href={`/invoices/${invoice.id}`}
                className="group bg-white dark:bg-primary-700 rounded-2xl p-5 sm:p-6 border-2 border-primary-200 dark:border-quotla-light/20 hover:border-quotla-orange dark:hover:border-quotla-orange hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    <span className="font-sans text-xs font-bold text-gray-600 dark:text-primary-400 uppercase">
                      Invoice
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                      invoice.status === 'paid'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : invoice.status === 'sent'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        : invoice.status === 'overdue'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        : invoice.status === 'cancelled'
                        ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                        : 'bg-gray-100 text-gray-700 dark:bg-primary-600 dark:text-primary-100'
                    }`}
                  >
                    {invoice.status}
                  </span>
                </div>

                <div className="font-heading font-bold text-lg text-quotla-dark dark:text-primary-50 mb-1 group-hover:text-quotla-orange transition-colors">
                  {invoice.invoice_number}
                </div>

                {invoice.title && (
                  <div className="font-sans text-sm text-gray-600 dark:text-primary-400 mb-3">
                    {invoice.title}
                  </div>
                )}

                {invoice.client && (
                  <div className="font-sans text-sm text-gray-700 dark:text-primary-300 mb-3 font-medium">
                    {invoice.client.name}
                  </div>
                )}

                <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-primary-600">
                  <div className="font-heading font-bold text-lg text-quotla-orange">
                    {formatCurrency(invoice.total, invoice.currency)}
                  </div>
                  <div className="font-sans text-xs text-gray-500 dark:text-primary-400">
                    {format(new Date(invoice.created_at), 'MMM d, yyyy')}
                  </div>
                </div>

                {invoice.due_date && (
                  <div className="font-sans text-xs text-gray-500 dark:text-primary-400 mt-2">
                    Due: {format(new Date(invoice.due_date), 'MMM d, yyyy')}
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
              {searchTerm ? 'No invoices found' : 'No invoices yet'}
            </h3>
            <p className="font-sans text-sm text-gray-600 dark:text-primary-400 mb-6">
              {searchTerm
                ? 'Try adjusting your search terms'
                : 'Start by creating your first invoice'
              }
            </p>
            {!searchTerm && (
              <Link
                href="/invoices/new"
                className="inline-block px-5 py-2.5 rounded-xl bg-quotla-orange text-white text-sm font-semibold hover:bg-secondary-600 transition-all shadow-lg shadow-quotla-orange/30 hover:shadow-xl hover:-translate-y-0.5"
              >
                Create Your First Invoice
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
