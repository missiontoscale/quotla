import { NextRequest, NextResponse } from 'next/server'
import { generateCompleteQuote } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    const quote = await generateCompleteQuote(prompt)

    return NextResponse.json({ quote })
  } catch (error) {
    console.error('AI quote generation error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate quote'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
