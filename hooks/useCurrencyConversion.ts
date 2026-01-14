'use client'

import { useState, useEffect } from 'react'
import { convertCurrency } from '@/lib/utils/currency'

interface ConversionResult {
  convertedAmount: number | null
  isConverting: boolean
  error: string | null
  isConverted: boolean
}

/**
 * Hook to convert currency amounts with caching and error handling
 * @param amount - The amount to convert
 * @param fromCurrency - Source currency code
 * @param toCurrency - Target currency code
 * @returns Conversion result with converted amount, loading state, and error
 */
export function useCurrencyConversion(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): ConversionResult {
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null)
  const [isConverting, setIsConverting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // If currencies are the same, no conversion needed
    if (fromCurrency === toCurrency) {
      setConvertedAmount(amount)
      setIsConverting(false)
      setError(null)
      return
    }

    // Don't convert invalid amounts
    if (amount < 0 || isNaN(amount)) {
      setConvertedAmount(null)
      setError('Invalid amount')
      return
    }

    const performConversion = async () => {
      setIsConverting(true)
      setError(null)

      try {
        const result = await convertCurrency(amount, fromCurrency, toCurrency)
        setConvertedAmount(result)
      } catch (err) {
        console.error('Currency conversion error:', err)
        setError(err instanceof Error ? err.message : 'Conversion failed')
        // Fallback to original amount if conversion fails
        setConvertedAmount(amount)
      } finally {
        setIsConverting(false)
      }
    }

    performConversion()
  }, [amount, fromCurrency, toCurrency])

  return {
    convertedAmount,
    isConverting,
    error,
    isConverted: fromCurrency !== toCurrency && convertedAmount !== null,
  }
}

/**
 * Hook to convert multiple amounts at once (batch conversion)
 * @param conversions - Array of conversion requests
 * @returns Map of conversion results by key
 */
export function useBatchCurrencyConversion<T extends { amount: number; from: string; to: string }>(
  conversions: Array<T & { key: string }>
): Record<string, number> {
  const [results, setResults] = useState<Record<string, number>>({})

  useEffect(() => {
    if (conversions.length === 0) return

    const performConversions = async () => {
      const newResults: Record<string, number> = {}

      await Promise.all(
        conversions.map(async (conv) => {
          try {
            if (conv.from === conv.to) {
              newResults[conv.key] = conv.amount
            } else {
              const converted = await convertCurrency(conv.amount, conv.from, conv.to)
              newResults[conv.key] = converted
            }
          } catch (error) {
            console.error(`Conversion failed for ${conv.key}:`, error)
            // Fallback to original amount
            newResults[conv.key] = conv.amount
          }
        })
      )

      setResults(newResults)
    }

    performConversions()
  }, [JSON.stringify(conversions)]) // eslint-disable-line react-hooks/exhaustive-deps

  return results
}
