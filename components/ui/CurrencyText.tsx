'use client'

import { useState, useEffect } from 'react'
import { useUserCurrency } from '@/hooks/useUserCurrency'
import { formatCurrency, detectUserCurrency } from '@/lib/utils/currency'

interface CurrencyTextProps {
  amount: number
  sourceCurrency: string
  className?: string
}

/**
 * Display currency amount converted to user's preferred currency.
 * - sourceCurrency: the currency the amount is stored in
 * - Converts to user's default currency (or detected locale currency for visitors)
 */
export function CurrencyText({ amount, sourceCurrency, className }: CurrencyTextProps) {
  const { currency: userCurrency, isAuthenticated } = useUserCurrency()
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null)

  const targetCurrency = isAuthenticated ? userCurrency : detectUserCurrency()
  const needsConversion = sourceCurrency !== targetCurrency

  useEffect(() => {
    if (!needsConversion) {
      setConvertedAmount(amount)
      return
    }

    let cancelled = false

    fetch('/api/currency/convert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, from: sourceCurrency, to: targetCurrency }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data.convertedAmount != null) {
          setConvertedAmount(data.convertedAmount)
        }
      })
      .catch(() => {
        if (!cancelled) setConvertedAmount(amount)
      })

    return () => {
      cancelled = true
    }
  }, [amount, sourceCurrency, targetCurrency, needsConversion])

  if (convertedAmount === null) {
    return <span className={className}>{formatCurrency(amount, sourceCurrency)}</span>
  }

  return (
    <span className={className}>
      {formatCurrency(convertedAmount, targetCurrency)}
    </span>
  )
}
