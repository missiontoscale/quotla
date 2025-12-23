'use client'

import { useState } from 'react'
import { exportToPDF, exportToWord, exportToJSON } from '@/lib/export'
import { QuoteWithItems, InvoiceWithItems, Profile } from '@/types'

interface ExportButtonsProps {
  type: 'quote' | 'invoice'
  data: QuoteWithItems | InvoiceWithItems
  profile: Profile | null
}

export default function ExportButtons({ type, data, profile }: ExportButtonsProps) {
  const [exporting, setExporting] = useState<string | null>(null)
  const [error, setError] = useState('')

  const handleExport = async (format: 'pdf' | 'word' | 'json') => {
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
      <div className="flex gap-2">
        <button
          onClick={() => handleExport('pdf')}
          disabled={exporting !== null}
          className="btn btn-secondary text-sm"
        >
          {exporting === 'pdf' ? 'Exporting...' : 'PDF'}
        </button>
        <button
          onClick={() => handleExport('word')}
          disabled={exporting !== null}
          className="btn btn-secondary text-sm"
        >
          {exporting === 'word' ? 'Exporting...' : 'Word'}
        </button>
        <button
          onClick={() => handleExport('json')}
          disabled={exporting !== null}
          className="btn btn-secondary text-sm"
        >
          {exporting === 'json' ? 'Exporting...' : 'JSON'}
        </button>
      </div>
      {error && <div className="absolute top-full mt-1 text-red-600 text-xs">{error}</div>}
    </div>
  )
}
