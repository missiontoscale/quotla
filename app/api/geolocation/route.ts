import { NextRequest, NextResponse } from 'next/server'

interface LocationInfo {
  country: string
  countryCode: string
  currency: string
  ip?: string
}

// Map of country codes to their primary currency
const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  US: 'USD',
  CA: 'CAD',
  GB: 'GBP',
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
  TD: 'XAF', // Chad uses Central African CFA franc
}

export async function GET(request: NextRequest) {
  try {
    // Get client IP from headers
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const clientIp = forwardedFor?.split(',')[0] || realIp || ''

    // For development/localhost, use a geolocation service
    let locationInfo: LocationInfo

    // Try ipapi.co (free tier: 30k requests/month)
    try {
      const response = await fetch(`https://ipapi.co/${clientIp}/json/`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()

        if (data.country_code && !data.error) {
          const currency = COUNTRY_CURRENCY_MAP[data.country_code] || data.currency || 'USD'

          locationInfo = {
            country: data.country_name || data.country_code,
            countryCode: data.country_code,
            currency,
            ip: data.ip,
          }

          return NextResponse.json(locationInfo)
        }
      }
    } catch (error) {
      console.warn('ipapi.co failed:', error)
    }

    // Fallback to default USD
    locationInfo = {
      country: 'United States',
      countryCode: 'US',
      currency: 'USD',
    }

    return NextResponse.json(locationInfo)
  } catch (error) {
    console.error('Geolocation error:', error)

    // Return default on error
    return NextResponse.json({
      country: 'United States',
      countryCode: 'US',
      currency: 'USD',
    })
  }
}
