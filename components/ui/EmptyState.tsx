/**
 * EmptyState Component
 *
 * Empty state component with icon, title, description, and optional CTA button.
 * Used across dashboard, blog, chat interfaces, and list pages.
 *
 * Consolidates empty state patterns from:
 * - app/dashboard/page.tsx (lines 242-255)
 * - app/blog/page.tsx (lines 239-246)
 * - components/CreateModal.tsx (lines 384-427)
 *
 * Usage:
 * <EmptyState
 *   icon={<DocumentIcon />}
 *   title="No quotes yet"
 *   description="Create your first quote to get started"
 *   action={{ label: "Create Quote", onClick: () => {} }}
 * />
 */

import React from 'react'
import { COLORS, TYPOGRAPHY, SPACING } from '@/lib/constants'
import { Button } from './Button'

export interface EmptyStateAction {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'ghost'
}

export interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: EmptyStateAction
  className?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div className={`text-center py-16 ${className}`}>
      {/* Icon */}
      {icon && (
        <div className={`flex items-center justify-center mb-4 text-${COLORS.TEXT.SECONDARY}`}>
          {icon}
        </div>
      )}

      {/* Title */}
      <h3 className={`${TYPOGRAPHY.HEADING_SM} text-${COLORS.TEXT.PRIMARY} mb-2`}>
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className={`${TYPOGRAPHY.BODY_SM} text-${COLORS.TEXT.SECONDARY} mb-6 max-w-md mx-auto`}>
          {description}
        </p>
      )}

      {/* Action button */}
      {action && (
        <Button
          variant={action.variant || 'primary'}
          size="md"
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}

// Preset empty states for common use cases
export const EmptyStates = {
  NoMessages: () => (
    <EmptyState
      icon={
        <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
      }
      title="No messages yet"
      description="Start a conversation to see your chat history here."
    />
  ),

  NoQuotes: () => (
    <EmptyState
      icon={
        <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      }
      title="No quotes yet"
      description="Create your first quote to get started with Quotla."
    />
  ),

  NoInvoices: () => (
    <EmptyState
      icon={
        <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"
          />
        </svg>
      }
      title="No invoices yet"
      description="Generate your first invoice to start getting paid."
    />
  ),

  NoResults: () => (
    <EmptyState
      icon={
        <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      }
      title="No results found"
      description="Try adjusting your search or filter to find what you're looking for."
    />
  ),

  NoBlogPosts: () => (
    <EmptyState
      icon={
        <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2"
          />
        </svg>
      }
      title="No blog posts found"
      description="Check back later for new content."
    />
  ),
}

export default EmptyState
