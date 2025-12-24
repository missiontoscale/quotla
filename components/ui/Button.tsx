/**
 * Button Component
 *
 * Standardized button component with variants and sizes.
 * Replaces inconsistent button styling across 30+ files.
 *
 * Usage:
 * <Button variant="primary" size="lg">Get Started</Button>
 * <Button variant="secondary" size="md">Learn More</Button>
 * <Button variant="ghost" size="sm">Cancel</Button>
 * <Button variant="icon" size="sm"><Icon /></Button>
 */

import React from 'react'
import { COLORS, SPACING, TRANSITIONS, BORDERS } from '@/lib/constants'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'icon' | 'danger'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  fullWidth?: boolean
  children?: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      disabled,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    // Base styles that apply to all buttons
    const baseStyles = `
      inline-flex items-center justify-center
      font-medium
      ${TRANSITIONS.COLORS}
      focus:outline-none focus:ring-2 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
      ${fullWidth ? 'w-full' : ''}
    `.trim().replace(/\s+/g, ' ')

    // Variant styles
    const variantStyles = {
      primary: `
        bg-${COLORS.BG.ACCENT_ORANGE} text-white
        hover:bg-secondary-600 hover:scale-105
        focus:ring-${COLORS.BRAND.ORANGE}
        ${BORDERS.ROUNDED_LG}
      `.trim().replace(/\s+/g, ' '),

      secondary: `
        bg-transparent text-white
        ${BORDERS.THICK} border-white
        hover:bg-white/10
        focus:ring-white
        ${BORDERS.ROUNDED_LG}
      `.trim().replace(/\s+/g, ' '),

      ghost: `
        bg-transparent text-${COLORS.TEXT.PRIMARY}
        hover:bg-${COLORS.BG.TERTIARY}
        focus:ring-${COLORS.PRIMARY[600]}
        ${BORDERS.ROUNDED_MD}
      `.trim().replace(/\s+/g, ' '),

      icon: `
        bg-transparent text-${COLORS.TEXT.PRIMARY}
        hover:bg-${COLORS.BG.TERTIARY}
        focus:ring-${COLORS.PRIMARY[600]}
        ${BORDERS.ROUNDED_MD}
        p-2
      `.trim().replace(/\s+/g, ' '),

      danger: `
        bg-red-600 text-white
        hover:bg-red-700
        focus:ring-red-500
        ${BORDERS.ROUNDED_LG}
      `.trim().replace(/\s+/g, ' '),
    }

    // Size styles
    const sizeStyles = {
      xs: 'px-2 py-1 text-xs',
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
      xl: 'px-10 py-5 text-xl',
    }

    // Icon buttons don't need padding from sizeStyles
    const sizeClass = variant === 'icon' ? '' : sizeStyles[size]

    const combinedClassName = `
      ${baseStyles}
      ${variantStyles[variant]}
      ${sizeClass}
      ${className}
    `.trim().replace(/\s+/g, ' ')

    return (
      <button
        ref={ref}
        className={combinedClassName}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {children}
          </>
        ) : (
          children
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
