'use client'

import { ButtonHTMLAttributes, ReactNode } from 'react'

interface SubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  loadingText?: string
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'danger'
  fullWidth?: boolean
}

export default function SubmitButton({
  loading = false,
  loadingText = 'Processing...',
  children,
  variant = 'primary',
  fullWidth = false,
  disabled,
  className = '',
  ...props
}: SubmitButtonProps) {
  const baseClasses = 'px-6 py-3 rounded-xl font-semibold transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2'

  const variantClasses = {
    primary: 'bg-quotla-orange text-white hover:bg-secondary-600 focus:ring-quotla-orange shadow-quotla-orange/20 hover:shadow-md',
    secondary: 'bg-quotla-dark text-quotla-light hover:bg-quotla-dark/90 focus:ring-quotla-dark shadow-quotla-dark/20 hover:shadow-md',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-red-600/20 hover:shadow-md'
  }

  const widthClass = fullWidth ? 'w-full' : ''

  return (
    <button
      type="submit"
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${widthClass} ${className}`.trim()}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {loadingText}
        </span>
      ) : children}
    </button>
  )
}
