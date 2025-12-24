/**
 * useTypingAnimation Hook
 *
 * Custom hook for typing/deleting animation effect.
 * Consolidates duplicate typing animation logic from:
 * - app/page.tsx (lines 55-84) - Hero typing animation
 * - app/page.tsx (lines 87-112) - Placeholder typing animation
 * - app/dashboard/page.tsx (lines 37-55) - Dashboard typing animation
 *
 * Usage:
 * const { text, isDeleting } = useTypingAnimation({
 *   phrases: ['Create quotes', 'Track invoices', 'Get paid faster'],
 *   typingSpeed: 100,
 *   deletingSpeed: 50,
 *   pauseDuration: 2000,
 * })
 */

import { useState, useEffect } from 'react'
import { ANIMATION_DELAYS } from '@/lib/constants'

export interface UseTypingAnimationOptions {
  phrases: string[]
  typingSpeed?: number
  deletingSpeed?: number
  pauseDuration?: number
  loop?: boolean
  autoStart?: boolean
}

export function useTypingAnimation({
  phrases,
  typingSpeed = ANIMATION_DELAYS.TYPING_SPEED,
  deletingSpeed = ANIMATION_DELAYS.TYPING_SPEED_DELETE,
  pauseDuration = ANIMATION_DELAYS.PAUSE_BEFORE_DELETE,
  loop = true,
  autoStart = true,
}: UseTypingAnimationOptions) {
  const [text, setText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [isActive, setIsActive] = useState(autoStart)

  useEffect(() => {
    if (!isActive || phrases.length === 0) return

    // Start typing immediately on mount
    if (text === '' && !isDeleting && phraseIndex === 0) {
      setText(phrases[0].charAt(0))
      return
    }

    const currentPhrase = phrases[phraseIndex]
    const speed = isDeleting ? deletingSpeed : typingSpeed

    const timeout = setTimeout(() => {
      if (!isDeleting && text === currentPhrase) {
        // Finished typing, pause then start deleting
        setTimeout(() => setIsDeleting(true), pauseDuration)
      } else if (isDeleting && text === '') {
        // Finished deleting, move to next phrase
        setIsDeleting(false)
        const nextIndex = phraseIndex + 1

        if (loop) {
          // Loop back to beginning
          setPhraseIndex(nextIndex % phrases.length)
        } else if (nextIndex < phrases.length) {
          // Move to next phrase (no loop)
          setPhraseIndex(nextIndex)
        } else {
          // Stop at last phrase
          setIsActive(false)
        }
      } else if (isDeleting) {
        // Continue deleting
        setText(currentPhrase.substring(0, text.length - 1))
      } else {
        // Continue typing
        setText(currentPhrase.substring(0, text.length + 1))
      }
    }, speed)

    return () => clearTimeout(timeout)
  }, [
    text,
    isDeleting,
    phraseIndex,
    phrases,
    typingSpeed,
    deletingSpeed,
    pauseDuration,
    loop,
    isActive,
  ])

  // Control functions
  const start = () => setIsActive(true)
  const stop = () => setIsActive(false)
  const reset = () => {
    setText('')
    setIsDeleting(false)
    setPhraseIndex(0)
  }

  return {
    text,
    isDeleting,
    phraseIndex,
    currentPhrase: phrases[phraseIndex],
    isActive,
    start,
    stop,
    reset,
  }
}

export default useTypingAnimation
