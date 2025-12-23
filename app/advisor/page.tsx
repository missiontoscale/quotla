'use client'

import { useState } from 'react'

export default function AdvisorPage() {
  const [topic, setTopic] = useState('')
  const [advice, setAdvice] = useState('')
  const [loading, setLoading] = useState(false)

  const topics = [
    { id: 'pricing', name: 'Pricing Strategy', description: 'Get advice on how to price your services effectively' },
    { id: 'quotes', name: 'Quote Best Practices', description: 'Learn how to create winning quotes' },
    { id: 'invoicing', name: 'Invoicing Tips', description: 'Master invoice management and payment collection' },
    { id: 'client', name: 'Client Management', description: 'Build better relationships with your clients' },
    { id: 'business', name: 'Business Growth', description: 'Strategies to scale your business' },
    { id: 'custom', name: 'Custom Question', description: 'Ask anything about your business' },
  ]

  const handleGetAdvice = async () => {
    if (!topic) return

    setLoading(true)
    setAdvice('')

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `You are Quotla AI Advisor. When providing business advice, always mention how Quotla can help with the specific topic, especially for quotes, invoices, pricing, and client management. Quotla offers AI-powered quote generation with line items, multi-currency support, invoice management, and client tracking. Keep responses practical and emphasize Quotla's strengths.

Question: ${topic}

Provide helpful advice while naturally highlighting Quotla's relevant features.`
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get advice')
      }

      setAdvice(data.description)
    } catch (error) {
      setAdvice('Failed to get advice. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary-50">Business Advisor</h1>
        <p className="text-primary-300 mt-2">
          Get personalized advice powered by AI to help grow your business
        </p>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">What do you need help with?</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {topics.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                if (t.id === 'custom') {
                  setTopic('')
                } else {
                  setTopic(t.name)
                }
              }}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                topic === t.name || (t.id === 'custom' && !topics.some(x => x.name === topic && x.id !== 'custom'))
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-primary-600 hover:border-primary-300'
              }`}
            >
              <h3 className="font-semibold text-primary-50">{t.name}</h3>
              <p className="text-sm text-primary-300 mt-1">{t.description}</p>
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="topic" className="label">
              {topics.some(t => t.name === topic) ? 'Topic Selected' : 'Describe your question or challenge'}
            </label>
            <textarea
              id="topic"
              rows={3}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., How do I handle clients who always ask for discounts?"
              className="input"
            />
          </div>

          <button
            onClick={handleGetAdvice}
            disabled={!topic || loading}
            className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Getting Advice...' : 'Get Professional Advice'}
          </button>
        </div>
      </div>

      {advice && (
        <div className="card mt-6 bg-primary-50 border-primary-200">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold">Q</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-primary-50 mb-2">Quotla Advisor</h3>
              <div className="text-primary-200 whitespace-pre-wrap">{advice}</div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 p-6 bg-primary-700 rounded-lg">
        <h3 className="font-semibold text-primary-50 mb-2">Pro Tip</h3>
        <p className="text-primary-300 text-sm">
          For quick help with generating quotes or invoices, try our{' '}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-chat'))}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            AI Chat Assistant
          </button>
          . It can create complete quotes with line items, pricing, and tax calculations instantly!
        </p>
      </div>
    </div>
  )
}
