'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import VoiceRecorder from './VoiceRecorder'
import { classifyIntent, classifyIntentFast, type Intent } from '@/lib/ai/intent-classifier'
import { storeTransferData } from '@/lib/utils/secure-transfer'

interface Message {
  role: 'user' | 'assistant'
  content: string
  generatedQuote?: any
  generatedInvoice?: any
}

export default function QuotlaChat({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hi! I\'m Quotla AI Assistant. I can help you:\n\n• Generate complete quotes with line items and pricing\n• Create invoices\n• Provide business advice\n• Understand Nigeria\'s 2026 tax reforms\n\nWhat would you like to do today?',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [transcribing, setTranscribing] = useState(false)
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
            content: 'I can help you create a quote! To make it accurate, please tell me:\n\n1. **Client name** - Who is this quote for?\n2. **Service/Product** - What are you quoting?\n3. **Currency** (optional) - USD, NGN, EUR, or GBP?\n\nFor example: "Generate a quote for web development services for Acme Corp in NGN"',
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
      onClose()
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
      onClose()
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

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-2xl flex flex-col z-50 border-l">
      {/* Header */}
      <div className="bg-primary-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center">
            <span className="text-primary-600 font-bold text-lg">Q</span>
          </div>
          <div>
            <h2 className="font-semibold">Quotla AI Assistant</h2>
            <p className="text-xs opacity-90 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400"></span>
              Online
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:bg-primary-700 rounded-full p-2 transition-colors"
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-primary-600 text-white'
                  : 'bg-primary-600 text-primary-50'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              {message.generatedQuote && (
                <button
                  onClick={() => handleSaveQuote(message.generatedQuote)}
                  className="mt-3 w-full bg-white text-primary-600 px-3 py-2 rounded text-sm font-medium hover:bg-primary-700 transition-colors"
                >
                  Create This Quote →
                </button>
              )}
              {message.generatedInvoice && (
                <button
                  onClick={() => handleSaveInvoice(message.generatedInvoice)}
                  className="mt-3 w-full bg-white text-primary-600 px-3 py-2 rounded text-sm font-medium hover:bg-primary-700 transition-colors"
                >
                  Create This Invoice →
                </button>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-primary-600 rounded-lg px-4 py-2">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        {transcribing && (
          <div className="flex justify-start">
            <div className="bg-quotla-light border border-quotla-green/30 rounded-lg px-4 py-2">
              <div className="flex items-center gap-2">
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-quotla-orange rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-quotla-orange rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-1.5 h-1.5 bg-quotla-orange rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
                <span className="text-xs text-quotla-dark font-medium">Transcribing audio...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-primary-700">
        <div className="flex gap-2 items-end">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me anything or describe what you need..."
            className="flex-1 input text-sm"
            disabled={loading}
          />
          <VoiceRecorder
            onRecordingComplete={handleVoiceRecording}
            disabled={loading || transcribing}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading || transcribing}
            className="btn btn-primary px-4 disabled:opacity-50 disabled:cursor-not-allowed"
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
        <p className="text-xs text-primary-400 mt-2">
          Try: "Generate a quote for website development" or "Explain the 2026 VAT changes"
        </p>
      </div>
    </div>
  )
}
