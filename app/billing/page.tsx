'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import DashboardLayout from '@/components/DashboardLayout'

export const dynamic = 'force-dynamic'

export default function BillingPage() {
  const { user } = useAuth()
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')

  const plans = [
    {
      name: 'Free',
      price: { monthly: 0, annual: 0 },
      features: [
        '2 AI-generated quotes per month',
        '5 manual quotes',
        '5 invoices',
        'Basic templates',
        'PDF export',
        'Email support'
      ],
      current: true,
      cta: 'Current Plan'
    },
    {
      name: 'Professional',
      price: { monthly: 19, annual: 190 },
      features: [
        'Unlimited AI-generated documents',
        'Unlimited quotes & invoices',
        'Advanced templates',
        'Multi-currency support',
        'Client management',
        'Priority support',
        'Custom branding',
        'Analytics dashboard'
      ],
      current: false,
      cta: 'Upgrade Now',
      popular: true
    },
    {
      name: 'Business',
      price: { monthly: 49, annual: 490 },
      features: [
        'Everything in Professional',
        'Multiple business profiles',
        'Team collaboration (up to 5 users)',
        'Advanced analytics',
        'API access',
        'Dedicated account manager',
        'Custom integrations',
        'White-label options'
      ],
      current: false,
      cta: 'Upgrade Now'
    }
  ]

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
        <h1 className="text-3xl font-bold text-gray-900">Credits & Billing</h1>
        <p className="mt-2 text-gray-600">Manage your subscription, billing information, and payment history</p>
      </div>

      {/* Current Plan Overview */}
      <div className="card bg-gradient-to-r from-primary-50 to-blue-50 border-2 border-primary-200">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Current Plan: Free</h3>
            <p className="text-gray-700 mb-4">You're currently on the Free plan</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>2 AI quotes remaining this month</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>5 manual documents available</span>
              </div>
            </div>
          </div>
          <button className="btn btn-primary">
            Upgrade Plan
          </button>
        </div>
      </div>

      {/* Billing Cycle Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-3 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              billingCycle === 'monthly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              billingCycle === 'annual'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Annual
            <span className="ml-2 text-xs text-green-600 font-semibold">Save 17%</span>
          </button>
        </div>
      </div>

      {/* Pricing Plans */}
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`card relative ${
              plan.popular ? 'border-2 border-primary-500 shadow-lg' : ''
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold text-gray-900">
                  ${billingCycle === 'monthly' ? plan.price.monthly : plan.price.annual}
                </span>
                <span className="text-gray-600">
                  /{billingCycle === 'monthly' ? 'month' : 'year'}
                </span>
              </div>
              {billingCycle === 'annual' && plan.price.annual > 0 && (
                <p className="text-sm text-green-600 mt-1">
                  ${(plan.price.monthly * 12 - plan.price.annual).toFixed(0)} saved per year
                </p>
              )}
            </div>

            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button
              disabled={plan.current}
              className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                plan.current
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  : plan.popular
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'bg-gray-900 text-white hover:bg-gray-800'
              }`}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>

      {/* Payment Method */}
      <div className="card">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Payment Method</h3>
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-8 bg-gray-300 rounded flex items-center justify-center">
              <svg className="w-8 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">No payment method on file</p>
              <p className="text-sm text-gray-600">Add a payment method to upgrade your plan</p>
            </div>
          </div>
          <button className="btn btn-outline">
            Add Payment Method
          </button>
        </div>
      </div>

      {/* Billing History */}
      <div className="card">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Billing History</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Invoice
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {billingHistory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 text-sm text-gray-900">
                    {new Date(item.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">{item.description}</td>
                  <td className="px-4 py-4 text-sm text-gray-900">
                    ${item.amount.toFixed(2)}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <span className={`inline-block px-2 py-1 text-xs rounded ${
                      item.status === 'Paid'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm">
                    {item.invoice ? (
                      <button className="text-primary-600 hover:text-primary-700 font-medium">
                        Download
                      </button>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Usage Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-900">AI Quotes</h4>
            <span className="text-2xl font-bold text-primary-600">2/2</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-primary-600 h-2 rounded-full" style={{ width: '100%' }}></div>
          </div>
          <p className="text-xs text-gray-600 mt-2">Resets on February 1</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-900">Quotes</h4>
            <span className="text-2xl font-bold text-blue-600">3/5</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
          </div>
          <p className="text-xs text-gray-600 mt-2">2 remaining this month</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-900">Invoices</h4>
            <span className="text-2xl font-bold text-green-600">1/5</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-600 h-2 rounded-full" style={{ width: '20%' }}></div>
          </div>
          <p className="text-xs text-gray-600 mt-2">4 remaining this month</p>
        </div>
      </div>
    </div>
    </DashboardLayout>
  )
}
