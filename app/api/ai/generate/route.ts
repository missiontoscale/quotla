import { NextRequest, NextResponse } from 'next/server'
import { generateDescription } from '@/lib/ai'
import { sanitizeHtml } from '@/lib/utils/security'
import { extractFileContent, isFileSizeValid, MAX_FILE_SIZE, FileExtractionResult } from '@/lib/utils/file-extractor'
import { extractFromImageOpenAI, formatVisionResponse } from '@/lib/ai/vision'
import { validateDocument, generateFollowUpQuestion } from '@/lib/ai/extractors/document-validator'

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type')
    let prompt = ''
    let history = []
    let fileContent = ''

    // Handle multipart/form-data for file uploads
    if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData()
      prompt = formData.get('prompt') as string || ''
      const historyStr = formData.get('history') as string
      if (historyStr) {
        try {
          history = JSON.parse(historyStr)
        } catch (e) {
          console.error('Error parsing history:', e)
        }
      }

      const file = formData.get('file') as File | null
      if (file) {
        // Validate file size
        if (!isFileSizeValid(file)) {
          return NextResponse.json(
            { error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB` },
            { status: 400 }
          )
        }

        // Extract file content
        try {
          const extraction = await extractFileContent(file)

          // Check if it's an image file (returns FileExtractionResult)
          if (typeof extraction === 'object' && extraction.type === 'image') {
            // Use vision API to extract document data
            const visionResult = await extractFromImageOpenAI(
              extraction.base64Data!,
              extraction.mimeType,
              prompt || 'Extract all invoice/quote data from this document'
            )

            if (!visionResult.success) {
              return NextResponse.json(
                { error: visionResult.error || 'Failed to extract data from image' },
                { status: 400 }
              )
            }

            // Determine document type (default to quote if not specified)
            const documentType = visionResult.documentType === 'invoice' ? 'invoice' : 'quote'

            // Validate extracted data
            const validation = validateDocument(visionResult.data, documentType)

            // Format response for user
            const formattedResponse = formatVisionResponse(visionResult)

            // Check if we have enough data to auto-create
            if (validation.canAutoCreate) {
              return NextResponse.json({
                description: formattedResponse,
                extractedData: visionResult.data,
                documentType: documentType,
                canAutoCreate: true,
                missingFields: [],
                shouldCreateDocument: true
              })
            } else {
              // Need more information - ask follow-up questions
              const followUpQuestion = generateFollowUpQuestion(validation.missingRequired, documentType)

              return NextResponse.json({
                description: `${formattedResponse}\n\n${followUpQuestion}`,
                extractedData: visionResult.data,
                documentType: documentType,
                canAutoCreate: false,
                missingFields: validation.missingRequired,
                requiresFollowUp: true,
                shouldCreateDocument: false
              })
            }
          } else {
            // Text file - use existing text extraction
            fileContent = extraction as string
            prompt = prompt ? `${fileContent}\n\nUser question: ${prompt}` : fileContent
          }
        } catch (error) {
          console.error('File extraction error:', error)
          return NextResponse.json(
            { error: 'Failed to extract file content. Please try a different file format.' },
            { status: 400 }
          )
        }
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

    // Detect if user wants to create a document
    const lowerPrompt = prompt.toLowerCase()
    const isCreationRequest = lowerPrompt.includes('create') || lowerPrompt.includes('generate') ||
                              lowerPrompt.includes('actually') || lowerPrompt.includes('go on') ||
                              lowerPrompt.includes('do it')

    // Check if this is a follow-up creation request (user saying "create it now")
    const isFollowUpCreate = (lowerPrompt.includes('create') || lowerPrompt.includes('do it') ||
                              lowerPrompt.includes('go on') || lowerPrompt.includes('actually')) &&
                             history && history.length > 0

    const description = await generateDescription(prompt, history)
    const sanitized = sanitizeHtml(description)

    return NextResponse.json({
      description: sanitized,
      shouldCreateDocument: isCreationRequest || isFollowUpCreate
    })
  } catch (error) {
    console.error('AI generation error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    console.error('AI Provider:', process.env.AI_PROVIDER)
    console.error('Has OpenAI Key:', !!process.env.OPENAI_API_KEY)
    console.error('Has Anthropic Key:', !!process.env.ANTHROPIC_API_KEY)
    console.error('Has Gemini Key:', !!process.env.GOOGLE_AI_API_KEY)

    const errorMessage = error instanceof Error ? error.message : 'Failed to generate description'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
