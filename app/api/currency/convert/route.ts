import { NextRequest, NextResponse } from 'next/server'

interface FxRatesApiResponse {
  success: boolean
  base: string
  rates: Record<string, number>
  timestamp: number
  date: string
}

interface ConversionResult {
  from: string
  to: string
  amount: number
  convertedAmount: number
  rate: number
  timestamp: string
}

// Server-side cache for exchange rates (always USD-based)
const rateCache: {
  rates: Record<string, number> | null
  timestamp: number
} = {
  rates: null,
  timestamp: 0,
}

const CACHE_DURATION = 60 * 60 * 1000 // 1 hour

async function getExchangeRates(): Promise<Record<string, number>> {
  const now = Date.now()

  // Return cached rates if valid
  if (rateCache.rates && now - rateCache.timestamp < CACHE_DURATION) {
    return rateCache.rates
  }

  const response = await fetch('https://api.fxratesapi.com/latest')

  if (!response.ok) {
    throw new Error(`Exchange rate API error: ${response.statusText}`)
  }

  const data: FxRatesApiResponse = await response.json()

  if (!data.success || !data.rates) {
    throw new Error('Failed to fetch exchange rates')
  }

  // Cache the USD-based rates
  rateCache.rates = data.rates
  rateCache.timestamp = now

  return data.rates
}

async function convertCurrency(
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

  const rates = await getExchangeRates()

  const fromRate = rates[fromCurrency]
  const toRate = rates[toCurrency]

  if (!fromRate) {
    throw new Error(`Exchange rate not available for ${fromCurrency}`)
  }
  if (!toRate) {
    throw new Error(`Exchange rate not available for ${toCurrency}`)
  }

  // Convert: amount in FROM -> USD -> TO
  // fromRate = how many FROM per 1 USD
  // toRate = how many TO per 1 USD
  // So: amount / fromRate = USD value, then * toRate = TO value
  const rate = toRate / fromRate
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

export async function POST(request: NextRequest) {
  try {
    const { amount, from, to } = await request.json()

    if (!amount || !from || !to) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, from, to' },
        { status: 400 }
      )
    }

    if (typeof amount !== 'number' || amount < 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      )
    }

    const result = await convertCurrency(amount, from, to)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Currency conversion error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to convert currency' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const rates = await getExchangeRates()

    return NextResponse.json({
      base: 'USD',
      rates,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Exchange rates fetch error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch exchange rates' },
      { status: 500 }
    )
  }
}
