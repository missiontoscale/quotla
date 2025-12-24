/**
 * useChatHistory Hook
 *
 * Custom hook for managing chat history in localStorage.
 * Consolidates duplicate localStorage logic from chat implementations.
 *
 * Usage:
 * const { messages, addMessage, clearHistory } = useChatHistory('quotla_chat_history')
 */

import { useState, useEffect } from 'react'
import { STORAGE_KEYS, LIMITS } from '@/lib/constants'
import { ChatMessage } from '@/components/ui/ChatMessageBubble'

interface UseChatHistoryOptions {
  storageKey?: string
  maxMessages?: number
  autoSave?: boolean
}

export function useChatHistory(options: UseChatHistoryOptions = {}) {
  const {
    storageKey = STORAGE_KEYS.CHAT_HISTORY,
    maxMessages = LIMITS.CHAT_HISTORY_LIMIT,
    autoSave = true,
  } = options

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load chat history from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(storageKey)
        if (stored) {
          const parsed = JSON.parse(stored)
          // Convert timestamp strings back to Date objects
          const messagesWithDates = parsed.map((msg: any) => ({
            ...msg,
            timestamp: msg.timestamp ? new Date(msg.timestamp) : undefined,
          }))
          setMessages(messagesWithDates)
        }
      } catch (error) {
        console.error('Failed to load chat history:', error)
      } finally {
        setIsLoaded(true)
      }
    }
  }, [storageKey])

  // Auto-save to localStorage when messages change
  useEffect(() => {
    if (autoSave && isLoaded && typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, JSON.stringify(messages))
      } catch (error) {
        console.error('Failed to save chat history:', error)
      }
    }
  }, [messages, autoSave, isLoaded, storageKey])

  // Add a new message
  const addMessage = (message: ChatMessage) => {
    setMessages((prev) => {
      const updated = [...prev, message]
      // Limit to max messages
      if (updated.length > maxMessages) {
        return updated.slice(-maxMessages)
      }
      return updated
    })
  }

  // Add multiple messages
  const addMessages = (newMessages: ChatMessage[]) => {
    setMessages((prev) => {
      const updated = [...prev, ...newMessages]
      // Limit to max messages
      if (updated.length > maxMessages) {
        return updated.slice(-maxMessages)
      }
      return updated
    })
  }

  // Update the last message
  const updateLastMessage = (updates: Partial<ChatMessage>) => {
    setMessages((prev) => {
      if (prev.length === 0) return prev
      const updated = [...prev]
      updated[updated.length - 1] = {
        ...updated[updated.length - 1],
        ...updates,
      }
      return updated
    })
  }

  // Clear all messages
  const clearHistory = () => {
    setMessages([])
    if (typeof window !== 'undefined') {
      localStorage.removeItem(storageKey)
    }
  }

  // Get recent messages (for context)
  const getRecentMessages = (count: number = LIMITS.CHAT_MESSAGE_CONTEXT) => {
    return messages.slice(-count)
  }

  return {
    messages,
    setMessages,
    addMessage,
    addMessages,
    updateLastMessage,
    clearHistory,
    getRecentMessages,
    isLoaded,
  }
}

export default useChatHistory
