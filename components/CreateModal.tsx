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
          console.error('Error loading chat history:', error)
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
        body: formData,
      })

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
      setChatMessages(prev => [...prev.slice(-24), {
        role: 'assistant',
        content: 'Sorry, I couldn\'t process your voice message. Please try typing instead.',
        timestamp: new Date()
      }])
    } finally {
      setChatLoading(false)
    }
  }

  const handleChatSend = async () => {
    if ((!chatInput.trim() && !selectedFile) || chatLoading) return

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
          body: formData,
        })
      } else {
        // Send as JSON when no file
        response = await fetch('/api/ai/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: userMessage,
            history: recentMessages
          }),
        })
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate')
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

        if (parsedData) {
          // Convert parsedData to the format expected by /quotes/new and /invoices/new
          const aiDataForForm = {
            client_name: parsedData.client.name,
            currency: parsedData.currency,
            items: parsedData.items,
            tax_rate: parsedData.additional_charges?.find(c => c.description.toLowerCase().includes('tax'))?.amount ?
                      ((parsedData.additional_charges.find(c => c.description.toLowerCase().includes('tax'))!.amount / parsedData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)) * 100) : 0,
            notes: parsedData.notes || ''
          }

          // Navigate to the appropriate form with pre-filled data
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full" showCloseButton={false}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-600 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Quotla AI Assistant</h2>
              <p className="text-sm text-gray-600">Describe your quote or invoice, and I'll create it for you</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Chat Messages Area */}
        <div
          ref={chatContainerRef}
          className="bg-gray-50 rounded-xl border-2 border-gray-200 p-6 overflow-y-auto"
          style={{ height: 'clamp(400px, 60vh, 700px)' }}
        >
          {chatMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <p className="text-sm text-gray-600 max-w-lg mb-8">
                Click a suggestion above or type in your problem
              </p>
              <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => setChatInput('I need a quote for web development services for ABC Company. 40 hours at $100/hour.')}
                  className="text-left px-6 py-4 bg-white hover:bg-gray-50 rounded-lg text-sm text-gray-700 transition-all shadow-sm hover:shadow-md border border-gray-200"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">📝</span>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Create a quote</h4>
                      <p className="text-xs text-gray-600">I need a quote for web development services...</p>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => setChatInput('Create an invoice for consulting work. 3 days at $500 per day for XYZ Corp.')}
                  className="text-left px-6 py-4 bg-white hover:bg-gray-50 rounded-lg text-sm text-gray-700 transition-all shadow-sm hover:shadow-md border border-gray-200"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🧾</span>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Generate invoice</h4>
                      <p className="text-xs text-gray-600">Create an invoice for consulting work...</p>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => setChatInput('How should I price my freelance design services?')}
                  className="text-left px-6 py-4 bg-white hover:bg-gray-50 rounded-lg text-sm text-gray-700 transition-all shadow-sm hover:shadow-md border border-gray-200"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">💰</span>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Pricing advice</h4>
                      <p className="text-xs text-gray-600">How should I price my services?</p>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => setChatInput('What are the best practices for following up on quotes?')}
                  className="text-left px-6 py-4 bg-white hover:bg-gray-50 rounded-lg text-sm text-gray-700 transition-all shadow-sm hover:shadow-md border border-gray-200"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">💡</span>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Business tips</h4>
                      <p className="text-xs text-gray-600">Best practices for following up on quotes?</p>
                    </div>
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
                        : 'bg-white text-gray-900 shadow-sm border border-gray-200'
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
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
                  <div className="bg-white rounded-2xl px-5 py-3 shadow-sm border border-gray-200">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* File Upload Preview */}
        {selectedFile && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              <span className="text-sm font-medium text-gray-700">{selectedFile.name}</span>
              <span className="text-xs text-gray-500">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
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
          <div className="flex gap-3">
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
              className="p-3 rounded-lg border-2 border-gray-300 hover:border-primary-400 hover:bg-primary-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed self-end"
              title="Upload file (max 2MB)"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>
            <button
              onClick={() => setIsRecording(true)}
              disabled={chatLoading}
              className="p-3 rounded-lg border-2 border-gray-300 hover:border-primary-400 hover:bg-primary-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed self-end"
              title="Record voice message"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
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
              className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all disabled:opacity-50 disabled:bg-gray-50 resize-none"
              disabled={chatLoading}
              rows={2}
            />
            <button
              onClick={handleChatSend}
              disabled={(!chatInput.trim() && !selectedFile) || chatLoading}
              className="px-6 py-3 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none self-end"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        )}
        <p className="text-xs text-gray-500 text-center">
          Keeps up to 25 messages in context • Max file size: 2MB
        </p>
      </div>
    </Modal>
  )
}
