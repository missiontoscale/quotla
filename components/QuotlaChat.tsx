'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import VoiceRecorder from './VoiceRecorder'
import { classifyIntent, classifyIntentFast, type Intent } from '@/lib/ai/intent-classifier'
import { storeTransferData } from '@/lib/utils/secure-transfer'
import { useUserCurrency } from '@/hooks/useUserCurrency'

interface Message {
  role: 'user' | 'assistant'
  content: string
  generatedQuote?: any
  generatedInvoice?: any
}

export default function QuotlaChat({ onClose }: { onClose?: () => void } = {}) {
  const { currency: userCurrency } = useUserCurrency()
  const initialMessage: Message = {
    role: 'assistant',
    content: 'Hello! I\'m Quotla, your AI assistant. I can help you generate quotes and invoices, or answer business questions. What can I help you with today?'
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
      return classification.intent
    } catch (error) {
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

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userMessage,
          history: messages.slice(-10).map(m => ({ role: m.role, content: m.content }))
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate quote')
      }

      // Check if currency is needed (from external API)
      if (data.extractedData && data.extractedData.needs_currency) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.description || 'Please specify the currency (e.g., NGN, USD, EUR, GBP) for this quote.',
          },
        ])
        return
      }

      // Validate quote data exists
      if (!data.extractedData || typeof data.extractedData !== 'object') {
        throw new Error('Invalid quote data received from API')
      }

      const quote = data.extractedData

      // Validate required fields
      if (!quote.client_name || !quote.items || !Array.isArray(quote.items)) {
        throw new Error('Quote is missing required fields (client_name or items)')
      }

      // Get currency symbol with default
      const currency = quote.currency || userCurrency
      const currencySymbol = currency === 'NGN' ? '₦' :
                            currency === 'EUR' ? '€' :
                            currency === 'GBP' ? '£' : '$'

      const assistantMessage: Message = {
        role: 'assistant',
        content: `I've generated a quote for you! Here's what I created:\n\n**Client:** ${quote.client_name}\n**Currency:** ${currency}\n\n**Items:**\n${quote.items.map((item: any, i: number) =>
          `${i + 1}. ${item.description}\n   Qty: ${item.quantity} × ${currencySymbol}${item.unit_price.toFixed(2)} = ${currencySymbol}${item.amount.toFixed(2)}`
        ).join('\n\n')}\n\n**Subtotal:** ${currencySymbol}${quote.subtotal.toFixed(2)}\n**Tax (${(quote.tax_rate * 100).toFixed(1)}%):** ${currencySymbol}${quote.tax_amount.toFixed(2)}\n**Total:** ${currencySymbol}${quote.total.toFixed(2)}\n\n${quote.notes ? `**Notes:** ${quote.notes}\n\n` : ''}Would you like me to create this quote in your system?`,
        generatedQuote: quote,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred'
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `I apologize, but I encountered an error generating the quote: ${errorMsg}. Please try again with more details or check if the AI service is running.`,
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

      // Ensure we have valid response data
      if (!data.description) {
        throw new Error('No response generated')
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.description,
        },
      ])
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred'
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `I apologize, but I encountered an error: ${errorMsg}. Please try again or check if the AI service is running.`,
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
        throw new Error(data.error || 'Failed to generate invoice')
      }

      // Check if currency is needed (from external API)
      if (data.extractedData && data.extractedData.needs_currency) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.description || 'Please specify the currency (e.g., NGN, USD, EUR, GBP) for this invoice.',
          },
        ])
        return
      }

      // Validate invoice data exists
      if (!data.extractedData || typeof data.extractedData !== 'object') {
        throw new Error('Invalid invoice data received from API')
      }

      const invoice = data.extractedData

      // Validate required fields
      if (!invoice.client_name || !invoice.items || !Array.isArray(invoice.items)) {
        throw new Error('Invoice is missing required fields (client_name or items)')
      }

      // Get currency symbol with default
      const currency = invoice.currency || userCurrency
      const currencySymbol = currency === 'NGN' ? '₦' :
                            currency === 'EUR' ? '€' :
                            currency === 'GBP' ? '£' : '$'

      const assistantMessage: Message = {
        role: 'assistant',
        content: `I've generated an invoice for you! Here's what I created:\n\n**Client:** ${invoice.client_name}\n**Currency:** ${currency}\n**Invoice #:** ${invoice.invoice_number || 'Auto-generated'}\n${invoice.payment_terms ? `**Payment Terms:** ${invoice.payment_terms}\n` : ''}\n**Items:**\n${invoice.items.map((item: any, i: number) =>
          `${i + 1}. ${item.description}\n   Qty: ${item.quantity} × ${currencySymbol}${item.unit_price.toFixed(2)} = ${currencySymbol}${item.amount.toFixed(2)}`
        ).join('\n\n')}\n\n**Subtotal:** ${currencySymbol}${invoice.subtotal.toFixed(2)}\n**Tax (${(invoice.tax_rate * 100).toFixed(1)}%):** ${currencySymbol}${invoice.tax_amount.toFixed(2)}${invoice.delivery_charge ? `\n**Delivery:** ${currencySymbol}${invoice.delivery_charge.toFixed(2)}` : ''}\n**Total:** ${currencySymbol}${invoice.total.toFixed(2)}\n\n${invoice.notes ? `**Notes:** ${invoice.notes}\n\n` : ''}${invoice.due_date ? `**Due Date:** ${invoice.due_date}\n\n` : ''}Would you like me to create this invoice in your system?`,
        generatedInvoice: invoice,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred'
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `I apologize, but I encountered an error generating the invoice: ${errorMsg}. Please try again with more details or check if the AI service is running.`,
        },
      ])
    }
  }

  const handleSaveQuote = async (quote: any) => {
    try {
      // ✅ SECURE: Store data in sessionStorage, pass only ID via URL
      const transferId = storeTransferData('quote', quote)
      router.push(`/create?transfer=${transferId}`)
      if (onClose) onClose()
    } catch (error) {
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
      router.push(`/business/invoices?transfer=${transferId}`)
      if (onClose) onClose()
    } catch (error) {
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
      // Handle error silently
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

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-primary-900 dark:via-primary-800 dark:to-primary-900">

      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-primary-700 bg-white/80 dark:bg-primary-800/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-quotla-green to-quotla-orange flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">Q</span>
            </div>
            <div>
              <h2 className="font-heading font-bold text-lg text-gray-900 dark:text-white">Quotla AI Assistant</h2>
              <p className="text-xs text-gray-500 dark:text-primary-400">Generate quotes, invoices & get business advice</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-primary-700 rounded-lg transition-colors"
              aria-label="Close chat"
            >
              <svg className="w-5 h-5 text-gray-500 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Messages Container */}
      <div
        className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 scrollbar-track-transparent dark:scrollbar-thumb-primary-600 dark:hover:scrollbar-thumb-primary-500"
        style={{
          scrollbarWidth: 'thin',
          minHeight: '400px',
          maxHeight: '600px'
        }}
      >
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
          >
            <div
              className={`max-w-[80%] rounded-2xl shadow-md transition-all hover:shadow-lg ${
                message.role === 'user'
                  ? 'bg-gradient-to-br from-quotla-green to-quotla-orange text-white rounded-tr-md px-5 py-3.5'
                  : 'bg-white dark:bg-primary-700 text-gray-800 dark:text-primary-50 border border-gray-100 dark:border-primary-600 rounded-tl-md px-5 py-4'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>

              {/* Action Buttons for Generated Items */}
              {message.generatedQuote && (
                <button
                  onClick={() => handleSaveQuote(message.generatedQuote)}
                  className="mt-4 w-full bg-quotla-green hover:bg-quotla-green/90 text-white px-5 py-3 rounded-xl text-sm font-bold shadow-md hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Create This Quote</span>
                </button>
              )}

              {message.generatedInvoice && (
                <button
                  onClick={() => handleSaveInvoice(message.generatedInvoice)}
                  className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 rounded-xl text-sm font-bold shadow-md hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span>Create This Invoice</span>
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-start animate-fadeIn">
            <div className="bg-white dark:bg-primary-700 border border-gray-100 dark:border-primary-600 rounded-2xl rounded-tl-md px-5 py-4 shadow-md">
              <div className="flex items-center gap-3">
                <div className="flex space-x-2">
                  <div className="w-2.5 h-2.5 bg-quotla-green rounded-full animate-bounce"></div>
                  <div className="w-2.5 h-2.5 bg-quotla-orange rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                  <div className="w-2.5 h-2.5 bg-quotla-green rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                </div>
                <span className="text-sm text-gray-600 dark:text-primary-300 font-medium">Quotla is thinking...</span>
              </div>
            </div>
          </div>
        )}

        {/* Transcribing State */}
        {transcribing && (
          <div className="flex justify-start animate-fadeIn">
            <div className="bg-orange-50 dark:bg-primary-700 border border-quotla-orange/40 dark:border-quotla-orange/50 rounded-2xl rounded-tl-md px-5 py-4 shadow-md">
              <div className="flex items-center gap-3">
                <div className="flex space-x-2">
                  <div className="w-2.5 h-2.5 bg-quotla-orange rounded-full animate-bounce"></div>
                  <div className="w-2.5 h-2.5 bg-quotla-orange rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                  <div className="w-2.5 h-2.5 bg-quotla-orange rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                </div>
                <span className="text-sm text-gray-700 dark:text-primary-300 font-medium">Transcribing audio...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-6 py-5 border-t border-gray-200 dark:border-primary-700 bg-white/80 dark:bg-primary-800/80 backdrop-blur-sm">
        <div className="flex gap-3 items-end">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Ask me anything or describe what you need..."
            className="flex-1 px-5 py-3.5 text-sm bg-gray-50 dark:bg-primary-700/50 border-2 border-gray-200 dark:border-primary-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-quotla-green/50 dark:focus:ring-quotla-orange/50 focus:border-quotla-green dark:focus:border-quotla-orange transition-all text-gray-900 dark:text-primary-50 placeholder-gray-500 dark:placeholder-primary-400"
            disabled={loading || transcribing}
          />

          <VoiceRecorder
            onRecordingComplete={handleVoiceRecording}
            disabled={loading || transcribing}
          />

          <button
            onClick={handleSend}
            disabled={!input.trim() || loading || transcribing}
            className="px-5 py-3.5 bg-gradient-to-r from-quotla-green to-quotla-orange text-white rounded-xl hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none hover:-translate-y-0.5 font-medium"
            aria-label="Send message"
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

        {/* Helper Text */}
        <div className="mt-3 px-2">
          <p className="text-xs text-gray-500 dark:text-primary-400 leading-relaxed">
            💡 <span className="font-medium">Try:</span> "Generate a quote for web development for Acme Corp" or "What are the 2026 VAT changes?"
          </p>
        </div>
      </div>

      {/* Quick Action Button */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-primary-700 bg-gray-50/50 dark:bg-primary-900/50">
        <button
          onClick={() => setShowSelectionModal(true)}
          className="w-full group flex items-center justify-center gap-3 px-5 py-3.5 bg-white dark:bg-primary-800 hover:bg-gray-50 dark:hover:bg-primary-700 border-2 border-gray-200 dark:border-primary-600 hover:border-quotla-green dark:hover:border-quotla-orange rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-quotla-green/10 to-quotla-orange/10 flex items-center justify-center flex-shrink-0 group-hover:from-quotla-green/20 group-hover:to-quotla-orange/20 transition-colors">
            <svg className="w-5 h-5 text-quotla-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div className="text-left">
            <div className="font-heading font-bold text-sm text-gray-900 dark:text-white">Create Manually</div>
            <div className="font-sans text-xs text-gray-500 dark:text-primary-400">Skip AI and create yourself</div>
          </div>
        </button>
      </div>

      {/* Selection Modal */}
      {showSelectionModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
          onClick={() => setShowSelectionModal(false)}
        >
          <div
            className="bg-white dark:bg-primary-800 rounded-3xl shadow-2xl max-w-lg w-full p-8 transform transition-all animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">Create Document</h3>
                <p className="text-sm text-gray-500 dark:text-primary-400 mt-1">Choose what you'd like to create</p>
              </div>
              <button
                onClick={() => setShowSelectionModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-primary-700 rounded-lg transition-colors"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Options */}
            <div className="space-y-4 mb-6">
              <button
                onClick={() => {
                  setShowSelectionModal(false)
                  router.push('/create')
                }}
                className="w-full group flex items-center gap-5 p-5 bg-quotla-green/5 hover:bg-quotla-green/10 border-2 border-quotla-green/20 hover:border-quotla-green rounded-2xl transition-all duration-200 hover:shadow-lg"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-quotla-green to-quotla-green/80 flex items-center justify-center flex-shrink-0 shadow-md group-hover:shadow-lg transition-shadow">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <div className="font-heading font-bold text-lg text-gray-900 dark:text-white">Quote</div>
                  <div className="font-sans text-sm text-gray-600 dark:text-primary-300 mt-0.5">Create a proposal for potential clients</div>
                </div>
                <svg className="w-5 h-5 text-quotla-green opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <button
                onClick={() => {
                  setShowSelectionModal(false)
                  router.push('/business/invoices')
                }}
                className="w-full group flex items-center gap-5 p-5 bg-purple-500/5 hover:bg-purple-500/10 border-2 border-purple-500/20 hover:border-purple-500 rounded-2xl transition-all duration-200 hover:shadow-lg"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-md group-hover:shadow-lg transition-shadow">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <div className="font-heading font-bold text-lg text-gray-900 dark:text-white">Invoice</div>
                  <div className="font-sans text-sm text-gray-600 dark:text-primary-300 mt-0.5">Request payment for delivered services</div>
                </div>
                <svg className="w-5 h-5 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Info Toggle */}
            <button
              onClick={() => setShowDifferenceInfo(!showDifferenceInfo)}
              className="w-full text-center text-sm text-quotla-orange hover:text-quotla-orange/80 font-semibold transition-colors flex items-center justify-center gap-2 py-2"
            >
              <span>What's the difference?</span>
              <svg className={`w-4 h-4 transition-transform duration-200 ${showDifferenceInfo ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Expandable Info */}
            {showDifferenceInfo && (
              <div className="mt-5 p-5 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-primary-900 dark:to-primary-800 rounded-2xl space-y-4 text-sm border border-gray-200 dark:border-primary-700 animate-fadeIn">
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-quotla-green mt-1.5 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-heading font-bold text-quotla-green text-base mb-1">Quote</h4>
                      <p className="text-gray-700 dark:text-primary-300 leading-relaxed">A proposal sent to potential clients showing estimated prices for products or services. It's not a request for payment.</p>
                    </div>
                  </div>
                </div>
                <div className="h-px bg-gray-300 dark:bg-primary-600"></div>
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-purple-600 mt-1.5 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-heading font-bold text-purple-600 text-base mb-1">Invoice</h4>
                      <p className="text-gray-700 dark:text-primary-300 leading-relaxed">A payment request sent after delivering products or services. It includes payment terms and due dates.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
