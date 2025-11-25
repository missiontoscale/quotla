import { generateDescription as generateWithAnthropic, generateQuoteWithAnthropic } from './anthropic'
import { generateDescriptionWithOpenAI, generateQuoteWithOpenAI, GeneratedQuote } from './openai'
import { generateDescriptionWithGemini, generateQuoteWithGemini } from './gemini'

type AIProvider = 'anthropic' | 'openai' | 'gemini' | 'none'

const AI_PROVIDER = (process.env.AI_PROVIDER || 'openai') as AIProvider

export type { GeneratedQuote }

export async function generateDescription(prompt: string, history?: Array<{role: string, content: string}>): Promise<string> {
  // Try the primary provider first
  let primaryError: Error | null = null

  switch (AI_PROVIDER) {
    case 'openai':
      try {
        return await generateDescriptionWithOpenAI(prompt, history)
      } catch (error) {
        primaryError = error instanceof Error ? error : new Error('OpenAI failed')
        console.log('Primary provider (OpenAI) failed, trying fallback...', primaryError.message)
      }
      break

    case 'gemini':
      try {
        return await generateDescriptionWithGemini(prompt, history)
      } catch (error) {
        primaryError = error instanceof Error ? error : new Error('Gemini failed')
        console.log('Primary provider (Gemini) failed, trying fallback...', primaryError.message)
      }
      break

    case 'anthropic':
      try {
        return await generateWithAnthropic(prompt, history)
      } catch (error) {
        primaryError = error instanceof Error ? error : new Error('Anthropic failed')
        console.log('Primary provider (Anthropic) failed, trying fallback...', primaryError.message)
      }
      break

    case 'none':
      throw new Error('AI generation is disabled. Please enable an AI provider in your environment variables.')
  }

  // If primary provider failed, don't try fallback - just throw the error
  // This prevents unnecessary API calls to providers with no credits/invalid keys
  if (primaryError) {
    throw primaryError
  }

  // This should never happen, but TypeScript needs it
  throw new Error('Unexpected error in AI generation')
}

export async function generateCompleteQuote(prompt: string): Promise<GeneratedQuote> {
  let primaryError: Error | null = null

  switch (AI_PROVIDER) {
    case 'openai':
      try {
        return await generateQuoteWithOpenAI(prompt)
      } catch (error) {
        primaryError = error instanceof Error ? error : new Error('OpenAI quote generation failed')
        console.log('Primary provider (OpenAI) failed for quote generation:', primaryError.message)
      }
      break

    case 'gemini':
      try {
        return await generateQuoteWithGemini(prompt)
      } catch (error) {
        primaryError = error instanceof Error ? error : new Error('Gemini quote generation failed')
        console.log('Primary provider (Gemini) failed for quote generation:', primaryError.message)
      }
      break

    case 'anthropic':
      try {
        return await generateQuoteWithAnthropic(prompt)
      } catch (error) {
        primaryError = error instanceof Error ? error : new Error('Anthropic quote generation failed')
        console.log('Primary provider (Anthropic) failed for quote generation:', primaryError.message)
      }
      break

    case 'none':
      throw new Error('AI generation is disabled. Please enable an AI provider in your environment variables.')
  }

  if (primaryError) {
    throw primaryError
  }

  throw new Error('Unexpected error in quote generation')
}
