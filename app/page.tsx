'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import Footer from '@/components/Footer'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function HomePage() {
  const router = useRouter()
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [chatMessages, setChatMessages] = useState<Array<{role: string, content: string}>>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [promptCount, setPromptCount] = useState(0)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [typingText, setTypingText] = useState('')
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  const phrases = [
    'Simplify Money',
    'Generate quotes fast',
    'Abandon redundancies',
    'Meet client expectations'
  ]

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setIsAuthenticated(true)
        router.push('/dashboard')
      } else {
        setCheckingAuth(false)
      }
    }
    checkAuth()
  }, [router])

  useEffect(() => {
    const currentPhrase = phrases[phraseIndex]
    const typingSpeed = isDeleting ? 50 : 100
    const pauseBeforeDelete = 2000
    const pauseBeforeNext = 500

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userMessage,
          history: recentMessages
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate')
      }

      const updatedMessages = [...chatMessages, newUserMessage, { role: 'assistant', content: data.description }]
      setChatMessages(updatedMessages)

      // Save to localStorage for non-authenticated users
      if (!isAuthenticated) {
        localStorage.setItem('quotla_chat_history', JSON.stringify(updatedMessages))
      }
    } catch (error) {
      const errorMessage = { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }
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
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Smart Invoice Management",
      description: "Generate invoices, track payments, and manage your billing workflow effortlessly.",
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
      title: "Business Intelligence",
      description: "Get AI-powered advice on pricing, proposals, client management, and business growth.",
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
      color: "from-indigo-500 to-blue-500"
    },
    {
      title: "Export & Share",
      description: "Generate beautiful PDFs and share quotes and invoices with your clients instantly.",
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
      color: "from-blue-500/20 to-cyan-500/20",
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
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* Skip to main content - Accessibility */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-white px-4 py-2 rounded-lg shadow-lg z-50">
        Skip to main content
      </a>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-16">
              <Link href="/" className="flex items-center gap-3 group">
                <img src="/images/quotla-logo.png" alt="Quotla" className="h-8 w-auto transform group-hover:scale-105 transition-transform" />
                <span className="text-xl font-bold text-gray-900">Quotla</span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-6">
                <Link href="/about" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">About</Link>
                <Link href="/blog" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">Blog</Link>
                <Link href="/billing" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">Pricing</Link>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/login" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                Sign In
              </Link>
              <Link href="/signup" className="px-4 py-2 rounded-lg text-sm font-semibold bg-gray-900 text-white hover:bg-gray-800 transition-all shadow-sm">
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main id="main-content" className="overflow-hidden">
        {/* Hero Section with Chat */}
        <section className="relative min-h-screen flex items-center py-20 lg:py-28 bg-gradient-to-br from-white via-primary-50/30 to-blue-50/30" style={{backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.03) 1px, transparent 1px)', backgroundSize: '60px 60px'}}>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            {/* Large screen layout: Text left, Chat right */}
            <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
              {/* Text Section - Left aligned on all screens */}
              <div className="text-left mb-12 lg:mb-0">
                <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight min-h-[1.2em]">
                  {typingText}
                  <span className="animate-pulse">|</span>
                </h2>
                <p className="text-xl text-gray-600 lg:max-w-xl leading-relaxed">
                  Quotla exists to ease the tension on dedicated professionals as they navigate complex labour markets. By solving a fundamental issue in quote creation, for consultants and freelancers, as well as invoicing for business owners.
                </p>
                {!isAuthenticated && (
                  <p className="text-sm text-gray-500 mt-4">
                    Try 2 questions free • <Link href="/signup" className="text-primary-600 hover:text-primary-700 font-semibold underline">Create account</Link> for unlimited access
                  </p>
                )}
              </div>

              {/* Interactive Chat Interface - Right on large screens */}
              <div className="max-w-4xl lg:max-w-none mx-auto">
              {/* Suggested Prompts */}
              {chatMessages.length === 0 && (
                <div className="grid sm:grid-cols-2 gap-3 mb-6">
                  {[
                    { icon: "📝", title: 'Create a quote', prompt: 'Help me create a professional quote for web development services', color: 'from-blue-500/10 to-cyan-500/10 border-blue-200' },
                    { icon: "🧾", title: 'Generate invoice', prompt: 'Generate an invoice for my recent consulting project', color: 'from-purple-500/10 to-pink-500/10 border-purple-200' },
                    { icon: "💰", title: 'Pricing advice', prompt: 'How should I price my freelance design services?', color: 'from-orange-500/10 to-red-500/10 border-orange-200' },
                    { icon: "💡", title: 'Business tips', prompt: 'What are the best practices for following up on quotes?', color: 'from-green-500/10 to-emerald-500/10 border-green-200' },
                  ].map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setChatInput(suggestion.prompt)
                        setTimeout(() => handleChatSend(), 100)
                      }}
                      className={`bg-gradient-to-br ${suggestion.color} border rounded-2xl p-5 text-left hover:shadow-lg hover:scale-[1.02] transition-all group`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-3xl">{suggestion.icon}</span>
                        <div>
                          <h4 className="font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">{suggestion.title}</h4>
                          <p className="text-sm text-gray-600 leading-relaxed">{suggestion.prompt}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Chat Interface */}
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden">
                {chatMessages.length > 0 ? (
                  <div className="p-6 max-h-[500px] overflow-y-auto space-y-4">
                    {chatMessages.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl px-5 py-3 shadow-sm ${
                          msg.role === 'user'
                            ? 'bg-gray-900 text-white'
                            : 'bg-gray-100 text-gray-900 border border-gray-200'
                        }`}>
                          <p className="text-base leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    ))}
                    {chatLoading && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 border border-gray-200 rounded-2xl px-5 py-3">
                          <div className="flex space-x-2">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-16 text-center">
                    <p className="text-gray-600">Click a suggestion above or type in your problem</p>
                  </div>
                )}

                {/* Chat Input */}
                <div className="p-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleChatSend()}
                      placeholder={promptCount >= 2 && !isAuthenticated ? "Sign up to continue..." : "Ask about quotes, invoices, pricing, or business advice..."}
                      className="flex-1 px-5 py-4 rounded-xl bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 text-base transition-all"
                      disabled={chatLoading || (!isAuthenticated && promptCount >= 2)}
                    />
                    <button
                      onClick={handleChatSend}
                      disabled={!chatInput.trim() || chatLoading || (!isAuthenticated && promptCount >= 2)}
                      className="px-6 py-4 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  </div>
                  {!isAuthenticated && promptCount > 0 && (
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      {promptCount}/2 free questions used
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
              <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Everything you need</h3>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Powerful tools designed to simplify your business operations
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, idx) => (
                <div key={idx} className="group relative bg-white rounded-2xl p-8 border border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all duration-300">
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} text-white text-2xl mb-5 transform group-hover:scale-110 transition-transform`}>
                    {feature.icon}
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h4>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Clients & Partners Section */}
        <section className="py-16 bg-gradient-to-br from-gray-50 to-white" style={{backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.02) 1px, transparent 1px)', backgroundSize: '60px 60px'}}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Trusted by professionals worldwide</h3>
              <p className="text-lg text-gray-600">Join thousands of businesses streamlining their workflow</p>
            </div>

            {/* Horizontal scrolling logos */}
            <div className="relative overflow-hidden">
              {/* Left fade */}
              <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-gray-50 to-transparent z-10"></div>
              {/* Right fade */}
              <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10"></div>

              <div className="flex animate-scroll-left space-x-12 mb-8">
                {[...Array(2)].map((_, setIndex) => (
                  <div key={setIndex} className="flex space-x-12 shrink-0">
                    {[
                      { name: 'Microsoft', logo: 'https://img.logo.dev/microsoft.com?token=pk_X-NyT1KdRKuAsr5p7K_wTA' },
                      { name: 'Shopify', logo: 'https://img.logo.dev/shopify.com?token=pk_X-NyT1KdRKuAsr5p7K_wTA' },
                      { name: 'Adobe', logo: 'https://img.logo.dev/adobe.com?token=pk_X-NyT1KdRKuAsr5p7K_wTA' },
                      { name: 'Slack', logo: 'https://img.logo.dev/slack.com?token=pk_X-NyT1KdRKuAsr5p7K_wTA' },
                      { name: 'Mailchimp', logo: 'https://img.logo.dev/mailchimp.com?token=pk_X-NyT1KdRKuAsr5p7K_wTA' },
                      { name: 'Stripe', logo: 'https://img.logo.dev/stripe.com?token=pk_X-NyT1KdRKuAsr5p7K_wTA' }
                    ].map((company, idx) => (
                      <div key={idx} className="flex items-center justify-center w-48 h-20 bg-white rounded-xl border border-gray-200 px-6 shadow-sm grayscale hover:grayscale-0 transition-all">
                        <img
                          src={company.logo}
                          alt={company.name}
                          className="h-8 w-auto object-contain opacity-60 hover:opacity-100 transition-opacity"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              const span = document.createElement('span');
                              span.className = 'text-lg font-semibold text-gray-400';
                              span.textContent = company.name;
                              parent.appendChild(span);
                            }
                          }}
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
        <section className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Built for your business</h3>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Trusted by professionals across industries
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {useCases.map((useCase, idx) => (
                <Link key={idx} href={useCase.link} className="group">
                  <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all duration-300">
                    <div className={`h-48 bg-gradient-to-br ${useCase.color} flex items-center justify-center relative`}>
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/5 to-gray-900/10"></div>
                      <div className="relative text-primary-600 opacity-70 group-hover:opacity-90 transition-opacity">
                        {useCase.icon}
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="text-xs font-semibold text-primary-600 uppercase tracking-wide mb-2">{useCase.category}</div>
                      <h4 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">{useCase.title}</h4>
                      <p className="text-gray-600 leading-relaxed">{useCase.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10"></div>
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h3 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to transform your business?
            </h3>
            <p className="text-xl text-gray-300 mb-10 leading-relaxed">
              Join thousands of professionals using Quotla to streamline their workflow,<br className="hidden sm:block" />
              create professional documents, and grow their business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup" className="px-8 py-4 rounded-xl text-lg font-semibold bg-white text-gray-900 hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl hover:scale-105">
                Start Free - No Credit Card
              </Link>
              <Link href="/about" className="px-8 py-4 rounded-xl text-lg font-semibold bg-transparent text-white hover:bg-white/10 transition-all border-2 border-white/20">
                Learn More
              </Link>
            </div>
            <p className="text-sm text-gray-400 mt-6">
              Free plan includes 2 AI questions • Upgrade anytime for unlimited access
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
