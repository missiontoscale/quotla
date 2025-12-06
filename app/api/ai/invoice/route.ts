import { NextRequest, NextResponse } from 'next/server'
import { generateInvoiceFromPrompt, formatInvoice } from '@/lib/ai/invoice-generator'

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    // Generate invoice data from the prompt
    const invoiceData = await generateInvoiceFromPrompt(prompt)

    // Format as text
    const formattedInvoice = formatInvoice(invoiceData)

    return NextResponse.json({
      invoice: formattedInvoice,
      invoiceData: invoiceData,
      success: true
    })
  } catch (error) {
    console.error('Invoice generation error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate invoice'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
