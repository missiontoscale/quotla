'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import Footer from '@/components/Footer'
import LoadingSpinner from '@/components/LoadingSpinner'
import Navbar from '@/components/Navbar'
import HeroCarousel from '@/components/home/HeroCarousel'
import PricingSection from '@/components/home/PricingSection'
import { detectUserCurrency, formatPrice, type Currency } from '@/lib/utils/currency'
import BusinessOwnerFeatures from '@/components/home/BusinessOwnerFeatures'

export default function HomePage() {
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [chatMessages, setChatMessages] = useState<Array<{role: string, content: string}>>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [promptCount, setPromptCount] = useState(0)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [placeholderText, setPlaceholderText] = useState('')
  const [placeholderPhraseIndex, setPlaceholderPhraseIndex] = useState(0)
  const [isPlaceholderDeleting, setIsPlaceholderDeleting] = useState(false)
  const [currency, setCurrency] = useState<Currency>({
    code: 'NGN',
    symbol: '₦',
    rate: 1,
  })
  const [isLoadingCurrency, setIsLoadingCurrency] = useState(true)

  const placeholderPhrases = [
    'Create a professional quote...',
    'Generate an invoice...',
    'Help me price my services...',
    'Ask about quotes and invoices...',
    'How can I help your business today?...',
    'Draft a quote for a new client...',
    'Calculate project pricing...',
    'What are best practices for invoicing?...',
    'Help me with my freelance business...',
    'Create a detailed estimate...',
    'Price my consulting services...',
    'Generate a client proposal...'
  ]

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsAuthenticated(!!session)
      setCheckingAuth(false)
    }
    checkAuth()
  }, [])

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

  // Typing animation for chat input placeholder
  useEffect(() => {
    // Only show typing animation when chat is empty
    if (chatMessages.length > 0) {
      setPlaceholderText('')
      return
    }

    const currentPhrase = placeholderPhrases[placeholderPhraseIndex]
    const typingSpeed = isPlaceholderDeleting ? 30 : 80
    const pauseBeforeDelete = 2000

    const timeout = setTimeout(() => {
      if (!isPlaceholderDeleting && placeholderText === currentPhrase) {
        setTimeout(() => setIsPlaceholderDeleting(true), pauseBeforeDelete)
      } else if (isPlaceholderDeleting && placeholderText === '') {
        setIsPlaceholderDeleting(false)
        setPlaceholderPhraseIndex((prev) => (prev + 1) % placeholderPhrases.length)
      } else if (isPlaceholderDeleting) {
        setPlaceholderText(currentPhrase.substring(0, placeholderText.length - 1))
      } else {
        setPlaceholderText(currentPhrase.substring(0, placeholderText.length + 1))
      }
    }, typingSpeed)

    return () => clearTimeout(timeout)
  }, [placeholderText, isPlaceholderDeleting, placeholderPhraseIndex, chatMessages.length, placeholderPhrases])

  const handleChatSend = async () => {
    if (!chatInput.trim() || chatLoading) return

    // Limit to 2 prompts for non-authenticated users
    if (!isAuthenticated && promptCount >= 2) {
      const updatedMessages = [...chatMessages,
        { role: 'user', content: chatInput },
        { role: 'assistant', content: 'You\'ve reached the free limit of 2 questions. Create a free account to continue chatting with unlimited access to Quotla AI!' }
      ]
      setChatMessages(updatedMessages)
      setChatInput('')

      // Save to localStorage before redirecting
      localStorage.setItem('quotla_chat_history', JSON.stringify(updatedMessages))
      localStorage.setItem('quotla_redirect_after_auth', 'true')
      return
    }

    const userMessage = chatInput
    setChatInput('')
    const newUserMessage = { role: 'user', content: userMessage }
    setChatMessages(prev => [...prev, newUserMessage])
    setChatLoading(true)
    setPromptCount(prev => prev + 1)

    try {
      // Get last 5 messages for context (10 total with user/assistant pairs)
      const recentMessages = chatMessages.slice(-10).map(m => ({
        role: m.role,
        content: m.content
      }))

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userMessage,
          history: recentMessages
        }),
      })

      if (!response.ok) {
        // Try to parse JSON error, but handle HTML responses gracefully
        let errorMessage = 'Failed to generate response'
        try {
          const data = await response.json()
          errorMessage = data.error || errorMessage
        } catch (e) {
          // Response wasn't JSON (likely an HTML error page)
          errorMessage = `Server error (${response.status})`
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()

      const updatedMessages = [...chatMessages, newUserMessage, { role: 'assistant', content: data.description }]
      setChatMessages(updatedMessages)

      // Save to localStorage for non-authenticated users
      if (!isAuthenticated) {
        localStorage.setItem('quotla_chat_history', JSON.stringify(updatedMessages))
      }
    } catch (error) {
      const errorText = error instanceof Error ? error.message : 'Sorry, I encountered an error. Please try again.'
      const errorMessage = { role: 'assistant', content: errorText }
      const updatedMessages = [...chatMessages, newUserMessage, errorMessage]
      setChatMessages(updatedMessages)

      // Save to localStorage for non-authenticated users
      if (!isAuthenticated) {
        localStorage.setItem('quotla_chat_history', JSON.stringify(updatedMessages))
      }
    } finally {
      setChatLoading(false)
    }
  }

  if (checkingAuth) {
    return <LoadingSpinner />
  }

  const features = [
    {
      title: "AI Quote Generation",
      description: "Create professional quotes with line items, pricing, and terms in seconds using natural language.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      color: "from-quotla-green to-quotla-orange"
    },
    {
      title: "Invoice Management",
      description: "Generate invoices, track payments, and organize your billing records.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: "from-quotla-dark to-quotla-green"
    },
    {
      title: "Inventory Management",
      description: "Track your products and services, manage stock levels, and integrate seamlessly with quotes and invoices.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      color: "from-quotla-green to-quotla-orange"
    },
    {
      title: "Multi-Currency Support",
      description: "Work with clients globally using USD, NGN, EUR, GBP and automatic currency conversion.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "from-quotla-dark to-quotla-green"
    },
    {
      title: "Income Summaries & Export",
      description: "View simple income summaries by month or year. Generate professional PDFs and share quotes and invoices with your clients.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: "from-quotla-green to-quotla-orange"
    },
    {
      title: "Client Portal",
      description: "Manage all your clients in one place with complete history and communication tracking.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      color: "from-quotla-dark to-quotla-green"
    }
  ]

  const useCases = [
    {
      category: "Freelancers",
      title: "Built for Independent Professionals",
      description: "Streamline your entire workflow from quote creation to payment tracking, all in one intuitive platform.",
      icon: (
        <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      link: "/about"
    },
    {
      category: "Small Business",
      title: "Grow Your Business Faster",
      description: "Automate quotes and invoices so you can focus on what matters: serving clients and scaling revenue.",
      icon: (
        <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      link: "/about"
    },
    {
      category: "Agencies",
      title: "Manage Multiple Clients with Ease",
      description: "Keep projects organized with professional quotes, invoices, and complete client history in one dashboard.",
      icon: (
        <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
      link: "/about"
    }
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-primary-800 transition-colors">
      {/* Skip to main content - Accessibility */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-white px-4 py-2 rounded-lg shadow-lg z-50">
        Skip to main content
      </a>

      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <main id="main-content" className="overflow-hidden">
        {/* Hero Carousel Section */}
        <HeroCarousel typingText="" />


        {/* Story Section 1: The Problem - Simplified with dark background */}
        <section className="relative py-32 bg-quotla-dark overflow-hidden">
          {/* Diagonal edge transition from previous dark section */}
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-br from-quotla-dark via-[#162020] to-quotla-green" style={{clipPath: 'polygon(0 0, 100% 0, 100% 60%, 0 100%)'}}></div>

          {/* Subtle background effects */}
          <div className="absolute inset-0">
            <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-quotla-orange/5 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-1/3 left-1/4 w-[500px] h-[500px] bg-quotla-green/10 rounded-full blur-[100px]"></div>
          </div>

          <div className="relative w-full px-4 sm:px-6 lg:px-20 pt-20">
            {/* Section intro */}
            <div className="text-center mb-20">
              <div className="inline-block px-6 py-2 bg-quotla-orange/15 backdrop-blur-sm rounded-full mb-6 border border-quotla-orange/30">
                <span className="font-heading text-sm font-bold text-quotla-orange tracking-widest">THE REALITY</span>
              </div>
              <h2 className="font-sans text-4xl md:text-5xl lg:text-6xl font-bold text-quotla-light mb-6 leading-tight">
                You didn't start your business<br/>to spend hours on quotes
              </h2>
              <p className="text-xl text-quotla-light/70 max-w-3xl mx-auto">
                Every hour formatting documents is an hour not serving clients, building relationships, or doing the work you actually love.
              </p>
            </div>

            {/* Problem illustration - simplified */}
            <div className="relative max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="relative order-2 lg:order-1">
                  {/* Simplified image presentation */}
                  <div className="relative group">
                    <div className="absolute -inset-4 bg-gradient-to-br from-quotla-orange/20 to-quotla-green/20 blur-2xl"></div>
                    <div className="relative overflow-hidden rounded-2xl" style={{clipPath: 'polygon(0 0, 100% 0, 100% 85%, 0 100%)'}}>
                      <img
                        src="/images/home/independent-professional.jpg"
                        alt="Professional working"
                        className="w-full h-auto shadow-2xl transform group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </div>
                </div>
                <div className="order-1 lg:order-2 space-y-6">
                  {[
                    { stat: "3-5 hours/week", text: "wasted on manual quote creation" },
                    { stat: "47%", text: "of freelancers delay quotes due to complexity" },
                    { stat: "$2,400/year", text: "lost to inefficient invoicing workflows" }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-2 h-2 bg-quotla-orange rounded-full mt-3"></div>
                      <div>
                        <div className="font-heading text-2xl md:text-3xl font-bold text-quotla-light mb-1">{item.stat}</div>
                        <div className="text-base md:text-lg text-quotla-light/70">{item.text}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Story Section 2: The Solution - Smooth color transition - CENTERED */}
        <section className="relative py-32 bg-gradient-to-b from-quotla-light via-quotla-green/10 to-quotla-dark overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <div className="inline-block px-6 py-2 bg-quotla-orange/20 backdrop-blur-sm rounded-full mb-6 border border-quotla-orange/30">
                <span className="font-heading text-sm font-bold text-quotla-orange tracking-widest">THE SOLUTION</span>
              </div>
              <h2 className="font-sans text-5xl md:text-6xl font-bold text-quotla-dark mb-6 leading-tight">
                What if creating quotes<br/>
                <span className="text-quotla-orange">was actually enjoyable?</span>
              </h2>
            </div>

            {/* Use Cases Grid */}
            <div className="grid md:grid-cols-3 gap-8">
              {useCases.map((useCase, idx) => (
                <Link key={idx} href={useCase.link} className="group">
                  <div className={`relative h-[550px] overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-quotla-orange/30 hover:scale-[1.02] ${
                    idx === 0 ? 'rounded-tl-[80px] rounded-br-[80px] rounded-tr-2xl rounded-bl-2xl' :
                    idx === 1 ? 'rounded-3xl' :
                    'rounded-tr-[80px] rounded-bl-[80px] rounded-tl-2xl rounded-br-2xl'
                  }`}>
                    <img
                      src={
                        useCase.category === 'Freelancers'
                          ? '/images/home/freelancer.jpg'
                          : useCase.category === 'Small Business'
                          ? '/images/home/business-owner.jpg'
                          : '/images/home/managing-multiple-cleints.jpg'
                      }
                      alt={useCase.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => {
                        e.currentTarget.src = '/images/about/A2.jpg'
                      }}
                    />
                    {/* Gradient overlay with slide-up effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-quotla-dark via-quotla-dark/60 to-transparent group-hover:from-quotla-dark/95 group-hover:via-quotla-dark/80 flex items-end transition-all duration-500">
                      <div className="p-10 w-full transform transition-transform duration-500 group-hover:-translate-y-2">
                        <div className="font-heading text-xs font-bold text-quotla-orange uppercase tracking-widest mb-4">{useCase.category}</div>
                        <h4 className="font-sans text-3xl font-bold text-quotla-light mb-4 leading-tight">
                          {useCase.title}
                        </h4>
                        <p className="text-lg text-quotla-light/90 leading-relaxed">
                          {useCase.description}
                        </p>
                        {/* Arrow indicator */}
                        <div className="mt-6 flex items-center gap-2 text-quotla-orange font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          <span>Learn more</span>
                          <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Story Section 3: Features - Bold showcase - FULL WIDTH */}
        <section className="relative py-32 bg-quotla-dark overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-quotla-orange/10 rounded-full blur-[150px] animate-morph"></div>
            <div className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-quotla-green/15 rounded-full blur-[130px] animate-morph" style={{animationDelay: '10s'}}></div>
            <div className="absolute inset-0 bg-[url('/images/patterns/grid/Quotla%20grid%20pattern%20light.svg')] bg-center opacity-[0.02]" style={{backgroundSize: '150%'}}></div>
          </div>

          <div className="relative w-full px-4 sm:px-6 lg:px-20">
            <div className="text-center mb-20">
              <div className="inline-block px-6 py-2 bg-quotla-light/10 backdrop-blur-sm rounded-full mb-6 border border-quotla-light/20">
                <span className="font-heading text-sm font-bold text-quotla-light tracking-widest">FEATURES THAT WORK</span>
              </div>
              <h2 className="font-sans text-5xl md:text-6xl font-bold text-quotla-light mb-6 leading-tight">
                Everything you need.<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-quotla-orange via-secondary-400 to-quotla-light">Nothing you don't.</span>
              </h2>
              <p className="text-xl text-quotla-light/70 max-w-3xl mx-auto">
                Built for real businesses, not feature bloat. Every tool serves a purpose.
              </p>
            </div>

            {/* Features grid with creative card design */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  className="group relative bg-quotla-light/5 backdrop-blur-sm rounded-3xl p-8 border-2 border-quotla-light/10 hover:border-quotla-orange hover:bg-quotla-light/10 transition-all duration-500 hover:scale-[1.03] animate-diagonal-slide overflow-hidden"
                  style={{animationDelay: `${idx * 0.08}s`}}
                >
                  {/* Hover gradient effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-quotla-orange/0 via-transparent to-quotla-green/0 group-hover:from-quotla-orange/10 group-hover:to-quotla-green/10 transition-all duration-500 rounded-3xl"></div>

                  <div className="relative z-10">
                    {/* Icon with unique positioning */}
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} text-white mb-6 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-xl`}>
                      {feature.icon}
                    </div>

                    <h4 className="font-sans text-2xl font-bold text-quotla-light mb-4 group-hover:text-quotla-orange transition-colors">{feature.title}</h4>
                    <p className="font-sans text-base text-quotla-light/70 leading-relaxed">{feature.description}</p>

                    {/* Decorative element */}
                    <div className="absolute top-6 right-6 w-20 h-20 border-2 border-quotla-light/5 rounded-full group-hover:border-quotla-orange/30 transition-all duration-500"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Story Section 4: Social Proof - Testimonial with visual impact - CENTERED */}
        <section className="relative py-32 bg-gradient-to-br from-quotla-light via-white to-quotla-green/20 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-20 left-10 w-96 h-96 bg-quotla-green/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-quotla-orange/10 rounded-full blur-3xl"></div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Image side with creative framing */}
              <div className="relative order-2 lg:order-1">
                <div className="absolute -inset-4 bg-gradient-to-br from-quotla-orange/30 to-quotla-green/30 blur-2xl"></div>
                {/* Hexagon-style clipped image */}
                <div className="relative overflow-hidden" style={{clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)'}}>
                  <img
                    src="/images/home/independent-professional.jpg"
                    alt="Professional business portrait"
                    className="relative shadow-2xl w-full h-auto object-cover transform hover:scale-110 transition-transform duration-700"
                  />
                </div>
                {/* Floating badge */}
                <div className="absolute -bottom-8 -right-8 bg-quotla-dark text-quotla-light px-8 py-6 rounded-2xl shadow-2xl border-4 border-quotla-light">
                  <div className="font-heading text-4xl font-bold mb-1">2 min</div>
                  <div className="text-sm text-quotla-light/80">avg. quote time</div>
                </div>
              </div>

              {/* Testimonial side */}
              <div className="order-1 lg:order-2 space-y-8">
                <div className="inline-block px-6 py-2 bg-quotla-dark/10 rounded-full mb-4">
                  <span className="font-heading text-sm font-bold text-quotla-dark tracking-widest">A QUOTLA STORY </span>
                </div>

                {/* Large quote mark */}
                <svg className="w-16 h-16 text-quotla-orange/30" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>

                <blockquote className="font-sans text-4xl md:text-5xl font-bold text-quotla-dark leading-tight">
                  With Quotla, I close more deals in less time thanks to their automation.
                </blockquote>

                <div className="flex items-center gap-4 pt-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-quotla-orange to-quotla-green"></div>
                  <div>
                    <div className="font-heading font-bold text-quotla-dark text-lg">Owen H.</div>
                    <div className="text-quotla-dark/60">Creative Director</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Story Section 5: Mission Statement - Reversed layout - FULL WIDTH */}
        <section className="relative py-32 bg-gradient-to-br from-quotla-dark via-[#1a2820] to-quotla-green overflow-hidden">
        
          <div className="relative w-full px-4 sm:px-6 lg:px-20">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Text side */}
              <div className="space-y-8">
                <div className="inline-block px-6 py-2 bg-quotla-light/10 backdrop-blur-sm rounded-full border border-quotla-light/20">
                  <span className="font-heading text-sm font-bold text-quotla-light tracking-widest">OUR MISSION</span>
                </div>

                <h2 className="font-sans text-4xl md:text-5xl font-bold text-quotla-light leading-tight">
                  Built by entrepreneurs,<br/>
                  <span className="text-quotla-orange">for entrepreneurs</span>
                </h2>

                <p className="text-xl text-quotla-light/80 leading-relaxed">
                  We've walked in your shoes. The late nights, the client calls, the never-ending admin work. Quotla was born from that struggle—a tool to give you back your most precious resource: time.
                </p>

                {/* Quote card */}
                <div className="bg-quotla-light/10 backdrop-blur-md rounded-2xl p-8 border border-quotla-light/20">
                  <svg className="w-12 h-12 text-quotla-orange/40 mb-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                  <p className="text-quotla-light/90 text-lg italic leading-relaxed mb-6">
                    Time is your most valuable asset. Every hour on admin is an hour not growing your business. That's why we built Quotla.
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-quotla-orange to-quotla-green"></div>
                    <div>
                      <div className="font-heading font-bold text-quotla-light">The Quotla Team</div>
                      <div className="text-quotla-light/60 text-sm">Building better business tools</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Image side */}
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-br from-quotla-orange/20 to-quotla-green/20 blur-3xl"></div>
                {/* Asymmetric rounded corners */}
                <div className="relative overflow-hidden rounded-tl-[100px] rounded-br-[100px] rounded-tr-3xl rounded-bl-3xl shadow-2xl">
                  <img
                    src="/images/home/business-owner2.jpg"
                    alt="Business professional"
                    className="w-full object-cover transform hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Business Owner Features Section */}
        <BusinessOwnerFeatures />

        {/* Story Section 6: Pricing - Wave transition - CENTERED */}
        <PricingSection currency={currency} isLoadingCurrency={isLoadingCurrency} />

        {/* Story Section 7: FAQ - Asymmetric background */}
        <section className="relative py-32 bg-gradient-to-br from-quotla-dark via-[#1a2820] to-quotla-dark overflow-hidden">
          {/* Creative background elements */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-1/2 h-full bg-quotla-orange/5 transform -skew-x-12"></div>
            <div className="absolute inset-0 bg-[url('/images/patterns/grid/Quotla%20grid%20pattern%20light.svg')] bg-center opacity-[0.02]" style={{backgroundSize: '150%'}}></div>
          </div>

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <div className="inline-block px-6 py-2 bg-quotla-light/10 backdrop-blur-sm rounded-full mb-6 border border-quotla-light/20">
                <span className="font-heading text-sm font-bold text-quotla-light tracking-widest">GOT QUESTIONS?</span>
              </div>
              <h2 className="font-sans text-5xl md:text-6xl font-bold text-quotla-light mb-6 leading-tight">
                We've got<br/>
                <span className="text-quotla-orange">answers</span>
              </h2>
              <p className="text-xl text-quotla-light/70 max-w-2xl mx-auto">
                Everything you need to know before you get started
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  question: "How does Quotla's AI work?",
                  answer: "Quotla Agent uses advanced AI to understand your business needs in plain language. Simply describe what you need - like 'Create a quote for website design with 3 pages and hosting' - and our AI generates a professional, itemized quote in seconds."
                },
                {
                  question: "Do I need technical skills to use Quotla?",
                  answer: "Not at all! Quotla is designed to be intuitive. If you can describe your services in everyday language, you can use Quotla. No templates to learn, no complicated forms to fill out."
                },
                {
                  question: "Can I customize the quotes and invoices?",
                  answer: "Absolutely! While our AI creates quotes instantly, you have complete control to edit, customize, and brand every document. Add your logo, adjust pricing, modify terms - everything is fully editable."
                },
                {
                  question: "What currencies does Quotla support?",
                  answer: "Quotla supports USD, NGN, EUR, and GBP with automatic currency conversion. Perfect for working with international clients or managing multi-currency businesses."
                },
                {
                  question: "Is my data secure?",
                  answer: "Yes! We use industry-standard encryption and security measures to protect your data. Your quotes, invoices, and client information are stored securely and are only accessible to you."
                },
                {
                  question: "Can I try Quotla for free?",
                  answer: "Yes! Our free plan includes 2 AI questions, basic quote creation, and PDF export. No credit card required. Upgrade anytime for unlimited access to all features."
                }
              ].map((faq, idx) => (
                <div key={idx} className="group bg-quotla-light/5 backdrop-blur-sm rounded-2xl border-2 border-quotla-light/10 overflow-hidden transition-all duration-500 hover:border-quotla-orange hover:bg-quotla-light/10">
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-8 text-left hover:bg-quotla-light/5 transition-colors"
                    aria-expanded={openFaq === idx}
                  >
                    <h4 className="font-sans text-xl font-bold text-quotla-light pr-8 group-hover:text-quotla-orange transition-colors">{faq.question}</h4>
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-quotla-light/10 flex items-center justify-center transition-all duration-500 ${openFaq === idx ? 'bg-quotla-orange rotate-180' : 'group-hover:bg-quotla-light/20'}`}>
                      <svg
                        className="w-5 h-5 text-quotla-light transition-transform duration-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-500 ${openFaq === idx ? 'max-h-96' : 'max-h-0'}`}
                  >
                    <div className="px-8 pb-8 pt-0">
                      <p className="text-quotla-light/80 text-lg leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA - Bold finish with creative split design */}
        <section className="relative py-40 overflow-hidden">
          {/* Split background */}
          <div className="absolute inset-0 bg-gradient-to-br from-quotla-orange via-secondary-500 to-quotla-dark"></div>
          <div className="absolute inset-0 bg-[url('/images/patterns/spiral/Quotla%20Spiral%20orange.svg')] bg-center opacity-[0.05]" style={{backgroundSize: '100%'}}></div>

          {/* Animated orbs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-quotla-light/10 rounded-full blur-3xl animate-morph"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-quotla-dark/20 rounded-full blur-3xl animate-morph" style={{animationDelay: '5s'}}></div>

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-block px-6 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-8 border border-white/30">
              <span className="font-heading text-sm font-bold text-white tracking-widest">READY TO START?</span>
            </div>

            <h2 className="font-sans text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
              Stop wasting time.<br/>
              <span className="text-quotla-dark">Start building.</span>
            </h2>

            <p className="text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
              Join thousands who've transformed their workflow with Quotla
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <a
                href="#pricing"
                onClick={(e) => {
                  e.preventDefault()
                  document.querySelector('#pricing')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="group relative px-12 py-6 rounded-2xl text-xl font-bold bg-quotla-dark text-quotla-light hover:bg-quotla-dark/90 transition-all shadow-2xl hover:shadow-quotla-dark/80 hover:scale-105 overflow-hidden"
              >
                <span className="relative z-10">See plans & pricing</span>
                <div className="absolute inset-0 bg-quotla-light/10 transform -skew-x-12 translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
              </a>

              <Link
                href="/about"
                className="px-12 py-6 rounded-2xl text-xl font-bold bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 hover:bg-white/20 hover:border-white/50 transition-all"
              >
                Learn more
              </Link>
            </div>

            <p className="text-white/70 mt-8">
              Free to start • No credit card • 2-minute setup
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
