'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import Footer from '@/components/Footer'
import LoadingSpinner from '@/components/LoadingSpinner'
import Navbar from '@/components/Navbar'
import { detectUserCurrency, formatPrice, type Currency } from '@/lib/utils/currency'

export default function HomePage() {
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [chatMessages, setChatMessages] = useState<Array<{role: string, content: string}>>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [promptCount, setPromptCount] = useState(0)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [typingText, setTypingText] = useState('')
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [placeholderText, setPlaceholderText] = useState('')
  const [placeholderPhraseIndex, setPlaceholderPhraseIndex] = useState(0)
  const [isPlaceholderDeleting, setIsPlaceholderDeleting] = useState(false)
  const [currency, setCurrency] = useState<Currency>({
    code: 'USD',
    symbol: '$',
    rate: 1,
  })
  const [isLoadingCurrency, setIsLoadingCurrency] = useState(true)

  const phrases = [
    'Create quotes in seconds',
    'Track invoices effortlessly',
    'Get paid faster',
    'Simplify your workflow'
  ]

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

  useEffect(() => {
    // Start typing immediately on mount
    if (typingText === '' && !isDeleting && phraseIndex === 0) {
      setTypingText(phrases[0].charAt(0))
      return
    }

    const currentPhrase = phrases[phraseIndex]
    const typingSpeed = isDeleting ? 50 : 100
    const pauseBeforeDelete = 2000

    const timeout = setTimeout(() => {
      if (!isDeleting && typingText === currentPhrase) {
        // Finished typing, pause then start deleting
        setTimeout(() => setIsDeleting(true), pauseBeforeDelete)
      } else if (isDeleting && typingText === '') {
        // Finished deleting, move to next phrase
        setIsDeleting(false)
        setPhraseIndex((prev) => (prev + 1) % phrases.length)
      } else if (isDeleting) {
        // Continue deleting
        setTypingText(currentPhrase.substring(0, typingText.length - 1))
      } else {
        // Continue typing
        setTypingText(currentPhrase.substring(0, typingText.length + 1))
      }
    }, typingSpeed)

    return () => clearTimeout(timeout)
  }, [typingText, isDeleting, phraseIndex, phrases])

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
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Inventory Management",
      description: "Track your products and services, manage stock levels, and integrate seamlessly with quotes and invoices.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Multi-Currency Support",
      description: "Work with clients globally using USD, NGN, EUR, GBP and automatic currency conversion.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "from-orange-500 to-red-500"
    },
    {
      title: "Income Summaries & Export",
      description: "View simple income summaries by month or year. Generate professional PDFs and share quotes and invoices with your clients.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: "from-green-500 to-emerald-500"
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
      color: "from-quotla-light/50 to-quotla-green/20",
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
      color: "from-purple-500/20 to-pink-500/20",
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
      color: "from-orange-500/20 to-red-500/20",
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
        {/* Hero Section with Chat */}
        <section className="relative min-h-screen flex items-center py-20 lg:py-28 bg-gradient-to-br from-quotla-light via-quotla-light/80 to-quotla-green/20 dark:from-primary-800 dark:via-quotla-dark dark:to-primary-800">
          <div className="absolute inset-0 bg-[url('/images/patterns/grid/Quotla%20grid%20pattern%20light.svg')] bg-center opacity-5 dark:opacity-[0.05]" style={{backgroundSize: '150%'}}></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="lg:grid lg:grid-cols-5 lg:gap-16 lg:items-start">
              {/* Text Section - Spans 3 columns */}
              <div className="lg:col-span-3 text-left mb-12 lg:mb-0 lg:pt-12">
                <h2 className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold text-quotla-dark dark:text-primary-50 mb-6 leading-tight min-h-[1.2em] transition-colors">
                  {typingText}
                  <span className="animate-pulse">|</span>
                </h2>
                <p className="font-sans text-xl text-quotla-dark/80 dark:text-primary-300 lg:max-w-2xl leading-relaxed mb-8 transition-colors">
                  Quotla helps you create professional quotes and invoices in seconds. Powered by AI, designed for freelancers and small businesses who want to spend less time on paperwork and more time doing what they love.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center px-8 py-4 rounded-xl text-lg font-semibold bg-quotla-dark text-quotla-light hover:bg-quotla-dark/90 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    Get started free
                  </Link>
                  <Link
                    href="/about"
                    className="inline-flex items-center justify-center px-8 py-4 rounded-xl text-lg font-semibold bg-transparent text-quotla-dark hover:bg-quotla-dark/5 transition-all border-2 border-quotla-dark/20"
                  >
                    Learn more
                  </Link>
                </div>
                {!isAuthenticated && (
                  <p className="text-sm text-quotla-dark/60 dark:text-primary-400">
                    Start with 2 free AI questions • No credit card required
                  </p>
                )}
              </div>

              {/* Interactive Chat Interface - Spans 2 columns, sticky */}
              <div className="lg:col-span-2 lg:sticky lg:top-24">
                <div className="bg-quotla-light dark:bg-primary-700 rounded-3xl shadow-2xl border-2 border-quotla-dark/10 dark:border-quotla-light/20 overflow-hidden transition-colors backdrop-blur-sm">
                  {chatMessages.length > 0 ? (
                    <div className="p-6 max-h-[500px] overflow-y-auto space-y-4 bg-quotla-light/50 dark:bg-primary-800/50">
                      {chatMessages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] rounded-2xl px-5 py-3 shadow-sm ${
                            msg.role === 'user'
                              ? 'bg-quotla-dark text-quotla-light'
                              : 'bg-quotla-light/90 text-quotla-dark border border-quotla-dark/10'
                          }`}>
                            <p className="text-base leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                          </div>
                        </div>
                      ))}
                      {chatLoading && (
                        <div className="flex justify-start">
                          <div className="bg-quotla-light/90 border border-quotla-dark/10 rounded-2xl px-5 py-3">
                            <div className="flex space-x-2">
                              <div className="w-2 h-2 bg-quotla-dark/40 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-quotla-dark/40 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                              <div className="w-2 h-2 bg-quotla-dark/40 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-16 text-center bg-quotla-light/50 dark:bg-primary-800/50">
                      <div className="mb-6">
                        <img
                          src="/images/logos/icons/Quotla icon off white.svg"
                          alt="Quotla icon"
                          className="w-16 h-16 mx-auto opacity-30 dark:opacity-40 mb-4 transition-opacity"
                        />
                        <p className="text-quotla-dark/70 dark:text-primary-300 text-lg font-semibold transition-colors">Ask me anything</p>
                        <p className="text-quotla-dark/50 dark:text-primary-400 text-sm mt-2">Try "Create a quote for website design"</p>
                      </div>
                    </div>
                  )}

                  {/* Chat Input */}
                  <div className="p-4 bg-quotla-light/70 dark:bg-primary-700 border-t-2 border-quotla-dark/10 dark:border-primary-600 transition-colors">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleChatSend()}
                        placeholder={
                          promptCount >= 2 && !isAuthenticated
                            ? "Sign up to continue..."
                            : placeholderText || "What can I help with?..."
                        }
                        className="flex-1 px-5 py-4 rounded-xl bg-quotla-light dark:bg-quotla-light border-2 border-quotla-dark/20 dark:border-quotla-dark/30 text-quotla-dark placeholder-quotla-dark/40 dark:placeholder-quotla-dark/50 focus:outline-none focus:ring-2 focus:ring-quotla-orange dark:focus:ring-quotla-orange focus:border-transparent disabled:opacity-50 text-base transition-all caret-quotla-dark"
                        disabled={chatLoading || (!isAuthenticated && promptCount >= 2)}
                      />
                      <button
                        onClick={handleChatSend}
                        disabled={!chatInput.trim() || chatLoading || (!isAuthenticated && promptCount >= 2)}
                        aria-label="Send message"
                        className="px-6 py-4 rounded-xl bg-quotla-dark text-quotla-light font-semibold hover:bg-quotla-dark/90 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </button>
                    </div>
                    {!isAuthenticated && promptCount > 0 && (
                      <p className="text-xs text-quotla-dark/50 dark:text-primary-400 mt-2 text-center">
                        {promptCount}/2 free questions used • <Link href="/signup" className="text-quotla-dark dark:text-primary-600 hover:underline font-semibold">Sign up</Link> for unlimited
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-gradient-to-br from-primary-800 via-quotla-dark to-primary-800 relative">
          <div className="absolute inset-0 bg-[url('/images/patterns/grid/Quotla%20grid%20pattern%20light.svg')] bg-center opacity-[0.05]" style={{backgroundSize: '150%'}}></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h3 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6">What's the big deal?</h3>
              <p className="font-sans text-xl text-quotla-light/90 max-w-2xl mx-auto leading-relaxed">
                Quotla is helping professionals, business owners, & entrepreneurs manage quotes, invoices, and inventory with ease.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, idx) => (
                <div key={idx} className="group relative bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:border-quotla-orange/80 hover:bg-white/15 hover:shadow-2xl transition-all duration-300">
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} text-white text-2xl mb-5 transform group-hover:scale-110 transition-transform shadow-lg`}>
                    {feature.icon}
                  </div>
                  <h4 className="font-heading text-xl font-semibold text-white mb-4">{feature.title}</h4>
                  <p className="font-sans text-base text-quotla-light/80 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Clients & Partners Section */}
        <section className="py-20 bg-gradient-to-br from-quotla-dark via-quotla-dark/95 to-primary-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/images/patterns/grid/Quotla%20grid%20pattern%20light.svg')] bg-center opacity-[0.03]" style={{backgroundSize: '150%'}}></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-4">
              <p className="font-heading text-[34px] md:text-[43px] font-bold text-white leading-relaxed">By partnering with industry leaders we can boast of top notch delivery</p>
            </div>

            {/* Horizontal scrolling logos */}
            <div className="relative overflow-hidden py-4 scale-90">
              <div className="flex animate-scroll-left space-x-8">
                {/* Duplicate the logo set 3 times for seamless infinite scroll */}
                {[0, 1, 2].map((setIndex) => (
                  <div key={setIndex} className="flex space-x-8 shrink-0">
                    {['Canva', 'Anthropic', 'Netlify', 'Google', 'Stripe', 'Supabase', 'Open AI'].map((partner) => (
                      <div
                        key={`${setIndex}-${partner}`}
                        className="group flex items-center justify-center w-52 h-28 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-5 shadow-lg hover:bg-white/15 hover:border-white/30 hover:shadow-xl transition-all duration-300"
                      >
                        <img
                          src={`/images/logos of partners/${partner}.svg`}
                          alt={`${partner} logo`}
                          className="max-w-full max-h-full object-contain filter brightness-0 invert opacity-70 group-hover:opacity-100 transition-opacity scale-115"
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="py-24 bg-primary-700 relative">
          <div className="absolute inset-0 bg-[url('/images/patterns/grid/Quotla%20grid%20pattern%20light.svg')] bg-center opacity-[0.03]" style={{backgroundSize: '150%'}}></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h3 className="font-heading text-4xl md:text-5xl font-bold text-primary-50 mb-6">Built for your business</h3>
              <p className="font-sans text-xl text-primary-300 max-w-2xl mx-auto leading-relaxed">
                Join thousands of professionals who trust Quotla to manage their business
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {useCases.map((useCase, idx) => (
                <Link key={idx} href={useCase.link} className="group">
                  <div className="bg-white rounded-2xl overflow-hidden border border-primary-600 hover:border-primary-500 hover:shadow-xl transition-all duration-300">
                    <div className={`h-48 bg-gradient-to-br ${useCase.color} flex items-center justify-center relative`}>
                      <div className="absolute inset-0 bg-gradient-to-br from-primary-900/5 to-primary-900/10"></div>
                      <div className="relative text-primary-600 opacity-70 group-hover:opacity-90 transition-opacity">
                        {useCase.icon}
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="font-sans text-xs font-semibold text-quotla-orange uppercase tracking-wide mb-3">{useCase.category}</div>
                      <h4 className="font-heading text-xl font-bold text-quotla-dark mb-3 group-hover:text-quotla-orange transition-colors">{useCase.title}</h4>
                      <p className="font-sans text-base text-gray-700 leading-relaxed">{useCase.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-24 bg-gradient-to-br from-quotla-dark via-primary-800 to-quotla-dark relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/images/patterns/grid/Quotla%20grid%20pattern%20light.svg')] bg-center opacity-[0.03]" style={{backgroundSize: '150%'}}></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h3 className="font-heading text-[34px] md:text-[43px] font-bold text-white mb-6">Loved by professionals worldwide</h3>
              <p className="font-sans text-xl text-quotla-light/80 max-w-2xl mx-auto leading-relaxed">
                Here's what Quotla users have to tell you . . .
              </p>
            </div>

            {/* Horizontal scrolling testimonials */}
            <div className="relative overflow-hidden py-4">
              <div className="flex animate-scroll-left space-x-8">
                {/* Duplicate the testimonials 3 times for seamless infinite scroll */}
                {[0, 1, 2].map((setIndex) => (
                  <div key={setIndex} className="flex space-x-8 shrink-0">
                    {[
                      {
                        name: "Sarah Johnson",
                        role: "Freelance Designer",
                        avatar: "SJ",
                        testimonial: "Quotla has transformed how I handle my freelance business. Creating professional quotes used to take me hours, now it takes minutes. The AI assistance is incredible!",
                        rating: 5
                      },
                      {
                        name: "Michael Chen",
                        role: "Marketing Agency Owner",
                        avatar: "MC",
                        testimonial: "Managing multiple clients was a nightmare before Quotla. The ability to track quotes, invoices, and payments in one place has saved our agency countless hours.",
                        rating: 5
                      },
                      {
                        name: "Amara Okafor",
                        role: "Food Chain Owner",
                        avatar: "AO",
                        testimonial: "The multi-currency support is a game-changer for my business. I work with clients across different countries, and Quotla makes it seamless to handle different currencies.",
                        rating: 5
                      },
                    ].map((testimonial, idx) => (
                      <div key={`${setIndex}-${idx}`} className="w-96 bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/15 hover:border-quotla-orange/60 transition-all duration-300 shadow-xl shrink-0">
                        <div className="flex items-center mb-6">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-quotla-orange to-quotla-green flex items-center justify-center text-white font-bold text-lg mr-4">
                            {testimonial.avatar}
                          </div>
                          <div>
                            <h4 className="font-heading text-lg font-semibold text-white">{testimonial.name}</h4>
                            <p className="font-sans text-sm text-quotla-light/70">{testimonial.role}</p>
                          </div>
                        </div>
                        <p className="font-sans text-base text-quotla-light/90 leading-relaxed">
                          &ldquo;{testimonial.testimonial}&rdquo;
                        </p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Plans & Pricing Section */}
        <section id="pricing" className="py-24 bg-gradient-to-br from-quotla-light via-white to-quotla-light/80 relative">
          <div className="absolute inset-0 bg-[url('/images/patterns/grid/Quotla%20grid%20pattern%20light.svg')] bg-center opacity-5" style={{backgroundSize: '150%'}}></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h3 className="font-heading text-4xl md:text-5xl font-bold text-quotla-dark mb-6">Choose your perfect plan</h3>
              {/* <p className="font-sans text-xl text-quotla-dark/70 max-w-2xl mx-auto leading-relaxed">
                Choose the perfect plan for your business needs
              </p> */}
              <p className="text-sm text-quotla-dark/60 mt-2">
                {isLoadingCurrency
                  ? 'Loading prices...'
                  : `Prices shown in ${currency.code} (live rates)`
                }
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {/* Simple Start - $1 */}
              <div className="bg-white rounded-2xl p-6 border-2 border-quotla-dark/10 hover:border-quotla-orange/50 hover:shadow-xl transition-all duration-300">
                <div className="mb-6">
                  <h4 className="font-heading text-xl font-bold text-quotla-dark mb-2">Simple Start</h4>
                  <div className="flex items-baseline mb-2">
                    <span className="text-4xl font-bold text-quotla-dark">{formatPrice(1, currency)}</span>
                    <span className="text-quotla-dark/60 ml-2 text-sm">/month</span>
                  </div>
                  <p className="text-quotla-dark/70 text-sm">Build your financial foundation</p>
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
                <Link href="/signup" className="block w-full text-center px-4 py-2.5 rounded-xl text-sm font-semibold bg-quotla-dark/10 text-quotla-dark hover:bg-quotla-dark/20 transition-all">
                  Get Started
                </Link>
              </div>

              {/* Essentials */}
              <div className="bg-white rounded-2xl p-6 border-2 border-quotla-dark/10 hover:border-quotla-orange/50 hover:shadow-xl transition-all duration-300">
                <div className="mb-6">
                  <h4 className="font-heading text-xl font-bold text-quotla-dark mb-2">Essentials</h4>
                  <div className="flex items-baseline mb-2">
                    <span className="text-4xl font-bold text-quotla-dark">{formatPrice(5, currency)}</span>
                    <span className="text-quotla-dark/60 ml-2 text-sm">/month</span>
                  </div>
                  <p className="text-quotla-dark/70 text-sm">Save time and focus on growth</p>
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
                <Link href="/signup" className="block w-full text-center px-4 py-2.5 rounded-xl text-sm font-semibold bg-quotla-dark/10 text-quotla-dark hover:bg-quotla-dark/20 transition-all">
                  Choose Plan
                </Link>
              </div>

              {/* Plus - Most Popular */}
              <div className="bg-gradient-to-br from-quotla-dark to-primary-800 rounded-2xl p-6 border-2 border-quotla-orange shadow-2xl transform scale-105 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-quotla-orange text-white px-4 py-1 rounded-full text-xs font-semibold">
                  Best Value
                </div>
                <div className="mb-6">
                  <h4 className="font-heading text-xl font-bold text-white mb-2">Plus</h4>
                  <div className="flex items-baseline mb-2">
                    <span className="text-4xl font-bold text-white">{formatPrice(7, currency)}</span>
                    <span className="text-white/70 ml-2 text-sm">/month</span>
                  </div>
                  <p className="text-white/80 text-sm">Boost efficiency & profitability</p>
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
                <Link href="/signup" className="block w-full text-center px-4 py-2.5 rounded-xl text-sm font-semibold bg-quotla-orange text-white hover:bg-secondary-600 transition-all shadow-lg">
                  Choose Plan
                </Link>
              </div>

              {/* Advanced */}
              <div className="bg-white rounded-2xl p-6 border-2 border-quotla-dark/10 hover:border-quotla-orange/50 hover:shadow-xl transition-all duration-300">
                <div className="mb-6">
                  <h4 className="font-heading text-xl font-bold text-quotla-dark mb-2">Advanced</h4>
                  <div className="flex items-baseline mb-2">
                    <span className="text-4xl font-bold text-quotla-dark">{formatPrice(14, currency)}</span>
                    <span className="text-quotla-dark/60 ml-2 text-sm">/month</span>
                  </div>
                  <p className="text-quotla-dark/70 text-sm">Scale with customization</p>
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
                <Link href="/signup" className="block w-full text-center px-4 py-2.5 rounded-xl text-sm font-semibold bg-quotla-dark text-white hover:bg-quotla-dark/90 transition-all">
                  Choose Plan
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 bg-gradient-to-br from-primary-700 via-quotla-dark to-primary-800 relative">
          <div className="absolute inset-0 bg-[url('/images/patterns/grid/Quotla%20grid%20pattern%20light.svg')] bg-center opacity-[0.03]" style={{backgroundSize: '150%'}}></div>
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h3 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6">Frequently Asked Questions</h3>
              <p className="font-sans text-xl text-quotla-light/80 max-w-2xl mx-auto leading-relaxed">
                Everything you need to know about Quotla
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
                <div key={idx} className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden transition-all duration-300 hover:border-quotla-orange/50">
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
                    aria-expanded={openFaq === idx}
                  >
                    <h4 className="text-lg font-semibold text-white pr-8">{faq.question}</h4>
                    <svg
                      className={`w-6 h-6 text-quotla-light/70 transition-transform duration-300 flex-shrink-0 ${openFaq === idx ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${openFaq === idx ? 'max-h-96' : 'max-h-0'}`}
                  >
                    <div className="px-6 pb-6 pt-0">
                      <p className="text-quotla-light/80 leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-br from-quotla-dark via-quotla-dark/95 to-quotla-dark relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/images/patterns/spiral/Quotla%20Spiral%20orange.svg')] bg-center opacity-[0.0275]" style={{backgroundSize: '8100%'}}></div>
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h3 className="font-heading text-4xl md:text-5xl font-bold text-white mb-10">
              Join the power move today
            </h3>
            <div className="flex justify-center">
              <a
                href="#pricing"
                onClick={(e) => {
                  e.preventDefault()
                  document.querySelector('#pricing')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="px-10 py-5 rounded-xl text-xl font-semibold bg-quotla-orange text-white hover:bg-secondary-600 transition-all shadow-xl shadow-quotla-orange/40 hover:shadow-2xl hover:shadow-quotla-orange/60 hover:scale-105"
              >
                See plans and pricing
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
