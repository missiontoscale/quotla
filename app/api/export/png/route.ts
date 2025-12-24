import { NextRequest, NextResponse } from 'next/server'
import { getExternalAIClient } from '@/lib/api/external-ai-client'

export async function POST(request: NextRequest) {
  try {
    const { prompt, history, document_type } = await request.json()

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    // Always use external AI API to export PNG
    const client = getExternalAIClient()
    const pngBlob = await client.exportPng({
      prompt,
      history: history || [],
      document_type,
    })

    // Return PNG as downloadable file
    const headers = new Headers()
    headers.set('Content-Type', 'image/png')
    headers.set('Content-Disposition', `attachment; filename="${document_type || 'document'}_${Date.now()}.png"`)

    return new NextResponse(pngBlob, {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error('PNG export error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to export PNG'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
