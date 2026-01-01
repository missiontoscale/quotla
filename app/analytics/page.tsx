'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import TimeTracker from '@/components/TimeTracker'
import ProfitabilityDashboard from '@/components/ProfitabilityDashboard'

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<'profitability' | 'time-tracking'>('profitability')

  return (
    <div className="min-h-screen bg-gradient-to-br from-quotla-light via-quotla-light/30 to-quotla-green/5">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="mb-8">
          <div className="inline-block mb-4 px-6 py-2 bg-quotla-orange/20 backdrop-blur-sm rounded-full border border-quotla-orange/30">
            <span className="text-quotla-orange font-semibold text-sm uppercase tracking-wider">
              Business Intelligence
            </span>
          </div>
          <h1 className="font-heading text-5xl md:text-6xl font-bold text-quotla-dark mb-4">
            Analytics & Tracking
          </h1>
          <p className="text-xl text-quotla-dark/80 max-w-3xl">
            Track your time, monitor project profitability, and gain insights into your business performance.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8 border-b border-gray-200 dark:border-primary-700">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('profitability')}
              className={`pb-4 px-6 text-lg font-semibold transition-colors border-b-2 ${
                activeTab === 'profitability'
                  ? 'border-quotla-orange text-quotla-orange'
                  : 'border-transparent text-gray-500 hover:text-quotla-dark'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Project Profitability
              </div>
            </button>
            <button
              onClick={() => setActiveTab('time-tracking')}
              className={`pb-4 px-6 text-lg font-semibold transition-colors border-b-2 ${
                activeTab === 'time-tracking'
                  ? 'border-quotla-orange text-quotla-orange'
                  : 'border-transparent text-gray-500 hover:text-quotla-dark'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Time Tracking
              </div>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">
          {activeTab === 'profitability' && (
            <div>
              <ProfitabilityDashboard />
            </div>
          )}

          {activeTab === 'time-tracking' && (
            <div className="max-w-4xl">
              <TimeTracker />
            </div>
          )}
        </div>

        {/* Feature Highlights */}
        <div className="mt-16 grid md:grid-cols-2 gap-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-quotla-orange/20">
            <div className="w-12 h-12 bg-gradient-to-br from-quotla-orange to-secondary-600 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-quotla-dark mb-2">Track Project Profitability</h3>
            <p className="text-quotla-dark/70">
              Monitor costs, revenue, and profit margins for each project. Identify your most profitable work and optimize your business strategy.
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-quotla-green/20">
            <div className="w-12 h-12 bg-gradient-to-br from-quotla-green to-green-600 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-quotla-dark mb-2">Accurate Time Tracking</h3>
            <p className="text-quotla-dark/70">
              Track billable hours with precision. Start and stop timers for different projects, calculate billable amounts automatically, and never miss a minute.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
