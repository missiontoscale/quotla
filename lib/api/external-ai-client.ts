// External ML API Configuration
const EXTERNAL_API_URL = process.env.EXTERNAL_AI_API_URL || 'https://quotla-ml.onrender.com'

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

// Response types matching OpenAPI spec
interface DocumentItem {
  description: string
  quantity: number
  unit_price: number
  amount: number
}

interface InvoiceData {
  client_name: string
  client_address?: string
  invoice_number: string
  date: string
  due_date?: string
  items: DocumentItem[]
  subtotal: number
  tax_rate: number
  tax_amount: number
  delivery_charge?: number
  total: number
  currency: string
  payment_terms?: string
  notes?: string
}

interface QuoteData {
  client_name: string
  client_address?: string
  quote_number: string
  date: string
  valid_until?: string
  items: DocumentItem[]
  subtotal: number
  tax_rate: number
  tax_amount: number
  total: number
  currency: string
  notes?: string
}

interface AIResponse {
  success: boolean
  text_output: string
  data?: InvoiceData | QuoteData
  document_type?: 'quote' | 'invoice'
  needs_currency?: boolean
  error?: string
}

/**
 * External AI Client for Quotla ML API
 * This client communicates with the external Python ML API backend
 * that provides structured document generation using AI (OpenAI/Anthropic/Gemini)
 */
class ExternalAIClient {
  /**
   * Generate a document (auto-detects type: invoice or quote)
   * Calls POST /api/generate
   */
  async generate(params: GenerateParams): Promise<AIResponse> {
    try {
      const { prompt, history = [] } = params

      console.log('[External AI Client] Calling:', `${EXTERNAL_API_URL}/api/generate`)
      console.log('[External AI Client] Payload:', { prompt: prompt.substring(0, 50) + '...', historyLength: history.length })

      const response = await fetch(`${EXTERNAL_API_URL}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          history: history.length > 0 ? history : undefined,
        }),
      })

      console.log('[External AI Client] Response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('[External AI Client] Error response:', errorData)
        throw new Error(errorData.detail || errorData.error || `API returned ${response.status}`)
      }

      const data = await response.json()
      console.log('[External AI Client] Success response:', { hasData: !!data.data, documentType: data.document_type })

      return {
        success: data.success ?? true,
        text_output: data.text_output || '',
        data: data.data,
        document_type: data.document_type,
        needs_currency: data.needs_currency ?? false,
      }
    } catch (error) {
      console.error('[External AI Client] Exception:', error)
      return {
        success: false,
        text_output: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Generate a quote specifically
   * Calls POST /api/generate/quote
   */
  async generateQuote(params: GenerateParams): Promise<AIResponse> {
    try {
      const { prompt, history = [] } = params

      const response = await fetch(`${EXTERNAL_API_URL}/api/generate/quote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          history: history.length > 0 ? history : undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || errorData.error || `API returned ${response.status}`)
      }

      const data = await response.json()

      return {
        success: data.success ?? true,
        text_output: data.text_output || '',
        data: data.data,
        document_type: 'quote',
        needs_currency: data.needs_currency ?? false,
      }
    } catch (error) {
      return {
        success: false,
        text_output: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Generate an invoice specifically
   * Calls POST /api/generate/invoice
   */
  async generateInvoice(params: GenerateParams): Promise<AIResponse> {
    try {
      const { prompt, history = [] } = params

      const response = await fetch(`${EXTERNAL_API_URL}/api/generate/invoice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          history: history.length > 0 ? history : undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || errorData.error || `API returned ${response.status}`)
      }

      const data = await response.json()

      return {
        success: data.success ?? true,
        text_output: data.text_output || '',
        data: data.data,
        document_type: 'invoice',
        needs_currency: data.needs_currency ?? false,
      }
    } catch (error) {
      return {
        success: false,
        text_output: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Generate document from uploaded file (supports PDF, DOCX, images)
   * Calls POST /api/generate/with-file
   */
  async generateWithFile(params: GenerateWithFileParams): Promise<AIResponse> {
    try {
      const { prompt, file } = params

      const formData = new FormData()
      formData.append('prompt', prompt)
      formData.append('file', file)

      const response = await fetch(`${EXTERNAL_API_URL}/api/generate/with-file`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || errorData.error || `API returned ${response.status}`)
      }

      const data = await response.json()

      return {
        success: data.success ?? true,
        text_output: data.text_output || '',
        data: data.data,
        document_type: data.document_type,
        needs_currency: data.needs_currency ?? false,
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred'
      return {
        success: false,
        text_output: '',
        error: `File upload failed: ${errorMsg}`
      }
    }
  }

  /**
   * Export document as PDF
   * Calls POST /api/export/pdf
   */
  async exportPdf(params: ExportParams): Promise<Blob> {
    const response = await fetch(`${EXTERNAL_API_URL}/api/export/pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: params.prompt,
        history: params.history,
        document_type: params.document_type,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || errorData.error || 'Failed to export PDF')
    }

    return await response.blob()
  }

  /**
   * Export document as DOCX
   * Calls POST /api/export/docx
   */
  async exportDocx(params: ExportParams): Promise<Blob> {
    const response = await fetch(`${EXTERNAL_API_URL}/api/export/docx`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: params.prompt,
        history: params.history,
        document_type: params.document_type,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || errorData.error || 'Failed to export DOCX')
    }

    return await response.blob()
  }

  /**
   * Export document as PNG image
   * Calls POST /api/export/png
   */
  async exportPng(params: ExportParams): Promise<Blob> {
    const response = await fetch(`${EXTERNAL_API_URL}/api/export/png`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: params.prompt,
        history: params.history,
        document_type: params.document_type,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || errorData.error || 'Failed to export PNG')
    }

    return await response.blob()
  }
}

let clientInstance: ExternalAIClient | null = null

export function getExternalAIClient(): ExternalAIClient {
  if (!clientInstance) {
    clientInstance = new ExternalAIClient()
  }
  return clientInstance
}
