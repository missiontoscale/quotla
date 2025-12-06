import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File

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

    // Use OpenAI Whisper API to transcribe
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      language: 'en', // You can make this dynamic if needed
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
