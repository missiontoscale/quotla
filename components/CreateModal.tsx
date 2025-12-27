'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { format } from 'date-fns'
import { parseAIResponse, shouldCreateDocument, ParsedDocumentData } from '@/lib/ai/response-parser'
import { extractInvoiceDataFromConversation } from '@/lib/ai/conversation-parser'
import Modal from './Modal'
import VoiceRecorder from './VoiceRecorder'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface CreateModalProps {
  isOpen: boolean
  onClose: () => void
}

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

export default function CreateModal({ isOpen, onClose }: CreateModalProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
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
          // Silently fail if unable to load chat history
        }
      }
    }
  }, [isOpen])

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [chatMessages])

  const handleVoiceRecording = async (audioBlob: Blob) => {
    setIsRecording(false)

    // Check authentication
    if (!user) {
      setChatMessages(prev => [...prev.slice(-24), {
        role: 'assistant',
        content: 'Please sign in to use the AI assistant. Your session may have expired.',
        timestamp: new Date()
      }])
      localStorage.setItem('quotla_chat_history', JSON.stringify(chatMessages))
      localStorage.setItem('quotla_redirect_after_auth', 'true')
      router.push('/login')
      return
    }

    // Convert audio blob to file
    const audioFile = new File([audioBlob], `voice-${Date.now()}.webm`, { type: 'audio/webm' })
    const userMessage = '[Voice message]'

    setChatMessages(prev => [...prev.slice(-24), { role: 'user', content: userMessage, timestamp: new Date() }])
    setChatLoading(true)

    try {
      const recentMessages = chatMessages.slice(-24).map(m => ({
        role: m.role,
        content: m.content
      }))

      const formData = new FormData()
      formData.append('prompt', 'Please transcribe this audio and respond accordingly')
      formData.append('history', JSON.stringify(recentMessages))
      formData.append('file', audioFile)

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })

      // Check if response is HTML (redirect to login)
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('text/html')) {
        throw new Error('AUTHENTICATION_REQUIRED')
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process voice message')
      }

      setChatMessages(prev => [...prev.slice(-24), {
        role: 'assistant',
        content: data.description || 'I received your voice message. However, audio transcription is not yet fully implemented. Please type your message for now.',
        timestamp: new Date()
      }])
    } catch (error) {
      if (error instanceof Error && error.message === 'AUTHENTICATION_REQUIRED') {
        setChatMessages(prev => [...prev.slice(-24), {
          role: 'assistant',
          content: 'Your session has expired. Please sign in again to continue.',
          timestamp: new Date()
        }])
        localStorage.setItem('quotla_chat_history', JSON.stringify(chatMessages))
        localStorage.setItem('quotla_redirect_after_auth', 'true')
        setTimeout(() => router.push('/login'), 2000)
      } else {
        setChatMessages(prev => [...prev.slice(-24), {
          role: 'assistant',
          content: 'Sorry, I couldn\'t process your voice message. Please try typing instead.',
          timestamp: new Date()
        }])
      }
    } finally {
      setChatLoading(false)
    }
  }

  const handleChatSend = async () => {
    if ((!chatInput.trim() && !selectedFile) || chatLoading) return

    // Check authentication
    if (!user) {
      setChatMessages(prev => [...prev.slice(-24), {
        role: 'assistant',
        content: 'Please sign in to use the AI assistant. Your session may have expired.',
        timestamp: new Date()
      }])
      // Save chat history and redirect to login
      localStorage.setItem('quotla_chat_history', JSON.stringify(chatMessages))
      localStorage.setItem('quotla_redirect_after_auth', 'true')
      router.push('/login')
      return
    }

    const userMessage = chatInput || (selectedFile ? `[Uploaded file: ${selectedFile.name}]` : '')
    const fileToSend = selectedFile
    setChatInput('')
    setChatMessages(prev => [...prev.slice(-24), { role: 'user', content: userMessage, timestamp: new Date() }])
    setChatLoading(true)

    try {
      const recentMessages = chatMessages.slice(-24).map(m => ({
        role: m.role,
        content: m.content
      }))

      let response
      if (fileToSend) {
        // Send as FormData when file is present
        const formData = new FormData()
        formData.append('prompt', chatInput)
        formData.append('history', JSON.stringify(recentMessages))
        formData.append('file', fileToSend)

        response = await fetch('/api/ai/generate', {
          method: 'POST',
          credentials: 'include',
          body: formData,
        })
      } else {
        // Send as JSON when no file
        response = await fetch('/api/ai/generate', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: userMessage,
            history: recentMessages
          }),
        })
      }

      // Check if response is HTML (redirect to login)
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('text/html')) {
        throw new Error('AUTHENTICATION_REQUIRED')
      }

      const data = await response.json()

      if (!response.ok) {
        const errorMessage = data.error || 'Failed to generate'
        console.error('API Error:', errorMessage, 'Status:', response.status)
        throw new Error(errorMessage)
      }

      const aiResponse = data.description
      const shouldCreateFromAPI = data.shouldCreateDocument

      const shouldCreate = shouldCreateFromAPI || shouldCreateDocument(userMessage, aiResponse)

      if (shouldCreate) {
        const allMessages: ConversationMessage[] = [
          ...chatMessages.map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content: userMessage },
          { role: 'assistant', content: aiResponse }
        ]

        const extractedData = extractInvoiceDataFromConversation(allMessages)

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
        }

        if (!parsedData) {
          parsedData = parseAIResponse(aiResponse)

          if (!parsedData && chatMessages.length > 0) {
            const lastAssistantMessage = [...chatMessages].reverse().find(m => m.role === 'assistant')
            if (lastAssistantMessage) {
              parsedData = parseAIResponse(lastAssistantMessage.content)
            }
          }
        }

        if (parsedData && parsedData.items && parsedData.items.length > 0) {
          // Convert parsedData to the format expected by /quotes/new and /invoices/new
          const aiDataForForm = {
            client_name: parsedData.client.name || 'Customer',
            currency: parsedData.currency || 'USD',
            items: parsedData.items,
            tax_rate: parsedData.additional_charges?.find(c => c.description.toLowerCase().includes('tax'))?.amount ?
                      ((parsedData.additional_charges.find(c => c.description.toLowerCase().includes('tax'))!.amount / parsedData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)) * 100) : 0,
            notes: parsedData.notes || ''
          }

          // Navigate to the appropriate form with pre-filled data
          const total = parsedData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0) + (parsedData.additional_charges?.reduce((sum, c) => sum + c.amount, 0) || 0)

          const enhancedResponse = `✓ **I've prepared the ${parsedData.type} for you!**\n\n**Client:** ${parsedData.client.name}\n**Total:** ${parsedData.currency} ${total.toFixed(2)}\n\nClick the button below to review and save it.`

          setChatMessages(prev => [...prev.slice(-24), {
            role: 'assistant',
            content: enhancedResponse,
            timestamp: new Date(),
            documentId: encodeURIComponent(JSON.stringify(aiDataForForm)),
            documentType: parsedData.type
          }])
        } else {
          // No parsable data, but still show the AI response
          setChatMessages(prev => [...prev.slice(-24), { role: 'assistant', content: aiResponse, timestamp: new Date() }])
        }
      } else {
        setChatMessages(prev => [...prev.slice(-24), { role: 'assistant', content: aiResponse, timestamp: new Date() }])
      }
    } catch (error) {

      // Handle authentication errors
      if (error instanceof Error && error.message === 'AUTHENTICATION_REQUIRED') {
        setChatMessages(prev => [...prev.slice(-24), {
          role: 'assistant',
          content: 'Your session has expired. Please sign in again to continue.',
          timestamp: new Date()
        }])
        // Save chat history and redirect to login
        localStorage.setItem('quotla_chat_history', JSON.stringify(chatMessages))
        localStorage.setItem('quotla_redirect_after_auth', 'true')
        setTimeout(() => router.push('/login'), 2000)
      } else {
        // Provide more specific error messages
        let errorMessage = 'Sorry, I encountered an error. Please try again.'

        if (error instanceof Error) {
          // Check for specific error types
          if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            errorMessage = 'Unable to connect to the AI service. Please check your connection and try again.'
          } else if (error.message.includes('Failed to generate')) {
            errorMessage = 'The AI service is currently unavailable. Please ensure the external API backend is running and accessible.'
          } else if (error.message) {
            errorMessage = `Error: ${error.message}`
          }
        }

        setChatMessages(prev => [...prev.slice(-24), {
          role: 'assistant',
          content: errorMessage,
          timestamp: new Date()
        }])
      }
    } finally {
      setChatLoading(false)
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full" showCloseButton={false}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-primary-600 flex items-center justify-center flex-shrink-0 shadow-lg">
              <span className="text-white font-bold text-2xl">Q</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-primary-50">What do you need?</h2>
              <p className="text-sm text-primary-300">Describe your quote or invoice, and I'll create it for you</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-primary-400 hover:text-primary-300 hover:bg-primary-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Chat Messages Area */}
        <div
          ref={chatContainerRef}
          className="bg-primary-700 rounded-xl border-2 border-primary-600 p-6 overflow-y-auto"
          style={{ height: 'clamp(400px, 60vh, 700px)' }}
        >
          {chatMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <p className="text-sm text-primary-300 max-w-lg mb-8">
                Click a suggestion below to get started, or type your own request.:
              </p>
              <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => setChatInput('Help me create a quote for ')}
                  className="text-left px-6 py-4 bg-white hover:bg-primary-700 rounded-lg text-sm text-primary-200 transition-all shadow-sm hover:shadow-md border border-primary-600"
                >
                  <div>
                    <h4 className="font-semibold text-primary-50 mb-1">Create a quote</h4>
                    <p className="text-xs text-primary-300">Help me create a quote for . . .</p>
                  </div>
                </button>
                <button
                  onClick={() => setChatInput('Hey there! I need your help to create an invoice for ')}
                  className="text-left px-6 py-4 bg-white hover:bg-primary-700 rounded-lg text-sm text-primary-200 transition-all shadow-sm hover:shadow-md border border-primary-600"
                >
                  <div>
                    <h4 className="font-semibold text-primary-50 mb-1">Generate invoice</h4>
                    <p className="text-xs text-primary-300">Hey there! I need your help to create an invoice for . . .</p>
                  </div>
                </button>
                <button
                  onClick={() => setChatInput('How should I price my ')}
                  className="text-left px-6 py-4 bg-white hover:bg-primary-700 rounded-lg text-sm text-primary-200 transition-all shadow-sm hover:shadow-md border border-primary-600"
                >
                  <div>
                    <h4 className="font-semibold text-primary-50 mb-1">Pricing advice</h4>
                    <p className="text-xs text-primary-300">How should I price my . . .</p>
                  </div>
                </button>
                <button
                  onClick={() => setChatInput('Explain the 2026 VAT changes in Nigeria')}
                  className="text-left px-6 py-4 bg-white hover:bg-primary-700 rounded-lg text-sm text-primary-200 transition-all shadow-sm hover:shadow-md border border-primary-600"
                >
                  <div>
                    <h4 className="font-semibold text-primary-50 mb-1">Tax law guidance</h4>
                    <p className="text-xs text-primary-300">Explain the 2026 VAT changes in Nigeria</p>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] ${msg.role === 'user' ? '' : 'space-y-2'}`}>
                    <div className={`rounded-2xl px-5 py-3 ${
                      msg.role === 'user'
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-primary-50 shadow-sm border border-primary-600'
                    }`}>
                      {msg.role === 'user' ? (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      ) : (
                        <div className="text-sm leading-relaxed prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1 prose-li:my-0">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      )}
                      {msg.timestamp && !isNaN(new Date(msg.timestamp).getTime()) && (
                        <p className="text-xs mt-2 opacity-70">
                          {format(new Date(msg.timestamp), 'h:mm a')}
                        </p>
                      )}
                    </div>
                    {msg.documentId && msg.documentType && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            onClose()
                            router.push(`/${msg.documentType}s/new?ai_data=${msg.documentId}`)
                          }}
                          className="flex-1 px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-all font-medium shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View & Save
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white rounded-2xl px-5 py-3 shadow-sm border border-primary-600">
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
          <div className="p-4 bg-quotla-light border border-quotla-green/30 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-quotla-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              <span className="text-sm font-medium text-primary-200">{selectedFile.name}</span>
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
        {isRecording ? (
          <VoiceRecorder
            onRecordingComplete={handleVoiceRecording}
            disabled={chatLoading}
          />
        ) : (
          <div className="relative">
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
            <div className="relative flex items-end gap-2 px-4 py-3 rounded-lg border-2 border-primary-500 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-200 bg-white transition-all">
              <textarea
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleChatSend()
                  }
                }}
                placeholder="Describe your quote or invoice..."
                className="flex-1 outline-none resize-none bg-transparent text-sm sm:text-base disabled:opacity-50 disabled:bg-primary-700 min-h-[24px] max-h-[200px]"
                disabled={chatLoading}
                rows={1}
                style={{
                  height: 'auto',
                  overflowY: chatInput.split('\n').length > 3 ? 'auto' : 'hidden'
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement
                  target.style.height = 'auto'
                  target.style.height = target.scrollHeight + 'px'
                }}
              />
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={chatLoading}
                  className="p-2 rounded-md hover:bg-primary-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Upload file (max 2MB)"
                >
                  <svg className="w-5 h-5 text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>
                <button
                  onClick={() => setIsRecording(true)}
                  disabled={chatLoading}
                  className="p-2 rounded-md hover:bg-primary-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Record voice message"
                >
                  <svg className="w-5 h-5 text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>
                <button
                  onClick={handleChatSend}
                  disabled={(!chatInput.trim() && !selectedFile) || chatLoading}
                  className="p-2 rounded-md bg-primary-600 text-white hover:bg-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Send message"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
        <p className="text-xs text-primary-400 text-center">
          Keeps up to 25 messages in context • Max file size: 2MB
        </p>
      </div>
    </Modal>
  )
}
