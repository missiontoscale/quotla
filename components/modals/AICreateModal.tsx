'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { parseAIResponse, shouldCreateDocument, ParsedDocumentData } from '@/lib/ai/response-parser'
import { extractInvoiceDataFromConversation } from '@/lib/ai/conversation-parser'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import VoiceRecorder from '@/components/VoiceRecorder'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { X } from 'lucide-react'

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

interface AICreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AICreateModal({ open, onOpenChange }: AICreateModalProps) {
  const router = useRouter()
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [chatMessages])

  // Reset when modal closes
  useEffect(() => {
    if (!open) {
      setChatMessages([])
      setChatInput('')
      setSelectedFile(null)
    }
  }, [open])

  const handleVoiceRecording = async (audioBlob: Blob) => {
    setChatLoading(true)
    try {
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

      const transcribedText = data.text
      setChatInput(transcribedText)

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

  const handleChatSendWithText = async (messageText: string, hasFile: boolean = false) => {
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

      let response
      let data

      // Handle file upload separately
      if (hasFile && selectedFile) {
        const formData = new FormData()
        formData.append('prompt', messageText)
        formData.append('history', JSON.stringify(recentMessages))
        formData.append('file', selectedFile)

        response = await fetch('/api/ai/generate', {
          method: 'POST',
          body: formData,
        })

        data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to process file')
        }

        // Handle the file upload response
        // Check if data was successfully extracted
        if (data.extractedData && Object.keys(data.extractedData).length > 0) {
          // Successfully extracted data from file
          const aiResponse = data.description || 'File processed successfully!'
          setChatMessages(prev => [...prev.slice(-24), {
            role: 'assistant',
            content: aiResponse,
            timestamp: new Date()
          }])
        } else {
          // No data extracted, but not an error - just a conversation response
          const aiResponse = data.description || 'I couldn\'t extract structured data from this file. Could you provide more details about what you need?'
          setChatMessages(prev => [...prev.slice(-24), {
            role: 'assistant',
            content: aiResponse,
            timestamp: new Date()
          }])
        }

        setChatLoading(false)
        setSelectedFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        return
      }

      // Regular text-only request
      response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userMessage,
          history: recentMessages
        }),
      })

      data = await response.json()

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
          const aiDataForForm = {
            client_name: parsedData.client.name,
            currency: parsedData.currency,
            items: parsedData.items,
            tax_rate: parsedData.additional_charges?.find(c => c.description.toLowerCase().includes('tax'))?.amount ?
                      ((parsedData.additional_charges.find(c => c.description.toLowerCase().includes('tax'))!.amount / parsedData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)) * 100) : 0,
            notes: parsedData.notes || ''
          }

          const total = parsedData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0) + (parsedData.additional_charges?.reduce((sum, c) => sum + c.amount, 0) || 0)

          const enhancedResponse = `✓ I've prepared the ${parsedData.type} for you!\n\nClient: ${parsedData.client.name}\nTotal: ${parsedData.currency} ${total.toFixed(2)}\n\nClick the button below to review and save it.`

          setChatMessages(prev => [...prev.slice(-24), {
            role: 'assistant',
            content: enhancedResponse,
            timestamp: new Date(),
            documentId: encodeURIComponent(JSON.stringify(aiDataForForm)),
            documentType: parsedData.type
          }])
        } 
        // else {
        //   setChatMessages(prev => [...prev.slice(-24), { role: 'assistant', content: `${aiResponse}\n\n⚠️ I couldn't parse the document data. Please provide more details or create manually.`, timestamp: new Date() }])
        // }
      } 
      else {
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
    handleChatSendWithText(chatInput, !!selectedFile)
  }

  const handleFileUploadSend = () => {
    if (!selectedFile) return
    const prompt = chatInput.trim() || 'Extract all data from this file'
    setChatInput(prompt)
    handleChatSendWithText(prompt, true)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-purple-500/30 overflow-hidden flex flex-col">
        <DialogHeader className="border-b border-slate-700 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-slate-50">AI Assistant</DialogTitle>
                <p className="text-sm text-slate-400">Create quotes and invoices with AI</p>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Chat Messages Area */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/50 rounded-lg"
        >
          {chatMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-200 mb-2">Start creating with AI</h3>
              <p className="text-sm text-slate-400 max-w-md">
                Tell me about your business, client, and what you're quoting. I'll generate a professional document for you.
              </p>
              <div className="mt-6 text-left w-full max-w-md space-y-3">
                <p className="text-xs font-semibold text-slate-500 uppercase">Try saying:</p>
                <button
                  onClick={() => setChatInput('I need a quote for web development services for ABC Company. 40 hours at $100/hour.')}
                  className="w-full text-left px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-300 transition-colors"
                >
                  "I need a quote for web development services..."
                </button>
                <button
                  onClick={() => setChatInput('Create an invoice for consulting work. 3 days at $500 per day for XYZ Corp.')}
                  className="w-full text-left px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-300 transition-colors"
                >
                  "Create an invoice for consulting work..."
                </button>
              </div>
            </div>
          ) : (
            <>
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] ${msg.role === 'user' ? '' : 'space-y-2'}`}>
                    <div className={`rounded-2xl px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-800 text-slate-100'
                    }`}>
                      <div className="text-sm leading-relaxed prose prose-sm max-w-none prose-headings:mt-2 prose-headings:mb-2 prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
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
                          onClick={() => {
                            onOpenChange(false)
                            router.push(`/${msg.documentType}s/new?ai_data=${msg.documentId}`)
                          }}
                          className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all font-medium shadow-md hover:shadow-lg"
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
                  <div className="bg-slate-800 rounded-2xl px-4 py-3">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* File Upload Preview */}
        {selectedFile && (
          <div className="mb-3 p-3 bg-slate-800 border border-purple-500/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                <span className="text-sm text-slate-300">{selectedFile.name}</span>
                <span className="text-xs text-slate-500">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
              </div>
              <button
                onClick={() => {
                  setSelectedFile(null)
                  if (fileInputRef.current) fileInputRef.current.value = ''
                }}
                className="text-red-400 hover:text-red-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <button
              onClick={handleFileUploadSend}
              disabled={chatLoading}
              className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {chatLoading ? 'Processing...' : 'Process File'}
            </button>
          </div>
        )}

        {/* Chat Input Area */}
        <div className="flex gap-2 pt-4 border-t border-slate-700">
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
            className="p-3 rounded-lg border border-slate-700 hover:border-purple-500 hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title="Upload file (max 2MB)"
          >
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            className="flex-1 px-4 py-3 rounded-lg border border-slate-700 bg-slate-900 text-slate-100 placeholder-slate-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all disabled:opacity-50 resize-none"
            disabled={chatLoading}
            rows={1}
            style={{
              height: 'auto',
              minHeight: '48px',
              maxHeight: '120px'
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement
              target.style.height = 'auto'
              target.style.height = Math.min(target.scrollHeight, 120) + 'px'
            }}
          />
          <button
            onClick={handleChatSend}
            disabled={!chatInput.trim() || chatLoading}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-slate-500 text-center pt-2">
          Keeps up to 25 messages in context • Max file size: 2MB • Voice recording available
        </p>
      </DialogContent>
    </Dialog>
  )
}
