'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatCurrency } from '@/lib/utils/currency'
import { SUBSCRIPTION_PLANS, getRemainingQuota, formatQuota, type UsageStats } from '@/lib/constants/plans'
import { useAuth } from '@/contexts/AuthContext'
import { useSubscription } from '@/hooks/useSubscription'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function PricingPage() {
  const router = useRouter()
  const { user, profile, subscriptionPlan } = useAuth()
  const { createCheckoutSession, isFreePlan } = useSubscription()
  const [currencyCode, setCurrencyCode] = useState<string>('USD')
  const [activeFaq, setActiveFaq] = useState<number | null>(null)
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null)
  const [convertedPrices, setConvertedPrices] = useState<Record<number, number>>({})
  const [isLoadingCurrency, setIsLoadingCurrency] = useState(true)
  const [exchangeRate, setExchangeRate] = useState<number>(1)

  // Detect user's location and currency
  useEffect(() => {
    const detectCurrency = async () => {
      setIsLoadingCurrency(true)
      try {
        // Check if user has a cached location (24-hour cache)
        const cached = localStorage.getItem('userLocation')
        let detectedCurrency = 'USD'

        if (cached) {
          const data = JSON.parse(cached)
          const cacheAge = Date.now() - (data.timestamp || 0)
          const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

          if (cacheAge < CACHE_DURATION && data.currency) {
            detectedCurrency = data.currency
          } else {
            // Cache expired, fetch new location
            const response = await fetch('/api/geolocation')
            if (response.ok) {
              const locationData = await response.json()
              detectedCurrency = locationData.currency || 'USD'
              // Cache the new location
              localStorage.setItem('userLocation', JSON.stringify({
                ...locationData,
                timestamp: Date.now(),
              }))
            }
          }
        } else {
          // No cache, fetch location
          const response = await fetch('/api/geolocation')
          if (response.ok) {
            const locationData = await response.json()
            detectedCurrency = locationData.currency || 'USD'
            // Cache the location
            localStorage.setItem('userLocation', JSON.stringify({
              ...locationData,
              timestamp: Date.now(),
            }))
          }
        }

        setCurrencyCode(detectedCurrency)

        // If not USD, fetch exchange rates and convert prices
        if (detectedCurrency !== 'USD') {
          const ratesResponse = await fetch(`/api/currency/convert?base=USD`)
          if (ratesResponse.ok) {
            const ratesData = await ratesResponse.json()
            const rate = ratesData.rates[detectedCurrency]
            if (rate) {
              setExchangeRate(rate)
              // Convert all plan prices
              const converted: Record<number, number> = {}
              SUBSCRIPTION_PLANS.forEach(plan => {
                converted[plan.priceUSD] = Number((plan.priceUSD * rate).toFixed(2))
              })
              setConvertedPrices(converted)
            }
          }
        }
      } catch (error) {
        console.error('Failed to detect currency:', error)
        setCurrencyCode('USD')
      } finally {
        setIsLoadingCurrency(false)
      }
    }

    detectCurrency()
  }, [])

  // Fetch usage stats for authenticated users
  useEffect(() => {
    const fetchUsageStats = async () => {
      if (!user) return

      try {
        // TODO: Implement actual API call when backend is ready
        // For now, use mock data
        const mockStats: UsageStats = {
          aiQuotesUsed: 0,
          manualQuotesUsed: 0,
          manualInvoicesUsed: 0,
          period: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        }
        setUsageStats(mockStats)
      } catch (error) {
        // Silently fail if unable to fetch usage stats
      }
    }

    fetchUsageStats()
  }, [user])

  const [isUpgrading, setIsUpgrading] = useState<string | null>(null)

  // Use SUBSCRIPTION_PLANS directly (excluding free plan for display)
  const paidPlans = SUBSCRIPTION_PLANS.filter(p => p.priceUSD > 0)

  // Get current user's plan from context
  const currentPlanId = profile?.subscription_plan || 'free'
  const currentPlan = SUBSCRIPTION_PLANS.find(p => p.id === currentPlanId)

  const handleUpgrade = async (planId: string) => {
    if (!user) {
      router.push('/signup')
      return
    }

    setIsUpgrading(planId)
    try {
      const url = await createCheckoutSession(planId)
      if (url) {
        window.location.href = url
      }
    } finally {
      setIsUpgrading(null)
    }
  }

  const faqs = [
    {
      question: 'How does the AI quote generation work?',
      answer: 'Our AI analyzes your client conversations and project details to automatically generate professional quotes. Simply provide the context, and our AI will create a detailed, accurate quote based on your specifications and pricing patterns.',
    },
    {
      question: 'Can I cancel my subscription anytime?',
      answer: 'Yes! You can cancel your subscription at any time. Your plan will remain active until the end of your current billing period, and you won\'t be charged again.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express), debit cards, and PayPal. All payments are processed securely through Stripe.',
    },
    {
      question: 'What happens to my data if I cancel?',
      answer: 'Your data remains accessible for 30 days after cancellation. You can export all your quotes, invoices, and client data at any time. After 30 days, data is permanently deleted as per our privacy policy.',
    },
    {
      question: 'Do you offer refunds?',
      answer: 'We offer a 30-day money-back guarantee. If you\'re not satisfied with Quotla within the first 30 days, contact us for a full refund.',
    },
    {
      question: 'Can I upgrade or downgrade my plan?',
      answer: 'Absolutely! You can upgrade or downgrade your plan at any time. When upgrading, you\'ll get immediate access to new features. When downgrading, changes take effect at the start of your next billing cycle.',
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes! We use bank-level encryption (AES-256) to protect your data. All data is stored securely in SOC 2 compliant data centers, and we never share your information with third parties.',
    },
  ]


  return (
    <div className="min-h-screen" style={{backgroundColor: '#0e1616'}}>
      {/* Header */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[url('/images/patterns/grid/Quotla%20grid%20pattern%20light.svg')] bg-cover bg-center opacity-15"></div>
        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="font-heading text-5xl md:text-6xl font-bold text-quotla-light mb-6 leading-tight">
            Simple, Transparent Pricing
          </h1>
          <p className="font-sans text-xl text-primary-300 mb-4 leading-relaxed">
            Choose the plan that's right for your business
          </p>
          {isLoadingCurrency ? (
            <p className="text-sm text-primary-400">
              Detecting your location...
            </p>
          ) : currencyCode !== 'USD' ? (
            <p className="text-sm text-primary-400">
              Prices shown in {currencyCode} (converted from USD at rate: {exchangeRate.toFixed(4)})
            </p>
          ) : (
            <p className="text-sm text-primary-400">
              All prices in USD. Subscription billing in USD.
            </p>
          )}
        </div>
      </section>

      {/* Current Plan Overview - Only for Authenticated Users */}
      {user && profile && currentPlan && (
        <section className="pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-quotla-light mb-6">Your Current Plan</h2>

            <div className="bg-gradient-to-r from-primary-700 to-primary-600 border-2 border-primary-500 rounded-2xl p-8">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-quotla-light mb-2">
                    Current Plan: {currentPlan.name}
                  </h3>
                  <p className="text-primary-200">
                    {currentPlan.id === 'free'
                      ? "You're currently on the Free plan"
                      : `Active subscription - ${formatCurrency(currentPlan.priceUSD, 'USD')}/month`}
                  </p>
                </div>
                <Link
                  href="/billing"
                  className="mt-4 md:mt-0 inline-block px-6 py-3 rounded-lg font-medium transition-all"
                  style={{backgroundColor: '#ce6203', color: '#fffad6'}}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseDown={(e) => e.currentTarget.style.opacity = '0.7'}
                  onMouseUp={(e) => e.currentTarget.style.opacity = '0.9'}
                >
                  Manage Subscription
                </Link>
              </div>

              {/* Usage Stats */}
              {usageStats && (
                <div className="space-y-4 pt-6 border-t border-primary-500">
                  <p className="text-sm font-semibold text-primary-200 mb-3">
                    Usage for {usageStats.period}
                  </p>

                  {(() => {
                    const quotaInfo = getRemainingQuota(currentPlanId, usageStats)
                    if (!quotaInfo) return null

                    return (
                      <>
                        {/* AI Quotes */}
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-primary-200">AI Quotes</span>
                            <span className="font-medium text-quotla-light">
                              {formatQuota(quotaInfo.aiQuotes.used, quotaInfo.aiQuotes.total)}
                            </span>
                          </div>
                          <div className="w-full bg-primary-600 rounded-full h-2">
                            <div
                              className="bg-quotla-orange h-2 rounded-full transition-all"
                              style={{ width: `${Math.min(quotaInfo.aiQuotes.percentage, 100)}%` }}
                            />
                          </div>
                        </div>

                        {/* Manual Quotes */}
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-primary-200">Manual Quotes</span>
                            <span className="font-medium text-quotla-light">
                              {formatQuota(quotaInfo.quotes.used, quotaInfo.quotes.total)}
                            </span>
                          </div>
                          <div className="w-full bg-primary-600 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full transition-all"
                              style={{ width: `${Math.min(quotaInfo.quotes.percentage, 100)}%` }}
                            />
                          </div>
                        </div>

                        {/* Invoices */}
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-primary-200">Invoices</span>
                            <span className="font-medium text-quotla-light">
                              {formatQuota(quotaInfo.invoices.used, quotaInfo.invoices.total)}
                            </span>
                          </div>
                          <div className="w-full bg-primary-600 rounded-full h-2">
                            <div
                              className="bg-purple-600 h-2 rounded-full transition-all"
                              style={{ width: `${Math.min(quotaInfo.invoices.percentage, 100)}%` }}
                            />
                          </div>
                        </div>
                      </>
                    )
                  })()}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Pricing Cards */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {paidPlans.map((plan) => {
              const isCurrentPlan = plan.id === currentPlanId
              const isUpgradingThis = isUpgrading === plan.id

              return (
                <div
                  key={plan.name}
                  className={`relative rounded-2xl shadow-lg transition-all duration-300 hover:shadow-2xl ${
                    plan.popular
                      ? 'bg-gradient-to-br from-quotla-dark to-primary-800 border-2 border-quotla-orange scale-105'
                      : 'bg-white border-2 border-quotla-dark/10 hover:border-quotla-orange/50'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-quotla-orange text-white px-4 py-1 rounded-full text-xs font-semibold shadow-lg shadow-quotla-orange/40">
                        Most Popular
                      </span>
                    </div>
                  )}

                  {isCurrentPlan && (
                    <div className="absolute -top-3 right-4">
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        Current Plan
                      </span>
                    </div>
                  )}

                  <div className="p-6">
                    <h3 className={`text-xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-quotla-dark'}`}>
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className={`text-4xl font-bold ${plan.popular ? 'text-white' : 'text-quotla-dark'}`}>
                        {currencyCode !== 'USD' && convertedPrices[plan.priceUSD]
                          ? formatCurrency(convertedPrices[plan.priceUSD], currencyCode)
                          : formatCurrency(plan.priceUSD, 'USD')}
                      </span>
                      <span className={`text-sm ${plan.popular ? 'text-white/70' : 'text-quotla-dark/60'}`}>
                        /month
                      </span>
                    </div>
                    {currencyCode !== 'USD' && convertedPrices[plan.priceUSD] && (
                      <div className={`text-xs mb-4 ${plan.popular ? 'text-white/60' : 'text-quotla-dark/50'}`}>
                        ({formatCurrency(plan.priceUSD, 'USD')} USD)
                      </div>
                    )}

                    <ul className="space-y-3 mb-6 text-sm">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-2">
                          <svg
                            className={`w-4 h-4 flex-shrink-0 mt-0.5 ${plan.popular ? 'text-quotla-orange' : 'text-quotla-green'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className={plan.popular ? 'text-white' : 'text-quotla-dark/80'}>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={isCurrentPlan || isUpgradingThis}
                      className={`block w-full py-2.5 rounded-xl font-semibold text-center transition-all shadow-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                        plan.popular
                          ? 'bg-quotla-orange text-white hover:bg-secondary-600'
                          : 'bg-quotla-dark/10 text-quotla-dark hover:bg-quotla-dark/20'
                      }`}
                    >
                      {isUpgradingThis ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Processing...
                        </span>
                      ) : isCurrentPlan ? (
                        'Current Plan'
                      ) : user ? (
                        plan.cta
                      ) : (
                        'Get Started'
                      )}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-quotla-light text-center mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-primary-300 text-center mb-12">
            Everything you need to know about Quotla pricing
          </p>

          {/* FAQ Pills Navigation */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {['Billing', 'Features', 'Security', 'Support', 'Trial', 'Refunds'].map((category, index) => (
              <button
                key={category}
                onClick={() => setActiveFaq(index)}
                className="px-6 py-2 rounded-full font-medium transition-all shadow-md"
                style={{
                  backgroundColor: activeFaq === index ? '#ce6203' : '#2a2f2f',
                  color: activeFaq === index ? '#fffad6' : '#d1d5db'
                }}
                onMouseEnter={(e) => {
                  if (activeFaq !== index) {
                    e.currentTarget.style.backgroundColor = '#374151'
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeFaq !== index) {
                    e.currentTarget.style.backgroundColor = '#2a2f2f'
                  }
                }}
                onMouseDown={(e) => e.currentTarget.style.opacity = '0.7'}
                onMouseUp={(e) => e.currentTarget.style.opacity = '1'}
              >
                {category}
              </button>
            ))}
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isExpanded = activeFaq === index
              return (
                <div
                  key={index}
                  className="rounded-lg overflow-hidden transition-all"
                  style={{border: `1px solid ${isExpanded ? '#445642' : '#2a2f2f'}`}}
                >
                  <button
                    onClick={() => setActiveFaq(isExpanded ? null : index)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between transition-colors"
                    style={{backgroundColor: isExpanded ? '#2a2f2f' : '#1a1f1f'}}
                    onMouseEnter={(e) => {
                      if (!isExpanded) e.currentTarget.style.backgroundColor = '#2a2f2f'
                    }}
                    onMouseLeave={(e) => {
                      if (!isExpanded) e.currentTarget.style.backgroundColor = '#1a1f1f'
                    }}
                    onMouseDown={(e) => e.currentTarget.style.opacity = '0.7'}
                    onMouseUp={(e) => e.currentTarget.style.opacity = '1'}
                  >
                    <span className="font-semibold pr-4" style={{color: '#fffad6'}}>{faq.question}</span>
                    <svg
                      className={`w-5 h-5 transform transition-transform flex-shrink-0 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      style={{color: '#9ca3af'}}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      isExpanded ? 'max-h-96' : 'max-h-0'
                    }`}
                  >
                    <div className="px-6 py-4" style={{backgroundColor: '#1a1f1f', color: '#d1d5db', borderTop: '1px solid #2a2f2f'}}>
                      {faq.answer}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" style={{background: 'linear-gradient(135deg, #080b0b 0%, #1a1f1f 100%)'}}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6" style={{color: '#fffad6'}}>
            Ready to streamline your quoting process?
          </h2>
          <p className="text-xl mb-8" style={{color: '#d1d5db'}}>
            Join thousands of businesses using Quotla to create professional quotes in seconds
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="px-8 py-4 rounded-lg font-semibold transition-all shadow-lg"
              style={{backgroundColor: '#ce6203', color: '#fffad6'}}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              onMouseDown={(e) => e.currentTarget.style.opacity = '0.7'}
              onMouseUp={(e) => e.currentTarget.style.opacity = '0.9'}
            >
              Get Started
            </Link>
            <Link
              href="/demo"
              className="px-8 py-4 rounded-lg font-semibold transition-all"
              style={{border: '2px solid #fffad6', color: '#fffad6', backgroundColor: 'transparent'}}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#fffad6'
                e.currentTarget.style.color = '#0e1616'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = '#fffad6'
              }}
              onMouseDown={(e) => e.currentTarget.style.opacity = '0.7'}
              onMouseUp={(e) => e.currentTarget.style.opacity = '1'}
            >
              Watch Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}
