'use client'

import { useState, useEffect } from 'react'
import type { ProjectProfitability, ProfitabilitySummary } from '@/types/profitability'
import { formatCurrency, getUserCurrency } from '@/lib/utils/currency'

export default function ProfitabilityDashboard() {
  const [profitability, setProfitability] = useState<ProjectProfitability[]>([])
  const [summary, setSummary] = useState<ProfitabilitySummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedClient, setSelectedClient] = useState<string>('')
  const [currency, setCurrency] = useState<string>('USD')

  // Load profitability data
  const loadProfitability = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedClient) params.append('client_id', selectedClient)

      const response = await fetch(`/api/profitability?${params}`)
      if (response.ok) {
        const data = await response.json()
        setProfitability(data.profitability || [])
        setSummary(data.summary || null)
      }
    } catch (error) {
      console.error('Error loading profitability:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Get user's preferred currency
    const userCurrency = getUserCurrency()
    setCurrency(userCurrency)
  }, [])

  useEffect(() => {
    loadProfitability()
  }, [selectedClient])

  // Format currency with user's preferred currency
  const formatAmount = (amount: number): string => {
    return formatCurrency(amount, currency)
  }

  // Get profit color based on value
  const getProfitColor = (profit: number): string => {
    if (profit > 0) return 'text-green-600 dark:text-green-400'
    if (profit < 0) return 'text-red-600 dark:text-red-400'
    return 'text-gray-600 dark:text-gray-400'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-quotla-orange"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-quotla-green/10 to-quotla-green/5 rounded-xl p-6 border border-quotla-green/20">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
              <svg className="w-6 h-6 text-quotla-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-quotla-dark dark:text-quotla-light">
              {formatAmount(summary.total_revenue)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-quotla-orange/10 to-quotla-orange/5 rounded-xl p-6 border border-quotla-orange/20">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Costs</p>
              <svg className="w-6 h-6 text-quotla-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-quotla-dark dark:text-quotla-light">
              {formatAmount(summary.total_costs)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-xl p-6 border border-green-500/20">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Profit</p>
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <p className={`text-3xl font-bold ${getProfitColor(summary.total_profit)}`}>
              {formatAmount(summary.total_profit)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Profit Margin</p>
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-quotla-dark dark:text-quotla-light">
              {summary.average_profit_margin.toFixed(1)}%
            </p>
          </div>
        </div>
      )}

      {/* Projects Table */}
      <div className="bg-white dark:bg-primary-900 rounded-xl shadow-lg border border-gray-200 dark:border-primary-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-primary-700">
          <h3 className="text-2xl font-bold text-quotla-dark dark:text-quotla-light">Project Profitability</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-primary-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Quote #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Costs
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Profit
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Margin
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-primary-700">
              {profitability.map((project) => (
                <tr key={project.quote_id} className="hover:bg-gray-50 dark:hover:bg-primary-800 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-quotla-dark dark:text-quotla-light">
                      {project.quote_number}
                    </div>
                    {project.invoice_number && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Invoice: {project.invoice_number}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-quotla-dark dark:text-quotla-light">
                      {project.client_name || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-medium text-quotla-dark dark:text-quotla-light">
                      {formatAmount(project.amount_paid || 0)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm text-quotla-dark dark:text-quotla-light">
                      {formatAmount(project.total_costs)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className={`text-sm font-semibold ${getProfitColor(project.profit)}`}>
                      {formatAmount(project.profit)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className={`text-sm font-semibold ${getProfitColor(project.profit)}`}>
                      {project.profit_margin_percentage.toFixed(1)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      project.invoice_status === 'paid'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : project.invoice_status === 'sent'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                    }`}>
                      {project.invoice_status || 'quoted'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {profitability.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-gray-500 dark:text-gray-400">No profitability data available</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Create quotes and invoices to start tracking project profitability
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
