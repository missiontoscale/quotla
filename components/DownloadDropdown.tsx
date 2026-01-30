'use client'

import { useState, useRef, useEffect } from 'react'
import { Download } from 'lucide-react'
import { exportToPDF, exportToWord, exportToPNG, exportToJSON } from '@/lib/export'
import { QuoteWithItems, InvoiceWithItems, Profile } from '@/types'

interface DownloadDropdownProps {
  type: 'quote' | 'invoice'
  data: QuoteWithItems | InvoiceWithItems
  profile: Profile | null
}

export default function DownloadDropdown({ type, data, profile }: DownloadDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [exporting, setExporting] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleExport = async (format: 'pdf' | 'word' | 'png' | 'json') => {
    setExporting(format)
    setIsOpen(false)

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
      console.error('Export failed:', err)
    } finally {
      setExporting(null)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={exporting !== null}
        className="inline-flex items-center justify-center gap-2 px-4 py-2 min-h-[44px] md:min-h-0 md:py-2 text-sm font-medium text-cyan-400 hover:text-cyan-300 hover:bg-slate-800 rounded-md transition-colors disabled:opacity-50"
      >
        <Download className="w-4 h-4" />
        {exporting ? 'Exporting...' : 'Download'}
      </button>

      {isOpen && (
        <div className="absolute left-0 md:left-auto md:right-0 bottom-full mb-2 md:bottom-auto md:top-full md:mt-2 w-48 rounded-md shadow-lg bg-slate-800 ring-1 ring-slate-700 z-50">
          <div className="py-1" role="menu">
            <button
              onClick={() => handleExport('pdf')}
              className="block w-full text-left px-4 py-3 md:py-2 text-sm text-slate-300 hover:bg-slate-700 min-h-[44px] md:min-h-0"
              role="menuitem"
            >
              PDF Document
            </button>
            <button
              onClick={() => handleExport('word')}
              className="block w-full text-left px-4 py-3 md:py-2 text-sm text-slate-300 hover:bg-slate-700 min-h-[44px] md:min-h-0"
              role="menuitem"
            >
              Word Document
            </button>
            <button
              onClick={() => handleExport('png')}
              className="block w-full text-left px-4 py-3 md:py-2 text-sm text-slate-300 hover:bg-slate-700 min-h-[44px] md:min-h-0"
              role="menuitem"
            >
              PNG Image
            </button>
            <button
              onClick={() => handleExport('json')}
              className="block w-full text-left px-4 py-3 md:py-2 text-sm text-slate-300 hover:bg-slate-700 min-h-[44px] md:min-h-0"
              role="menuitem"
            >
              JSON Data
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
