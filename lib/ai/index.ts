import { generateDescription as generateWithAnthropic } from './anthropic'
import { generateDescriptionWithOpenAI } from './openai'
import { generateDescriptionWithGemini } from './gemini'

type AIProvider = 'anthropic' | 'openai' | 'gemini' | 'none'

const AI_PROVIDER = (process.env.AI_PROVIDER || 'anthropic') as AIProvider

export async function generateDescription(prompt: string): Promise<string> {
  // Try the primary provider first
  let primaryError: Error | null = null

  switch (AI_PROVIDER) {
    case 'openai':
      try {
        return await generateDescriptionWithOpenAI(prompt)
      } catch (error) {
        primaryError = error instanceof Error ? error : new Error('OpenAI failed')
        console.log('Primary provider (OpenAI) failed, trying fallback...', primaryError.message)
      }
      break

    case 'gemini':
      try {
        return await generateDescriptionWithGemini(prompt)
      } catch (error) {
        primaryError = error instanceof Error ? error : new Error('Gemini failed')
        console.log('Primary provider (Gemini) failed, trying fallback...', primaryError.message)
      }
      break

    case 'anthropic':
      try {
        return await generateWithAnthropic(prompt)
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
