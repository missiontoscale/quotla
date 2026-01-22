import { ParserResult } from '@/types/bank-import'
import { parseCSV } from './csv-parser'
import { parseExcel } from './excel-parser'
import { parsePDF, isPDF } from './pdf-parser'

export type SupportedFileType = 'csv' | 'xlsx' | 'xls' | 'pdf'

/**
 * Detect file type from File object
 */
export function detectFileType(file: File): SupportedFileType | null {
  const name = file.name.toLowerCase()
  const type = file.type.toLowerCase()

  if (name.endsWith('.csv') || type === 'text/csv') {
    return 'csv'
  }

  if (
    name.endsWith('.xlsx') ||
    type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ) {
    return 'xlsx'
  }

  if (name.endsWith('.xls') || type === 'application/vnd.ms-excel') {
    return 'xls'
  }

  if (isPDF(file)) {
    return 'pdf'
  }

  return null
}

/**
 * Validate file for bank statement import
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds maximum allowed size (10MB)`,
    }
  }

  const fileType = detectFileType(file)
  if (!fileType) {
    return {
      valid: false,
      error: 'Unsupported file type. Please upload a CSV, Excel (xlsx/xls), or PDF file.',
    }
  }

  return { valid: true }
}

/**
 * Parse bank statement file
 * Automatically detects file type and routes to appropriate parser
 */
export async function parseStatement(
  file: File,
  bankHint?: string
): Promise<ParserResult> {
  // Validate file first
  const validation = validateFile(file)
  if (!validation.valid) {
    return {
      success: false,
      transactions: [],
      error: validation.error,
    }
  }

  const fileType = detectFileType(file)

  try {
    switch (fileType) {
      case 'csv': {
        const content = await file.text()
        return await parseCSV(content, bankHint)
      }

      case 'xlsx':
      case 'xls': {
        const buffer = await file.arrayBuffer()
        return await parseExcel(buffer, bankHint)
      }

      case 'pdf': {
        return await parsePDF(file, bankHint)
      }

      default:
        return {
          success: false,
          transactions: [],
          error: 'Unsupported file type',
        }
    }
  } catch (err) {
    return {
      success: false,
      transactions: [],
      error: err instanceof Error ? err.message : 'Failed to parse file',
    }
  }
}

// Re-export types and utilities
export { parseCSV } from './csv-parser'
export { parseExcel } from './excel-parser'
export { parsePDF, isPDF } from './pdf-parser'
export type { ParserResult } from '@/types/bank-import'
