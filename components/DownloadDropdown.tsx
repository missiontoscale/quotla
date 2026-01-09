'use client'

import { useState, useRef, useEffect } from 'react'
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
        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
      >
        {exporting ? `Exporting...` : 'Download'}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1" role="menu">
            <button
              onClick={() => handleExport('pdf')}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
            >
              📄 PDF Document
            </button>
            <button
              onClick={() => handleExport('word')}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
            >
              📝 Word Document
            </button>
            <button
              onClick={() => handleExport('png')}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
            >
              🖼️ PNG Image
            </button>
            <button
              onClick={() => handleExport('json')}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
            >
              📋 JSON Data
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
