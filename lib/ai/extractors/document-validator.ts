/**
 * Document validation for AI-extracted data
 * Determines if extracted data is complete enough to auto-create documents
 */

import { ExtractedDocumentData } from '../vision/types'

export interface ValidationResult {
  isComplete: boolean
  canAutoCreate: boolean
  missingRequired: string[]
  missingOptional: string[]
  warnings: string[]
  severity: 'none' | 'warning' | 'error'
}

interface FieldRequirement {
  required: string[]
  optional: string[]
  conditional?: {
    field: string
    requiredIf: string[]
  }[]
}

/**
 * Document field requirements by type
 */
const DOCUMENT_REQUIREMENTS: Record<'quote' | 'invoice', FieldRequirement> = {
  quote: {
    required: [
      'client.name',
      'items',
      'currency'
    ],
    optional: [
      'client.address',
      'client.email',
      'client.phone',
      'notes',
      'valid_until',
      'business.name'
    ],
  },
  invoice: {
    required: [
      'client.name',
      'items',
      'currency',
      'due_date'
    ],
    optional: [
      'client.address',
      'client.email',
      'payment_terms',
      'notes',
      'business.name'
    ],
    conditional: [
      {
        field: 'payment_terms',
        requiredIf: ['due_date']
      }
    ]
  }
}

/**
 * Validate extracted document data
 */
export function validateDocument(
  data: ExtractedDocumentData | null,
  type: 'quote' | 'invoice'
): ValidationResult {
  const result: ValidationResult = {
    isComplete: false,
    canAutoCreate: false,
    missingRequired: [],
    missingOptional: [],
    warnings: [],
    severity: 'none'
  }

  // No data extracted
  if (!data) {
    result.missingRequired = DOCUMENT_REQUIREMENTS[type].required
    result.severity = 'error'
    result.warnings.push('No data could be extracted from the document')
    return result
  }

  const requirements = DOCUMENT_REQUIREMENTS[type]

  // Check required fields
  requirements.required.forEach(fieldPath => {
    if (!getNestedField(data, fieldPath)) {
      result.missingRequired.push(fieldPath)
    }
  })

  // Check optional fields
  requirements.optional.forEach(fieldPath => {
    if (!getNestedField(data, fieldPath)) {
      result.missingOptional.push(fieldPath)
    }
  })

  // Check items specifically
  if (!data.items || data.items.length === 0) {
    if (!result.missingRequired.includes('items')) {
      result.missingRequired.push('items')
    }
    result.warnings.push('No line items found in the document')
  } else {
    // Validate each item has minimum required data
    const incompleteItems = data.items.filter(item =>
      !item.description || (!item.amount && (!item.quantity || !item.unitPrice))
    )

    if (incompleteItems.length > 0) {
      result.warnings.push(
        `${incompleteItems.length} item(s) missing description or pricing information`
      )
    }
  }

  // Check if currency is specified
  if (!data.currency) {
    result.warnings.push('Currency not detected - please specify (USD, NGN, EUR, etc.)')
  }

  // Check conditional requirements
  if (requirements.conditional) {
    requirements.conditional.forEach(condition => {
      const hasCondition = condition.requiredIf.some(field => getNestedField(data, field))
      if (hasCondition && !getNestedField(data, condition.field)) {
        result.missingRequired.push(condition.field)
      }
    })
  }

  // Determine completeness
  result.isComplete = result.missingRequired.length === 0
  result.canAutoCreate = result.isComplete && result.warnings.length === 0

  // Set severity
  if (result.missingRequired.length > 0) {
    result.severity = 'error'
  } else if (result.warnings.length > 0 || result.missingOptional.length > 0) {
    result.severity = 'warning'
  } else {
    result.severity = 'none'
  }

  return result
}

/**
 * Get nested field value from object using dot notation
 */
function getNestedField(obj: any, path: string): any {
  // Handle special case for "items" (check if array has items)
  if (path === 'items') {
    return obj.items && Array.isArray(obj.items) && obj.items.length > 0 ? obj.items : null
  }

  // Handle special case for "due_date" vs "dueDate"
  if (path === 'due_date') {
    return obj.dueDate || obj.due_date
  }

  if (path === 'valid_until') {
    return obj.validUntil || obj.valid_until
  }

  // Standard nested path resolution
  const parts = path.split('.')
  let current = obj

  for (const part of parts) {
    if (current == null) {
      return null
    }
    current = current[part]
  }

  return current
}

/**
 * Generate user-friendly follow-up question for missing fields
 */
export function generateFollowUpQuestion(
  missingFields: string[],
  documentType: 'quote' | 'invoice'
): string {
  if (missingFields.length === 0) {
    return 'All required information is present!'
  }

  const fieldDescriptions: Record<string, string> = {
    'client.name': "the client's name or company name",
    'client.address': "the client's address",
    'client.email': "the client's email address",
    'client.phone': "the client's phone number",
    'due_date': 'the payment due date',
    'dueDate': 'the payment due date',
    'currency': 'the currency (e.g., USD, NGN, EUR, GBP)',
    'items': 'the line items (products/services with quantities and prices)',
    'payment_terms': 'payment terms (e.g., Net 30, Due on receipt)',
    'notes': 'any additional notes or instructions',
    'valid_until': 'how long this quote is valid',
    'business.name': 'your business/company name'
  }

  const questions = missingFields
    .filter(field => fieldDescriptions[field]) // Only include known fields
    .map(field => `• ${fieldDescriptions[field]}`)

  if (questions.length === 0) {
    return `I extracted most of the ${documentType} data, but need some clarification. Please provide the missing information.`
  }

  return `I've extracted most of the ${documentType} information, but I need a few more details:\n\n${questions.join('\n')}\n\nPlease provide these details so I can create the ${documentType}.`
}

/**
 * Merge user-provided data with extracted data
 */
export function mergeDocumentData(
  extracted: ExtractedDocumentData,
  updates: Partial<ExtractedDocumentData>
): ExtractedDocumentData {
  return {
    ...extracted,
    ...updates,
    business: {
      ...extracted.business,
      ...updates.business
    },
    client: {
      ...extracted.client,
      ...updates.client
    },
    items: updates.items || extracted.items,
  }
}

/**
 * Check if document data has minimum viable information
 */
export function hasMinimumViableData(data: ExtractedDocumentData | null): boolean {
  if (!data) return false

  return !!(
    data.client?.name &&
    data.items &&
    data.items.length > 0 &&
    data.currency
  )
}
