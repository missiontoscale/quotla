'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { cn, dashboardColors as colors } from '@/hooks/use-dashboard-theme'

interface MobileSectionHeaderProps {
  title: string
  linkText?: string
  linkHref?: string
  className?: string
}

/**
 * MobileSectionHeader
 *
 * Reusable header component with title and optional "View X >" link.
 * Used in: Overview section, Activity section, Low Stock section
 *
 * @example
 * <MobileSectionHeader
 *   title="OVERVIEW"
 *   linkText="View Sales"
 *   linkHref="/business/sales"
 * />
 */
export function MobileSectionHeader({
  title,
  linkText,
  linkHref,
  className
}: MobileSectionHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between mb-5', className)}>
      <p className={cn('text-xs font-medium uppercase tracking-wider', colors.text.muted)}>
        {title}
      </p>
      {linkText && linkHref && (
        <Link
          href={linkHref}
          className="text-xs text-quotla-orange hover:text-secondary-400 flex items-center gap-1 transition-colors"
        >
          {linkText} <ChevronRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  )
}

export default MobileSectionHeader