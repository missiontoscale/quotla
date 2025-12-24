import { NextRequest, NextResponse } from 'next/server'
import { getExternalAIClient } from '@/lib/api/external-ai-client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { prompt, history } = await request.json()

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    // Always use external AI API
    const client = getExternalAIClient()
    const result = await client.generateInvoice({
      prompt,
      history: history || [],
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to generate invoice' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      invoice: result.data,
      text_output: result.text_output,
      success: result.success,
      document_type: result.document_type,
      needs_currency: result.needs_currency || false,
    })
  } catch (error) {
    console.error('AI invoice generation error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate invoice'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
