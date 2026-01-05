'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import DashboardLayout from '@/components/DashboardLayout'
import Link from 'next/link'
import { getUserCurrency, formatCurrency, getCurrency, type Currency } from '@/lib/utils/currency'
import { SUBSCRIPTION_PLANS, getRemainingQuota, formatQuota, type UsageStats } from '@/lib/constants/plans'

export const dynamic = 'force-dynamic'

export default function BillingPage() {
  const { user } = useAuth()
  const [currencyCode, setCurrencyCode] = useState<string>('USD')
  const currency = getCurrency(currencyCode)
  const [isLoadingCurrency, setIsLoadingCurrency] = useState(true)

  // TODO: Fetch actual usage stats from database
  const [usageStats] = useState<UsageStats>({
    aiQuotesUsed: 2,
    manualQuotesUsed: 3,
    manualInvoicesUsed: 1,
    period: 'February 2025',
  })

  // Get current plan (TODO: fetch from user profile)
  const currentPlanId = 'free'
  const quotaInfo = getRemainingQuota(currentPlanId, usageStats)

  // Get user's preferred currency
  useEffect(() => {
    setIsLoadingCurrency(true)
    const userCurrency = getUserCurrency()
    setCurrencyCode(userCurrency)
    setIsLoadingCurrency(false)
  }, [])

  // Filter plans to show only paid plans (exclude free)
  const upgradePlans = SUBSCRIPTION_PLANS.filter(plan => plan.id !== 'free')

  const billingHistory = [
    {
      id: 1,
      date: '2025-01-01',
      description: 'Monthly subscription - Professional Plan',
      amount: 19.00,
      status: 'Paid',
      invoice: 'INV-2025-001'
    },
    {
      id: 2,
      date: '2024-12-01',
      description: 'Monthly subscription - Professional Plan',
      amount: 19.00,
      status: 'Paid',
      invoice: 'INV-2024-012'
    },
    {
      id: 3,
      date: '2024-11-01',
      description: 'Monthly subscription - Free Plan',
      amount: 0.00,
      status: 'Free',
      invoice: null
    },
  ]


  return (
    <DashboardLayout>
      <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary-50">Credits & Billing</h1>
        <p className="mt-2 text-primary-300">Manage your subscription, billing information, and payment history</p>
        <p className="mt-1 text-sm text-primary-400">
          {isLoadingCurrency ? 'Loading prices...' : `Prices shown in ${currency?.code || 'USD'}`}
        </p>
      </div>

      {/* Current Plan Overview */}
      <div className="card bg-gradient-to-r from-primary-700 to-primary-600 border-2 border-primary-500">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-primary-50 mb-2">Current Plan: Free</h3>
            <p className="text-primary-200 mb-4">You're currently on the Free plan</p>
            <div className="space-y-2">
              {quotaInfo && (
                <>
                  <div className="flex items-center gap-2 text-sm text-primary-200">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{quotaInfo.aiQuotes.remaining} AI quotes remaining this month</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-primary-200">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{quotaInfo.quotes.remaining} manual quotes remaining</span>
                  </div>
                </>
              )}
            </div>
          </div>
          <Link href="/pricing" className="btn bg-primary-800 text-white hover:bg-primary-900">
            View All Plans
          </Link>
        </div>
      </div>

      {/* Pricing Plans */}
      <div>
        <h2 className="text-2xl font-bold text-primary-50 mb-6">Upgrade Your Plan</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {upgradePlans.map((plan) => (
            <div
              key={plan.name}
              className={`card relative ${
                plan.popular ? 'border-2 border-primary-800 shadow-lg' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary-800 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-primary-50 mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-primary-50">
                    {formatCurrency(plan.priceUSD, currencyCode)}
                  </span>
                  <span className="text-primary-300">/month</span>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-primary-200">
                    <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                  plan.popular
                    ? 'bg-primary-800 text-white hover:bg-primary-900'
                    : 'bg-primary-600 text-primary-50 hover:bg-primary-600'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Method */}
      <div className="card">
        <h3 className="text-xl font-bold text-primary-50 mb-4">Payment Method</h3>
        <div className="flex items-center justify-between p-4 bg-primary-700 rounded-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-8 bg-primary-500 rounded flex items-center justify-center">
              <svg className="w-8 h-5 text-primary-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
              </svg>
            </div>
            <div>
              <p className="font-medium text-primary-50">No payment method on file</p>
              <p className="text-sm text-primary-300">Add a payment method to upgrade your plan</p>
            </div>
          </div>
          <button className="btn bg-primary-800 text-white hover:bg-primary-900">
            Add Payment Method
          </button>
        </div>
      </div>

      {/* Billing History */}
      <div className="card">
        <h3 className="text-xl font-bold text-primary-50 mb-4">Billing History</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-primary-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-primary-300 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-primary-300 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-primary-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-primary-300 uppercase tracking-wider">
                  Invoice
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-600">
              {billingHistory.map((item) => (
                <tr key={item.id} className="hover:bg-primary-700">
                  <td className="px-4 py-4 text-sm text-primary-50">
                    {new Date(item.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-4 py-4 text-sm text-primary-50">{item.description}</td>
                  <td className="px-4 py-4 text-sm text-primary-50">
                    {formatCurrency(item.amount, currencyCode)}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <span className={`inline-block px-2 py-1 text-xs rounded ${
                      item.status === 'Paid'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-primary-600 text-primary-100'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm">
                    {item.invoice ? (
                      <button className="text-primary-50 hover:text-primary-200 font-medium">
                        Download
                      </button>
                    ) : (
                      <span className="text-primary-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Usage Stats */}
      {quotaInfo && (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-primary-50">AI Quotes</h4>
              <span className="text-2xl font-bold text-primary-50">
                {formatQuota(quotaInfo.aiQuotes.used, quotaInfo.aiQuotes.total)}
              </span>
            </div>
            <div className="w-full bg-primary-600 rounded-full h-2">
              <div
                className="bg-primary-800 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(100, quotaInfo.aiQuotes.percentage)}%` }}
              ></div>
            </div>
            <p className="text-xs text-primary-300 mt-2">Resets on {usageStats.period}</p>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-primary-50">Quotes</h4>
              <span className="text-2xl font-bold text-primary-50">
                {formatQuota(quotaInfo.quotes.used, quotaInfo.quotes.total)}
              </span>
            </div>
            <div className="w-full bg-primary-600 rounded-full h-2">
              <div
                className="bg-primary-800 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(100, quotaInfo.quotes.percentage)}%` }}
              ></div>
            </div>
            <p className="text-xs text-primary-300 mt-2">
              {quotaInfo.quotes.remaining === Infinity
                ? 'Unlimited'
                : `${quotaInfo.quotes.remaining} remaining this month`}
            </p>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-primary-50">Invoices</h4>
              <span className="text-2xl font-bold text-primary-50">
                {formatQuota(quotaInfo.invoices.used, quotaInfo.invoices.total)}
              </span>
            </div>
            <div className="w-full bg-primary-600 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(100, quotaInfo.invoices.percentage)}%` }}
              ></div>
            </div>
            <p className="text-xs text-primary-300 mt-2">
              {quotaInfo.invoices.remaining === Infinity
                ? 'Unlimited'
                : `${quotaInfo.invoices.remaining} remaining this month`}
            </p>
          </div>
        </div>
      )}
    </div>
    </DashboardLayout>
  )
}
