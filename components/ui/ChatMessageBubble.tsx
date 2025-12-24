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

  // Bubble styling based on role
  const bubbleStyles = role === 'user'
    ? `bg-${COLORS.BG.PRIMARY} text-white`
    : `bg-${COLORS.BG.TERTIARY} text-${COLORS.TEXT.PRIMARY}`

  return (
    <div className={`flex ${alignmentClass} ${className}`}>
      <div
        className={`
          max-w-[85%] ${BORDERS.ROUNDED_XL}
          px-5 py-3
          ${bubbleStyles}
          ${SPACING.GAP_SM}
        `.trim().replace(/\s+/g, ' ')}
      >
        {/* Message content or loading state */}
        {isLoading ? (
          <LoadingSpinner variant="dots" size="md" />
        ) : (
          <>
            <p className="whitespace-pre-wrap break-words">{content}</p>

            {/* Timestamp (optional) */}
            {showTimestamp && timestamp && (
              <p className={`text-xs text-${COLORS.TEXT.SECONDARY} mt-1`}>
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
