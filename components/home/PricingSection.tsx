'use client'

import Link from 'next/link'
import { formatPrice, type Currency } from '@/lib/utils/currency'

interface PricingSectionProps {
  currency: Currency
  isLoadingCurrency: boolean
}

export default function PricingSection({ currency, isLoadingCurrency }: PricingSectionProps) {
  return (
    <section id="pricing" className="relative py-32 bg-gradient-to-b from-quotla-light via-white to-quotla-light overflow-hidden">
      {/* Wave transition from dark section */}
      <div className="absolute top-0 left-0 right-0 h-24">
        <svg className="w-full h-full" viewBox="0 0 1440 100" fill="none" preserveAspectRatio="none">
          <path d="M0,50 Q360,0 720,50 T1440,50 L1440,0 L0,0 Z" fill="url(#waveGradient)"/>
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0e1616" />
              <stop offset="50%" stopColor="#1a2820" />
              <stop offset="100%" stopColor="#445642" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-40 left-10 w-72 h-72 bg-quotla-orange/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 right-10 w-96 h-96 bg-quotla-green/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-6 py-2.5 bg-quotla-orange/10 rounded-full mb-6 border border-quotla-orange/30">
            <svg className="w-4 h-4 text-quotla-orange" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
            </svg>
            <span className="font-heading text-sm font-bold text-quotla-dark tracking-widest">TRANSPARENT PRICING</span>
          </div>
          <h2 className="font-sans text-5xl md:text-6xl font-bold text-quotla-dark mb-6 leading-tight">
            Choose Your Growth Path
          </h2>
          <p className="text-xl text-quotla-dark/70 max-w-3xl mx-auto mb-6">
            From solo entrepreneurs to scaling teams, we have a plan that fits your journey. <span className="text-quotla-orange font-semibold">Start free, scale when ready</span>.
          </p>
          <p className="text-sm text-quotla-dark/50 mb-2">
            {isLoadingCurrency
              ? 'Loading prices...'
              : `All prices shown in ${currency.code} • Live currency conversion`
            }
          </p>
          <p className="text-xs text-quotla-green font-semibold">30-day money-back guarantee on all paid plans</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {/* Simple Start - $1 */}
          <div className="group relative bg-white rounded-3xl p-8 border-2 border-quotla-dark/10 hover:border-quotla-green hover:shadow-2xl hover:shadow-quotla-green/10 transition-all duration-500 hover:-translate-y-2 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-quotla-green/0 to-quotla-orange/0 group-hover:from-quotla-green/5 group-hover:to-quotla-orange/5 transition-all duration-500 rounded-3xl"></div>

            {/* Top accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-quotla-green to-quotla-orange transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>

            <div className="relative z-10">
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-quotla-green/10 flex items-center justify-center mb-6 group-hover:bg-quotla-green/20 transition-colors">
                <svg className="w-6 h-6 text-quotla-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>

              <div className="mb-6">
              <h4 className="font-heading text-xl font-bold text-quotla-dark mb-3">Simple Start</h4>
              <div className="flex items-baseline mb-2">
                <span className="text-5xl font-bold text-quotla-dark">{formatPrice(1, currency)}</span>
                <span className="text-quotla-dark/60 ml-2 text-sm">/month</span>
              </div>
              <p className="text-quotla-dark/70 text-sm leading-relaxed">Perfect for solo entrepreneurs starting their journey</p>
            </div>
            <ul className="space-y-3 mb-6 text-sm">
              <li className="flex items-start">
                <svg className="w-4 h-4 text-quotla-green mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-quotla-dark/80">1 user + accountant access</span>
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 text-quotla-green mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-quotla-dark/80">Quotla Agent - AI-powered bank feeds</span>
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 text-quotla-green mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-quotla-dark/80">Income and expenses tracking</span>
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 text-quotla-green mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-quotla-dark/80">Invoices and quotes</span>
              </li>
            </ul>
              <Link href="/signup" className="group/btn flex items-center justify-center gap-2 w-full text-center px-4 py-3 rounded-xl text-sm font-bold bg-quotla-green/10 text-quotla-dark hover:bg-quotla-green hover:text-white transition-all">
                Get Started
                <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Essentials */}
          <div className="group relative bg-white rounded-3xl p-8 border-2 border-quotla-dark/10 hover:border-quotla-orange hover:shadow-2xl hover:shadow-quotla-orange/10 transition-all duration-500 hover:-translate-y-2 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-quotla-orange/0 to-quotla-green/0 group-hover:from-quotla-orange/5 group-hover:to-quotla-green/5 transition-all duration-500 rounded-3xl"></div>

            {/* Top accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-quotla-orange to-quotla-green transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>

            <div className="relative z-10">
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-quotla-orange/10 flex items-center justify-center mb-6 group-hover:bg-quotla-orange/20 transition-colors">
                <svg className="w-6 h-6 text-quotla-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>

              <div className="mb-6">
              <h4 className="font-heading text-xl font-bold text-quotla-dark mb-3">Essentials</h4>
              <div className="flex items-baseline mb-2">
                <span className="text-5xl font-bold text-quotla-dark">{formatPrice(5, currency)}</span>
                <span className="text-quotla-dark/60 ml-2 text-sm">/month</span>
              </div>
              <p className="text-quotla-dark/70 text-sm leading-relaxed">For small teams ready to streamline workflows</p>
            </div>
            <ul className="space-y-3 mb-6 text-sm">
              <li className="flex items-start">
                <svg className="w-4 h-4 text-quotla-green mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-quotla-dark/80">3 users + accountant access</span>
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 text-quotla-green mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-quotla-dark/80">Everything in Simple Start</span>
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 text-quotla-green mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-quotla-dark/80">AI-powered collaboration</span>
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 text-quotla-green mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-quotla-dark/80">Bill management</span>
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 text-quotla-green mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-quotla-dark/80">Multi-currency support</span>
              </li>
            </ul>
              <Link href="/signup" className="group/btn flex items-center justify-center gap-2 w-full text-center px-4 py-3 rounded-xl text-sm font-bold bg-quotla-orange/10 text-quotla-dark hover:bg-quotla-orange hover:text-white transition-all">
                Choose Plan
                <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Plus - Most Popular */}
          <div className="group relative bg-gradient-to-br from-quotla-dark via-[#1a2820] to-quotla-green rounded-3xl p-8 border-2 border-quotla-orange shadow-2xl transform scale-105 hover:scale-110 transition-all duration-500 overflow-hidden">
            {/* Animated glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-quotla-orange/20 to-quotla-green/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>

            {/* Best Value Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-quotla-orange text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Best Value
            </div>

            <div className="relative z-10">
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-quotla-orange/20 flex items-center justify-center mb-6 group-hover:bg-quotla-orange/30 transition-colors">
                <svg className="w-6 h-6 text-quotla-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>

              <div className="mb-6">
              <h4 className="font-heading text-xl font-bold text-white mb-3">Plus</h4>
              <div className="flex items-baseline mb-2">
                <span className="text-5xl font-bold text-white">{formatPrice(7, currency)}</span>
                <span className="text-white/70 ml-2 text-sm">/month</span>
              </div>
              <p className="text-white/80 text-sm leading-relaxed">Most popular for growing businesses</p>
            </div>
            <ul className="space-y-3 mb-6 text-sm">
              <li className="flex items-start">
                <svg className="w-4 h-4 text-quotla-orange mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-white">5 users + accountant access</span>
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 text-quotla-orange mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-white">Everything in Essentials</span>
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 text-quotla-orange mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-white">Anomaly detection</span>
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 text-quotla-orange mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-white">Quotla Customer Agent</span>
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 text-quotla-orange mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-white">Inventory tracking</span>
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 text-quotla-orange mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-white">Budgeting & class tracking</span>
              </li>
            </ul>
              <Link href="/signup" className="group/btn flex items-center justify-center gap-2 w-full text-center px-4 py-3 rounded-xl text-sm font-bold bg-quotla-orange text-white hover:bg-secondary-600 transition-all shadow-lg hover:shadow-xl">
                Choose Plan
                <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Advanced */}
          <div className="group relative bg-white rounded-3xl p-8 border-2 border-quotla-dark/10 hover:border-quotla-dark hover:shadow-2xl hover:shadow-quotla-dark/10 transition-all duration-500 hover:-translate-y-2 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-quotla-dark/0 to-quotla-green/0 group-hover:from-quotla-dark/5 group-hover:to-quotla-green/5 transition-all duration-500 rounded-3xl"></div>

            {/* Top accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-quotla-dark to-quotla-green transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>

            <div className="relative z-10">
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-quotla-dark/10 flex items-center justify-center mb-6 group-hover:bg-quotla-dark/20 transition-colors">
                <svg className="w-6 h-6 text-quotla-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>

              <div className="mb-6">
              <h4 className="font-heading text-xl font-bold text-quotla-dark mb-3">Advanced</h4>
              <div className="flex items-baseline mb-2">
                <span className="text-5xl font-bold text-quotla-dark">{formatPrice(14, currency)}</span>
                <span className="text-quotla-dark/60 ml-2 text-sm">/month</span>
              </div>
              <p className="text-quotla-dark/70 text-sm leading-relaxed">Enterprise features for scaling teams</p>
            </div>
            <ul className="space-y-3 mb-6 text-sm">
              <li className="flex items-start">
                <svg className="w-4 h-4 text-quotla-green mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-quotla-dark/80">25 users + accountant access</span>
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 text-quotla-green mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-quotla-dark/80">Everything in Plus</span>
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 text-quotla-green mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-quotla-dark/80">Quotla Finance Agent</span>
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 text-quotla-green mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-quotla-dark/80">Project Management Agent</span>
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 text-quotla-green mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-quotla-dark/80">Custom report builder</span>
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 text-quotla-green mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-quotla-dark/80">Workflow automation</span>
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 text-quotla-green mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-quotla-dark/80">Unlimited classes & locations</span>
              </li>
            </ul>
              <Link href="/signup" className="group/btn flex items-center justify-center gap-2 w-full text-center px-4 py-3 rounded-xl text-sm font-bold bg-quotla-dark text-white hover:bg-quotla-dark/90 transition-all hover:shadow-lg">
                Choose Plan
                <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Additional Trust Elements */}
        <div className="mt-16 pt-12 border-t border-quotla-dark/10">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-full bg-quotla-green/10 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-quotla-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h4 className="font-heading font-bold text-quotla-dark">Secure & Compliant</h4>
              <p className="text-sm text-quotla-dark/60">Bank-level encryption for all your data</p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-full bg-quotla-orange/10 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-quotla-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="font-heading font-bold text-quotla-dark">24/7 Support</h4>
              <p className="text-sm text-quotla-dark/60">Always here when you need us</p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-full bg-quotla-dark/10 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-quotla-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h4 className="font-heading font-bold text-quotla-dark">Easy Migration</h4>
              <p className="text-sm text-quotla-dark/60">We'll help you switch from your current system</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
