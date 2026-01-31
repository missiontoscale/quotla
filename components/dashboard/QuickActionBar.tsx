'use client'

import Link from 'next/link'
import { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface QuickAction {
  icon: LucideIcon
  label: string
  mobileLabel: string
  href: string
}

interface QuickActionBarProps {
  actions: QuickAction[]
  className?: string
}

/**
 * QuickActionBar
 *
 * Reusable quick action buttons with responsive labels.
 * Shows abbreviated labels on mobile and full labels on desktop.
 *
 * @example
 * const quickActions: QuickAction[] = [
 *   { icon: FileText, label: 'New Invoice', mobileLabel: 'Invoice', href: '/business/sales' },
 *   { icon: Users, label: 'Add Customer', mobileLabel: 'Customer', href: '/business/sales' },
 * ]
 *
 * <QuickActionBar actions={quickActions} />
 */
export function QuickActionBar({ actions, className }: QuickActionBarProps) {
  return (
    <div className={className || 'grid grid-cols-4 gap-1.5 md:flex md:flex-wrap md:gap-2 md:justify-center'}>
      {actions.map((action) => (
        <Link key={action.href + action.label} href={action.href}>
          <Button variant="outline" size="sm" className="gap-1 md:gap-2 text-xs w-full">
            <action.icon className="w-3.5 h-3.5" />
            <span className="md:hidden">{action.mobileLabel}</span>
            <span className="hidden md:inline">{action.label}</span>
          </Button>
        </Link>
      ))}
    </div>
  )
}

export type { QuickAction }
export default QuickActionBar