import Anthropic from '@anthropic-ai/sdk'
import { GeneratedQuote } from './openai'
import {
  CHAT_SYSTEM_PROMPT,
  QUOTE_GENERATION_SYSTEM_PROMPT,
  getQuoteGenerationPrompt,
  QUOTE_GENERATION_CONFIG
} from '@/prompts'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function generateDescription(
  prompt: string,
  history?: Array<{role: string, content: string}>
): Promise<string> {
  try {
    // Build messages array with history
    const messages: Array<{role: 'user' | 'assistant', content: string}> = []

    // Add last 5 conversation pairs (10 messages) for context
    if (history && history.length > 0) {
      const recentHistory = history.slice(-10)
      recentHistory.forEach(msg => {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({
            role: msg.role as 'user' | 'assistant',
            content: msg.content
          })
        }
      })
    }

    // Add current prompt
    messages.push({
      role: 'user',
      content: prompt,
    })

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 200,
      temperature: 0.5,
      system: CHAT_SYSTEM_PROMPT,
      messages,
    })

    const content = message.content[0]
    if (content.type === 'text') {
      return content.text.trim()
    }

    throw new Error('Unexpected response format')
  } catch (error) {
    console.error('AI generation error:', error)
    throw new Error('Failed to generate description')
  }
}

export async function generateQuoteWithAnthropic(prompt: string): Promise<GeneratedQuote> {
  // Detect currency from prompt
  const lowerPrompt = prompt.toLowerCase()
  let currency = 'USD'

  if (lowerPrompt.includes('ngn') || lowerPrompt.includes('naira') || lowerPrompt.includes('nigeria')) {
    currency = 'NGN'
  } else if (lowerPrompt.includes('eur') || lowerPrompt.includes('euro')) {
    currency = 'EUR'
  } else if (lowerPrompt.includes('gbp') || lowerPrompt.includes('pound')) {
    currency = 'GBP'
  }

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: QUOTE_GENERATION_CONFIG.maxTokens,
      temperature: QUOTE_GENERATION_CONFIG.temperature,
      system: QUOTE_GENERATION_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: getQuoteGenerationPrompt(prompt, currency),
        },
      ],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response format')
    }

    let jsonText = content.text.trim()

    // Remove markdown code blocks if present
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '')

    const quote = JSON.parse(jsonText)

    // Validate and ensure structure
    if (!quote.items || !Array.isArray(quote.items) || quote.items.length === 0) {
      throw new Error('Generated quote must have at least one item')
    }

    // Ensure all items have required fields and add sort_order
    quote.items = quote.items.map((item: any, index: number) => ({
      description: item.description || 'Item',
      quantity: parseFloat(item.quantity) || 1,
      unit_price: parseFloat(item.unit_price) || 0,
      amount: parseFloat(item.amount) || 0,
      sort_order: index,
    }))

    // Validate and ensure numeric fields
    quote.subtotal = parseFloat(quote.subtotal) || 0
    quote.tax_rate = parseFloat(quote.tax_rate) || 0
    quote.tax_amount = parseFloat(quote.tax_amount) || 0
    quote.total = parseFloat(quote.total) || 0

    return quote
  } catch (error) {
    console.error('Anthropic quote generation error:', error)
    if (error instanceof Error) {
      if (error.message.includes('JSON')) {
        throw new Error('Failed to parse AI response. Please try again with a different description.')
      }
      throw new Error(`Quote generation error: ${error.message}`)
    }
    throw new Error('Failed to generate quote with Anthropic')
  }
}
