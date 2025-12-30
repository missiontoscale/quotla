// External ML API Configuration
// Remove trailing slash to avoid issues with URL construction
const EXTERNAL_API_URL = (process.env.EXTERNAL_AI_API_URL || 'https://quotla-ml.onrender.com').replace(/\/$/, '')

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
      const url = `${EXTERNAL_API_URL}/api/generate`

      console.log('[External AI Client] Calling:', url)
      console.log('[External AI Client] Payload:', { prompt: prompt.substring(0, 50) + '...', historyLength: history.length })

      // New API schema requires multipart/form-data with history as JSON string
      const formData = new FormData()
      formData.append('prompt', prompt)

      // History must be sent as JSON string according to OpenAPI schema
      if (history.length > 0) {
        formData.append('history', JSON.stringify(history))
      }

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - let browser set it with boundary for multipart
      })

      console.log('[External AI Client] Response status:', response.status)
      console.log('[External AI Client] Response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        // Try to get response text first
        const responseText = await response.text()
        console.error('[External AI Client] Error response body:', responseText)

        // Try to parse as JSON
        let errorData: any = {}
        try {
          errorData = JSON.parse(responseText)
        } catch {
          // Not JSON, use the text
          throw new Error(`API error (${response.status}): ${responseText.substring(0, 200)}`)
        }

        throw new Error(errorData.detail || errorData.error || `API returned ${response.status}`)
      }

      const data = await response.json()
      console.log('[External AI Client] Success response:', { hasData: !!data.data, documentType: data.document_type, needsCurrency: data.needs_currency })

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
   * Uses /api/generate with document_type='quote'
   */
  async generateQuote(params: GenerateParams): Promise<AIResponse> {
    try {
      const { prompt, history = [] } = params

      // Use new unified endpoint with document_type parameter
      const formData = new FormData()
      formData.append('prompt', prompt)
      formData.append('document_type', 'quote')

      if (history.length > 0) {
        formData.append('history', JSON.stringify(history))
      }

      const response = await fetch(`${EXTERNAL_API_URL}/api/generate`, {
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
   * Uses /api/generate with document_type='invoice'
   */
  async generateInvoice(params: GenerateParams): Promise<AIResponse> {
    try {
      const { prompt, history = [] } = params

      // Use new unified endpoint with document_type parameter
      const formData = new FormData()
      formData.append('prompt', prompt)
      formData.append('document_type', 'invoice')

      if (history.length > 0) {
        formData.append('history', JSON.stringify(history))
      }

      const response = await fetch(`${EXTERNAL_API_URL}/api/generate`, {
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
   * Uses /api/generate with file upload
   */
  async generateWithFile(params: GenerateWithFileParams): Promise<AIResponse> {
    try {
      const { prompt, file } = params

      // Use unified endpoint with file parameter
      const formData = new FormData()
      formData.append('prompt', prompt)
      formData.append('file', file)

      const response = await fetch(`${EXTERNAL_API_URL}/api/generate`, {
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
   * Uses /api/export with format='pdf'
   */
  async exportPdf(params: ExportParams): Promise<Blob> {
    const formData = new FormData()
    formData.append('prompt', params.prompt)
    formData.append('format', 'pdf')
    formData.append('history', JSON.stringify(params.history))
    if (params.document_type) {
      formData.append('document_type', params.document_type)
    }

    const response = await fetch(`${EXTERNAL_API_URL}/api/export`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || errorData.error || 'Failed to export PDF')
    }

    return await response.blob()
  }

  /**
   * Export document as DOCX
   * Uses /api/export with format='docx'
   */
  async exportDocx(params: ExportParams): Promise<Blob> {
    const formData = new FormData()
    formData.append('prompt', params.prompt)
    formData.append('format', 'docx')
    formData.append('history', JSON.stringify(params.history))
    if (params.document_type) {
      formData.append('document_type', params.document_type)
    }

    const response = await fetch(`${EXTERNAL_API_URL}/api/export`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || errorData.error || 'Failed to export DOCX')
    }

    return await response.blob()
  }

  /**
   * Export document as PNG image
   * Uses /api/export with format='png'
   */
  async exportPng(params: ExportParams): Promise<Blob> {
    const formData = new FormData()
    formData.append('prompt', params.prompt)
    formData.append('format', 'png')
    formData.append('history', JSON.stringify(params.history))
    if (params.document_type) {
      formData.append('document_type', params.document_type)
    }

    const response = await fetch(`${EXTERNAL_API_URL}/api/export`, {
      method: 'POST',
      body: formData,
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
