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
 * Parse CSV bank statement file
 */
export async function parseCSV(
  fileContent: string,
  bankHint?: string
): Promise<ParserResult> {
  try {
    const lines = fileContent.split(/\r?\n/).filter((line) => line.trim())

    if (lines.length < 2) {
      return {
        success: false,
        transactions: [],
        error: 'File is empty or has insufficient data',
      }
    }

    // Detect delimiter
    const delimiter = detectDelimiter(lines[0])

    // Parse header row
    const headers = parseCSVRow(lines[0], delimiter)

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

    for (let i = 1; i < lines.length; i++) {
      const row = parseCSVRow(lines[i], delimiter)

      if (row.length === 0 || row.every((cell) => !cell.trim())) {
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
      error: err instanceof Error ? err.message : 'Failed to parse CSV file',
    }
  }
}

/**
 * Detect the delimiter used in CSV
 */
function detectDelimiter(headerLine: string): string {
  const delimiters = [',', ';', '\t', '|']
  let maxCount = 0
  let bestDelimiter = ','

  for (const delimiter of delimiters) {
    const count = (headerLine.match(new RegExp(`\\${delimiter}`, 'g')) || []).length
    if (count > maxCount) {
      maxCount = count
      bestDelimiter = delimiter
    }
  }

  return bestDelimiter
}

/**
 * Parse a single CSV row handling quoted values
 */
function parseCSVRow(line: string, delimiter: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }

  result.push(current.trim())
  return result
}

/**
 * Detect bank format from headers
 */
function detectBankFormat(headers: string[]): BankFormat {
  const normalizedHeaders = headers.map((h) => h.toLowerCase().trim())

  for (const [, format] of Object.entries(NIGERIAN_BANK_FORMATS)) {
    if (format.name === 'Generic') continue

    let matchCount = 0
    const totalPatterns =
      format.patterns.dateColumn.length + format.patterns.descriptionColumn.length

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
  const debitIndex = format.patterns.debitColumn
    ? findColumnIndex(format.patterns.debitColumn)
    : -1
  const balanceIndex = format.patterns.balanceColumn
    ? findColumnIndex(format.patterns.balanceColumn)
    : -1

  // Look for reference/transaction ID column
  const referencePatterns = ['reference', 'ref', 'transaction id', 'txn id', 'trans ref']
  const referenceIndex = findColumnIndex(referencePatterns)

  // Must have date and description
  if (dateIndex === -1 || descriptionIndex === -1) {
    return null
  }

  // Must have amount OR credit/debit columns
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
  row: string[],
  mapping: ColumnMapping,
  format: BankFormat,
  headers: string[]
): ParsedTransaction | null {
  // Parse date
  const dateStr = row[mapping.dateIndex]
  const date = parseDate(dateStr, format.dateFormats)

  if (!date) {
    throw new Error(`Invalid date: ${dateStr}`)
  }

  // Parse description
  const description = row[mapping.descriptionIndex]?.trim()
  if (!description) {
    return null // Skip rows without description
  }

  // Parse amount
  let amount: number

  if (mapping.amountIndex !== -1 && row[mapping.amountIndex]?.trim()) {
    amount = parseAmount(row[mapping.amountIndex])
  } else if (mapping.creditIndex !== undefined && mapping.debitIndex !== undefined) {
    const credit = mapping.creditIndex !== undefined ? parseAmount(row[mapping.creditIndex] || '0') : 0
    const debit = mapping.debitIndex !== undefined ? parseAmount(row[mapping.debitIndex] || '0') : 0
    amount = credit - debit
  } else {
    throw new Error('Could not determine transaction amount')
  }

  // Skip zero amount transactions
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
    mapping.referenceIndex !== undefined ? row[mapping.referenceIndex]?.trim() : undefined

  // Build raw data object
  const rawData: Record<string, string> = {}
  headers.forEach((header, index) => {
    if (row[index]) {
      rawData[header] = row[index]
    }
  })

  return {
    date,
    description,
    amount,
    balance,
    reference,
    rawData,
  }
}

/**
 * Parse date string using multiple formats
 */
function parseDate(dateStr: string, formats: string[]): Date | null {
  if (!dateStr?.trim()) return null

  const cleaned = dateStr.trim()

  // Try ISO format first
  const isoDate = new Date(cleaned)
  if (!isNaN(isoDate.getTime())) {
    return isoDate
  }

  // Try common date patterns
  const patterns = [
    // DD/MM/YYYY
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
    // DD-MM-YYYY
    /^(\d{1,2})-(\d{1,2})-(\d{4})$/,
    // YYYY-MM-DD
    /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
    // DD-MMM-YYYY (e.g., 15-Jan-2024)
    /^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/,
    // DD MMM YYYY (e.g., 15 Jan 2024)
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
        // YYYY-MM-DD format
        year = parseInt(match[1])
        month = parseInt(match[2]) - 1
        day = parseInt(match[3])
      } else if (match[2].match(/[A-Za-z]/)) {
        // Month name format
        day = parseInt(match[1])
        month = months[match[2].toLowerCase()]
        year = parseInt(match[3])
      } else {
        // DD/MM/YYYY or DD-MM-YYYY
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
 * Parse amount string to number
 */
function parseAmount(amountStr: string): number {
  if (!amountStr?.trim()) return 0

  let cleaned = amountStr.trim()

  // Check for negative indicators
  const isNegative =
    cleaned.startsWith('-') ||
    cleaned.startsWith('(') ||
    cleaned.toLowerCase().includes('dr') ||
    cleaned.toLowerCase().includes('debit')

  // Remove currency symbols, commas, spaces, and text
  cleaned = cleaned
    .replace(/[₦$€£¥N]/g, '')
    .replace(/,/g, '')
    .replace(/\s/g, '')
    .replace(/[()]/g, '')
    .replace(/DR|CR|debit|credit/gi, '')
    .trim()

  // Handle empty after cleaning
  if (!cleaned || cleaned === '-') return 0

  const amount = parseFloat(cleaned)

  if (isNaN(amount)) return 0

  return isNegative && amount > 0 ? -amount : amount
}
