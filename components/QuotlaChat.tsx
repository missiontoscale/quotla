'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import VoiceRecorder from './VoiceRecorder'
import { classifyIntent, classifyIntentFast, type Intent } from '@/lib/ai/intent-classifier'
import { storeTransferData } from '@/lib/utils/secure-transfer'

interface Message {
  role: 'user' | 'assistant'
  content: string
  generatedQuote?: any
  generatedInvoice?: any
}

export default function QuotlaChat({ onClose }: { onClose?: () => void } = {}) {
  const initialMessage: Message = {
    role: 'assistant'
  }

  const [messages, setMessages] = useState<Message[]>([initialMessage])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [transcribing, setTranscribing] = useState(false)
  const [showSelectionModal, setShowSelectionModal] = useState(false)
  const [showDifferenceInfo, setShowDifferenceInfo] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  /**
   * AI-powered intent detection with fallback to fast heuristics
   * This replaces the old keyword-based detection with context-aware classification
   */
  const detectIntent = async (userMessage: string): Promise<Intent> => {
    // Option 1: Use AI-powered classification (more accurate, uses API)
    // Uncomment this for production use with full AI classification
    try {
      const classification = await classifyIntent(messages, userMessage)
      console.log('AI Intent Classification:', classification)
      return classification.intent
    } catch (error) {
      console.error('AI classification failed, falling back to fast heuristics:', error)
      // Fallback to fast heuristics if AI fails
      return classifyIntentFast(messages, userMessage)
    }

    // Option 2: Use fast heuristics only (faster, no API cost)
    // Uncomment this to skip AI classification and use only heuristics
    // return classifyIntentFast(messages, userMessage)
  }

  const handleGenerateQuote = async (userMessage: string) => {
    try {
      // Check if the message has enough detail
      const lowerMsg = userMessage.toLowerCase()
      const hasClient = lowerMsg.match(/for\s+([a-z\s]+)/i) || lowerMsg.includes('client')
      const hasService = lowerMsg.includes('web') || lowerMsg.includes('development') ||
                        lowerMsg.includes('design') || lowerMsg.includes('consulting') ||
                        lowerMsg.includes('service') || lowerMsg.includes('product')

      // Ask clarifying questions if details are missing
      if (!hasClient && !lowerMsg.includes('generate')) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: 'Perfect! Let\'s craft a winning quote together. To ensure precision, I\'ll need:\n\n1. **Client name** - Who are we impressing?\n2. **Service/Product** - What value are you delivering?\n3. **Currency** (optional) - USD, NGN, EUR, or GBP?\n\nExample: "Create a quote for web development services for Acme Corp in NGN"',
          },
        ])
        return
      }

      const response = await fetch('/api/ai/generate-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMessage }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate quote')
      }

      // Check if currency is needed
      if (data.needs_currency) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.text_output || 'Please specify the currency (e.g., NGN, USD, EUR, GBP) for this quote.',
          },
        ])
        return
      }

      const quote = data.quote

      // Get currency symbol
      const currencySymbol = quote.currency === 'NGN' ? '₦' :
                            quote.currency === 'EUR' ? '€' :
                            quote.currency === 'GBP' ? '£' : '$'

      const assistantMessage: Message = {
        role: 'assistant',
        content: `I've generated a quote for you! Here's what I created:\n\n**Client:** ${quote.client_name}\n**Currency:** ${quote.currency || 'USD'}\n\n**Items:**\n${quote.items.map((item: any, i: number) =>
          `${i + 1}. ${item.description}\n   Qty: ${item.quantity} × ${currencySymbol}${item.unit_price.toFixed(2)} = ${currencySymbol}${item.amount.toFixed(2)}`
        ).join('\n\n')}\n\n**Subtotal:** ${currencySymbol}${quote.subtotal.toFixed(2)}\n**Tax (${(quote.tax_rate * 100).toFixed(1)}%):** ${currencySymbol}${quote.tax_amount.toFixed(2)}\n**Total:** ${currencySymbol}${quote.total.toFixed(2)}\n\n${quote.notes ? `**Notes:** ${quote.notes}\n\n` : ''}Would you like me to create this quote in your system?`,
        generatedQuote: quote,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `I apologize, but I encountered an error generating the quote: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again with more details.`,
        },
      ])
    }
  }

  const handleGeneralAdvice = async (userMessage: string) => {
    try {
      // Get last 5 messages for context (10 total with user/assistant pairs)
      const recentMessages = messages.slice(-10).map(m => ({
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
        throw new Error(data.error || 'Failed to get advice')
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.description,
        },
      ])
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'I apologize, but I encountered an error. Please try again.',
        },
      ])
    }
  }

  const handleGenerateInvoice = async (userMessage: string) => {
    try {
      // Get last 5 messages for context (10 total with user/assistant pairs)
      const recentMessages = messages.slice(-10).map(m => ({
        role: m.role,
        content: m.content
      }))

      // Combine conversation history for context
      const conversationContext = recentMessages.map(m => `${m.role}: ${m.content}`).join('\n')
      const fullPrompt = `${conversationContext}\nuser: ${userMessage}`

      const response = await fetch('/api/ai/generate-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: fullPrompt }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate invoice')
      }

      // Check if currency is needed
      if (data.needs_currency) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.text_output || 'Please specify the currency (e.g., NGN, USD, EUR, GBP) for this invoice.',
          },
        ])
        return
      }

      const invoice = data.invoice

      // Get currency symbol
      const currencySymbol = invoice.currency === 'NGN' ? '₦' :
                            invoice.currency === 'EUR' ? '€' :
                            invoice.currency === 'GBP' ? '£' : '$'

      const assistantMessage: Message = {
        role: 'assistant',
        content: `I've generated an invoice for you! Here's what I created:\n\n**Client:** ${invoice.client_name}\n**Currency:** ${invoice.currency || 'USD'}\n**Invoice #:** ${invoice.invoice_number || 'Auto-generated'}\n${invoice.payment_terms ? `**Payment Terms:** ${invoice.payment_terms}\n` : ''}\n**Items:**\n${invoice.items.map((item: any, i: number) =>
          `${i + 1}. ${item.description}\n   Qty: ${item.quantity} × ${currencySymbol}${item.unit_price.toFixed(2)} = ${currencySymbol}${item.amount.toFixed(2)}`
        ).join('\n\n')}\n\n**Subtotal:** ${currencySymbol}${invoice.subtotal.toFixed(2)}\n**Tax (${(invoice.tax_rate * 100).toFixed(1)}%):** ${currencySymbol}${invoice.tax_amount.toFixed(2)}${invoice.delivery_charge ? `\n**Delivery:** ${currencySymbol}${invoice.delivery_charge.toFixed(2)}` : ''}\n**Total:** ${currencySymbol}${invoice.total.toFixed(2)}\n\n${invoice.notes ? `**Notes:** ${invoice.notes}\n\n` : ''}${invoice.due_date ? `**Due Date:** ${invoice.due_date}\n\n` : ''}Would you like me to create this invoice in your system?`,
        generatedInvoice: invoice,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `I apologize, but I encountered an error generating the invoice: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again with more details.`,
        },
      ])
    }
  }

  const handleSaveQuote = async (quote: any) => {
    try {
      // ✅ SECURE: Store data in sessionStorage, pass only ID via URL
      const transferId = storeTransferData('quote', quote)
      router.push(`/quotes/new?transfer=${transferId}`)
      if (onClose) onClose()
    } catch (error) {
      console.error('Failed to store quote data securely:', error)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Failed to navigate to quote creation. Please try manually creating the quote.',
        },
      ])
    }
  }

  const handleSaveInvoice = async (invoice: any) => {
    try {
      // ✅ SECURE: Store data in sessionStorage, pass only ID via URL
      const transferId = storeTransferData('invoice', invoice)
      router.push(`/invoices/new?transfer=${transferId}`)
      if (onClose) onClose()
    } catch (error) {
      console.error('Failed to store invoice data securely:', error)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Failed to navigate to invoice creation. Please try manually creating the invoice.',
        },
      ])
    }
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      // Detect intent using AI-powered classification
      const intent = await detectIntent(userMessage)

      // Get the last assistant message to check for generated items
      const lastAssistantMsg = messages.filter(m => m.role === 'assistant').pop()

      // Route to appropriate handler based on intent
      if (intent === 'save_quote' && lastAssistantMsg?.generatedQuote) {
        await handleSaveQuote(lastAssistantMsg.generatedQuote)
      } else if (intent === 'save_invoice' && lastAssistantMsg?.generatedInvoice) {
        await handleSaveInvoice(lastAssistantMsg.generatedInvoice)
      } else if (intent === 'generate_quote') {
        await handleGenerateQuote(userMessage)
      } else if (intent === 'generate_invoice') {
        await handleGenerateInvoice(userMessage)
      } else {
        await handleGeneralAdvice(userMessage)
      }
    } catch (error) {
      console.error('Chat error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVoiceRecording = async (audioBlob: Blob) => {
    setTranscribing(true)
    try {
      // Convert audio to text using enhanced Whisper API
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')

      const response = await fetch('/api/ai/transcribe', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to transcribe audio')
      }

      // Use the transcribed text as input
      setInput(data.text)

      // Show a brief success message
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '🎤 Transcribed! You can review and send the message above.',
        },
      ])
    } catch (error) {
      console.error('Transcription error:', error)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I had trouble understanding the audio. Please try again or type your message.',
        },
      ])
    } finally {
      setTranscribing(false)
    }
  }

  const handleClearChat = () => {
    setMessages([initialMessage])
    setInput('')
  }

  return (
    <div className="flex flex-col bg-white dark:bg-primary-800" style={{ minHeight: '120px', maxHeight: messages.length > 1 ? '600px' : '120px' }}>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-primary-900/30" style={{ maxHeight: messages.length > 1 ? '400px' : '0px' }}>
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                message.role === 'user'
                  ? 'bg-gradient-to-br from-quotla-green to-quotla-orange text-white rounded-tr-sm'
                  : 'bg-white dark:bg-primary-700 text-gray-800 dark:text-primary-50 border border-gray-200 dark:border-primary-600 rounded-tl-sm'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
              {message.generatedQuote && (
                <button
                  onClick={() => handleSaveQuote(message.generatedQuote)}
                  className="mt-3 w-full bg-quotla-green hover:bg-quotla-green/90 text-white px-4 py-2.5 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
                >
                  Create This Quote →
                </button>
              )}
              {message.generatedInvoice && (
                <button
                  onClick={() => handleSaveInvoice(message.generatedInvoice)}
                  className="mt-3 w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
                >
                  Create This Invoice →
                </button>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-primary-700 border border-gray-200 dark:border-primary-600 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="flex space-x-1.5">
                  <div className="w-2 h-2 bg-quotla-green rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-quotla-orange rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                  <div className="w-2 h-2 bg-quotla-green rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                </div>
                <span className="text-xs text-gray-600 dark:text-primary-300 font-medium">Quotla is thinking...</span>
              </div>
            </div>
          </div>
        )}
        {transcribing && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-primary-700 border border-quotla-orange/30 dark:border-quotla-orange/50 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="flex space-x-1.5">
                  <div className="w-2 h-2 bg-quotla-orange rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-quotla-orange rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                  <div className="w-2 h-2 bg-quotla-orange rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                </div>
                <span className="text-xs text-gray-600 dark:text-primary-300 font-medium">Transcribing audio...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-primary-700 bg-white dark:bg-primary-800">
        <div className="flex gap-2 items-end">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Let's seal a deal together..."
            className="flex-1 px-4 py-2 text-sm bg-gray-100 dark:bg-primary-700 border border-gray-200 dark:border-primary-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-quotla-green dark:focus:ring-quotla-orange focus:border-transparent text-gray-900 dark:text-primary-50 placeholder-gray-500 dark:placeholder-primary-400"
            disabled={loading || transcribing}
          />
          <VoiceRecorder
            onRecordingComplete={handleVoiceRecording}
            disabled={loading || transcribing}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading || transcribing}
            className="px-4 py-2 bg-gradient-to-r from-quotla-green to-quotla-orange text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none hover:-translate-y-0.5"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-primary-400 mt-2 px-1">
          Try: "Generate a quote for website development" or "Explain the 2026 VAT changes"
        </p>
      </div>

      <div className="flex justify-center">
        <button
          onClick={() => setShowSelectionModal(true)}
          className="group flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white rounded-lg transition-all shadow-sm hover:shadow-md"
        >
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div className="text-left">
            <div className="font-heading font-semibold text-sm">Create myself</div>
            <div className="font-sans text-xs text-white/80">Manual creation</div>
          </div>
        </button>
      </div>

      {/* Selection Modal */}
      {showSelectionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowSelectionModal(false)}>
          <div className="bg-white dark:bg-primary-700 rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-heading font-bold text-quotla-dark dark:text-primary-50">What would you like to create?</h3>
              <button
                onClick={() => setShowSelectionModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3 mb-4">
              <button
                onClick={() => {
                  setShowSelectionModal(false)
                  router.push('/quotes/new')
                }}
                className="w-full group flex items-center gap-4 p-4 bg-quotla-green/10 hover:bg-quotla-green/20 border-2 border-quotla-green/30 hover:border-quotla-green rounded-xl transition-all"
              >
                <div className="w-12 h-12 rounded-lg bg-quotla-green flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <div className="font-heading font-bold text-base text-quotla-dark dark:text-primary-50">Quote</div>
                  <div className="font-sans text-sm text-gray-600 dark:text-primary-300">Create a new quote</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setShowSelectionModal(false)
                  router.push('/invoices/new')
                }}
                className="w-full group flex items-center gap-4 p-4 bg-purple-500/10 hover:bg-purple-500/20 border-2 border-purple-500/30 hover:border-purple-500 rounded-xl transition-all"
              >
                <div className="w-12 h-12 rounded-lg bg-purple-500 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <div className="font-heading font-bold text-base text-quotla-dark dark:text-primary-50">Invoice</div>
                  <div className="font-sans text-sm text-gray-600 dark:text-primary-300">Create a new invoice</div>
                </div>
              </button>
            </div>

            <button
              onClick={() => setShowDifferenceInfo(!showDifferenceInfo)}
              className="w-full text-center text-sm text-quotla-orange hover:text-secondary-600 font-medium transition-colors flex items-center justify-center gap-1"
            >
              <span>What's the difference?</span>
              <svg className={`w-4 h-4 transition-transform ${showDifferenceInfo ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showDifferenceInfo && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-primary-800 rounded-lg space-y-3 text-sm">
                <div>
                  <h4 className="font-heading font-bold text-quotla-green mb-1">Quote</h4>
                  <p className="text-gray-600 dark:text-primary-300">A quote is a proposal sent to potential clients showing estimated prices for products or services. It's not a request for payment.</p>
                </div>
                <div>
                  <h4 className="font-heading font-bold text-purple-600 mb-1">Invoice</h4>
                  <p className="text-gray-600 dark:text-primary-300">An invoice is a payment request sent after delivering products or services. It includes payment terms and due dates.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
