/**
 * Currency conversion utility using live exchange rates
 */

export interface Currency {
  code: string
  symbol: string
  rate: number
}

export interface CurrencyRates {
  [key: string]: number
}

// Currency symbols mapping
export const CURRENCY_SYMBOLS: { [key: string]: string } = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  NGN: '₦',
  GHS: '₵',
  ZAR: 'R',
  KES: 'KSh',
  INR: '₹',
  CAD: 'C$',
  AUD: 'A$',
  JPY: '¥',
  CNY: '¥',
  BRL: 'R$',
  MXN: 'MX$',
  CHF: 'CHF',
  SEK: 'kr',
  NZD: 'NZ$',
  SGD: 'S$',
  HKD: 'HK$',
  NOK: 'kr',
  DKK: 'kr',
  PLN: 'zł',
  TRY: '₺',
  RUB: '₽',
  AED: 'د.إ',
  SAR: 'ر.س',
  THB: '฿',
  MYR: 'RM',
  IDR: 'Rp',
  PHP: '₱',
  VND: '₫',
  EGP: 'E£',
  MAD: 'د.م.',
  TND: 'د.ت',
  CLP: 'CLP$',
  ARS: 'ARS$',
  COP: 'COL$',
  PEN: 'S/',
  UAH: '₴',
  RON: 'lei',
  CZK: 'Kč',
  HUF: 'Ft',
  ILS: '₪',
  QAR: 'ر.ق',
  KWD: 'د.ك',
  BHD: 'د.ب',
  OMR: 'ر.ع.',
  JOD: 'د.ا',
  LBP: 'ل.ل',
}

// Timezone to currency mapping
export const TIMEZONE_TO_CURRENCY: { [key: string]: string } = {
  'Europe/London': 'GBP',
  'Europe/Paris': 'EUR',
  'Europe/Berlin': 'EUR',
  'Europe/Madrid': 'EUR',
  'Europe/Rome': 'EUR',
  'Europe/Amsterdam': 'EUR',
  'Europe/Brussels': 'EUR',
  'Europe/Vienna': 'EUR',
  'Europe/Stockholm': 'SEK',
  'Europe/Copenhagen': 'DKK',
  'Europe/Oslo': 'NOK',
  'Europe/Warsaw': 'PLN',
  'Europe/Prague': 'CZK',
  'Europe/Budapest': 'HUF',
  'Europe/Bucharest': 'RON',
  'Europe/Zurich': 'CHF',
  'Europe/Istanbul': 'TRY',
  'Europe/Moscow': 'RUB',
  'Europe/Kiev': 'UAH',
  'Africa/Lagos': 'NGN',
  'Africa/Accra': 'GHS',
  'Africa/Johannesburg': 'ZAR',
  'Africa/Nairobi': 'KES',
  'Africa/Cairo': 'EGP',
  'Africa/Casablanca': 'MAD',
  'Africa/Tunis': 'TND',
  'Asia/Kolkata': 'INR',
  'Asia/Tokyo': 'JPY',
  'Asia/Shanghai': 'CNY',
  'Asia/Hong_Kong': 'HKD',
  'Asia/Singapore': 'SGD',
  'Asia/Bangkok': 'THB',
  'Asia/Kuala_Lumpur': 'MYR',
  'Asia/Jakarta': 'IDR',
  'Asia/Manila': 'PHP',
  'Asia/Ho_Chi_Minh': 'VND',
  'Asia/Dubai': 'AED',
  'Asia/Riyadh': 'SAR',
  'Asia/Tel_Aviv': 'ILS',
  'Asia/Doha': 'QAR',
  'Asia/Kuwait': 'KWD',
  'Asia/Bahrain': 'BHD',
  'Asia/Muscat': 'OMR',
  'Asia/Amman': 'JOD',
  'Asia/Beirut': 'LBP',
  'America/Toronto': 'CAD',
  'America/Vancouver': 'CAD',
  'America/New_York': 'USD',
  'America/Chicago': 'USD',
  'America/Denver': 'USD',
  'America/Los_Angeles': 'USD',
  'America/Mexico_City': 'MXN',
  'America/Sao_Paulo': 'BRL',
  'America/Santiago': 'CLP',
  'America/Buenos_Aires': 'ARS',
  'America/Bogota': 'COP',
  'America/Lima': 'PEN',
  'Australia/Sydney': 'AUD',
  'Australia/Melbourne': 'AUD',
  'Pacific/Auckland': 'NZD',
}

/**
 * Fetch live currency exchange rates from API
 * Using open.er-api.com (free, no API key required)
 * This uses the centralized currency service with caching
 */
export async function fetchLiveCurrencyRates(baseCurrency: string = 'USD'): Promise<CurrencyRates | null> {
  try {
    // Use the centralized currency API endpoint for better caching
    const response = await fetch(`/api/currency/convert?base=${baseCurrency}`)

    if (!response.ok) {
      throw new Error('Failed to fetch currency rates')
    }

    const data = await response.json()
    return data.rates as CurrencyRates
  } catch (error) {
    console.error('Error fetching live currency rates:', error)

    // Fallback to direct API call if the endpoint fails
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const response = await fetch(
        `https://open.er-api.com/v6/latest/${baseCurrency}`,
        { signal: controller.signal }
      )
      clearTimeout(timeoutId)

      if (response.ok) {
        const data = await response.json()
        return data.rates as CurrencyRates
      }
    } catch (fallbackError) {
      console.error('Fallback currency fetch also failed:', fallbackError)
    }

    return null
  }
}

/**
 * Detect user's currency based on location
 */
export async function detectUserCurrency(): Promise<Currency> {
  const defaultCurrency: Currency = {
    code: 'USD',
    symbol: '$',
    rate: 1,
  }

  try {
    // Get timezone
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    let detectedCurrencyCode = 'USD'

    // Try API-based detection first (more accurate)
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000)

      const response = await fetch('https://ipapi.co/json/', {
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      if (response.ok) {
        const data = await response.json()
        detectedCurrencyCode = data.currency || 'USD'
      }
    } catch (apiError) {
      // Fallback to timezone-based detection
      detectedCurrencyCode = TIMEZONE_TO_CURRENCY[timeZone] || 'USD'
    }

    // Fetch live rates
    const rates = await fetchLiveCurrencyRates('USD')

    if (rates && rates[detectedCurrencyCode]) {
      return {
        code: detectedCurrencyCode,
        symbol: CURRENCY_SYMBOLS[detectedCurrencyCode] || detectedCurrencyCode,
        rate: rates[detectedCurrencyCode],
      }
    }

    // If no live rate available, return USD
    return defaultCurrency
  } catch (error) {
    console.error('Error detecting user currency:', error)
    return defaultCurrency
  }
}

/**
 * Format price with currency
 */
export function formatPrice(priceUSD: number, currency: Currency): string {
  const convertedPrice = priceUSD * currency.rate

  // For whole numbers, don't show decimals
  // For fractional amounts, show 2 decimals
  const formattedAmount = convertedPrice % 1 === 0
    ? convertedPrice.toFixed(0)
    : convertedPrice.toFixed(2)

  return `${currency.symbol}${formattedAmount}`
}

/**
 * Convert amount between currencies
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: CurrencyRates
): number {
  if (fromCurrency === toCurrency) return amount

  // Convert to USD first, then to target currency
  const amountInUSD = fromCurrency === 'USD' ? amount : amount / rates[fromCurrency]
  const convertedAmount = toCurrency === 'USD' ? amountInUSD : amountInUSD * rates[toCurrency]

  return convertedAmount
}
