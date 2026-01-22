// Bank Statement Import Types

export interface BankStatementImport {
  id: string
  user_id: string

  // File info
  file_name: string
  file_type: 'csv' | 'pdf' | 'xlsx' | 'xls'
  file_url?: string
  file_size?: number

  // Bank info
  bank_name?: string
  account_number?: string
  statement_period_start?: string
  statement_period_end?: string

  // Import statistics
  total_transactions: number
  imported_expenses: number
  imported_income: number
  skipped_transactions: number

  // Status
  status: 'processing' | 'completed' | 'failed' | 'undone'
  error_message?: string

  // Metadata
  created_at: string
  completed_at?: string
}

export interface ParsedTransaction {
  // Raw data from bank statement
  date: Date
  description: string
  amount: number // Negative for expenses, positive for income
  balance?: number
  reference?: string

  // Original row data for debugging
  rawData: Record<string, string>
}

export interface CategorizedTransaction extends ParsedTransaction {
  // Categorization results
  type: 'expense' | 'income' | 'transfer' | 'unknown'
  category?: string
  confidence: number // 0 to 1

  // Matching results
  matchedInvoiceId?: string
  matchedCustomerName?: string

  // Import status
  imported: boolean
  importedRecordId?: string
  error?: string
}

export interface ParserResult {
  success: boolean
  transactions: ParsedTransaction[]
  bankName?: string
  accountNumber?: string
  periodStart?: Date
  periodEnd?: Date
  error?: string
  warnings?: string[]
}

export interface ImportResult {
  success: boolean
  batchId: string
  summary: {
    totalTransactions: number
    importedExpenses: number
    importedIncome: number
    skippedTransactions: number
    newInvoicesCreated: number
    invoicesMarkedPaid: number
  }
  transactions: CategorizedTransaction[]
  errors?: string[]
}

export interface ImportHistoryItem {
  id: string
  file_name: string
  file_type: string
  bank_name?: string
  total_transactions: number
  imported_expenses: number
  imported_income: number
  status: string
  created_at: string
}

// Bank format detection patterns
export interface BankFormat {
  name: string
  patterns: {
    dateColumn: string[]
    descriptionColumn: string[]
    amountColumn: string[]
    creditColumn?: string[]
    debitColumn?: string[]
    balanceColumn?: string[]
  }
  dateFormats: string[]
}

// Nigerian bank formats
export const NIGERIAN_BANK_FORMATS: Record<string, BankFormat> = {
  gtbank: {
    name: 'GTBank',
    patterns: {
      dateColumn: ['Transaction Date', 'Date', 'Txn Date'],
      descriptionColumn: ['Description', 'Narration', 'Details'],
      amountColumn: ['Amount'],
      creditColumn: ['Credit', 'CR'],
      debitColumn: ['Debit', 'DR'],
      balanceColumn: ['Balance', 'Running Balance'],
    },
    dateFormats: ['DD-MMM-YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'],
  },
  access: {
    name: 'Access Bank',
    patterns: {
      dateColumn: ['Trans Date', 'Transaction Date', 'Date'],
      descriptionColumn: ['Narration', 'Description'],
      amountColumn: ['Amount'],
      creditColumn: ['Credit'],
      debitColumn: ['Debit'],
      balanceColumn: ['Balance'],
    },
    dateFormats: ['DD-MMM-YYYY', 'DD/MM/YYYY'],
  },
  firstbank: {
    name: 'First Bank',
    patterns: {
      dateColumn: ['Date', 'Trans Date', 'Value Date'],
      descriptionColumn: ['Narration', 'Description', 'Remarks'],
      amountColumn: ['Amount'],
      creditColumn: ['Credit', 'CR Amount'],
      debitColumn: ['Debit', 'DR Amount'],
      balanceColumn: ['Balance', 'Book Balance'],
    },
    dateFormats: ['DD/MM/YYYY', 'DD-MM-YYYY'],
  },
  uba: {
    name: 'UBA',
    patterns: {
      dateColumn: ['Trans Date', 'Date', 'Posted Date'],
      descriptionColumn: ['Narration', 'Description'],
      amountColumn: ['Amount'],
      creditColumn: ['Credit'],
      debitColumn: ['Debit'],
      balanceColumn: ['Balance'],
    },
    dateFormats: ['DD-MMM-YYYY', 'DD/MM/YYYY'],
  },
  zenith: {
    name: 'Zenith Bank',
    patterns: {
      dateColumn: ['Transaction Date', 'Date', 'Value Date'],
      descriptionColumn: ['Description', 'Narration'],
      amountColumn: ['Amount'],
      creditColumn: ['Credit', 'CR'],
      debitColumn: ['Debit', 'DR'],
      balanceColumn: ['Balance'],
    },
    dateFormats: ['DD/MM/YYYY', 'DD-MMM-YYYY'],
  },
  generic: {
    name: 'Generic',
    patterns: {
      dateColumn: ['Date', 'Trans Date', 'Transaction Date', 'Posted Date', 'Value Date'],
      descriptionColumn: ['Description', 'Narration', 'Details', 'Remarks', 'Memo'],
      amountColumn: ['Amount', 'Transaction Amount'],
      creditColumn: ['Credit', 'CR', 'Deposit', 'Money In'],
      debitColumn: ['Debit', 'DR', 'Withdrawal', 'Money Out'],
      balanceColumn: ['Balance', 'Running Balance', 'Available Balance'],
    },
    dateFormats: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD', 'DD-MMM-YYYY', 'DD-MM-YYYY'],
  },
}

// Expense category patterns for auto-categorization
export const EXPENSE_CATEGORY_PATTERNS: Array<{
  pattern: RegExp
  category: string
  type: 'expense' | 'income' | 'transfer'
}> = [
  // Expenses
  { pattern: /payroll|salary|wage|staff/i, category: 'Professional Services', type: 'expense' },
  { pattern: /uber|bolt|taxi|transport|bus|cab/i, category: 'Travel & Transport', type: 'expense' },
  { pattern: /electricity|power|nepa|ekedc|ikedc|aedc|phed/i, category: 'Utilities', type: 'expense' },
  { pattern: /airtime|mtn|glo|airtel|9mobile|data|internet|wifi/i, category: 'Utilities', type: 'expense' },
  { pattern: /rent|lease|accommodation/i, category: 'Rent & Facilities', type: 'expense' },
  { pattern: /software|subscription|saas|license|hosting/i, category: 'Software & Tools', type: 'expense' },
  { pattern: /office|stationery|supplies|paper|printer/i, category: 'Office Supplies', type: 'expense' },
  { pattern: /marketing|advert|promotion|campaign|ads/i, category: 'Marketing & Advertising', type: 'expense' },
  { pattern: /training|course|seminar|workshop|conference/i, category: 'Training & Development', type: 'expense' },
  { pattern: /equipment|hardware|laptop|computer|phone|device/i, category: 'Equipment & Hardware', type: 'expense' },
  { pattern: /maintenance|repair|service|fixing/i, category: 'Miscellaneous', type: 'expense' },
  { pattern: /fuel|petrol|diesel|gas station/i, category: 'Travel & Transport', type: 'expense' },
  { pattern: /dstv|gotv|cable|netflix|spotify/i, category: 'Software & Tools', type: 'expense' },
  { pattern: /insurance|hmo|health/i, category: 'Professional Services', type: 'expense' },
  { pattern: /bank charge|vat|stamp duty|sms alert/i, category: 'Miscellaneous', type: 'expense' },
  { pattern: /pos|atm withdrawal|cash withdrawal/i, category: 'Miscellaneous', type: 'expense' },

  // Income patterns
  { pattern: /payment received|credit alert|inward/i, type: 'income', category: '' },
  { pattern: /transfer from|tfr from|frm/i, type: 'income', category: '' },
  { pattern: /deposit|lodgement/i, type: 'income', category: '' },

  // Transfer patterns (internal, should be skipped)
  { pattern: /transfer to own|self transfer|same name/i, type: 'transfer', category: '' },
  { pattern: /inter account|between accounts/i, type: 'transfer', category: '' },
]
