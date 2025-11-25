'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Message {
  role: 'user' | 'assistant'
  content: string
  generatedQuote?: any
}

export default function QuotlaChat({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hi! I\'m Quotla AI Assistant. I can help you:\n\n• Generate complete quotes with line items and pricing\n• Create invoices\n• Provide business advice\n• Answer questions about your quotes and invoices\n\nWhat would you like to do today?',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const detectIntent = (userMessage: string, lastMessage?: Message): string => {
    const lowerMsg = userMessage.toLowerCase()

    // If the last message had a generated quote and user says "yes", "do it", etc.
    if (lastMessage?.generatedQuote) {
      if (
        lowerMsg.includes('yes') ||
        lowerMsg.includes('create') ||
        lowerMsg.includes('do it') ||
        lowerMsg.includes('sure') ||
        lowerMsg.includes('okay') ||
        lowerMsg.includes('ok')
      ) {
        // But if they're asking for modifications (currency, changes), regenerate
        if (
          lowerMsg.includes('but') ||
          lowerMsg.includes('ngn') ||
          lowerMsg.includes('naira') ||
          lowerMsg.includes('currency') ||
          lowerMsg.includes('instead') ||
          lowerMsg.includes('different')
        ) {
          return 'generate_quote'
        }
        return 'save_quote'
      }
    }

    if (
      lowerMsg.includes('quote') ||
      lowerMsg.includes('generate') ||
      lowerMsg.includes('create') ||
      lowerMsg.includes('price') ||
      lowerMsg.includes('estimate') ||
      lowerMsg.includes('ngn') ||
      lowerMsg.includes('naira') ||
      lowerMsg.includes('usd') ||
      lowerMsg.includes('web development')
    ) {
      return 'generate_quote'
    }

    if (lowerMsg.includes('invoice')) {
      return 'generate_invoice'
    }

    return 'general'
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

  const handleSaveQuote = async (quote: any) => {
    try {
      router.push(`/quotes/new?ai_data=${encodeURIComponent(JSON.stringify(quote))}`)
      onClose()
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

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      // Get the last assistant message to check for context
      const lastAssistantMsg = messages.filter(m => m.role === 'assistant').pop()
      const intent = detectIntent(userMessage, lastAssistantMsg)

      if (intent === 'save_quote' && lastAssistantMsg?.generatedQuote) {
        await handleSaveQuote(lastAssistantMsg.generatedQuote)
      } else if (intent === 'generate_quote') {
        await handleGenerateQuote(userMessage)
      } else if (intent === 'generate_invoice') {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: 'Invoice generation is coming soon! For now, you can create invoices manually from the Invoices page.',
          },
        ])
      } else {
        await handleGeneralAdvice(userMessage)
      }
    } catch (error) {
      console.error('Chat error:', error)
    } finally {
      setLoading(false)
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
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              {message.generatedQuote && (
                <button
                  onClick={() => handleSaveQuote(message.generatedQuote)}
                  className="mt-3 w-full bg-white text-primary-600 px-3 py-2 rounded text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Create This Quote →
                </button>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me anything or describe what you need..."
            className="flex-1 input text-sm"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
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
        <p className="text-xs text-gray-500 mt-2">
          Try: "Generate a quote for website development" or "Create a quote for 3 months of consulting"
        </p>
      </div>
    </div>
  )
}
