import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { getExternalAIClient } from '@/lib/api/external-ai-client'
import { sanitizeHtml } from '@/lib/utils/security'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set() {},
          remove() {},
        },
      }
    )

    const { data: { session } } = await supabase.auth.getSession()

    // Allow unauthenticated users for the homepage demo (with rate limiting handled elsewhere)
    // But authenticated users get full access
    const isAuthenticated = !!session

    const contentType = request.headers.get('content-type')
    let prompt = ''
    let history = []

    // Handle multipart/form-data for file uploads
    if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData()
      prompt = formData.get('prompt') as string || ''
      const historyStr = formData.get('history') as string
      if (historyStr) {
        try {
          history = JSON.parse(historyStr)
        } catch (e) {
          // Silently fail if unable to parse history
        }
      }

      const file = formData.get('file') as File | null
      if (file) {
        // Use external API for file upload
        const client = getExternalAIClient()
        const result = await client.generateWithFile({
          prompt: prompt || 'Extract all invoice/quote data from this document',
          file,
        })

        if (!result.success) {
          return NextResponse.json(
            { error: result.error || 'Failed to extract data from file' },
            { status: 400 }
          )
        }

        const sanitized = sanitizeHtml(result.text_output)

        return NextResponse.json({
          description: sanitized,
          extractedData: result.data,
          documentType: result.document_type,
          shouldCreateDocument: true,
        })
      }
    } else {
      const body = await request.json()
      prompt = body.prompt
      history = body.history || []
    }

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    // Always use external AI API
    const client = getExternalAIClient()

    let result
    try {
      result = await client.generate({
        prompt,
        history,
      })
    } catch (apiError) {
      console.error('[Generate Route] External API Error:', apiError)

      // Check if it's a connection error
      const errorMessage = apiError instanceof Error ? apiError.message : 'Unknown error'
      if (errorMessage.includes('fetch') || errorMessage.includes('ECONNREFUSED')) {
        return NextResponse.json(
          {
            error: 'Unable to connect to the AI service. Please ensure the external API backend is running at ' +
                   (process.env.EXTERNAL_AI_API_URL || 'https://quotla-ml.onrender.com')
          },
          { status: 503 }
        )
      }

      return NextResponse.json(
        { error: `AI service error: ${errorMessage}` },
        { status: 500 }
      )
    }

    console.log('[Generate Route] External API Result:', { success: result.success, hasData: !!result.data, documentType: result.document_type })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to generate description' },
        { status: 400 }
      )
    }

    const sanitized = sanitizeHtml(result.text_output)

    // Detect if user wants to create a document
    const lowerPrompt = prompt.toLowerCase()
    const isCreationRequest = lowerPrompt.includes('create') || lowerPrompt.includes('generate') ||
                              lowerPrompt.includes('actually') || lowerPrompt.includes('go on') ||
                              lowerPrompt.includes('do it')

    // Check if this is a follow-up creation request
    const isFollowUpCreate = (lowerPrompt.includes('create') || lowerPrompt.includes('do it') ||
                              lowerPrompt.includes('go on') || lowerPrompt.includes('actually')) &&
                             history && history.length > 0

    return NextResponse.json({
      description: sanitized,
      extractedData: result.data,
      documentType: result.document_type,
      shouldCreateDocument: isCreationRequest || isFollowUpCreate || result.needs_currency === false,
    })
  } catch (error) {

    const errorMessage = error instanceof Error ? error.message : 'Failed to generate description'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
