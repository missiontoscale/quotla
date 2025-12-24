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

    // Always use external AI API to export DOCX
    const client = getExternalAIClient()
    const docxBlob = await client.exportDocx({
      prompt,
      history: history || [],
      document_type,
    })

    // Return DOCX as downloadable file
    const headers = new Headers()
    headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    headers.set('Content-Disposition', `attachment; filename="${document_type || 'document'}_${Date.now()}.docx"`)

    return new NextResponse(docxBlob, {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error('DOCX export error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to export DOCX'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
