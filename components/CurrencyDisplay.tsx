'use client'

import { formatCurrency } from '@/lib/utils/currency'

interface CurrencyDisplayProps {
  amount: number
  currency: string
  className?: string
}

/**
 * Simple component to display formatted currency.
 * No conversion - just displays the amount in the specified currency.
 * For conversion, use the /api/currency/convert endpoint.
 */
export default function CurrencyDisplay({
  amount,
  currency,
  className = '',
}: CurrencyDisplayProps) {
  return (
    <span className={className}>
      {formatCurrency(amount, currency)}
    </span>
  )
}

/**
 * Simplified version for inline usage (alias)
 */
export function InlineCurrency({
  amount,
  currency,
  className = '',
}: {
  amount: number
  currency: string
  className?: string
}) {
  return <span className={className}>{formatCurrency(amount, currency)}</span>
}
