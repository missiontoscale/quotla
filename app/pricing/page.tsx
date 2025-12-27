'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { detectUserCurrency, formatPrice, type Currency } from '@/lib/utils/currency'
import { SUBSCRIPTION_PLANS, getRemainingQuota, formatQuota, type UsageStats } from '@/lib/constants/plans'
import { useAuth } from '@/contexts/AuthContext'
import LoadingSpinner from '@/components/LoadingSpinner'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function PricingPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const [currency, setCurrency] = useState<Currency>({
    code: 'USD',
    symbol: '$',
    rate: 1,
  })
  const [activeFaq, setActiveFaq] = useState<number | null>(null)
  const [isLoadingCurrency, setIsLoadingCurrency] = useState(true)
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null)

  // Detect user's location and set currency with live rates
  useEffect(() => {
    const loadCurrency = async () => {
      setIsLoadingCurrency(true)
      const detectedCurrency = await detectUserCurrency()
      setCurrency(detectedCurrency)
      setIsLoadingCurrency(false)
    }

    loadCurrency()
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

  // Show all plans for authenticated users, filter free for public
  const displayPlans = user
    ? SUBSCRIPTION_PLANS
    : SUBSCRIPTION_PLANS.filter(plan => plan.id !== 'free')

  // Get current user's plan
  const currentPlanId = profile?.subscription_plan || 'free'
  const currentPlan = displayPlans.find(p => p.id === currentPlanId)

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
      question: 'Is there a free trial available?',
      answer: 'Yes! All new users get a 14-day free trial with full access to all features. No credit card required to start your trial.',
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
          <p className="text-sm text-primary-400">
            {isLoadingCurrency
              ? 'Loading prices...'
              : `Prices shown in ${currency.code} (live rates). All plans include a 14-day free trial.`
            }
          </p>
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
                      : `Active subscription - ${formatPrice(currentPlan.priceUSD, currency)}/month`}
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
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {displayPlans.map((plan) => (
              <div
                key={plan.name}
                className={`relative bg-primary-800 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-2xl ${
                  plan.popular ? 'border-2 border-quotla-orange scale-105' : 'border border-primary-700'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
                    <span className="bg-quotla-orange text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg shadow-quotla-orange/40">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="p-8">
                  <h3 className="text-2xl font-bold text-quotla-light mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-5xl font-bold text-quotla-light">
                      {formatPrice(plan.priceUSD, currency)}
                    </span>
                    <span className="text-primary-300 text-lg">/month</span>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <svg
                          className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="text-primary-200">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {(() => {
                    const isCurrentPlan = user && currentPlanId === plan.id
                    const ctaText = isCurrentPlan
                      ? 'Current Plan'
                      : user
                        ? `Switch to ${plan.name}`
                        : plan.cta

                    if (isCurrentPlan) {
                      return (
                        <div
                          className="block w-full py-4 rounded-xl font-semibold text-center cursor-not-allowed"
                          style={{backgroundColor: '#2a2f2f', color: '#9ca3af'}}
                        >
                          {ctaText}
                        </div>
                      )
                    }

                    return (
                      <Link
                        href={user ? "/billing" : "/signup"}
                        className="block w-full py-4 rounded-xl font-semibold text-center transition-all shadow-lg"
                        style={{
                          backgroundColor: plan.popular ? '#ce6203' : '#2a2f2f',
                          color: '#fffad6'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                        onMouseDown={(e) => e.currentTarget.style.opacity = '0.7'}
                        onMouseUp={(e) => e.currentTarget.style.opacity = '0.9'}
                      >
                        {ctaText}
                      </Link>
                    )
                  })()}
                </div>
              </div>
            ))}
          </div>

          {/* Enterprise Option */}
          <div className="mt-12 text-center">
            <p className="mb-4" style={{color: '#d1d5db'}}>
              Need a custom solution for your enterprise?
            </p>
            <Link
              href="/contact"
              className="inline-block px-8 py-3 rounded-lg font-semibold transition-all"
              style={{border: '2px solid #ce6203', color: '#fffad6', backgroundColor: 'transparent'}}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#ce6203'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
              onMouseDown={(e) => e.currentTarget.style.opacity = '0.7'}
              onMouseUp={(e) => e.currentTarget.style.opacity = '1'}
            >
              Contact Sales
            </Link>
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
              Start Free Trial
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
