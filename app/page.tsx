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

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Generate Professional Quotes
            <br />
            <span className="text-primary-200">In Under 2 Minutes</span>
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-3xl mx-auto">
            AI-powered quote generation with multi-currency support, invoice management, and client tracking.
            Supercharge your workflow and close deals faster.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/signup" className="px-8 py-4 rounded-lg text-lg font-medium bg-white text-primary-600 hover:bg-gray-100 transition-colors shadow-xl">
              Start Free Trial
            </Link>
            <a href="#chat" className="px-8 py-4 rounded-lg text-lg font-medium bg-primary-700 text-white hover:bg-primary-600 transition-colors border-2 border-primary-500">
              Try AI Assistant
            </a>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white/10 backdrop-blur-sm border border-primary-700 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-2">AI-Powered Generation</h3>
            <p className="text-primary-200">
              Generate complete quotes with line items, pricing, and tax calculations in seconds using advanced AI.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-primary-700 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-2">Multi-Currency Support</h3>
            <p className="text-primary-200">
              Work with USD, NGN, EUR, GBP and more. Perfect for global businesses and African markets.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-primary-700 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-2">Complete Management</h3>
            <p className="text-primary-200">
              Track quotes, manage invoices, organize clients, and export to PDF - all in one platform.
            </p>
          </div>
        </div>

        {/* Chat Interface */}
        <div id="chat" className="bg-white/10 backdrop-blur-sm border border-primary-700 rounded-xl p-8 mb-16">
          <div className="text-center mb-6">
            <h3 className="text-3xl font-bold text-white mb-2">Chat with Quotla AI</h3>
            <p className="text-primary-200">Ask anything about quotes, invoices, pricing, or business advice</p>
            {!isAuthenticated && (
              <p className="text-sm text-primary-300 mt-2">
                Free users get 2 questions. <Link href="/signup" className="underline hover:text-white">Create account</Link> for unlimited access.
              </p>
            )}
          </div>

          <div className="max-w-3xl mx-auto">
            {/* Chat Messages */}
            {chatMessages.length > 0 && (
              <div className="bg-primary-900/50 rounded-lg p-4 mb-4 max-h-96 overflow-y-auto space-y-4">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      msg.role === 'user'
                        ? 'bg-white text-primary-900'
                        : 'bg-primary-700 text-white'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-primary-700 rounded-lg px-4 py-2">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Chat Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleChatSend()}
                placeholder={promptCount >= 2 && !isAuthenticated ? "Sign up to continue..." : "Ask me anything about quotes, invoices, or business advice..."}
                className="flex-1 px-4 py-3 rounded-lg bg-white/20 border border-primary-600 text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-white disabled:opacity-50"
                disabled={chatLoading || (!isAuthenticated && promptCount >= 2)}
              />
              <button
                onClick={handleChatSend}
                disabled={!chatInput.trim() || chatLoading || (!isAuthenticated && promptCount >= 2)}
                className="px-6 py-3 rounded-lg bg-white text-primary-600 font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Business Advisor Section */}
        <div className="bg-white/10 backdrop-blur-sm border border-primary-700 rounded-xl p-8">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-white mb-2">AI Business Advisor</h3>
            <p className="text-primary-200">Get expert advice on pricing, quotes, invoices, and growing your business</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {[
              { title: 'Pricing Strategy', desc: 'Learn to price services effectively' },
              { title: 'Quote Best Practices', desc: 'Create winning quotes' },
              { title: 'Invoice Management', desc: 'Master payment collection' },
              { title: 'Client Relations', desc: 'Build better relationships' },
              { title: 'Business Growth', desc: 'Scale your business' },
              { title: 'Negotiations', desc: 'Close deals faster' },
            ].map((topic, idx) => (
              <div key={idx} className="bg-primary-800/50 border border-primary-700 rounded-lg p-4 hover:bg-primary-700/50 transition-colors cursor-pointer">
                <h4 className="font-bold text-white mb-1">{topic.title}</h4>
                <p className="text-sm text-primary-200">{topic.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/signup" className="inline-block px-8 py-3 rounded-lg bg-white text-primary-600 font-medium hover:bg-gray-100 transition-colors">
              Get Full Access - Create Account
            </Link>
          </div>
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
