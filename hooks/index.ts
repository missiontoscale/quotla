/**
 * Hooks Index
 *
 * Central export point for custom hooks.
 *
 * Usage:
 * import { useChatHistory, useTypingAnimation, useAuthRequired } from '@/hooks'
 */

export { useChatHistory, default as useChatHistoryDefault } from './useChatHistory'
export { useTypingAnimation, default as useTypingAnimationDefault } from './useTypingAnimation'
export { useAuthRequired, default as useAuthRequiredDefault } from './useAuthRequired'

// Type exports
export type { UseTypingAnimationOptions } from './useTypingAnimation'
export type { RequireAuthOptions } from './useAuthRequired'
