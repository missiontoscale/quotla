interface ExchangeRateResponse {
  result: string
  base_code: string
  rates: Record<string, number>
  time_last_update_utc?: string
}

interface ConversionResult {
  from: string
  to: string
  amount: number
  convertedAmount: number
  rate: number
  timestamp: string
}

// Cache exchange rates for 1 hour to reduce API calls
const rateCache: {
  data: Record<string, number> | null
  base: string
  timestamp: number
} = {
  data: null,
  base: '',
  timestamp: 0,
}

const CACHE_DURATION = 60 * 60 * 1000 // 1 hour in milliseconds

export async function getExchangeRates(baseCurrency: string = 'USD'): Promise<Record<string, number>> {
  const now = Date.now()

  // Return cached rates if still valid
  if (rateCache.data && rateCache.base === baseCurrency && now - rateCache.timestamp < CACHE_DURATION) {
    return rateCache.data
  }

  try {
    // Using exchangerate-api.com free tier (1500 requests/month)
    // Alternative: Open Exchange Rates, Fixer.io, or Currency Layer
    const response = await fetch(
      `https://open.er-api.com/v6/latest/${baseCurrency}`
    )

    if (!response.ok) {
      throw new Error(`Exchange rate API error: ${response.statusText}`)
    }

    const data: ExchangeRateResponse = await response.json()

    if (data.result !== 'success') {
      throw new Error('Failed to fetch exchange rates')
    }

    if (!data.rates) {
      console.error('API response missing rates:', data)
      throw new Error('Invalid response from exchange rate API')
    }

    // Cache the rates
    rateCache.data = data.rates
    rateCache.base = baseCurrency
    rateCache.timestamp = now

    return data.rates
  } catch (error) {
    console.error('Exchange rate fetch error:', error)

    // Return cached data even if expired, as fallback
    if (rateCache.data && rateCache.base === baseCurrency) {
      console.warn('Using expired cache due to API error')
      return rateCache.data
    }

    throw new Error('Unable to fetch exchange rates')
  }
}

export async function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<ConversionResult> {
  if (fromCurrency === toCurrency) {
    return {
      from: fromCurrency,
      to: toCurrency,
      amount,
      convertedAmount: amount,
      rate: 1,
      timestamp: new Date().toISOString(),
    }
  }

  const rates = await getExchangeRates(fromCurrency)

  if (!rates) {
    throw new Error('Unable to fetch exchange rates')
  }

  const rate = rates[toCurrency]

  if (!rate) {
    throw new Error(`Exchange rate not available for ${toCurrency}`)
  }

  const convertedAmount = Number((amount * rate).toFixed(2))

  return {
    from: fromCurrency,
    to: toCurrency,
    amount,
    convertedAmount,
    rate,
    timestamp: new Date().toISOString(),
  }
}

export function formatCurrency(amount: number, currencyCode: string): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    // Fallback for currencies not supported by Intl
    return `${amount.toFixed(2)} ${currencyCode}`
  }
}
