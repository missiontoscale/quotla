/**
 * OpenAI Vision API for document extraction
 * Uses GPT-4o for image analysis and data extraction
 */

import OpenAI from 'openai'
import { VisionExtractionResult, ExtractedDocumentData } from './types'
import { VISION_EXTRACTION_PROMPT, VISION_CONFIG } from '@/prompts'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

/**
 * Extract structured document data from an image using GPT-4o vision
 */
export async function extractFromImageOpenAI(
  imageBase64: string,
  mimeType: string,
  additionalPrompt?: string
): Promise<VisionExtractionResult> {
  try {
    const completion = await openai.chat.completions.create({
      model: VISION_CONFIG.model, // gpt-4o
      messages: [
        {
          role: 'system',
          content: VISION_EXTRACTION_PROMPT,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: additionalPrompt || 'Extract all invoice/quote data from this document image.'
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${imageBase64}`,
                detail: VISION_CONFIG.detail, // 'high' for detailed analysis
              },
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: VISION_CONFIG.maxTokens,
      temperature: VISION_CONFIG.temperature,
    })

    const content = completion.choices[0]?.message?.content?.trim()

    if (!content) {
      return {
        success: false,
        documentType: 'unknown',
        confidence: 0,
        data: null,
        missingFields: [],
        error: 'No response from vision AI',
      }
    }

    // Parse and validate the response
    const extracted = JSON.parse(content) as VisionExtractionResult

    // Validate the structure
    return validateExtraction(extracted)
  } catch (error) {
    console.error('OpenAI vision extraction error:', error)

    // Handle JSON parse errors
    if (error instanceof SyntaxError) {
      return {
        success: false,
        documentType: 'unknown',
        confidence: 0,
        data: null,
        missingFields: [],
        error: 'Failed to parse AI response. The image may be unclear or not a business document.',
      }
    }

    // Handle API errors
    return {
      success: false,
      documentType: 'unknown',
      confidence: 0,
      data: null,
      missingFields: [],
      error: error instanceof Error ? error.message : 'Vision extraction failed',
    }
  }
}

/**
 * Validate and normalize the extracted data
 */
function validateExtraction(extracted: any): VisionExtractionResult {
  // Ensure required top-level fields exist
  const result: VisionExtractionResult = {
    success: extracted.success ?? false,
    documentType: extracted.documentType || 'unknown',
    confidence: parseFloat(extracted.confidence) || 0,
    data: extracted.data || null,
    missingFields: Array.isArray(extracted.missingFields) ? extracted.missingFields : [],
    rawText: extracted.rawText || undefined,
    error: extracted.error || undefined,
  }

  // If extraction failed, return early
  if (!result.success || !result.data) {
    return result
  }

  // Validate and normalize the data object
  const data = result.data as ExtractedDocumentData

  // Ensure items array exists
  if (!data.items || !Array.isArray(data.items)) {
    data.items = []
    result.missingFields.push('items')
  }

  // Normalize items: ensure numeric fields are numbers
  data.items = data.items.map((item, index) => ({
    description: item.description || `Item ${index + 1}`,
    quantity: item.quantity ? parseFloat(String(item.quantity)) : undefined,
    unitPrice: item.unitPrice ? parseFloat(String(item.unitPrice)) : undefined,
    amount: item.amount ? parseFloat(String(item.amount)) :
            (item.quantity && item.unitPrice ?
              parseFloat(String(item.quantity)) * parseFloat(String(item.unitPrice)) :
              undefined),
  }))

  // Normalize numeric fields
  if (data.subtotal) data.subtotal = parseFloat(String(data.subtotal))
  if (data.taxRate) data.taxRate = parseFloat(String(data.taxRate))
  if (data.taxAmount) data.taxAmount = parseFloat(String(data.taxAmount))
  if (data.deliveryCharge) data.deliveryCharge = parseFloat(String(data.deliveryCharge))
  if (data.total) data.total = parseFloat(String(data.total))

  // Calculate missing financial fields if possible
  if (!data.subtotal && data.items.length > 0) {
    const calculatedSubtotal = data.items.reduce((sum, item) => {
      return sum + (item.amount || 0)
    }, 0)
    if (calculatedSubtotal > 0) {
      data.subtotal = calculatedSubtotal
    }
  }

  if (!data.taxAmount && data.subtotal && data.taxRate) {
    data.taxAmount = data.subtotal * data.taxRate
  }

  if (!data.total && data.subtotal !== undefined) {
    data.total = data.subtotal + (data.taxAmount || 0) + (data.deliveryCharge || 0)
  }

  // Detect missing critical fields
  const criticalFields = ['client.name', 'currency', 'items']
  criticalFields.forEach(field => {
    if (field === 'client.name' && !data.client?.name) {
      if (!result.missingFields.includes('client.name')) {
        result.missingFields.push('client.name')
      }
    }
    if (field === 'currency' && !data.currency) {
      if (!result.missingFields.includes('currency')) {
        result.missingFields.push('currency')
      }
    }
    if (field === 'items' && data.items.length === 0) {
      if (!result.missingFields.includes('items')) {
        result.missingFields.push('items')
      }
    }
  })

  result.data = data
  return result
}

/**
 * Helper to format vision extraction result for user display
 */
export function formatVisionResponse(result: VisionExtractionResult): string {
  if (!result.success) {
    return `⚠️ Could not extract data from image: ${result.error || 'Unknown error'}`
  }

  const { data, documentType, confidence, missingFields } = result

  let response = `✅ Extracted ${documentType} data (${Math.round(confidence * 100)}% confidence)\n\n`

  if (data?.client?.name) {
    response += `**Client:** ${data.client.name}\n`
  }

  if (data?.business?.name) {
    response += `**Business:** ${data.business.name}\n`
  }

  if (data?.currency) {
    response += `**Currency:** ${data.currency}\n`
  }

  if (data?.items && data.items.length > 0) {
    response += `\n**Items:**\n`
    data.items.forEach((item, i) => {
      response += `${i + 1}. ${item.description}`
      if (item.quantity) response += ` (x${item.quantity})`
      if (item.unitPrice) response += ` @ ${item.unitPrice}`
      if (item.amount) response += ` = ${item.amount}`
      response += `\n`
    })
  }

  if (data?.total) {
    response += `\n**Total:** ${data.currency || ''} ${data.total}\n`
  }

  if (missingFields.length > 0) {
    response += `\n⚠️ **Missing information:** ${missingFields.join(', ')}\n`
    response += `Please provide these details to complete the document.`
  } else {
    response += `\n✅ All required information extracted! Ready to create document.`
  }

  return response
}
