// Geolocation utilities for currency detection based on user's location

export interface LocationInfo {
  country: string
  countryCode: string
  currency: string
  ip?: string
}

const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  // Existing
  US: 'USD',
  CA: 'CAD',
  GB: 'GBP',
  EU: 'EUR',
  DE: 'EUR',
  FR: 'EUR',
  IT: 'EUR',
  ES: 'EUR',
  NL: 'EUR',
  BE: 'EUR',
  AT: 'EUR',
  IE: 'EUR',
  PT: 'EUR',
  FI: 'EUR',
  GR: 'EUR',
  NG: 'NGN',
  KE: 'KES',
  GH: 'GHS',
  ZA: 'ZAR',
  AU: 'AUD',
  NZ: 'NZD',
  JP: 'JPY',
  CN: 'CNY',
  IN: 'INR',
  SG: 'SGD',
  CH: 'CHF',
  SE: 'SEK',
  NO: 'NOK',
  DK: 'DKK',
  MX: 'MXN',
  BR: 'BRL',
  TD: 'XAF',

  // Asia & Oceania
  HK: 'HKD', // Hong Kong
  KR: 'KRW', // South Korea
  TW: 'TWD', // Taiwan
  ID: 'IDR', // Indonesia
  MY: 'MYR', // Malaysia
  TH: 'THB', // Thailand
  PH: 'PHP', // Philippines
  VN: 'VND', // Vietnam
  PK: 'PKR', // Pakistan
  BD: 'BDT', // Bangladesh

  // Middle East & Central Asia
  AE: 'AED', // United Arab Emirates
  SA: 'SAR', // Saudi Arabia
  IL: 'ILS', // Israel
  TR: 'TRY', // Turkey
  QA: 'QAR', // Qatar
  KW: 'KWD', // Kuwait
  KZ: 'KZT', // Kazakhstan

  // Americas (Additional)
  AR: 'ARS', // Argentina
  CL: 'CLP', // Chile
  CO: 'COP', // Colombia
  PE: 'PEN', // Peru

  // Europe (Non-Euro / Eastern)
  PL: 'PLN', // Poland
  CZ: 'CZK', // Czech Republic
  HU: 'HUF', // Hungary
  RO: 'RON', // Romania
  IS: 'ISK', // Iceland

  // Africa (Additional)
  EG: 'EGP', // Egypt
  MA: 'MAD', // Morocco
  UG: 'UGX', // Uganda
  TZ: 'TZS', // Tanzania
  ET: 'ETB', // Ethiopia
  SN: 'XOF', // Senegal (West African CFA franc)
};

/**
 * Detect user's location and currency using IP geolocation
 * Uses multiple free services with fallback
 */
export async function detectUserLocation(): Promise<LocationInfo> {
  // Try ipapi.co first (free, no API key needed, 30k requests/month)
  try {
    const response = await fetch('https://ipapi.co/json/', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (response.ok) {
      const data = await response.json()

      if (data.country_code && !data.error) {
        const currency = COUNTRY_CURRENCY_MAP[data.country_code] || data.currency || 'USD'

        return {
          country: data.country_name || data.country_code,
          countryCode: data.country_code,
          currency,
          ip: data.ip,
        }
      }
    }
  } catch (error) {
    console.warn('ipapi.co failed, trying fallback:', error)
  }

  // Fallback to ip-api.com (free, no API key needed, 45 requests/minute)
  try {
    const response = await fetch('http://ip-api.com/json/?fields=status,country,countryCode,currency', {
      method: 'GET',
    })

    if (response.ok) {
      const data = await response.json()

      if (data.status === 'success' && data.countryCode) {
        const currency = COUNTRY_CURRENCY_MAP[data.countryCode] || data.currency || 'USD'

        return {
          country: data.country,
          countryCode: data.countryCode,
          currency,
        }
      }
    }
  } catch (error) {
    console.warn('ip-api.com failed:', error)
  }

  // Ultimate fallback - use USD
  return {
    country: 'United States',
    countryCode: 'US',
    currency: 'USD',
  }
}

/**
 * Get currency code from country code
 */
export function getCurrencyFromCountry(countryCode: string): string {
  return COUNTRY_CURRENCY_MAP[countryCode.toUpperCase()] || 'USD'
}

/**
 * Cache user's detected location in localStorage
 */
export function cacheUserLocation(location: LocationInfo): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem('userLocation', JSON.stringify({
      ...location,
      timestamp: Date.now(),
    }))
  } catch (error) {
    console.warn('Failed to cache user location:', error)
  }
}

/**
 * Get cached user location from localStorage
 * Returns null if cache is older than 24 hours
 */
export function getCachedUserLocation(): LocationInfo | null {
  if (typeof window === 'undefined') return null

  try {
    const cached = localStorage.getItem('userLocation')
    if (!cached) return null

    const data = JSON.parse(cached)
    const cacheAge = Date.now() - (data.timestamp || 0)
    const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

    // Return cached location if less than 24 hours old
    if (cacheAge < CACHE_DURATION) {
      return {
        country: data.country,
        countryCode: data.countryCode,
        currency: data.currency,
        ip: data.ip,
      }
    }

    // Cache expired, remove it
    localStorage.removeItem('userLocation')
    return null
  } catch (error) {
    console.warn('Failed to get cached location:', error)
    return null
  }
}

/**
 * Get user's currency with caching and fallback
 * First checks cache, then detects location if needed
 */
export async function getUserCurrencyFromLocation(): Promise<string> {
  // Check cache first
  const cached = getCachedUserLocation()
  if (cached) {
    return cached.currency
  }

  // Detect location and cache it
  const location = await detectUserLocation()
  cacheUserLocation(location)

  return location.currency
}
