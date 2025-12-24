/**
 * ChatInterface Component
 *
 * Complete chat interface combining messages display and input.
 * Consolidates 3 duplicate chat UI implementations:
 * - app/page.tsx (lines 336-410) - ~75 lines
 * - components/CreateModal.tsx (lines 378-599) - ~220 lines
 * - components/QuotlaChat.tsx (lines 385-485) - ~100 lines
 *
 * Total LOC savings: ~400 lines
 *
 * Usage:
 * <ChatInterface
 *   variant="hero"
 *   enableAuth={true}
 *   trackPrompts={true}
 *   apiEndpoint="/api/ai/generate"
 * />
 */

'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { ChatMessageBubble, ChatMessage } from '@/components/ui/ChatMessageBubble'
import { ChatInput } from '@/components/ui/ChatInput'
import { EmptyStates } from '@/components/ui/EmptyState'
import LoadingSpinner from '@/components/LoadingSpinner'
import useChatHistory from '@/hooks/useChatHistory'
import {
  ROUTES,
  API_ROUTES,
  LIMITS,
  STORAGE_KEYS,
  AUTH_MESSAGES,
  ERROR_MESSAGES,
  PLACEHOLDER_TEXT,
  COLORS,
} from '@/lib/constants'

export interface ChatInterfaceProps {
  variant?: 'hero' | 'modal' | 'sidebar'
  enableAuth?: boolean
  trackPrompts?: boolean
  apiEndpoint?: string
  placeholder?: string
  showFileUpload?: boolean
  showVoiceRecord?: boolean
  maxHeight?: string
  className?: string
  onQuoteGenerated?: (quote: any) => void
  onInvoiceGenerated?: (invoice: any) => void
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  variant = 'hero',
  enableAuth = true,
  trackPrompts = false,
  apiEndpoint = API_ROUTES.AI.GENERATE,
  placeholder = PLACEHOLDER_TEXT.CHAT_DEFAULT,
  showFileUpload = true,
  showVoiceRecord = true,
  maxHeight = '600px',
  className = '',
  onQuoteGenerated,
  onInvoiceGenerated,
}) => {
  const router = useRouter()
  const { user } = useAuth()
  const isAuthenticated = !!user

  // Chat state
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [promptCount, setPromptCount] = useState(0)

  // Chat history
  const { messages, addMessage, isLoaded } = useChatHistory({
    autoSave: !isAuthenticated, // Only auto-save for non-authenticated users
  })

  // Auto-scroll to bottom
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Handle sending a message
  const handleSend = async () => {
    if (!input.trim() || loading) return

    // Auth check for prompt limits
    if (enableAuth && trackPrompts && !isAuthenticated && promptCount >= LIMITS.FREE_PROMPTS) {
      // Add user message and limit warning
      addMessage({ role: 'user', content: input, timestamp: new Date() })
      addMessage({
        role: 'assistant',
        content: AUTH_MESSAGES.SIGN_IN_REDIRECT,
        timestamp: new Date(),
      })
      setInput('')

      // Set redirect flag
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.REDIRECT_AFTER_AUTH, 'true')
      }

      // Optionally redirect to login
      // router.push(ROUTES.LOGIN)
      return
    }

    const userMessage = input
    setInput('')
    setSelectedFile(null)

    // Add user message
    const newUserMessage: ChatMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    }
    addMessage(newUserMessage)

    // Increment prompt count
    if (trackPrompts) {
      setPromptCount((prev) => prev + 1)
    }

    setLoading(true)

    try {
      // Get recent messages for context
      const recentMessages = messages.slice(-LIMITS.CHAT_MESSAGE_CONTEXT).map((m) => ({
        role: m.role,
        content: m.content,
      }))

      // Prepare request body
      const requestBody: any = {
        prompt: userMessage,
        history: recentMessages,
      }

      // Add file if selected
      if (selectedFile) {
        // TODO: Handle file upload - convert to base64 or upload separately
        // For now, just mention it in the prompt
        requestBody.prompt = `${userMessage}\n[Attached file: ${selectedFile.name}]`
      }

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        let errorMessage = ERROR_MESSAGES.GENERATION_FAILED
        try {
          const data = await response.json()
          errorMessage = data.error || errorMessage
        } catch (e) {
          errorMessage = `${ERROR_MESSAGES.SERVICE_UNAVAILABLE} (${response.status})`
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()

      // Add assistant response
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.description || data.message || data.response,
        timestamp: new Date(),
      }
      addMessage(assistantMessage)

      // Handle special response types
      if (data.type === 'quote' && onQuoteGenerated) {
        onQuoteGenerated(data)
      } else if (data.type === 'invoice' && onInvoiceGenerated) {
        onInvoiceGenerated(data)
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorText = error instanceof Error ? error.message : ERROR_MESSAGES.GENERIC
      addMessage({
        role: 'assistant',
        content: errorText,
        timestamp: new Date(),
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle file selection
  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
  }

  // Handle voice recording
  const handleVoiceRecord = () => {
    // TODO: Implement voice recording
    console.log('Voice recording not yet implemented')
  }

  // Variant-specific styles
  const containerStyles = {
    hero: 'w-full max-w-4xl mx-auto',
    modal: 'w-full h-full',
    sidebar: 'w-full h-full',
  }

  const messagesContainerStyles = {
    hero: 'h-[400px]',
    modal: `max-h-[${maxHeight}]`,
    sidebar: 'flex-1',
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner variant="inline" size="lg" />
      </div>
    )
  }

  return (
    <div className={`flex flex-col ${containerStyles[variant]} ${className}`}>
      {/* Messages area */}
      <div
        className={`
          ${messagesContainerStyles[variant]}
          overflow-y-auto
          space-y-4 p-4
          bg-${COLORS.BG.PRIMARY}
          rounded-t-lg
        `.trim().replace(/\s+/g, ' ')}
      >
        {messages.length === 0 ? (
          <EmptyStates.NoMessages />
        ) : (
          <>
            {messages.map((message, index) => (
              <ChatMessageBubble key={index} message={message} showTimestamp={false} />
            ))}
            {loading && (
              <ChatMessageBubble
                message={{
                  role: 'assistant',
                  content: '',
                  isLoading: true,
                }}
              />
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input area */}
      <div className={`p-4 bg-${COLORS.BG.SECONDARY} rounded-b-lg`}>
        <ChatInput
          value={input}
          onChange={setInput}
          onSend={handleSend}
          onFileSelect={handleFileSelect}
          onVoiceRecord={handleVoiceRecord}
          placeholder={placeholder}
          disabled={loading}
          loading={loading}
          selectedFile={selectedFile}
          showFileUpload={showFileUpload}
          showVoiceRecord={showVoiceRecord}
        />

        {/* Context info */}
        {variant !== 'hero' && (
          <p className={`text-xs text-${COLORS.TEXT.SECONDARY} text-center mt-2`}>
            Keeps up to {LIMITS.CHAT_HISTORY_LIMIT} messages in context • Max file size:{' '}
            {LIMITS.MAX_FILE_SIZE_LABEL}
          </p>
        )}
      </div>
    </div>
  )
}

export default ChatInterface
