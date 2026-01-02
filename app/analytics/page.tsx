'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import TimeTracker from '@/components/TimeTracker'
import ProfitabilityDashboard from '@/components/ProfitabilityDashboard'

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<'profitability' | 'time-tracking'>('profitability')

  return (
    <div className="min-h-screen bg-quotla-light relative overflow-hidden">
      {/* Grid pattern background */}
      <div className="fixed inset-0 bg-[url('/images/patterns/grid/Quotla%20grid%20pattern%20light.svg')] bg-center opacity-[0.05] pointer-events-none" style={{backgroundSize: '150%'}}></div>

      {/* Atmospheric data visualization lines - subtle movement */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-10">
        <svg className="absolute w-full h-full" preserveAspectRatio="none">
          <path
            d="M0,300 Q400,100 800,250 T1600,200"
            stroke="#ce6203"
            strokeWidth="2"
            fill="none"
            className="animate-pulse"
            style={{animationDuration: '4s'}}
          />
          <path
            d="M0,500 Q300,400 600,450 T1200,380"
            stroke="#445642"
            strokeWidth="2"
            fill="none"
            className="animate-pulse"
            style={{animationDuration: '6s', animationDelay: '1s'}}
          />
          <path
            d="M0,700 Q500,600 1000,650 T2000,700"
            stroke="#0e1616"
            strokeWidth="1"
            fill="none"
            className="animate-pulse"
            style={{animationDuration: '5s', animationDelay: '2s'}}
          />
        </svg>
      </div>

      <Navbar />

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        {/* Bold asymmetric header with vertical accent */}
        <div className="mb-20 flex items-start gap-8">
          {/* Vertical accent bar with animated height */}
          <div className="hidden md:block relative">
            <div className="w-1 h-64 bg-quotla-dark overflow-hidden">
              <div className="w-full h-20 bg-quotla-orange animate-slide-up" style={{animationDuration: '2s', animationIterationCount: 'infinite'}}></div>
            </div>
          </div>

          {/* Header content - unconventional spacing */}
          <div className="flex-1">
            <div className="mb-6">
              <div className="inline-block mb-2 text-quotla-orange font-bold text-xs uppercase tracking-[0.3em]">
                Data · Insights · Intelligence
              </div>
            </div>
            <h1 className="font-heading text-6xl md:text-8xl font-bold text-quotla-dark mb-8 leading-[0.9] tracking-tighter">
              Analytics<br/>
              <span className="text-quotla-green">Command</span><br/>
              <span className="text-quotla-orange">Center</span>
            </h1>
            <p className="text-lg text-quotla-dark/70 max-w-xl leading-relaxed font-light">
              Real-time business intelligence. Track profitability, monitor time, optimize performance.
            </p>
          </div>
        </div>

        {/* Unconventional tab navigation - vertical sidebar style */}
        <div className="grid lg:grid-cols-[240px,1fr] gap-12 mb-16">
          {/* Left sidebar navigation */}
          <nav className="space-y-3">
            <button
              onClick={() => setActiveTab('profitability')}
              className={`w-full text-left p-6 transition-all duration-300 border-l-4 ${
                activeTab === 'profitability'
                  ? 'border-quotla-orange bg-quotla-orange/5 translate-x-2'
                  : 'border-quotla-dark/10 hover:border-quotla-dark/30 hover:translate-x-1'
              }`}
            >
              <div className="flex items-center gap-3 mb-1">
                <div className={`w-2 h-2 rounded-full ${activeTab === 'profitability' ? 'bg-quotla-orange' : 'bg-quotla-dark/30'}`}></div>
                <span className={`font-bold text-sm uppercase tracking-wider ${
                  activeTab === 'profitability' ? 'text-quotla-orange' : 'text-quotla-dark/60'
                }`}>
                  Profitability
                </span>
              </div>
              <div className={`text-xs ml-5 ${activeTab === 'profitability' ? 'text-quotla-dark/80' : 'text-quotla-dark/50'}`}>
                Revenue · Costs · Margins
              </div>
            </button>

            <button
              onClick={() => setActiveTab('time-tracking')}
              className={`w-full text-left p-6 transition-all duration-300 border-l-4 ${
                activeTab === 'time-tracking'
                  ? 'border-quotla-green bg-quotla-green/5 translate-x-2'
                  : 'border-quotla-dark/10 hover:border-quotla-dark/30 hover:translate-x-1'
              }`}
            >
              <div className="flex items-center gap-3 mb-1">
                <div className={`w-2 h-2 rounded-full ${activeTab === 'time-tracking' ? 'bg-quotla-green' : 'bg-quotla-dark/30'}`}></div>
                <span className={`font-bold text-sm uppercase tracking-wider ${
                  activeTab === 'time-tracking' ? 'text-quotla-green' : 'text-quotla-dark/60'
                }`}>
                  Time Tracking
                </span>
              </div>
              <div className={`text-xs ml-5 ${activeTab === 'time-tracking' ? 'text-quotla-dark/80' : 'text-quotla-dark/50'}`}>
                Hours · Billable · Projects
              </div>
            </button>

            {/* Decorative data stats - adds context */}
            <div className="pt-8 pl-6 space-y-4">
              <div>
                <div className="text-3xl font-bold text-quotla-dark mb-1">24/7</div>
                <div className="text-xs text-quotla-dark/60 uppercase tracking-wider">Live Tracking</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-quotla-orange mb-1">∞</div>
                <div className="text-xs text-quotla-dark/60 uppercase tracking-wider">Data Points</div>
              </div>
            </div>
          </nav>

          {/* Main content area - full bleed on right */}
          <div className="relative">
            {/* Tab indicator bar */}
            <div className="absolute -left-6 top-0 w-1 h-full bg-quotla-dark/5">
              <div
                className={`w-full transition-all duration-500 ${
                  activeTab === 'profitability' ? 'bg-quotla-orange h-1/2' : 'bg-quotla-green h-1/2 translate-y-full'
                }`}
              ></div>
            </div>

            <div className="animate-fadeIn">
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
          </div>
        </div>

        {/* Bottom insights - horizontal split design */}
        <div className="grid md:grid-cols-2 gap-1 bg-quotla-dark/10 mt-32">
          {/* Left panel - Profitability insight */}
          <div className="bg-quotla-light p-12 relative overflow-hidden group hover:bg-white transition-colors duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <path d="M10,90 L30,70 L50,80 L70,40 L90,50" stroke="#ce6203" strokeWidth="4" fill="none"/>
              </svg>
            </div>
            <div className="relative">
              <div className="w-3 h-3 bg-quotla-orange mb-6"></div>
              <h3 className="font-heading text-2xl font-bold text-quotla-dark mb-4 leading-tight">
                Project Profitability Analysis
              </h3>
              <p className="text-quotla-dark/70 leading-relaxed mb-6">
                Monitor costs, revenue, and profit margins. Identify high-performing projects and optimize resource allocation for maximum return.
              </p>
              <div className="flex items-center gap-2 text-sm font-bold text-quotla-orange uppercase tracking-wider group-hover:gap-4 transition-all">
                <span>Deep dive</span>
                <span>→</span>
              </div>
            </div>
          </div>

          {/* Right panel - Time tracking insight */}
          <div className="bg-quotla-light p-12 relative overflow-hidden group hover:bg-white transition-colors duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="50" cy="50" r="40" stroke="#445642" strokeWidth="4" fill="none"/>
                <path d="M50,50 L50,20" stroke="#445642" strokeWidth="4"/>
                <path d="M50,50 L70,50" stroke="#445642" strokeWidth="3"/>
              </svg>
            </div>
            <div className="relative">
              <div className="w-3 h-3 bg-quotla-green mb-6"></div>
              <h3 className="font-heading text-2xl font-bold text-quotla-dark mb-4 leading-tight">
                Precision Time Intelligence
              </h3>
              <p className="text-quotla-dark/70 leading-relaxed mb-6">
                Track billable hours with accuracy. Automated calculations, project categorization, and performance insights at your fingertips.
              </p>
              <div className="flex items-center gap-2 text-sm font-bold text-quotla-green uppercase tracking-wider group-hover:gap-4 transition-all">
                <span>Explore data</span>
                <span>→</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
