import {
  ParsedTransaction,
  CategorizedTransaction,
  EXPENSE_CATEGORY_PATTERNS,
} from '@/types/bank-import'

export interface CategorizationResult {
  type: 'expense' | 'income' | 'transfer' | 'unknown'
  category: string
  confidence: number
}

/**
 * Categorize a single transaction using rule-based patterns
 */
export function categorizeTransaction(transaction: ParsedTransaction): CategorizationResult {
  const description = transaction.description.toLowerCase()
  const amount = transaction.amount

  // First, determine type based on amount
  // Negative = expense (money out), Positive = income (money in)
  let baseType: 'expense' | 'income' | 'unknown' =
    amount < 0 ? 'expense' : amount > 0 ? 'income' : 'unknown'

  // Check against patterns
  for (const rule of EXPENSE_CATEGORY_PATTERNS) {
    if (rule.pattern.test(description)) {
      // If pattern suggests transfer, override
      if (rule.type === 'transfer') {
        return {
          type: 'transfer',
          category: '',
          confidence: 0.85,
        }
      }

      // If pattern matches expected type
      if (rule.type === baseType || (rule.type === 'expense' && baseType === 'expense')) {
        return {
          type: rule.type,
          category: rule.category,
          confidence: 0.8,
        }
      }

      // If income pattern but amount is positive (matches)
      if (rule.type === 'income' && baseType === 'income') {
        return {
          type: 'income',
          category: '',
          confidence: 0.75,
        }
      }
    }
  }

  // Default categorization based on amount sign
  if (baseType === 'expense') {
    return {
      type: 'expense',
      category: 'Miscellaneous',
      confidence: 0.5,
    }
  }

  if (baseType === 'income') {
    return {
      type: 'income',
      category: '',
      confidence: 0.5,
    }
  }

  return {
    type: 'unknown',
    category: '',
    confidence: 0.3,
  }
}

/**
 * Categorize multiple transactions
 */
export function categorizeTransactions(
  transactions: ParsedTransaction[]
): CategorizedTransaction[] {
  return transactions.map((tx) => {
    const result = categorizeTransaction(tx)

    return {
      ...tx,
      type: result.type,
      category: result.category || undefined,
      confidence: result.confidence,
      imported: false,
    }
  })
}

/**
 * Extract potential vendor name from transaction description
 */
export function extractVendorName(description: string): string | undefined {
  // Common patterns to clean up
  const cleanPatterns = [
    /\b(pos|atm|web|nip|transfer|trf|tfr|mc)\b/gi,
    /\b\d{6,}\b/g, // Remove long numbers (likely transaction IDs)
    /\b\d{2}\/\d{2}\/\d{2,4}\b/g, // Remove dates
    /\b(from|to|for|via)\b/gi,
    /[_\-\/\\]+/g, // Remove separators
  ]

  let cleaned = description

  for (const pattern of cleanPatterns) {
    cleaned = cleaned.replace(pattern, ' ')
  }

  // Collapse whitespace and trim
  cleaned = cleaned.replace(/\s+/g, ' ').trim()

  // If too short or too long, return undefined
  if (cleaned.length < 3 || cleaned.length > 100) {
    return undefined
  }

  // Capitalize first letter of each word
  return cleaned
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Detect if transaction is a duplicate based on existing transactions
 */
export function isDuplicate(
  transaction: ParsedTransaction,
  existingTransactions: Array<{
    expense_date: string
    amount: number
    bank_transaction_id?: string | null
  }>
): boolean {
  const txDate = transaction.date.toISOString().split('T')[0]
  const txAmount = Math.abs(transaction.amount)

  for (const existing of existingTransactions) {
    // Check by bank transaction ID if available
    if (
      transaction.reference &&
      existing.bank_transaction_id &&
      transaction.reference === existing.bank_transaction_id
    ) {
      return true
    }

    // Check by date and exact amount match
    const existingDate = new Date(existing.expense_date).toISOString().split('T')[0]
    const existingAmount = Math.abs(existing.amount)

    if (txDate === existingDate && Math.abs(txAmount - existingAmount) < 0.01) {
      return true
    }
  }

  return false
}

/**
 * Get summary statistics for categorized transactions
 */
export function getCategorySummary(
  transactions: CategorizedTransaction[]
): {
  totalExpenses: number
  totalIncome: number
  byCategory: Record<string, { count: number; total: number }>
  expenseCount: number
  incomeCount: number
  transferCount: number
  unknownCount: number
} {
  const summary = {
    totalExpenses: 0,
    totalIncome: 0,
    byCategory: {} as Record<string, { count: number; total: number }>,
    expenseCount: 0,
    incomeCount: 0,
    transferCount: 0,
    unknownCount: 0,
  }

  for (const tx of transactions) {
    switch (tx.type) {
      case 'expense':
        summary.expenseCount++
        summary.totalExpenses += Math.abs(tx.amount)
        if (tx.category) {
          if (!summary.byCategory[tx.category]) {
            summary.byCategory[tx.category] = { count: 0, total: 0 }
          }
          summary.byCategory[tx.category].count++
          summary.byCategory[tx.category].total += Math.abs(tx.amount)
        }
        break
      case 'income':
        summary.incomeCount++
        summary.totalIncome += Math.abs(tx.amount)
        break
      case 'transfer':
        summary.transferCount++
        break
      default:
        summary.unknownCount++
    }
  }

  return summary
}
