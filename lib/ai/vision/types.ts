/**
 * Type definitions for Vision AI document extraction
 */

export interface ExtractedBusinessInfo {
  name?: string
  address?: string
  phone?: string
  email?: string
}

export interface ExtractedClientInfo {
  name?: string
  address?: string
  phone?: string
  email?: string
}

export interface ExtractedItem {
  description: string
  quantity?: number
  unitPrice?: number
  amount?: number
}

export interface ExtractedDocumentData {
  business?: ExtractedBusinessInfo
  client?: ExtractedClientInfo
  documentNumber?: string
  date?: string
  dueDate?: string
  currency?: string
  items: ExtractedItem[]
  subtotal?: number
  taxRate?: number
  taxAmount?: number
  deliveryCharge?: number
  total?: number
  notes?: string
  paymentTerms?: string
}

export interface VisionExtractionResult {
  success: boolean
  documentType: 'invoice' | 'quote' | 'receipt' | 'business_card' | 'unknown'
  confidence: number
  data: ExtractedDocumentData | null
  missingFields: string[]
  rawText?: string
  error?: string
}
