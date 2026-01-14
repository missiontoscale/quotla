import { supabase } from '@/lib/supabase/client'

/**
 * Generate a sequential invoice number for a user
 * Format: INV-YYYY-NNNN (e.g., INV-2024-0001)
 */
export async function generateInvoiceNumber(userId: string): Promise<string> {
  try {
    // Get the current year
    const year = new Date().getFullYear()

    // Get the latest invoice for this user in the current year
    const { data: latestInvoice, error } = await supabase
      .from('invoices')
      .select('invoice_number')
      .eq('user_id', userId)
      .like('invoice_number', `INV-${year}-%`)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 means no rows returned, which is fine
      console.error('Error fetching latest invoice:', error)
      // Fallback to timestamp-based
      return `INV-${Date.now()}`
    }

    let sequenceNumber = 1

    if (latestInvoice?.invoice_number) {
      // Extract the sequence number from the latest invoice
      const match = latestInvoice.invoice_number.match(/INV-\d{4}-(\d+)/)
      if (match && match[1]) {
        sequenceNumber = parseInt(match[1], 10) + 1
      }
    }

    // Format the sequence number with leading zeros (4 digits)
    const paddedSequence = sequenceNumber.toString().padStart(4, '0')

    return `INV-${year}-${paddedSequence}`
  } catch (error) {
    console.error('Error generating invoice number:', error)
    // Fallback to timestamp-based
    return `INV-${Date.now()}`
  }
}

/**
 * Generate a sequential quote number for a user
 * Format: QUO-YYYY-NNNN (e.g., QUO-2024-0001)
 */
export async function generateQuoteNumber(userId: string): Promise<string> {
  try {
    // Get the current year
    const year = new Date().getFullYear()

    // Get the latest quote for this user in the current year
    const { data: latestQuote, error } = await supabase
      .from('quotes')
      .select('quote_number')
      .eq('user_id', userId)
      .like('quote_number', `QUO-${year}-%`)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching latest quote:', error)
      // Fallback to timestamp-based
      return `QUO-${Date.now()}`
    }

    let sequenceNumber = 1

    if (latestQuote?.quote_number) {
      // Extract the sequence number from the latest quote
      const match = latestQuote.quote_number.match(/QUO-\d{4}-(\d+)/)
      if (match && match[1]) {
        sequenceNumber = parseInt(match[1], 10) + 1
      }
    }

    // Format the sequence number with leading zeros (4 digits)
    const paddedSequence = sequenceNumber.toString().padStart(4, '0')

    return `QUO-${year}-${paddedSequence}`
  } catch (error) {
    console.error('Error generating quote number:', error)
    // Fallback to timestamp-based
    return `QUO-${Date.now()}`
  }
}

/**
 * Validate invoice number format
 */
export function isValidInvoiceNumber(invoiceNumber: string): boolean {
  // Allow both formats: INV-YYYY-NNNN and INV-timestamp
  const sequentialPattern = /^INV-\d{4}-\d{4}$/
  const timestampPattern = /^INV-\d{13}$/

  return sequentialPattern.test(invoiceNumber) || timestampPattern.test(invoiceNumber)
}

/**
 * Validate quote number format
 */
export function isValidQuoteNumber(quoteNumber: string): boolean {
  // Allow both formats: QUO-YYYY-NNNN and QUO-timestamp
  const sequentialPattern = /^QUO-\d{4}-\d{4}$/
  const timestampPattern = /^QUO-\d{13}$/

  return sequentialPattern.test(quoteNumber) || timestampPattern.test(quoteNumber)
}

/**
 * Parse invoice number to extract year and sequence
 */
export function parseInvoiceNumber(invoiceNumber: string): { year?: number; sequence?: number; isTimestamp: boolean } {
  const sequentialMatch = invoiceNumber.match(/^INV-(\d{4})-(\d{4})$/)

  if (sequentialMatch) {
    return {
      year: parseInt(sequentialMatch[1], 10),
      sequence: parseInt(sequentialMatch[2], 10),
      isTimestamp: false
    }
  }

  const timestampMatch = invoiceNumber.match(/^INV-(\d{13})$/)
  if (timestampMatch) {
    return {
      isTimestamp: true
    }
  }

  return { isTimestamp: false }
}
