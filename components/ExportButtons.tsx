'use client'

import { useState } from 'react'
import { exportToPDF, exportToWord, exportToPNG, exportToJSON } from '@/lib/export'
import { QuoteWithItems, InvoiceWithItems, Profile } from '@/types'

interface ExportButtonsProps {
  type: 'quote' | 'invoice'
  data: QuoteWithItems | InvoiceWithItems
  profile: Profile | null
}

export default function ExportButtons({ type, data, profile }: ExportButtonsProps) {
  const [exporting, setExporting] = useState<string | null>(null)
  const [error, setError] = useState('')

  const handleExport = async (format: 'pdf' | 'word' | 'png' | 'json') => {
    setExporting(format)
    setError('')

    try {
      const exportData = { type, data, profile }

      switch (format) {
        case 'pdf':
          await exportToPDF(exportData)
          break
        case 'word':
          await exportToWord(exportData)
          break
        case 'png':
          await exportToPNG(exportData)
          break
        case 'json':
          exportToJSON(exportData)
          break
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed')
    } finally {
      setExporting(null)
    }
  }

  return (
    <div className="relative">
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => handleExport('pdf')}
          disabled={exporting !== null}
          className="btn btn-secondary text-sm"
          title="Export as PDF document"
        >
          {exporting === 'pdf' ? 'Exporting...' : '📄 PDF'}
        </button>
        <button
          onClick={() => handleExport('word')}
          disabled={exporting !== null}
          className="btn btn-secondary text-sm"
          title="Export as Word document"
        >
          {exporting === 'word' ? 'Exporting...' : '📝 Word'}
        </button>
        <button
          onClick={() => handleExport('png')}
          disabled={exporting !== null}
          className="btn btn-secondary text-sm"
          title="Export as PNG image"
        >
          {exporting === 'png' ? 'Exporting...' : '🖼️ PNG'}
        </button>
        <button
          onClick={() => handleExport('json')}
          disabled={exporting !== null}
          className="btn btn-secondary text-sm"
          title="Export as JSON data"
        >
          {exporting === 'json' ? 'Exporting...' : '📋 JSON'}
        </button>
      </div>
      {error && <div className="absolute top-full mt-1 text-red-600 text-xs">{error}</div>}
    </div>
  )
}
