'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { format } from 'date-fns'
import { parseAIResponse, shouldCreateDocument, ParsedDocumentData } from '@/lib/ai/response-parser'
import { extractInvoiceDataFromConversation } from '@/lib/ai/conversation-parser'
import DashboardLayout from '@/components/DashboardLayout'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import VoiceRecorder from '@/components/VoiceRecorder'

export const dynamic = 'force-dynamic'

interface ChatMessage {
  role: string
  content: string
  timestamp: Date
  documentId?: string
  documentType?: 'quote' | 'invoice'
}

interface ConversationMessage {
  role: string
  content: string
}

export default function CreatePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Load chat history from localStorage on mount
    const savedChat = localStorage.getItem('quotla_chat_history')
    if (savedChat) {
      try {
        const parsed = JSON.parse(savedChat)
        setChatMessages(parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })))
        localStorage.removeItem('quotla_chat_history')
      } catch (error) {
        console.error('Error loading chat history:', error)
      }
    }
  }, [])

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [chatMessages])

  const handleVoiceRecording = async (audioBlob: Blob) => {
    setChatLoading(true)
    try {
      // Create FormData to send audio file
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')

      // Call transcription API
      const response = await fetch('/api/ai/transcribe', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to transcribe audio')
      }

      // Set the transcribed text as the chat input and send it
      const transcribedText = data.text
      setChatInput(transcribedText)

      // Add a small delay to show the transcribed text before sending
      setTimeout(() => {
        handleChatSendWithText(transcribedText)
      }, 500)
    } catch (error) {
      console.error('Transcription error:', error)
      setChatMessages(prev => [...prev.slice(-24), {
        role: 'assistant',
        content: `Sorry, I couldn't transcribe your voice message: ${error instanceof Error ? error.message : 'Unknown error'}. Please try typing your message instead.`,
        timestamp: new Date()
      }])
      setChatLoading(false)
    }
  }

  const handleChatSendWithText = async (messageText: string) => {
    if (!messageText.trim() || chatLoading) return

    const userMessage = messageText
    setChatInput('')
    setChatMessages(prev => [...prev.slice(-24), { role: 'user', content: userMessage, timestamp: new Date() }])
    setChatLoading(true)

    try {
      const recentMessages = chatMessages.slice(-24).map(m => ({
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

      const aiResponse = data.description
      const shouldCreateFromAPI = data.shouldCreateDocument

      const shouldCreate = shouldCreateFromAPI || shouldCreateDocument(userMessage, aiResponse)
      console.log('Should create document:', shouldCreate, {userMessage, aiResponse, shouldCreateFromAPI})

      if (shouldCreate) {
        const allMessages: ConversationMessage[] = [
          ...chatMessages.map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content: userMessage },
          { role: 'assistant', content: aiResponse }
        ]

        console.log('Attempting to extract data from conversation history...')
        const extractedData = extractInvoiceDataFromConversation(allMessages)
        console.log('Extracted data:', extractedData)

        let parsedData: ParsedDocumentData | null = null

        if (extractedData && extractedData.business.name && extractedData.items.length > 0) {
          const subtotal = extractedData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)

          const additionalCharges: Array<{description: string, amount: number}> = []
          if (extractedData.delivery_cost_percentage) {
            additionalCharges.push({
              description: 'Delivery',
              amount: subtotal * (extractedData.delivery_cost_percentage / 100)
            })
          }

          const fullConversation = allMessages.map(m => m.content).join('\n').toLowerCase()
          const isInvoice = fullConversation.includes('invoice') && !fullConversation.includes('quote')
          const isQuote = fullConversation.includes('quote') && !fullConversation.includes('invoice')
          const docType = isQuote ? 'quote' : 'invoice'

          const noteParts: string[] = []
          if (extractedData.payment_terms) noteParts.push(`Payment: ${extractedData.payment_terms}`)
          if (extractedData.delivery_date) noteParts.push(`Delivery: ${extractedData.delivery_date}`)
          if (extractedData.payment_details) {
            noteParts.push(`Bank: ${extractedData.payment_details.bank}`)
            noteParts.push(`Account: ${extractedData.payment_details.account_number}`)
            noteParts.push(`Account Name: ${extractedData.payment_details.account_name}`)
          }

          parsedData = {
            type: docType,
            business: extractedData.business,
            client: extractedData.client,
            items: extractedData.items,
            currency: extractedData.currency,
            additional_charges: additionalCharges.length > 0 ? additionalCharges : undefined,
            notes: noteParts.length > 0 ? noteParts.join('\n') : undefined
          }

          console.log('Converted to ParsedDocumentData:', parsedData)
        }

        if (!parsedData) {
          console.log('Conversation parser failed, trying old parser as fallback...')
          parsedData = parseAIResponse(aiResponse)

          if (!parsedData && chatMessages.length > 0) {
            console.log('Trying to parse from last assistant message...')
            const lastAssistantMessage = [...chatMessages].reverse().find(m => m.role === 'assistant')
            if (lastAssistantMessage) {
              parsedData = parseAIResponse(lastAssistantMessage.content)
            }
          }
        }

        console.log('Final parsed data:', parsedData)

        if (parsedData) {
          // Convert parsedData to the format expected by /create and /invoices
          const aiDataForForm = {
            client_name: parsedData.client.name,
            currency: parsedData.currency,
            items: parsedData.items,
            tax_rate: parsedData.additional_charges?.find(c => c.description.toLowerCase().includes('tax'))?.amount ?
                      ((parsedData.additional_charges.find(c => c.description.toLowerCase().includes('tax'))!.amount / parsedData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)) * 100) : 0,
            notes: parsedData.notes || ''
          }

          // Navigate to the appropriate form with pre-filled data
          const targetPath = parsedData.type === 'invoice' ? '/invoices' : '/create'
          const total = parsedData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0) + (parsedData.additional_charges?.reduce((sum, c) => sum + c.amount, 0) || 0)

          const enhancedResponse = `✓ I've prepared the ${parsedData.type} for you!\n\nClient: ${parsedData.client.name}\nTotal: ${parsedData.currency} ${total.toFixed(2)}\n\nClick the button below to review and save it.`

          setChatMessages(prev => [...prev.slice(-24), {
            role: 'assistant',
            content: enhancedResponse,
            timestamp: new Date(),
            documentId: encodeURIComponent(JSON.stringify(aiDataForForm)),
            documentType: parsedData.type
          }])
        } else {
          console.error('Failed to parse document data')
          setChatMessages(prev => [...prev.slice(-24), { role: 'assistant', content: `${aiResponse}\n\n⚠️ I couldn't parse the document data. Please provide more details or create manually.`, timestamp: new Date() }])
        }
      } else {
        setChatMessages(prev => [...prev.slice(-24), { role: 'assistant', content: aiResponse, timestamp: new Date() }])
      }
    } catch (error) {
      setChatMessages(prev => [...prev.slice(-24), { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.', timestamp: new Date() }])
    } finally {
      setChatLoading(false)
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleChatSend = () => {
    handleChatSendWithText(chatInput)
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary-50">Create Document</h1>
        <p className="mt-2 text-primary-300">Use AI to generate quotes and invoices in minutes, or create them manually</p>
      </div>

      {/* AI Chat Interface */}
      <div className="card bg-gradient-to-br from-primary-50 to-white border-2 border-primary-200 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-600 shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-primary-50">Quotla AI Assistant</h2>
              <p className="text-sm text-primary-300">Describe your quote or invoice, and I'll create it for you</p>
            </div>
          </div>
        </div>

        {/* Chat Messages Area */}
        <div
          ref={chatContainerRef}
          className="bg-white rounded-xl border-2 border-primary-600 p-4 mb-4 overflow-y-auto"
          style={{ height: 'clamp(400px, 50vh, 600px)' }}
        >
          {chatMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-primary-50 mb-2">Start creating with AI</h3>
              <p className="text-sm text-primary-300 max-w-md">
                Tell me about your business, client, and what you're quoting. I'll generate a professional document for you.
              </p>
              <div className="mt-6 text-left w-full max-w-md space-y-3">
                <p className="text-xs font-semibold text-primary-400 uppercase">Try saying:</p>
                <button
                  onClick={() => setChatInput('I need a quote for web development services for ABC Company. 40 hours at $100/hour.')}
                  className="w-full text-left px-4 py-2 bg-primary-700 hover:bg-primary-600 rounded-lg text-sm text-primary-200 transition-colors"
                >
                  "I need a quote for web development services..."
                </button>
                <button
                  onClick={() => setChatInput('Create an invoice for consulting work. 3 days at $500 per day for XYZ Corp.')}
                  className="w-full text-left px-4 py-2 bg-primary-700 hover:bg-primary-600 rounded-lg text-sm text-primary-200 transition-colors"
                >
                  "Create an invoice for consulting work..."
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] ${msg.role === 'user' ? '' : 'space-y-2'}`}>
                    <div className={`rounded-2xl px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-primary-600 text-white'
                        : 'bg-primary-600 text-primary-50'
                    }`}>
                      <div className="text-sm leading-relaxed prose prose-sm max-w-none prose-headings:mt-2 prose-headings:mb-2 prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            // Style markdown elements to match chat bubble colors
                            strong: ({children}) => <strong className={msg.role === 'user' ? 'text-white font-bold' : 'text-primary-50 font-bold'}>{children}</strong>,
                            em: ({children}) => <em className={msg.role === 'user' ? 'text-white' : 'text-primary-50'}>{children}</em>,
                            h1: ({children}) => <h1 className={msg.role === 'user' ? 'text-white text-xl font-bold' : 'text-primary-50 text-xl font-bold'}>{children}</h1>,
                            h2: ({children}) => <h2 className={msg.role === 'user' ? 'text-white text-lg font-bold' : 'text-primary-50 text-lg font-bold'}>{children}</h2>,
                            h3: ({children}) => <h3 className={msg.role === 'user' ? 'text-white text-base font-bold' : 'text-primary-50 text-base font-bold'}>{children}</h3>,
                            ul: ({children}) => <ul className={msg.role === 'user' ? 'text-white list-disc pl-4' : 'text-primary-50 list-disc pl-4'}>{children}</ul>,
                            ol: ({children}) => <ol className={msg.role === 'user' ? 'text-white list-decimal pl-4' : 'text-primary-50 list-decimal pl-4'}>{children}</ol>,
                            p: ({children}) => <p className={msg.role === 'user' ? 'text-white' : 'text-primary-50'}>{children}</p>,
                            code: ({children}) => <code className={msg.role === 'user' ? 'bg-primary-700 px-1 py-0.5 rounded text-white' : 'bg-primary-600 px-1 py-0.5 rounded text-primary-50'}>{children}</code>,
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                      {msg.timestamp && !isNaN(new Date(msg.timestamp).getTime()) && (
                        <p className="text-xs mt-1 opacity-70">
                          {format(new Date(msg.timestamp), 'h:mm a')}
                        </p>
                      )}
                    </div>
                    {msg.documentId && msg.documentType && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => router.push(`/${msg.documentType}s/new?ai_data=${msg.documentId}`)}
                          className="flex-1 px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-all font-medium shadow-md hover:shadow-lg"
                        >
                          Review & Save {msg.documentType === 'invoice' ? 'Invoice' : 'Quote'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-primary-600 rounded-2xl px-4 py-3">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* File Upload Preview */}
        {selectedFile && (
          <div className="mb-3 p-3 bg-quotla-light border border-quotla-green/30 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-quotla-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              <span className="text-sm text-primary-200">{selectedFile.name}</span>
              <span className="text-xs text-primary-400">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
            </div>
            <button
              onClick={() => {
                setSelectedFile(null)
                if (fileInputRef.current) fileInputRef.current.value = ''
              }}
              className="text-red-600 hover:text-red-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Chat Input Area */}
        <div className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                if (file.size > 2 * 1024 * 1024) {
                  alert('File size must be less than 2MB')
                  e.target.value = ''
                  return
                }
                setSelectedFile(file)
              }
            }}
            accept="image/*,.pdf,.doc,.docx"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={chatLoading}
            className="p-3 rounded-lg border-2 border-primary-500 hover:border-primary-400 hover:bg-primary-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed self-end"
            title="Upload file (max 2MB)"
          >
            <svg className="w-5 h-5 text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
          <VoiceRecorder
            onRecordingComplete={handleVoiceRecording}
            disabled={chatLoading}
          />
          <textarea
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleChatSend()
              }
            }}
            placeholder="Describe your quote or invoice... (Press Enter to send, Shift+Enter for new line)"
            className="flex-1 px-4 py-3 rounded-lg border-2 border-primary-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all disabled:opacity-50 disabled:bg-primary-700 resize-y min-h-[48px] max-h-[200px]"
            disabled={chatLoading}
            rows={1}
            style={{
              height: 'auto',
              minHeight: '48px'
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement
              target.style.height = 'auto'
              target.style.height = Math.min(target.scrollHeight, 200) + 'px'
            }}
          />
          <button
            onClick={handleChatSend}
            disabled={!chatInput.trim() || chatLoading}
            className="px-6 py-3 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none self-end"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-primary-400 mt-2 text-center">
          Keeps up to 25 messages in context • Max file size: 2MB • Voice recording available
        </p>
      </div>

      {/* Manual Creation Options */}
      <div className="grid md:grid-cols-2 gap-6">
        <button
          onClick={() => router.push('/create')}
          className="card hover:shadow-lg transition-all cursor-pointer text-left group"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-quotla-green/10 flex items-center justify-center group-hover:bg-quotla-green/20 transition-colors">
              <svg className="w-6 h-6 text-quotla-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-primary-50 mb-1">Create Quote Manually</h3>
              <p className="text-sm text-primary-300">Use the traditional form to create a quote with full control over every detail</p>
            </div>
            <svg className="w-5 h-5 text-primary-400 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>

        <button
          onClick={() => router.push('/business/invoices')}
          className="card hover:shadow-lg transition-all cursor-pointer text-left group"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-primary-50 mb-1">Create Invoice Manually</h3>
              <p className="text-sm text-primary-300">Use the traditional form to create an invoice with full control over every detail</p>
            </div>
            <svg className="w-5 h-5 text-primary-400 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>
      </div>
    </div>
    </DashboardLayout>
  )
}
