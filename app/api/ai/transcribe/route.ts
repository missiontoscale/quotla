import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

let openai: OpenAI | null = null

function getOpenAIClient(): OpenAI {
  if (!openai) {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set')
    }
    openai = new OpenAI({
      apiKey,
    })
  }
  return openai
}

// Domain-specific prompt to improve transcription accuracy for business/invoicing context
const TRANSCRIPTION_PROMPT = `This is a business conversation about quotes, invoices, pricing, clients, deliveries, taxes, payments, and financial terms. Common terms include: quote, invoice, subtotal, tax rate, delivery charge, client name, due date, payment terms, line items, unit price, quantity, amount, total, NGN (Nigerian Naira), USD, EUR, GBP, VAT, business registration, Tax Identification Number (TIN).`

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    const stream = formData.get('stream') === 'true' // Optional streaming support

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      )
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables.' },
        { status: 500 }
      )
    }

    // Convert File to a format that OpenAI expects
    const arrayBuffer = await audioFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Create a File-like object that OpenAI SDK accepts
    const file = new File([buffer], 'audio.webm', { type: audioFile.type })

    // Use OpenAI's Whisper transcription model
    if (stream) {
      const transcription = await getOpenAIClient().audio.transcriptions.create({
        file: file,
        model: 'whisper-1',
        prompt: TRANSCRIPTION_PROMPT,
        response_format: 'text',
        stream: true,
      })

      // Create a readable stream for the response
      const encoder = new TextEncoder()
      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            for await (const event of transcription) {
              const chunk = encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
              controller.enqueue(chunk)
            }
            controller.close()
          } catch (error) {
            controller.error(error)
          }
        },
      })

      return new Response(readableStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    }

    // Non-streaming response
    const transcription = await getOpenAIClient().audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      // Remove hardcoded language to enable auto-detection
      // The model will automatically detect the language
      prompt: TRANSCRIPTION_PROMPT, // Improves accuracy for domain-specific terms
      response_format: 'json',
    })

    return NextResponse.json({
      text: transcription.text,
    })
  } catch (error) {
    console.error('Transcription error:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Transcription failed: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to transcribe audio. Please try again.' },
      { status: 500 }
    )
  }
}
