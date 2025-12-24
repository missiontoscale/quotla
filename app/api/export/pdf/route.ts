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

    // Always use external AI API to export PDF
    const client = getExternalAIClient()
    const pdfBlob = await client.exportPdf({
      prompt,
      history: history || [],
      document_type,
    })

    // Return PDF as downloadable file
    const headers = new Headers()
    headers.set('Content-Type', 'application/pdf')
    headers.set('Content-Disposition', `attachment; filename="${document_type || 'document'}_${Date.now()}.pdf"`)

    return new NextResponse(pdfBlob, {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error('PDF export error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to export PDF'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
