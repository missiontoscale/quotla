import { ParsedTransaction, ParserResult } from '@/types/bank-import'

// External ML API URL
const EXTERNAL_API_URL = (
  process.env.EXTERNAL_AI_API_URL || 'https://quotla-ml.onrender.com'
).replace(/\/$/, '')

interface AIBankStatementResponse {
  success: boolean
  transactions?: Array<{
    date: string
    description: string
    amount: number
    balance?: number
    reference?: string
    type?: 'debit' | 'credit'
  }>
  bank_name?: string
  account_number?: string
  period_start?: string
  period_end?: string
  error?: string
}

/**
 * Parse PDF bank statement using external AI API
 */
export async function parsePDF(
  file: File,
  bankHint?: string
): Promise<ParserResult> {
  try {
    const formData = new FormData()
    formData.append('file', file)

    // Craft a specific prompt for bank statement extraction
    const prompt = `Extract all transactions from this bank statement PDF.
${bankHint ? `This is from ${bankHint} bank.` : ''}

For each transaction, extract:
- date: The transaction date (in YYYY-MM-DD format)
- description: The transaction description/narration
- amount: The transaction amount (negative for debits/outgoing, positive for credits/incoming)
- balance: The balance after transaction (if available)
- reference: Any reference number (if available)
- type: "debit" or "credit"

Also extract:
- bank_name: The bank name if visible
- account_number: Last 4 digits of account number if visible
- period_start: Statement start date (YYYY-MM-DD)
- period_end: Statement end date (YYYY-MM-DD)

Return the data as a JSON object with this structure:
{
  "success": true,
  "transactions": [...],
  "bank_name": "...",
  "account_number": "...",
  "period_start": "...",
  "period_end": "..."
}`

    formData.append('prompt', prompt)

    const response = await fetch(`${EXTERNAL_API_URL}/api/generate`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        transactions: [],
        error: errorData.detail || errorData.error || `API returned ${response.status}`,
      }
    }

    const data = await response.json()

    // The AI response might be in text_output as JSON string or in data field
    let parsedResponse: AIBankStatementResponse

    if (data.data && typeof data.data === 'object') {
      parsedResponse = data.data as AIBankStatementResponse
    } else if (data.text_output) {
      // Try to extract JSON from text output
      try {
        const jsonMatch = data.text_output.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          parsedResponse = JSON.parse(jsonMatch[0])
        } else {
          return {
            success: false,
            transactions: [],
            error: 'Could not extract transaction data from PDF',
          }
        }
      } catch {
        return {
          success: false,
          transactions: [],
          error: 'Failed to parse AI response as JSON',
        }
      }
    } else {
      return {
        success: false,
        transactions: [],
        error: 'No transaction data returned from AI',
      }
    }

    if (!parsedResponse.success || !parsedResponse.transactions) {
      return {
        success: false,
        transactions: [],
        error: parsedResponse.error || 'AI could not extract transactions from PDF',
      }
    }

    // Convert AI response to ParsedTransaction format
    const transactions: ParsedTransaction[] = []
    const warnings: string[] = []

    for (let i = 0; i < parsedResponse.transactions.length; i++) {
      const tx = parsedResponse.transactions[i]

      try {
        const date = new Date(tx.date)
        if (isNaN(date.getTime())) {
          warnings.push(`Transaction ${i + 1}: Invalid date "${tx.date}"`)
          continue
        }

        // Determine amount sign based on type if needed
        let amount = tx.amount
        if (tx.type === 'debit' && amount > 0) {
          amount = -amount
        } else if (tx.type === 'credit' && amount < 0) {
          amount = Math.abs(amount)
        }

        if (amount === 0) {
          continue // Skip zero amount transactions
        }

        transactions.push({
          date,
          description: tx.description || 'No description',
          amount,
          balance: tx.balance,
          reference: tx.reference,
          rawData: tx as unknown as Record<string, string>,
        })
      } catch (err) {
        warnings.push(
          `Transaction ${i + 1}: ${err instanceof Error ? err.message : 'Parse error'}`
        )
      }
    }

    // Parse period dates
    const periodStart = parsedResponse.period_start
      ? new Date(parsedResponse.period_start)
      : undefined
    const periodEnd = parsedResponse.period_end
      ? new Date(parsedResponse.period_end)
      : undefined

    return {
      success: true,
      transactions,
      bankName: parsedResponse.bank_name || bankHint,
      accountNumber: parsedResponse.account_number,
      periodStart:
        periodStart && !isNaN(periodStart.getTime()) ? periodStart : undefined,
      periodEnd: periodEnd && !isNaN(periodEnd.getTime()) ? periodEnd : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
    }
  } catch (err) {
    return {
      success: false,
      transactions: [],
      error: err instanceof Error ? err.message : 'Failed to parse PDF file',
    }
  }
}

/**
 * Check if file is a valid PDF
 */
export function isPDF(file: File): boolean {
  return (
    file.type === 'application/pdf' ||
    file.name.toLowerCase().endsWith('.pdf')
  )
}
