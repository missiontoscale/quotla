/**
 * Extracts text content from various file types
 * Supports: text files, JSON, PDFs (basic), images (via description)
 */

export interface FileExtractionResult {
  type: 'text' | 'image'
  content?: string
  fileName: string
  fileSize: string
  mimeType: string
  base64Data?: string
}

export async function extractFileContent(file: File): Promise<string | FileExtractionResult> {
  const fileName = file.name
  const fileType = file.type
  const fileSize = (file.size / 1024).toFixed(1)

  try {
    // Handle text-based files
    if (
      fileType.startsWith('text/') ||
      fileType === 'application/json' ||
      fileType === 'application/xml' ||
      fileName.endsWith('.txt') ||
      fileName.endsWith('.json') ||
      fileName.endsWith('.md') ||
      fileName.endsWith('.csv') ||
      fileName.endsWith('.xml')
    ) {
      const text = await file.text()
      return `File: ${fileName} (${fileSize} KB)\n\nContent:\n${text}`
    }

    // Handle PDF files (basic text extraction)
    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      // For now, acknowledge the PDF but note that full OCR/extraction requires additional libraries
      const arrayBuffer = await file.arrayBuffer()
      const text = new TextDecoder().decode(arrayBuffer)

      // Try to extract readable text (this is a basic approach)
      const readableText = text
        .replace(/[^\x20-\x7E\n]/g, ' ') // Keep only printable ASCII and newlines
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim()

      if (readableText.length > 100) {
        return `File: ${fileName} (PDF, ${fileSize} KB)\n\nExtracted text (basic extraction):\n${readableText.slice(0, 5000)}${readableText.length > 5000 ? '...\n\n[Content truncated for length]' : ''}`
      }

      return `File: ${fileName} (PDF, ${fileSize} KB)\n\n[PDF file uploaded. Basic text extraction found limited readable content. For better PDF processing, consider using OCR services or uploading the content as text.]`
    }

    // Handle images - convert to base64 for vision API processing
    if (fileType.startsWith('image/')) {
      const arrayBuffer = await file.arrayBuffer()
      const base64 = Buffer.from(arrayBuffer).toString('base64')

      return {
        type: 'image',
        fileName,
        fileSize,
        mimeType: fileType,
        base64Data: base64
      }
    }

    // Handle Word documents
    if (
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileName.endsWith('.docx')
    ) {
      return `File: ${fileName} (Word document, ${fileSize} KB)\n\n[Word document uploaded. To extract content, please save as .txt or copy-paste the text directly.]`
    }

    // Handle Excel/spreadsheets
    if (
      fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      fileType === 'application/vnd.ms-excel' ||
      fileName.endsWith('.xlsx') ||
      fileName.endsWith('.xls')
    ) {
      return `File: ${fileName} (Spreadsheet, ${fileSize} KB)\n\n[Spreadsheet uploaded. To extract content, please export as .csv or copy-paste the data.]`
    }

    // Fallback for unknown file types
    return `File: ${fileName} (${fileType || 'unknown type'}, ${fileSize} KB)\n\n[File uploaded but automatic content extraction is not supported for this file type. Please provide the content in a text format (.txt, .md, .json, .csv) or copy-paste the relevant information.]`

  } catch (error) {
    console.error('Error extracting file content:', error)
    return `File: ${fileName} (${fileType}, ${fileSize} KB)\n\n[Error reading file content. Please try uploading again or provide the information in a different format.]`
  }
}

/**
 * Checks if a file type is supported for content extraction
 */
export function isSupportedFileType(file: File): boolean {
  const fileType = file.type
  const fileName = file.name.toLowerCase()

  // Text-based files
  if (
    fileType.startsWith('text/') ||
    fileType === 'application/json' ||
    fileType === 'application/xml' ||
    fileName.endsWith('.txt') ||
    fileName.endsWith('.json') ||
    fileName.endsWith('.md') ||
    fileName.endsWith('.csv') ||
    fileName.endsWith('.xml')
  ) {
    return true
  }

  // PDFs (basic support)
  if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
    return true
  }

  // Images (for vision models)
  if (fileType.startsWith('image/')) {
    return true
  }

  return false
}

/**
 * Gets a maximum safe file size for processing (in bytes)
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

/**
 * Validates file size
 */
export function isFileSizeValid(file: File): boolean {
  return file.size <= MAX_FILE_SIZE
}
