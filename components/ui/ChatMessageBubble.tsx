/**
 * ChatMessageBubble Component
 *
 * Shared message bubble component for chat interfaces.
 * Consolidates duplicate chat message rendering from:
 * - app/page.tsx (lines 340-350)
 * - components/CreateModal.tsx (lines 430-470)
 * - components/QuotlaChat.tsx
 *
 * Usage:
 * <ChatMessageBubble role="user" content="Hello!" timestamp={new Date()} />
 * <ChatMessageBubble role="assistant" content="Hi there!" />
 */

import React from 'react'
import { COLORS, BORDERS, SPACING } from '@/lib/constants'
import LoadingSpinner from '@/components/LoadingSpinner'

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: Date
  isLoading?: boolean
}

interface ChatMessageBubbleProps {
  message: ChatMessage
  showTimestamp?: boolean
  className?: string
}

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({
  message,
  showTimestamp = false,
  className = '',
}) => {
  const { role, content, timestamp, isLoading } = message

  // Alignment based on role
  const alignmentClass = role === 'user' ? 'justify-end' : 'justify-start'

  // Bubble styling based on role with improved spacing and shadows
  const bubbleStyles = role === 'user'
    ? 'bg-gradient-to-br from-quotla-green to-quotla-orange text-white rounded-tr-md shadow-md hover:shadow-lg'
    : 'bg-white dark:bg-primary-700 text-gray-800 dark:text-primary-50 border border-gray-100 dark:border-primary-600 rounded-tl-md shadow-md hover:shadow-lg'

  return (
    <div className={`flex ${alignmentClass} animate-fadeIn ${className}`}>
      <div
        className={`
          max-w-[80%] rounded-2xl
          px-5 py-3.5
          ${bubbleStyles}
          transition-all duration-200
        `.trim().replace(/\s+/g, ' ')}
      >
        {/* Message content or loading state */}
        {isLoading ? (
          <div className="flex items-center gap-3">
            <div className="flex space-x-2">
              <div className="w-2.5 h-2.5 bg-quotla-green dark:bg-quotla-orange rounded-full animate-bounce"></div>
              <div className="w-2.5 h-2.5 bg-quotla-orange dark:bg-quotla-green rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
              <div className="w-2.5 h-2.5 bg-quotla-green dark:bg-quotla-orange rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
            </div>
            <span className="text-sm text-gray-600 dark:text-primary-300 font-medium">Thinking...</span>
          </div>
        ) : (
          <>
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{content}</p>

            {/* Timestamp (optional) */}
            {showTimestamp && timestamp && (
              <p className={`text-xs text-gray-500 dark:text-primary-400 mt-2 opacity-75`}>
                {new Date(timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default ChatMessageBubble
