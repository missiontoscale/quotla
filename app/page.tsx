'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function HomePage() {
  const router = useRouter()
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [chatMessages, setChatMessages] = useState<Array<{role: string, content: string}>>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [promptCount, setPromptCount] = useState(0)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

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

  const handleChatSend = async () => {
    if (!chatInput.trim() || chatLoading) return

    // Limit to 2 prompts for non-authenticated users
    if (!isAuthenticated && promptCount >= 2) {
      setChatMessages(prev => [...prev,
        { role: 'user', content: chatInput },
        { role: 'assistant', content: 'You\'ve reached the free limit of 2 questions. Create a free account to continue chatting with unlimited access to Quotla AI!' }
      ])
      setChatInput('')
      return
    }

    const userMessage = chatInput
    setChatInput('')
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }])
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

      setChatMessages(prev => [...prev, { role: 'assistant', content: data.description }])
    } catch (error) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }])
    } finally {
      setChatLoading(false)
    }
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-600 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-600">
      {/* Navigation */}
      <nav className="border-b border-primary-700 bg-primary-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center">
                <span className="text-primary-600 font-bold">Q</span>
              </div>
              <h1 className="text-2xl font-logo font-bold text-white">Quotla</h1>
            </div>
            <div className="flex gap-4">
              <Link href="/login" className="px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-primary-800 transition-colors">
                Sign In
              </Link>
              <Link href="/signup" className="px-4 py-2 rounded-lg text-sm font-medium bg-white text-primary-600 hover:bg-gray-100 transition-colors">
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Chat First */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Your AI-Powered Business Assistant
          </h2>
          <p className="text-lg text-primary-100 max-w-2xl mx-auto">
            Generate quotes, create invoices, get business advice - all through a simple conversation.
          </p>
          {!isAuthenticated && (
            <p className="text-sm text-primary-300 mt-3">
              Try 2 questions free, then <Link href="/signup" className="underline hover:text-white font-medium">create an account</Link> for unlimited access.
            </p>
          )}
        </div>

        {/* Main Chat Interface - Hero Element */}
        <div className="max-w-5xl mx-auto mb-12">
          {/* Suggested Prompts (shown when no messages) */}
          {chatMessages.length === 0 && (
            <div className="grid md:grid-cols-2 gap-3 mb-6">
              {[
                { title: 'Create a quote', prompt: 'Help me create a professional quote for web development services' },
                { title: 'Generate invoice', prompt: 'Generate an invoice for my recent consulting project' },
                { title: 'Pricing advice', prompt: 'How should I price my freelance design services?' },
                { title: 'Business tips', prompt: 'What are the best practices for following up on quotes?' },
              ].map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setChatInput(suggestion.prompt)
                    setTimeout(() => handleChatSend(), 100)
                  }}
                  className="bg-white/10 backdrop-blur-sm border border-primary-600 rounded-xl p-4 text-left hover:bg-white/20 transition-all group"
                >
                  <h4 className="font-semibold text-white mb-1 group-hover:text-primary-100">{suggestion.title}</h4>
                  <p className="text-sm text-primary-300">{suggestion.prompt}</p>
                </button>
              ))}
            </div>
          )}

          {/* Chat Messages Area */}
          <div className="bg-white/5 backdrop-blur-sm border border-primary-600 rounded-2xl shadow-2xl overflow-hidden">
            {chatMessages.length > 0 ? (
              <div className="p-6 max-h-[500px] overflow-y-auto space-y-4">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-5 py-3 ${
                      msg.role === 'user'
                        ? 'bg-white text-primary-900 shadow-lg'
                        : 'bg-primary-700/80 text-white backdrop-blur-sm'
                    }`}>
                      <p className="text-base leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-primary-700/80 backdrop-blur-sm rounded-2xl px-5 py-3">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Start a conversation</h3>
                <p className="text-primary-200">Click a suggestion above or type your question below</p>
              </div>
            )}

            {/* Chat Input - Always visible at bottom */}
            <div className="p-4 bg-primary-900/30 border-t border-primary-600">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleChatSend()}
                  placeholder={promptCount >= 2 && !isAuthenticated ? "Sign up to continue..." : "Ask anything about quotes, invoices, pricing, or business advice..."}
                  className="flex-1 px-5 py-4 rounded-xl bg-white/10 border border-primary-500 text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-white focus:bg-white/15 disabled:opacity-50 text-base"
                  disabled={chatLoading || (!isAuthenticated && promptCount >= 2)}
                />
                <button
                  onClick={handleChatSend}
                  disabled={!chatInput.trim() || chatLoading || (!isAuthenticated && promptCount >= 2)}
                  className="px-6 py-4 rounded-xl bg-white text-primary-600 font-semibold hover:bg-gray-100 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
              {!isAuthenticated && promptCount > 0 && (
                <p className="text-xs text-primary-300 mt-2 text-center">
                  {promptCount}/2 free questions used
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Features Below Chat */}
        <div className="grid md:grid-cols-3 gap-6 mb-16 max-w-5xl mx-auto">
          <div className="bg-white/5 backdrop-blur-sm border border-primary-700 rounded-xl p-5 text-center">
            <h3 className="text-lg font-bold text-white mb-1">AI Quote Generation</h3>
            <p className="text-sm text-primary-200">
              Complete quotes with line items and pricing in seconds
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-primary-700 rounded-xl p-5 text-center">
            <h3 className="text-lg font-bold text-white mb-1">Multi-Currency</h3>
            <p className="text-sm text-primary-200">
              USD, NGN, EUR, GBP and more for global business
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-primary-700 rounded-xl p-5 text-center">
            <h3 className="text-lg font-bold text-white mb-1">Complete Platform</h3>
            <p className="text-sm text-primary-200">
              Quotes, invoices, clients, and PDF export all-in-one
            </p>
          </div>
        </div>

        {/* What You Can Do Section */}
        <div className="max-w-5xl mx-auto mb-16">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-white mb-3">What can Quotla help you with?</h3>
            <p className="text-primary-200">Ask the AI assistant anything about your business</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              { title: 'Pricing Strategy', desc: 'Get advice on pricing your services competitively' },
              { title: 'Quote Creation', desc: 'Generate professional quotes instantly' },
              { title: 'Invoice Management', desc: 'Create and track invoices effortlessly' },
              { title: 'Client Relations', desc: 'Build stronger client relationships' },
              { title: 'Business Growth', desc: 'Strategies to scale your business' },
              { title: 'Payment Collection', desc: 'Best practices for getting paid faster' },
            ].map((topic, idx) => (
              <div key={idx} className="bg-white/5 backdrop-blur-sm border border-primary-700 rounded-xl p-4 hover:bg-white/10 transition-all">
                <h4 className="font-semibold text-white mb-1">{topic.title}</h4>
                <p className="text-sm text-primary-300">{topic.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="max-w-3xl mx-auto text-center bg-white/10 backdrop-blur-sm border border-primary-600 rounded-2xl p-10">
          <h3 className="text-3xl font-bold text-white mb-4">
            Ready to supercharge your business?
          </h3>
          <p className="text-lg text-primary-200 mb-6">
            Join thousands of professionals using Quotla to create quotes, manage invoices, and grow their business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="px-8 py-4 rounded-xl text-lg font-semibold bg-white text-primary-600 hover:bg-gray-100 transition-all shadow-xl">
              Start Free - No Credit Card
            </Link>
            <Link href="/login" className="px-8 py-4 rounded-xl text-lg font-semibold bg-primary-700 text-white hover:bg-primary-600 transition-all border-2 border-primary-500">
              Sign In
            </Link>
          </div>
          <p className="text-sm text-primary-300 mt-4">
            Free plan includes 2 AI questions. Unlimited access with paid plan.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-primary-800 mt-24 bg-primary-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center">
                  <span className="text-primary-600 font-bold">Q</span>
                </div>
                <h4 className="font-logo font-bold text-lg text-white">Quotla</h4>
              </div>
              <p className="text-primary-200 text-sm">
                AI-powered quote and invoice management for professionals worldwide.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-lg text-white mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/blog" className="text-primary-200 hover:text-white">Blog</Link></li>
                <li><Link href="/login" className="text-primary-200 hover:text-white">Sign In</Link></li>
                <li><Link href="/signup" className="text-primary-200 hover:text-white">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg text-white mb-4">Features</h4>
              <ul className="space-y-2 text-sm">
                <li className="text-primary-200">AI Quote Generation</li>
                <li className="text-primary-200">Multi-Currency Support</li>
                <li className="text-primary-200">Invoice Management</li>
                <li className="text-primary-200">Client Tracking</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-primary-800 text-center text-primary-300 text-sm">
            <p>&copy; {new Date().getFullYear()} Quotla. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
