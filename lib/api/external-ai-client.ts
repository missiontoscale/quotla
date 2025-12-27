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

interface GenerateParams {
  prompt: string
  history?: Array<{ role: string; content: string }>
}

interface GenerateWithFileParams {
  prompt: string
  file: File
}

interface ExportParams {
  prompt: string
  history: Array<{ role: string; content: string }>
  document_type: 'quote' | 'invoice'
}

interface AIResponse {
  success: boolean
  text_output: string
  data?: any
  document_type?: 'quote' | 'invoice'
  needs_currency?: boolean
  error?: string
}

/**
 * External AI Client using OpenAI GPT-4
 * This client provides AI generation capabilities for quotes, invoices, and general responses
 */
class ExternalAIClient {
  async generate(params: GenerateParams): Promise<AIResponse> {
    try {
      const { prompt, history = [] } = params

      // Build messages for GPT-4
      const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
        {
          role: 'system',
          content: `You are Quotla AI, an intelligent business assistant specialized in helping users create professional quotes and invoices. You provide helpful, accurate, and friendly responses about business matters, pricing, and financial documentation.

When users ask you to create quotes or invoices, help them by gathering the necessary information and providing clear, professional output.`
        },
        ...history.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        })),
        { role: 'user' as const, content: prompt }
      ]

      const response = await getOpenAIClient().chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 2000,
        temperature: 0.7,
      })

      const textContent = response.choices[0]?.message?.content
      if (!textContent) {
        throw new Error('No text response from AI')
      }

      return {
        success: true,
        text_output: textContent,
        document_type: this.detectDocumentType(prompt),
        needs_currency: this.needsCurrencyInfo(prompt, textContent),
      }
    } catch (error) {
      return {
        success: false,
        text_output: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  async generateQuote(params: GenerateParams): Promise<AIResponse> {
    try {
      const { prompt, history = [] } = params

      const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
        {
          role: 'system',
          content: `You are Quotla AI, a quote generation specialist. Help users create professional quotes by extracting or gathering:
- Client name and details
- Line items with descriptions and prices
- Payment terms
- Currency (USD, NGN, EUR, GBP)
- Any additional notes

Provide clear, structured information that can be used to create a formal quote.`
        },
        ...history.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        })),
        { role: 'user' as const, content: prompt }
      ]

      const response = await getOpenAIClient().chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 2000,
        temperature: 0.7,
      })

      const textContent = response.choices[0]?.message?.content
      if (!textContent) {
        throw new Error('No text response from AI')
      }

      return {
        success: true,
        text_output: textContent,
        document_type: 'quote',
        needs_currency: this.needsCurrencyInfo(prompt, textContent),
      }
    } catch (error) {
      return {
        success: false,
        text_output: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  async generateInvoice(params: GenerateParams): Promise<AIResponse> {
    try {
      const { prompt, history = [] } = params

      const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
        {
          role: 'system',
          content: `You are Quotla AI, an invoice generation specialist. Help users create professional invoices by extracting or gathering:
- Client name and details
- Invoice number and date
- Line items with descriptions and prices
- Payment terms and due date
- Currency (USD, NGN, EUR, GBP)
- Any additional notes

Provide clear, structured information that can be used to create a formal invoice.`
        },
        ...history.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        })),
        { role: 'user' as const, content: prompt }
      ]

      const response = await getOpenAIClient().chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 2000,
        temperature: 0.7,
      })

      const textContent = response.choices[0]?.message?.content
      if (!textContent) {
        throw new Error('No text response from AI')
      }

      return {
        success: true,
        text_output: textContent,
        document_type: 'invoice',
        needs_currency: this.needsCurrencyInfo(prompt, textContent),
      }
    } catch (error) {
      return {
        success: false,
        text_output: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  async generateWithFile(params: GenerateWithFileParams): Promise<AIResponse> {
    // File upload with vision is not implemented in this basic version
    // This would require image processing or OCR
    return {
      success: false,
      text_output: '',
      error: 'File upload not yet implemented. Please type your request instead.'
    }
  }

  async exportPdf(params: ExportParams): Promise<Blob> {
    throw new Error('PDF export should be handled by the frontend or a separate service')
  }

  async exportDocx(params: ExportParams): Promise<Blob> {
    throw new Error('DOCX export should be handled by the frontend or a separate service')
  }

  async exportPng(params: ExportParams): Promise<Blob> {
    throw new Error('PNG export should be handled by the frontend or a separate service')
  }

  private detectDocumentType(prompt: string): 'quote' | 'invoice' | undefined {
    const lowerPrompt = prompt.toLowerCase()
    if (lowerPrompt.includes('quote') || lowerPrompt.includes('estimate')) {
      return 'quote'
    }
    if (lowerPrompt.includes('invoice') || lowerPrompt.includes('bill')) {
      return 'invoice'
    }
    return undefined
  }

  private needsCurrencyInfo(prompt: string, response: string): boolean {
    const lowerPrompt = prompt.toLowerCase()
    const lowerResponse = response.toLowerCase()

    // Check if currency is mentioned
    const hasCurrency = /\b(usd|ngn|eur|gbp|naira|dollar|euro|pound|\$|₦|€|£)\b/i.test(lowerPrompt + ' ' + lowerResponse)

    return !hasCurrency
  }
}

let clientInstance: ExternalAIClient | null = null

export function getExternalAIClient(): ExternalAIClient {
  if (!clientInstance) {
    clientInstance = new ExternalAIClient()
  }
  return clientInstance
}
