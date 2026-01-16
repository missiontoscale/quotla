// Currency utilities for Quotla
// Handles currency formatting and selection (no conversion - use API for that)

export interface Currency {
  code: string
  name: string
  symbol: string
  flag: string
  decimals: number
  locale: string
}

// Supported currencies with their details
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

// Default currency for new visitors (before locale detection)
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
export function formatCurrency(amount: number, currencyCode: string): string {
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
  } catch {
    // Fallback if Intl fails
    return `${currency.symbol}${amount.toFixed(currency.decimals)}`
  }
}

// Format amount with custom symbol (for display flexibility)
export function formatAmount(amount: number, currencyCode: string): string {
  const currency = getCurrency(currencyCode)
  const decimals = currency?.decimals || 2

  return amount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

// Get user's preferred currency from localStorage (for visitors)
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
    // Trigger a custom event to notify components of currency change
    window.dispatchEvent(new CustomEvent('currencyChanged', { detail: { currency: currencyCode } }))
  } catch (error) {
    console.warn('Failed to save currency preference:', error)
  }
}

// Detect user's currency based on their locale/timezone
export function detectUserCurrency(): string {
  if (typeof window === 'undefined') return DEFAULT_CURRENCY

  try {
    // Check if we already have a stored preference
    const storedCurrency = getUserCurrency()
    if (storedCurrency && storedCurrency !== DEFAULT_CURRENCY) {
      return storedCurrency
    }

    // Try to detect from browser locale
    const locale = navigator.language || 'en-US'

    // Map common locales to currencies
    const localeMap: Record<string, string> = {
      'en-US': 'USD',
      'en-GB': 'GBP',
      'en-NG': 'NGN',
      'en-CA': 'CAD',
      'en-AU': 'AUD',
      'en-NZ': 'NZD',
      'en-IN': 'INR',
      'en-ZA': 'ZAR',
      'en-KE': 'KES',
      'en-GH': 'GHS',
      'de-DE': 'EUR',
      'de-CH': 'CHF',
      'fr-FR': 'EUR',
      'es-ES': 'EUR',
      'it-IT': 'EUR',
      'es-MX': 'MXN',
      'pt-BR': 'BRL',
      'ja-JP': 'JPY',
      'zh-CN': 'CNY',
      'sv-SE': 'SEK',
      'nb-NO': 'NOK',
      'da-DK': 'DKK',
      'en-SG': 'SGD',
    }

    const detectedCurrency = localeMap[locale] || DEFAULT_CURRENCY

    // Only auto-set if we found a match
    if (detectedCurrency !== DEFAULT_CURRENCY) {
      setUserCurrency(detectedCurrency)
    }

    return detectedCurrency
  } catch (error) {
    console.warn('Failed to detect user currency:', error)
    return DEFAULT_CURRENCY
  }
}

// Alias for formatCurrency (for backward compatibility)
export const formatPrice = formatCurrency
