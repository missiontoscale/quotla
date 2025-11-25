import { NextRequest, NextResponse } from 'next/server'
import { generateDescription } from '@/lib/ai'
import { sanitizeHtml } from '@/lib/utils/security'

export async function POST(request: NextRequest) {
  try {
    const { prompt, history } = await request.json()

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    const description = await generateDescription(prompt, history)
    const sanitized = sanitizeHtml(description)

    return NextResponse.json({ description: sanitized })
  } catch (error) {
    console.error('AI generation error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate description'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
