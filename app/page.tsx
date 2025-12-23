'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import Footer from '@/components/Footer'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function HomePage() {
  const [checkingAuth, setCheckingAuth] = useState(true)
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

  const phrases = [
    'Simplify Money',
    'Generate quotes fast',
    'Abandon redundancies',
    'Meet client expectations'
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
      console.error('Chat error:', error)
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
      title: "Income Summaries",
      description: "View simple income summaries by month or year. Export anytime for your records.",
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
    },
    {
      title: "Export & Share",
      description: "Generate professional PDFs and share quotes and invoices with your clients.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      ),
      color: "from-pink-500 to-rose-500"
    }
  ]

  const useCases = [
    {
      category: "Freelancers",
      title: "Perfect for Independent Professionals",
      description: "Manage your entire client workflow from quote to payment in one place.",
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
      title: "Scale Your Operations",
      description: "Automate your quoting and invoicing to focus on growing your business.",
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
      title: "Streamline Client Work",
      description: "Handle multiple clients and projects with organized quote and invoice management.",
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
    <div className="min-h-screen bg-primary-800">
      {/* Skip to main content - Accessibility */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-white px-4 py-2 rounded-lg shadow-lg z-50">
        Skip to main content
      </a>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-quotla-dark/95 backdrop-blur-xl border-b border-quotla-light/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-16">
              <Link href="/" className="flex items-center gap-3 group">
                <img src="/images/logos/icons/Quotla icon light.svg" alt="Quotla Logo" className="h-12 w-auto transform group-hover:scale-105 transition-transform" />
                <span className="text-2xl font-bold font-heading text-quotla-light">Quotla</span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-6">
                <Link href="/about" className="text-sm font-medium text-quotla-light/80 hover:text-quotla-light transition-colors">About</Link>
                <Link href="/blog" className="text-sm font-medium text-quotla-light/80 hover:text-quotla-light transition-colors">Blog</Link>
                <Link href="/pricing" className="text-sm font-medium text-quotla-light/80 hover:text-quotla-light transition-colors">Pricing</Link>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/login" className="px-4 py-2 text-sm font-medium text-quotla-light/80 hover:text-quotla-light transition-colors">
                Sign In
              </Link>
              <Link href="/signup" className="px-4 py-2 rounded-lg text-sm font-semibold bg-quotla-orange text-white hover:bg-secondary-600 transition-all shadow-sm">
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main id="main-content" className="overflow-hidden">
        {/* Hero Section with Chat */}
        <section className="relative min-h-screen flex items-center py-20 lg:py-28 bg-gradient-to-br from-white via-quotla-light/30 to-quotla-green/10">
          <div className="absolute inset-0 bg-[url('/images/patterns/grid/Quotla%20grid%20pattern%20light.svg')] bg-cover bg-center opacity-30"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            {/* Large screen layout: Text left, Chat right */}
            <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
              {/* Text Section - Left aligned on all screens */}
              <div className="text-left mb-12 lg:mb-0">
                <h2 className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold text-primary-50 mb-6 leading-tight min-h-[1.2em]">
                  {typingText}
                  <span className="animate-pulse">|</span>
                </h2>
                <p className="font-sans text-xl text-primary-300 lg:max-w-xl leading-relaxed mb-6">
                  Quotla exists to ease the tension on dedicated professionals as they navigate complex labour markets. By solving a fundamental issue in quote creation, for consultants and freelancers, as well as invoicing for business owners.
                </p>
                {!isAuthenticated && (
                  <p className="text-sm text-primary-400 mt-4">
                    Try 2 questions free • <Link href="/signup" className="text-primary-600 hover:text-primary-700 font-semibold underline">Create account</Link> for unlimited access
                  </p>
                )}
              </div>

              {/* Interactive Chat Interface - Right on large screens */}
              <div className="max-w-4xl lg:max-w-none mx-auto">
              {/* Chat Interface */}
              <div className="bg-white rounded-3xl shadow-2xl border border-primary-600/50 overflow-hidden">
                {chatMessages.length > 0 ? (
                  <div className="p-6 max-h-[500px] overflow-y-auto space-y-4">
                    {chatMessages.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl px-5 py-3 shadow-sm ${
                          msg.role === 'user'
                            ? 'bg-primary-800 text-white'
                            : 'bg-primary-600 text-primary-50 border border-primary-600'
                        }`}>
                          <p className="text-base leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    ))}
                    {chatLoading && (
                      <div className="flex justify-start">
                        <div className="bg-primary-600 border border-primary-600 rounded-2xl px-5 py-3">
                          <div className="flex space-x-2">
                            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-24 text-center">
                    <div className="mb-6">
                      <svg className="w-16 h-16 mx-auto text-primary-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                      <p className="text-primary-300 text-lg font-semibold">Tell me what you need</p>
                    </div>
                  </div>
                )}

                {/* Chat Input */}
                <div className="p-4 bg-primary-700 border-t border-primary-600">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleChatSend()}
                      placeholder={
                        promptCount >= 2 && !isAuthenticated
                          ? "Sign up to continue..."
                          : placeholderText || "Ask me anything..."
                      }
                      className="flex-1 px-5 py-4 rounded-xl bg-white border border-primary-500 text-quotla-dark placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 text-base transition-all caret-quotla-dark"
                      disabled={chatLoading || (!isAuthenticated && promptCount >= 2)}
                    />
                    <button
                      onClick={handleChatSend}
                      disabled={!chatInput.trim() || chatLoading || (!isAuthenticated && promptCount >= 2)}
                      aria-label="Send message"
                      className="px-6 py-4 rounded-xl bg-quotla-dark text-white font-semibold hover:bg-quotla-dark/90 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  </div>
                  {!isAuthenticated && promptCount > 0 && (
                    <p className="text-xs text-primary-400 mt-2 text-center">
                      {promptCount}/2 free questions used • <Link href="/signup" className="text-primary-600 hover:underline">Sign up</Link> for unlimited
                    </p>
                  )}
                </div>
              </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h3 className="font-heading text-4xl md:text-5xl font-bold text-quotla-dark mb-6">Everything you need</h3>
              <p className="font-sans text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
                Tools to create and organize professional quotes and invoices
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, idx) => (
                <div key={idx} className="group relative bg-white rounded-2xl p-8 border border-gray-200 hover:border-quotla-orange hover:shadow-xl transition-all duration-300">
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} text-white text-2xl mb-5 transform group-hover:scale-110 transition-transform`}>
                    {feature.icon}
                  </div>
                  <h4 className="font-heading text-xl font-semibold text-quotla-dark mb-4">{feature.title}</h4>
                  <p className="font-sans text-base text-gray-700 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Clients & Partners Section */}
        <section className="py-16 bg-gradient-to-br from-primary-700 to-white" style={{backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.02) 1px, transparent 1px)', backgroundSize: '60px 60px'}}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h3 className="font-heading text-3xl md:text-4xl font-bold text-primary-50 mb-4">Used by professionals worldwide</h3>
              <p className="font-sans text-lg text-primary-300 leading-relaxed">Create quotes and track invoices in one place</p>
            </div>

            {/* Horizontal scrolling logos */}
            <div className="relative overflow-hidden">
              <div className="flex animate-scroll-left space-x-12 mb-8">
                {[...Array(2)].map((_, setIndex) => (
                  <div key={setIndex} className="flex space-x-12 shrink-0">
                    {[
                      'Microsoft',
                      'Shopify',
                      'Adobe',
                      'Slack',
                      'Mailchimp',
                      'Stripe'
                    ].map((company, idx) => (
                      <div key={idx} className="flex items-center justify-center w-48 h-20 bg-white rounded-xl border border-primary-600 px-6 shadow-sm hover:shadow-md transition-all">
                        <span className="text-xl font-bold text-primary-100 opacity-60 hover:opacity-100 transition-opacity">
                          {company}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="py-24 bg-primary-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h3 className="font-heading text-4xl md:text-5xl font-bold text-primary-50 mb-6">Built for your business</h3>
              <p className="font-sans text-xl text-primary-300 max-w-2xl mx-auto leading-relaxed">
                Trusted by professionals across industries
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
                      <div className="font-sans text-xs font-semibold text-primary-600 uppercase tracking-wide mb-3">{useCase.category}</div>
                      <h4 className="font-heading text-xl font-bold text-primary-50 mb-3 group-hover:text-primary-600 transition-colors">{useCase.title}</h4>
                      <p className="font-sans text-base text-primary-300 leading-relaxed">{useCase.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-br from-quotla-dark via-quotla-dark/95 to-quotla-dark relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/images/patterns/spiral/Quotla%20Spiral%20orange.svg')] bg-center opacity-10" style={{backgroundSize: 'cover'}}></div>
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h3 className="font-heading text-4xl md:text-5xl font-bold text-white mb-8">
              Ready to get started?
            </h3>
            <p className="font-sans text-xl text-primary-300 mb-10 leading-relaxed">
              Create professional quotes and invoices in seconds.<br className="hidden sm:block" />
              Track your work and export records anytime.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup" className="px-8 py-4 rounded-xl text-lg font-semibold bg-quotla-orange text-white hover:bg-secondary-600 transition-all shadow-xl hover:shadow-2xl hover:scale-105">
                Start creating
              </Link>
              <Link href="/about" className="px-8 py-4 rounded-xl text-lg font-semibold bg-transparent text-white hover:bg-white/10 transition-all border-2 border-white/20">
                Learn More
              </Link>
            </div>
            <p className="text-sm text-primary-400 mt-6">
              Free plan includes 2 AI questions • Upgrade anytime for unlimited access
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
