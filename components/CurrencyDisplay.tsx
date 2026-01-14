'use client'

import { useCurrencyConversion } from '@/hooks/useCurrencyConversion'
import { formatCurrency } from '@/lib/utils/currency'

interface CurrencyDisplayProps {
  amount: number
  currency: string
  /** If provided, will convert from original currency to display currency */
  originalCurrency?: string
  /** Show conversion indicator */
  showConversionBadge?: boolean
  /** Show original price when converted */
  showOriginalPrice?: boolean
  /** Custom className for styling */
  className?: string
  /** Loading placeholder */
  loadingPlaceholder?: string
}

/**
 * Component to display currency with automatic conversion
 * Shows converted amount with optional original price indicator
 */
export default function CurrencyDisplay({
  amount,
  currency,
  originalCurrency,
  showConversionBadge = false,
  showOriginalPrice = false,
  className = '',
  loadingPlaceholder = '...',
}: CurrencyDisplayProps) {
  // Determine if conversion is needed
  const needsConversion = originalCurrency && originalCurrency !== currency

  const { convertedAmount, isConverting, isConverted } = useCurrencyConversion(
    amount,
    originalCurrency || currency,
    currency
  )

  if (isConverting) {
    return <span className={className}>{loadingPlaceholder}</span>
  }

  const displayAmount = needsConversion && convertedAmount !== null ? convertedAmount : amount
  const displayCurrency = currency

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <span>{formatCurrency(displayAmount, displayCurrency)}</span>

      {isConverted && showConversionBadge && (
        <span
          className="text-[10px] text-green-500 font-medium"
          title={`Converted from ${originalCurrency}`}
        >
          🔄
        </span>
      )}

      {isConverted && showOriginalPrice && (
        <span className="text-xs text-slate-500 line-through ml-1">
          {formatCurrency(amount, originalCurrency!)}
        </span>
      )}
    </span>
  )
}

/**
 * Simplified version for inline usage
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
