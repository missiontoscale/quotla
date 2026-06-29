/**
 * Hooks Index
 *
 * Central export point for custom hooks.
 *
 * Usage:
 * import { useChatHistory, useTypingAnimation, useAuthRequired } from '@/hooks'
 */

export { useTypingAnimation, default as useTypingAnimationDefault } from './useTypingAnimation'
export { useAuthRequired, default as useAuthRequiredDefault } from './useAuthRequired'
export { useGreeting, default as useGreetingDefault } from './useGreeting'

// Type exports
export type { UseTypingAnimationOptions } from './useTypingAnimation'
export type { RequireAuthOptions } from './useAuthRequired'
