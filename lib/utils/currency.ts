// Currency utilities for Quotla
// Handles currency formatting, conversion, and selection

export interface Currency {
  code: string
  name: string
  symbol: string
  flag: string
  decimals: number
  locale: string
}

// Popular currencies with their details
export const CURRENCIES: Currency[] = [
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', flag: '🇳🇬', decimals: 2, locale: 'en-NG' },
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸', decimals: 2, locale: 'en-US' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺', decimals: 2, locale: 'de-DE' },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧', decimals: 2, locale: 'en-GB' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', flag: '🇨🇦', decimals: 2, locale: 'en-CA' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺', decimals: 2, locale: 'en-AU' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵', decimals: 0, locale: 'ja-JP' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳', decimals: 2, locale: 'zh-CN' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳', decimals: 2, locale: 'en-IN' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', flag: '🇿🇦', decimals: 2, locale: 'en-ZA' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr', flag: '🇨🇭', decimals: 2, locale: 'de-CH' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬', decimals: 2, locale: 'en-SG' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', flag: '🇳🇿', decimals: 2, locale: 'en-NZ' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', flag: '🇸🇪', decimals: 2, locale: 'sv-SE' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', flag: '🇳🇴', decimals: 2, locale: 'nb-NO' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr', flag: '🇩🇰', decimals: 2, locale: 'da-DK' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$', flag: '🇲🇽', decimals: 2, locale: 'es-MX' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷', decimals: 2, locale: 'pt-BR' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', flag: '🇰🇪', decimals: 2, locale: 'en-KE' },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: 'GH₵', flag: '🇬🇭', decimals: 2, locale: 'en-GH' },
]

// Default currency
export const DEFAULT_CURRENCY = 'NGN'

// Get currency by code
export function getCurrency(code: string): Currency | undefined {
  return CURRENCIES.find(c => c.code === code)
}

// Get currency symbol
export function getCurrencySymbol(code: string): string {
  const currency = getCurrency(code)
  return currency?.symbol || code
}

// Format amount with currency
export function formatCurrency(amount: number, currencyCode: string = DEFAULT_CURRENCY): string {
  const currency = getCurrency(currencyCode)

  if (!currency) {
    // Fallback to basic formatting
    return `${currencyCode} ${amount.toFixed(2)}`
  }

  try {
    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: currency.decimals,
      maximumFractionDigits: currency.decimals,
    }).format(amount)
  } catch (error) {
    // Fallback if Intl fails
    return `${currency.symbol}${amount.toFixed(currency.decimals)}`
  }
}

// Format amount with custom symbol (for display flexibility)
export function formatAmount(amount: number, currencyCode: string = DEFAULT_CURRENCY): string {
  const currency = getCurrency(currencyCode)
  const decimals = currency?.decimals || 2

  return amount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

// Exchange rate type
export interface ExchangeRate {
  from: string
  to: string
  rate: number
  timestamp: number
}

// Exchange rates cache (in-memory for now, could be localStorage)
const exchangeRatesCache: Map<string, ExchangeRate> = new Map()
const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes in milliseconds

// Convert currency (with caching)
export async function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  if (fromCurrency === toCurrency) {
    return amount
  }

  const cacheKey = `${fromCurrency}_${toCurrency}`
  const cached = exchangeRatesCache.get(cacheKey)

  // Check if cache is still valid
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return amount * cached.rate
  }

  // Fetch new rate
  try {
    const rate = await fetchExchangeRate(fromCurrency, toCurrency)

    // Cache the rate
    exchangeRatesCache.set(cacheKey, {
      from: fromCurrency,
      to: toCurrency,
      rate,
      timestamp: Date.now(),
    })

    return amount * rate
  } catch (error) {
    console.error('Currency conversion error:', error)

    // If we have a cached rate (even if expired), use it
    if (cached) {
      console.warn('Using expired exchange rate')
      return amount * cached.rate
    }

    // No cached rate available, return original amount
    return amount
  }
}

// Fetch exchange rate from API
async function fetchExchangeRate(from: string, to: string): Promise<number> {
  // Using exchangerate-api.com free tier (1,500 requests/month)
  // You can swap this for another provider or use environment variables for API key
  const apiUrl = `https://api.exchangerate-api.com/v4/latest/${from}`

  const response = await fetch(apiUrl)

  if (!response.ok) {
    throw new Error(`Exchange rate API error: ${response.status}`)
  }

  const data = await response.json()

  if (!data.rates || !data.rates[to]) {
    throw new Error(`Exchange rate not found for ${from} to ${to}`)
  }

  return data.rates[to]
}

// Get cached exchange rate (for display purposes)
export function getCachedExchangeRate(from: string, to: string): ExchangeRate | null {
  const cacheKey = `${from}_${to}`
  const cached = exchangeRatesCache.get(cacheKey)

  if (!cached) return null

  // Check if cache is stale (> 24 hours)
  const isStale = Date.now() - cached.timestamp > 24 * 60 * 60 * 1000

  return isStale ? null : cached
}

// Get time since last update
export function getTimeSinceUpdate(timestamp: number): string {
  const diff = Date.now() - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return 'just now'
}

// Preload exchange rates for common conversions
export async function preloadExchangeRates(baseCurrency: string = DEFAULT_CURRENCY) {
  const commonCurrencies = ['USD', 'EUR', 'GBP', 'NGN']

  const promises = commonCurrencies
    .filter(curr => curr !== baseCurrency)
    .map(curr => fetchExchangeRate(baseCurrency, curr).then(rate => {
      exchangeRatesCache.set(`${baseCurrency}_${curr}`, {
        from: baseCurrency,
        to: curr,
        rate,
        timestamp: Date.now(),
      })
    }).catch(err => {
      console.warn(`Failed to preload rate for ${baseCurrency} to ${curr}:`, err)
    }))

  await Promise.allSettled(promises)
}

// Clear exchange rates cache
export function clearExchangeRatesCache() {
  exchangeRatesCache.clear()
}

// Get user's preferred currency from localStorage
export function getUserCurrency(): string {
  if (typeof window === 'undefined') return DEFAULT_CURRENCY

  try {
    return localStorage.getItem('preferredCurrency') || DEFAULT_CURRENCY
  } catch {
    return DEFAULT_CURRENCY
  }
}

// Set user's preferred currency in localStorage
export function setUserCurrency(currencyCode: string) {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem('preferredCurrency', currencyCode)
  } catch (error) {
    console.warn('Failed to save currency preference:', error)
  }
}
