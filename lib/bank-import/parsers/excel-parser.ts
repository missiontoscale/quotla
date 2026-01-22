import * as XLSX from 'xlsx'
import { ParsedTransaction, ParserResult, NIGERIAN_BANK_FORMATS, BankFormat } from '@/types/bank-import'

interface ColumnMapping {
  dateIndex: number
  descriptionIndex: number
  amountIndex: number
  creditIndex?: number
  debitIndex?: number
  balanceIndex?: number
  referenceIndex?: number
}

/**
 * Parse Excel bank statement file (xlsx, xls)
 */
export async function parseExcel(
  fileBuffer: ArrayBuffer,
  bankHint?: string
): Promise<ParserResult> {
  try {
    // Read workbook
    const workbook = XLSX.read(fileBuffer, { type: 'array', cellDates: true })

    if (workbook.SheetNames.length === 0) {
      return {
        success: false,
        transactions: [],
        error: 'Excel file contains no sheets',
      }
    }

    // Use first sheet or find sheet with transaction data
    const sheetName = findTransactionSheet(workbook) || workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]

    // Convert to JSON
    const data: unknown[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' })

    if (data.length < 2) {
      return {
        success: false,
        transactions: [],
        error: 'Sheet is empty or has insufficient data',
      }
    }

    // Find header row (might not be first row)
    const { headerRowIndex, headers } = findHeaderRow(data)

    if (headerRowIndex === -1 || headers.length === 0) {
      return {
        success: false,
        transactions: [],
        error: 'Could not find header row with date and description columns',
      }
    }

    // Detect bank format and column mapping
    const format = bankHint
      ? NIGERIAN_BANK_FORMATS[bankHint.toLowerCase()] || NIGERIAN_BANK_FORMATS.generic
      : detectBankFormat(headers)

    const columnMapping = mapColumns(headers, format)

    if (!columnMapping) {
      return {
        success: false,
        transactions: [],
        error: 'Could not identify required columns (date, description, amount)',
      }
    }

    // Parse transactions
    const transactions: ParsedTransaction[] = []
    const warnings: string[] = []

    for (let i = headerRowIndex + 1; i < data.length; i++) {
      const row = data[i] as unknown[]

      if (!row || row.length === 0 || row.every((cell) => !cell)) {
        continue // Skip empty rows
      }

      try {
        const transaction = parseTransactionRow(row, columnMapping, format, headers)
        if (transaction) {
          transactions.push(transaction)
        }
      } catch (err) {
        warnings.push(`Row ${i + 1}: ${err instanceof Error ? err.message : 'Parse error'}`)
      }
    }

    // Detect statement period
    const dates = transactions.map((t) => t.date).sort((a, b) => a.getTime() - b.getTime())
    const periodStart = dates.length > 0 ? dates[0] : undefined
    const periodEnd = dates.length > 0 ? dates[dates.length - 1] : undefined

    return {
      success: true,
      transactions,
      bankName: format.name,
      periodStart,
      periodEnd,
      warnings: warnings.length > 0 ? warnings : undefined,
    }
  } catch (err) {
    return {
      success: false,
      transactions: [],
      error: err instanceof Error ? err.message : 'Failed to parse Excel file',
    }
  }
}

/**
 * Find sheet that likely contains transaction data
 */
function findTransactionSheet(workbook: XLSX.WorkBook): string | null {
  const transactionKeywords = ['transaction', 'statement', 'account', 'history', 'ledger']

  for (const sheetName of workbook.SheetNames) {
    const lowerName = sheetName.toLowerCase()
    if (transactionKeywords.some((keyword) => lowerName.includes(keyword))) {
      return sheetName
    }
  }

  return null
}

/**
 * Find the header row in the data
 */
function findHeaderRow(data: unknown[][]): { headerRowIndex: number; headers: string[] } {
  const datePatterns = ['date', 'trans date', 'transaction date', 'posted', 'value date']
  const descPatterns = ['description', 'narration', 'details', 'remarks', 'memo']

  for (let i = 0; i < Math.min(10, data.length); i++) {
    const row = data[i]
    if (!row) continue

    const rowStrings = row.map((cell) => String(cell || '').toLowerCase().trim())

    const hasDate = datePatterns.some((pattern) =>
      rowStrings.some((cell) => cell.includes(pattern))
    )
    const hasDesc = descPatterns.some((pattern) =>
      rowStrings.some((cell) => cell.includes(pattern))
    )

    if (hasDate && hasDesc) {
      return {
        headerRowIndex: i,
        headers: row.map((cell) => String(cell || '').trim()),
      }
    }
  }

  // If no clear header found, use first non-empty row
  for (let i = 0; i < data.length; i++) {
    const row = data[i]
    if (row && row.some((cell) => cell)) {
      return {
        headerRowIndex: i,
        headers: row.map((cell) => String(cell || '').trim()),
      }
    }
  }

  return { headerRowIndex: -1, headers: [] }
}

/**
 * Detect bank format from headers
 */
function detectBankFormat(headers: string[]): BankFormat {
  const normalizedHeaders = headers.map((h) => h.toLowerCase().trim())

  for (const [, format] of Object.entries(NIGERIAN_BANK_FORMATS)) {
    if (format.name === 'Generic') continue

    let matchCount = 0

    for (const pattern of format.patterns.dateColumn) {
      if (normalizedHeaders.some((h) => h.includes(pattern.toLowerCase()))) {
        matchCount++
      }
    }

    for (const pattern of format.patterns.descriptionColumn) {
      if (normalizedHeaders.some((h) => h.includes(pattern.toLowerCase()))) {
        matchCount++
      }
    }

    if (matchCount >= 2) {
      return format
    }
  }

  return NIGERIAN_BANK_FORMATS.generic
}

/**
 * Map columns from headers using bank format
 */
function mapColumns(headers: string[], format: BankFormat): ColumnMapping | null {
  const normalizedHeaders = headers.map((h) => h.toLowerCase().trim())

  const findColumnIndex = (patterns: string[]): number => {
    for (const pattern of patterns) {
      const index = normalizedHeaders.findIndex((h) => h.includes(pattern.toLowerCase()))
      if (index !== -1) return index
    }
    return -1
  }

  const dateIndex = findColumnIndex(format.patterns.dateColumn)
  const descriptionIndex = findColumnIndex(format.patterns.descriptionColumn)
  const amountIndex = findColumnIndex(format.patterns.amountColumn)
  const creditIndex = format.patterns.creditColumn
    ? findColumnIndex(format.patterns.creditColumn)
    : -1
  const debitIndex = format.patterns.debitColumn ? findColumnIndex(format.patterns.debitColumn) : -1
  const balanceIndex = format.patterns.balanceColumn
    ? findColumnIndex(format.patterns.balanceColumn)
    : -1

  const referencePatterns = ['reference', 'ref', 'transaction id', 'txn id', 'trans ref']
  const referenceIndex = findColumnIndex(referencePatterns)

  if (dateIndex === -1 || descriptionIndex === -1) {
    return null
  }

  if (amountIndex === -1 && creditIndex === -1 && debitIndex === -1) {
    return null
  }

  return {
    dateIndex,
    descriptionIndex,
    amountIndex: amountIndex !== -1 ? amountIndex : -1,
    creditIndex: creditIndex !== -1 ? creditIndex : undefined,
    debitIndex: debitIndex !== -1 ? debitIndex : undefined,
    balanceIndex: balanceIndex !== -1 ? balanceIndex : undefined,
    referenceIndex: referenceIndex !== -1 ? referenceIndex : undefined,
  }
}

/**
 * Parse a single transaction row
 */
function parseTransactionRow(
  row: unknown[],
  mapping: ColumnMapping,
  format: BankFormat,
  headers: string[]
): ParsedTransaction | null {
  // Parse date
  const dateValue = row[mapping.dateIndex]
  const date = parseDate(dateValue, format.dateFormats)

  if (!date) {
    throw new Error(`Invalid date: ${dateValue}`)
  }

  // Parse description
  const description = String(row[mapping.descriptionIndex] || '').trim()
  if (!description) {
    return null
  }

  // Parse amount
  let amount: number

  if (mapping.amountIndex !== -1 && row[mapping.amountIndex]) {
    amount = parseAmount(row[mapping.amountIndex])
  } else if (mapping.creditIndex !== undefined && mapping.debitIndex !== undefined) {
    const credit = mapping.creditIndex !== undefined ? parseAmount(row[mapping.creditIndex]) : 0
    const debit = mapping.debitIndex !== undefined ? parseAmount(row[mapping.debitIndex]) : 0
    amount = credit - debit
  } else {
    throw new Error('Could not determine transaction amount')
  }

  if (amount === 0) {
    return null
  }

  // Parse balance
  const balance =
    mapping.balanceIndex !== undefined && row[mapping.balanceIndex]
      ? parseAmount(row[mapping.balanceIndex])
      : undefined

  // Parse reference
  const reference =
    mapping.referenceIndex !== undefined ? String(row[mapping.referenceIndex] || '').trim() : undefined

  // Build raw data object
  const rawData: Record<string, string> = {}
  headers.forEach((header, index) => {
    if (row[index] !== undefined && row[index] !== null && row[index] !== '') {
      rawData[header] = String(row[index])
    }
  })

  return {
    date,
    description,
    amount,
    balance,
    reference: reference || undefined,
    rawData,
  }
}

/**
 * Parse date from Excel cell value
 */
function parseDate(value: unknown, formats: string[]): Date | null {
  if (!value) return null

  // Excel might already provide a Date object
  if (value instanceof Date && !isNaN(value.getTime())) {
    return value
  }

  // Handle Excel serial date number
  if (typeof value === 'number') {
    const excelEpoch = new Date(1899, 11, 30)
    const date = new Date(excelEpoch.getTime() + value * 86400000)
    if (!isNaN(date.getTime())) {
      return date
    }
  }

  // Handle string date
  if (typeof value === 'string') {
    return parseDateString(value, formats)
  }

  return null
}

/**
 * Parse date string
 */
function parseDateString(dateStr: string, formats: string[]): Date | null {
  const cleaned = dateStr.trim()

  // Try ISO format first
  const isoDate = new Date(cleaned)
  if (!isNaN(isoDate.getTime())) {
    return isoDate
  }

  const patterns = [
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
    /^(\d{1,2})-(\d{1,2})-(\d{4})$/,
    /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
    /^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/,
    /^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/,
  ]

  const months: Record<string, number> = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
  }

  for (const pattern of patterns) {
    const match = cleaned.match(pattern)
    if (match) {
      let day: number, month: number, year: number

      if (pattern.source.startsWith('^(\\d{4})')) {
        year = parseInt(match[1])
        month = parseInt(match[2]) - 1
        day = parseInt(match[3])
      } else if (match[2].match(/[A-Za-z]/)) {
        day = parseInt(match[1])
        month = months[match[2].toLowerCase()]
        year = parseInt(match[3])
      } else {
        day = parseInt(match[1])
        month = parseInt(match[2]) - 1
        year = parseInt(match[3])
      }

      const date = new Date(year, month, day)
      if (!isNaN(date.getTime())) {
        return date
      }
    }
  }

  return null
}

/**
 * Parse amount from cell value
 */
function parseAmount(value: unknown): number {
  if (typeof value === 'number') {
    return value
  }

  if (typeof value !== 'string' || !value.trim()) {
    return 0
  }

  let cleaned = value.trim()

  const isNegative =
    cleaned.startsWith('-') ||
    cleaned.startsWith('(') ||
    cleaned.toLowerCase().includes('dr') ||
    cleaned.toLowerCase().includes('debit')

  cleaned = cleaned
    .replace(/[₦$€£¥N]/g, '')
    .replace(/,/g, '')
    .replace(/\s/g, '')
    .replace(/[()]/g, '')
    .replace(/DR|CR|debit|credit/gi, '')
    .trim()

  if (!cleaned || cleaned === '-') return 0

  const amount = parseFloat(cleaned)

  if (isNaN(amount)) return 0

  return isNegative && amount > 0 ? -amount : amount
}
