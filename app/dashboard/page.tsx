'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { Quote, Invoice } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { format } from 'date-fns'
import { formatCurrency } from '@/lib/utils/validation'

export default function DashboardPage() {
  const { user, profile } = useAuth()
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [user])

  useEffect(() => {
    const handleOpenChat = () => {
      const chatButton = document.querySelector('[title="Chat with Quotla AI"]') as HTMLButtonElement
      if (chatButton) {
        chatButton.click()
      }
    }
    window.addEventListener('open-chat', handleOpenChat)
    return () => window.removeEventListener('open-chat', handleOpenChat)
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
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back{profile?.company_name ? `, ${profile.company_name}` : ''}
        </h1>
        <p className="mt-2 text-gray-600">What would you like to do today?</p>
      </div>

      {/* AI Chat Quick Access - Hero Element */}
      <div className="card bg-gradient-to-br from-primary-50 to-white border-2 border-primary-200 shadow-xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary-600 mb-3 shadow-lg">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ask Quotla AI Anything</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Generate quotes, create invoices, get pricing advice, or ask business questions through a simple conversation
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-3 max-w-3xl mx-auto mb-4">
          <button
            onClick={() => {
              const event = new CustomEvent('open-chat')
              window.dispatchEvent(event)
            }}
            className="bg-white border-2 border-primary-200 rounded-xl p-5 text-left hover:border-primary-400 hover:shadow-lg transition-all group"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 group-hover:text-primary-600 mb-1">Create a quote</h4>
                <p className="text-sm text-gray-600">Generate a professional quote with AI</p>
              </div>
            </div>
          </button>
          <button
            onClick={() => {
              const event = new CustomEvent('open-chat')
              window.dispatchEvent(event)
            }}
            className="bg-white border-2 border-primary-200 rounded-xl p-5 text-left hover:border-primary-400 hover:shadow-lg transition-all group"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 group-hover:text-primary-600 mb-1">Make an invoice</h4>
                <p className="text-sm text-gray-600">Create an invoice in seconds</p>
              </div>
            </div>
          </button>
          <button
            onClick={() => {
              const event = new CustomEvent('open-chat')
              window.dispatchEvent(event)
            }}
            className="bg-white border-2 border-primary-200 rounded-xl p-5 text-left hover:border-primary-400 hover:shadow-lg transition-all group"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 group-hover:text-primary-600 mb-1">Get pricing help</h4>
                <p className="text-sm text-gray-600">Ask for pricing strategy advice</p>
              </div>
            </div>
          </button>
          <button
            onClick={() => {
              const event = new CustomEvent('open-chat')
              window.dispatchEvent(event)
            }}
            className="bg-white border-2 border-primary-200 rounded-xl p-5 text-left hover:border-primary-400 hover:shadow-lg transition-all group"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 group-hover:text-primary-600 mb-1">Business advice</h4>
                <p className="text-sm text-gray-600">Get expert business guidance</p>
              </div>
            </div>
          </button>
        </div>

        <div className="text-center">
          <button
            onClick={() => {
              const event = new CustomEvent('open-chat')
              window.dispatchEvent(event)
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Open Quotla Chat
          </button>
          <p className="text-xs text-gray-500 mt-2">AI assistant is always available to help</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card hover:shadow-lg transition-shadow">
          <div className="text-sm text-gray-600">Total Quotes</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{stats.totalQuotes}</div>
        </div>
        <div className="card hover:shadow-lg transition-shadow">
          <div className="text-sm text-gray-600">Total Invoices</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{stats.totalInvoices}</div>
        </div>
        <div className="card hover:shadow-lg transition-shadow">
          <div className="text-sm text-gray-600">Total Revenue</div>
          <div className="text-3xl font-bold text-primary-600 mt-2">{formatCurrency(stats.totalRevenue, invoices[0]?.currency || 'USD')}</div>
        </div>
        <div className="card hover:shadow-lg transition-shadow">
          <div className="text-sm text-gray-600">Paid Invoices</div>
          <div className="text-3xl font-bold text-green-600 mt-2">{stats.paidInvoices}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Recent Quotes</h2>
            <Link href="/quotes" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View all
            </Link>
          </div>
          {quotes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No quotes yet</p>
              <Link href="/quotes/new" className="btn btn-primary mt-4 inline-block">
                Create your first quote
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {quotes.map((quote) => (
                <Link
                  key={quote.id}
                  href={`/quotes/${quote.id}`}
                  className="block p-3 border rounded hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{quote.quote_number}</div>
                      {quote.title && <div className="text-sm text-gray-600">{quote.title}</div>}
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(quote.total, quote.currency)}</div>
                      <div className="text-xs text-gray-500">
                        {format(new Date(quote.created_at), 'MMM d, yyyy')}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded ${
                        quote.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : quote.status === 'sent'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {quote.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Recent Invoices</h2>
            <Link href="/invoices" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View all
            </Link>
          </div>
          {invoices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No invoices yet</p>
              <Link href="/invoices/new" className="btn btn-primary mt-4 inline-block">
                Create your first invoice
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {invoices.map((invoice) => (
                <Link
                  key={invoice.id}
                  href={`/invoices/${invoice.id}`}
                  className="block p-3 border rounded hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{invoice.invoice_number}</div>
                      {invoice.title && <div className="text-sm text-gray-600">{invoice.title}</div>}
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(invoice.total, invoice.currency)}</div>
                      <div className="text-xs text-gray-500">
                        {format(new Date(invoice.created_at), 'MMM d, yyyy')}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded ${
                        invoice.status === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : invoice.status === 'sent'
                          ? 'bg-blue-100 text-blue-800'
                          : invoice.status === 'overdue'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {invoice.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
