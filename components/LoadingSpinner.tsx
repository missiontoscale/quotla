'use client'

/**
 * LoadingSpinner Component
 *
 * Consolidated loading spinner component with multiple variants.
 * Consolidates 14+ duplicate loading spinner implementations across the codebase.
 *
 * Variants:
 * - page: Full-screen spinner with logo and spiral (default export)
 * - inline: Small spinner for buttons and inline content
 * - dots: Bouncing dots for chat bubbles and streaming content
 *
 * Usage:
 * <LoadingSpinner /> // Full page
 * <LoadingSpinner variant="inline" size="md" />
 * <LoadingSpinner variant="dots" size="sm" />
 */

import { COLORS, LOADING_TEXT } from '@/lib/constants'

interface LoadingSpinnerProps {
  variant?: 'page' | 'inline' | 'dots'
  size?: 'sm' | 'md' | 'lg'
  text?: string
}

export default function LoadingSpinner({ variant = 'page', size = 'md', text }: LoadingSpinnerProps = {}) {
  // Full-page loading spinner with logo
  if (variant === 'page') {
    return (
      <div className={`flex flex-col items-center justify-center min-h-screen bg-${COLORS.BG.PRIMARY}`}>
        <div className="relative flex items-center justify-center">
          {/* Quotla Logo - Static in the center */}
          <div className="relative z-10">
            <img
              src="/images/logos/icons/Quotla icon off white.svg"
              alt="Quotla"
              className="h-20 w-auto"
            />
          </div>

          {/* Revolving Spiral Pattern - 19x larger with 15% more opacity reduction */}
          <div className="absolute inset-0 flex items-center justify-center animate-spin" style={{ animationDuration: '3s' }}>
            <div
              className="bg-contain bg-center bg-no-repeat animate-pulse-grow"
              style={{
                width: '4864px',
                height: '4864px',
                opacity: 0.025,
                backgroundImage: "url('/images/patterns/spiral/Quotla%20Spiral%20orange.svg')",
                animation: 'spin 3s linear infinite, pulseGrow 1s ease-in-out infinite'
              }}
            ></div>
          </div>
        </div>
        <p className={`mt-8 text-${COLORS.TEXT.SECONDARY} text-sm font-medium`}>
          {text || LOADING_TEXT.DEFAULT}
        </p>
        <style jsx>{`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
          @keyframes pulseGrow {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.15);
            }
          }
        `}</style>
      </div>
    )
  }

  // Bouncing dots loader for chat interfaces
  if (variant === 'dots') {
    const dotSizes = {
      sm: 'w-1.5 h-1.5',
      md: 'w-2 h-2',
      lg: 'w-2.5 h-2.5'
    }

    return (
      <div className="flex items-center space-x-1">
        <div
          className={`${dotSizes[size]} bg-${COLORS.TEXT.SECONDARY} rounded-full animate-bounce`}
          style={{ animationDelay: '0s' }}
        />
        <div
          className={`${dotSizes[size]} bg-${COLORS.TEXT.SECONDARY} rounded-full animate-bounce`}
          style={{ animationDelay: '0.2s' }}
        />
        <div
          className={`${dotSizes[size]} bg-${COLORS.TEXT.SECONDARY} rounded-full animate-bounce`}
          style={{ animationDelay: '0.4s' }}
        />
      </div>
    )
  }

  // Inline spinner (default to inline if not page or dots)
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  }

  const dotSizes = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3'
  }

  return (
    <div className="flex items-center justify-center">
      <div className="relative">
        <div
          className={`${sizeClasses[size]} rounded-full animate-spin`}
          style={{
            borderColor: 'var(--color-primary-lightest)',
            borderTopColor: 'var(--color-primary)'
          }}
        ></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div
            className={`${dotSizes[size]} rounded-full animate-pulse`}
            style={{ backgroundColor: 'var(--color-primary)' }}
          ></div>
        </div>
      </div>
    </div>
  )
}

// Named export for backward compatibility
export const InlineLoadingSpinner = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => (
  <LoadingSpinner variant="inline" size={size} />
)
