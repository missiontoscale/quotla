import { createClient } from '@/lib/supabase/server'
import { ParsedTransaction } from '@/types/bank-import'

interface Invoice {
  id: string
  invoice_number: string
  total: number
  status: string
  issue_date: string
  due_date: string | null
  client_id: string | null
  client?: {
    full_name: string
    company_name?: string
  }
}

interface MatchResult {
  invoiceId: string
  invoiceNumber: string
  confidence: number
  matchType: 'amount' | 'customer' | 'reference' | 'combined'
}

/**
 * Find matching invoice for an income transaction
 */
export async function findMatchingInvoice(
  transaction: ParsedTransaction,
  userId: string
): Promise<MatchResult | null> {
  if (transaction.amount <= 0) {
    return null // Only match income (positive amounts)
  }

  const supabase = await createClient()
  const transactionDate = transaction.date
  const transactionAmount = Math.abs(transaction.amount)

  // Search for invoices within a reasonable date range
  // Income could arrive before or after invoice date
  const searchStartDate = new Date(transactionDate)
  searchStartDate.setDate(searchStartDate.getDate() - 60) // 60 days before

  const searchEndDate = new Date(transactionDate)
  searchEndDate.setDate(searchEndDate.getDate() + 7) // 7 days after

  // Get pending/sent invoices (not already paid)
  const { data: invoices, error } = await supabase
    .from('invoices')
    .select(
      `
      id,
      invoice_number,
      total,
      status,
      issue_date,
      due_date,
      client_id,
      customers:client_id (
        full_name,
        company_name
      )
    `
    )
    .eq('user_id', userId)
    .in('status', ['sent', 'draft', 'overdue'])
    .gte('issue_date', searchStartDate.toISOString().split('T')[0])
    .lte('issue_date', searchEndDate.toISOString().split('T')[0])
    .order('total', { ascending: false })

  if (error || !invoices || invoices.length === 0) {
    return null
  }

  const candidates: Array<Invoice & { matchScore: number; matchType: MatchResult['matchType'] }> = []

  for (const inv of invoices) {
    const invoice = inv as unknown as Invoice & { customers: { full_name: string; company_name?: string } | null }
    let matchScore = 0
    let matchType: MatchResult['matchType'] = 'amount'

    // Check amount match (exact or close)
    const amountDiff = Math.abs(invoice.total - transactionAmount)
    const amountDiffPercent = (amountDiff / invoice.total) * 100

    if (amountDiff < 0.01) {
      // Exact match
      matchScore += 50
    } else if (amountDiffPercent < 1) {
      // Within 1%
      matchScore += 40
    } else if (amountDiffPercent < 5) {
      // Within 5%
      matchScore += 25
    } else {
      // Amount doesn't match well, skip
      continue
    }

    // Check if invoice number appears in description
    const description = transaction.description.toLowerCase()
    const invoiceNum = invoice.invoice_number.toLowerCase()

    if (description.includes(invoiceNum)) {
      matchScore += 40
      matchType = 'reference'
    }

    // Check if customer name appears in description
    if (invoice.customers) {
      const customerName = invoice.customers.full_name.toLowerCase()
      const companyName = invoice.customers.company_name?.toLowerCase()

      if (description.includes(customerName)) {
        matchScore += 30
        matchType = matchType === 'reference' ? 'combined' : 'customer'
      } else if (companyName && description.includes(companyName)) {
        matchScore += 30
        matchType = matchType === 'reference' ? 'combined' : 'customer'
      } else {
        // Check for partial name match (at least first word)
        const nameParts = customerName.split(' ')
        if (nameParts.some((part) => part.length > 2 && description.includes(part))) {
          matchScore += 15
        }
      }
    }

    // Check date proximity (closer is better)
    const daysDiff = Math.abs(
      (transactionDate.getTime() - new Date(invoice.issue_date).getTime()) /
        (1000 * 60 * 60 * 24)
    )

    if (daysDiff <= 7) {
      matchScore += 10
    } else if (daysDiff <= 30) {
      matchScore += 5
    }

    if (matchScore >= 40) {
      // Minimum threshold for a potential match
      candidates.push({
        ...invoice,
        matchScore,
        matchType,
      })
    }
  }

  if (candidates.length === 0) {
    return null
  }

  // Sort by match score descending
  candidates.sort((a, b) => b.matchScore - a.matchScore)

  const best = candidates[0]

  // Convert score to confidence (0-1)
  const confidence = Math.min(best.matchScore / 100, 0.99)

  return {
    invoiceId: best.id,
    invoiceNumber: best.invoice_number,
    confidence,
    matchType: best.matchType,
  }
}

/**
 * Mark invoice as paid
 */
export async function markInvoiceAsPaid(
  invoiceId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('invoices')
    .update({
      status: 'paid',
      updated_at: new Date().toISOString(),
    })
    .eq('id', invoiceId)
    .eq('user_id', userId)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * Create a new invoice from income transaction
 */
export async function createInvoiceFromTransaction(
  transaction: ParsedTransaction,
  userId: string,
  currency: string = 'NGN'
): Promise<{ success: boolean; invoiceId?: string; error?: string }> {
  const supabase = await createClient()

  // Generate invoice number
  const timestamp = Date.now().toString(36).toUpperCase()
  const invoiceNumber = `INV-${timestamp}`

  // Extract potential customer name from description
  const customerName = extractCustomerName(transaction.description) || 'Bank Import Customer'

  // First, create or find customer
  let clientId: string | null = null

  const { data: existingCustomer } = await supabase
    .from('customers')
    .select('id')
    .eq('user_id', userId)
    .ilike('full_name', customerName)
    .limit(1)
    .single()

  if (existingCustomer) {
    clientId = existingCustomer.id
  } else {
    // Create new customer
    const { data: newCustomer, error: customerError } = await supabase
      .from('customers')
      .insert({
        user_id: userId,
        full_name: customerName,
        notes: 'Auto-created from bank statement import',
      })
      .select('id')
      .single()

    if (!customerError && newCustomer) {
      clientId = newCustomer.id
    }
  }

  // Create the invoice
  const { data: invoice, error } = await supabase
    .from('invoices')
    .insert({
      user_id: userId,
      client_id: clientId,
      invoice_number: invoiceNumber,
      title: `Payment - ${transaction.description.substring(0, 50)}`,
      status: 'paid',
      issue_date: transaction.date.toISOString().split('T')[0],
      due_date: transaction.date.toISOString().split('T')[0],
      currency,
      subtotal: transaction.amount,
      tax_rate: 0,
      tax_amount: 0,
      total: transaction.amount,
      notes: `Auto-created from bank statement import.\nOriginal description: ${transaction.description}`,
    })
    .select('id')
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  // Create invoice item
  await supabase.from('invoice_items').insert({
    invoice_id: invoice.id,
    description: transaction.description,
    quantity: 1,
    unit_price: transaction.amount,
    amount: transaction.amount,
    sort_order: 0,
  })

  return { success: true, invoiceId: invoice.id }
}

/**
 * Extract potential customer name from transaction description
 */
function extractCustomerName(description: string): string | null {
  // Common patterns that might indicate customer name
  const patterns = [
    /from\s+([A-Z][A-Za-z\s]+?)(?:\s+(?:ltd|limited|plc|inc|corp))?(?:\s|$)/i,
    /payment\s+(?:from|by)\s+([A-Z][A-Za-z\s]+)/i,
    /([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+)+)/,
  ]

  for (const pattern of patterns) {
    const match = description.match(pattern)
    if (match && match[1]) {
      const name = match[1].trim()
      // Validate: should be 2-50 chars, not all caps (likely abbreviation)
      if (name.length >= 2 && name.length <= 50 && name !== name.toUpperCase()) {
        return name
      }
    }
  }

  return null
}
