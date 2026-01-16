'use client'

import { useState } from 'react'
import { CURRENCIES } from '@/lib/utils/currency'

interface CurrencyConverterProps {
  currentAmount: number
  currentCurrency: string
  onConvert?: (newAmount: number, newCurrency: string) => void
}

export default function CurrencyConverter({
  currentAmount,
  currentCurrency,
  onConvert,
}: CurrencyConverterProps) {
  const [showConverter, setShowConverter] = useState(false)
  const [targetCurrency, setTargetCurrency] = useState('')
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null)
  const [rate, setRate] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleConvert = async () => {
    if (!targetCurrency) {
      setError('Please select a target currency')
      return
    }

    if (targetCurrency === currentCurrency) {
      setError('Target currency must be different')
      return
    }

    setLoading(true)
    setError('')
    setConvertedAmount(null)
    setRate(null)

    try {
      const response = await fetch('/api/currency/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: currentAmount,
          from: currentCurrency,
          to: targetCurrency,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Conversion failed')
      }

      setConvertedAmount(data.convertedAmount)
      setRate(data.rate)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to convert')
    } finally {
      setLoading(false)
    }
  }

  const applyConversion = () => {
    if (convertedAmount !== null && targetCurrency && onConvert) {
      onConvert(convertedAmount, targetCurrency)
      setShowConverter(false)
      setConvertedAmount(null)
      setTargetCurrency('')
    }
  }

  const currencySymbol = CURRENCIES.find((c) => c.code === currentCurrency)?.symbol || ''
  const targetSymbol = CURRENCIES.find((c) => c.code === targetCurrency)?.symbol || ''

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowConverter(!showConverter)}
        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
      >
        Convert Currency
      </button>

      {showConverter && (
        <div className="absolute top-8 right-0 z-10 bg-white border rounded-lg shadow-lg p-4 w-80">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold">Currency Converter</h4>
            <button
              type="button"
              onClick={() => setShowConverter(false)}
              className="text-primary-400 hover:text-primary-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-primary-200">Current Amount</label>
              <div className="text-lg font-bold">
                {currencySymbol}
                {currentAmount.toFixed(2)} {currentCurrency}
              </div>
            </div>

            <div>
              <label className="label">Convert to</label>
              <select
                className="input"
                value={targetCurrency}
                onChange={(e) => {
                  setTargetCurrency(e.target.value)
                  setConvertedAmount(null)
                  setRate(null)
                }}
              >
                <option value="">Select currency</option>
                {CURRENCIES.filter((c) => c.code !== currentCurrency).map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.code} - {currency.name}
                  </option>
                ))}
              </select>
            </div>

            {error && <div className="text-red-600 text-sm">{error}</div>}

            <button
              type="button"
              onClick={handleConvert}
              disabled={loading || !targetCurrency}
              className="btn btn-secondary w-full text-sm"
            >
              {loading ? 'Converting...' : 'Calculate'}
            </button>

            {convertedAmount !== null && rate !== null && (
              <div className="bg-green-50 border border-green-200 rounded p-3">
                <div className="text-sm text-green-800 mb-1">
                  Rate: 1 {currentCurrency} = {rate.toFixed(4)} {targetCurrency}
                </div>
                <div className="text-lg font-bold text-green-900">
                  {targetSymbol}
                  {convertedAmount.toFixed(2)} {targetCurrency}
                </div>
                {onConvert && (
                  <button
                    type="button"
                    onClick={applyConversion}
                    className="btn btn-primary w-full mt-2 text-sm"
                  >
                    Apply This Currency
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
