'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, FileSpreadsheet, FileText, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { NIGERIAN_BANK_FORMATS } from '@/types/bank-import'

interface BankStatementUploaderProps {
  onUpload: (file: File, bankHint?: string) => Promise<void>
  isUploading: boolean
}

const ACCEPTED_TYPES = '.csv,.xlsx,.xls,.pdf'
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export function BankStatementUploader({ onUpload, isUploading }: BankStatementUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedBank, setSelectedBank] = useState<string>('')
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds maximum allowed size (10MB)`
    }

    const extension = file.name.split('.').pop()?.toLowerCase()
    const validExtensions = ['csv', 'xlsx', 'xls', 'pdf']

    if (!extension || !validExtensions.includes(extension)) {
      return 'Please upload a CSV, Excel (.xlsx, .xls), or PDF file'
    }

    return null
  }

  const handleFileSelect = useCallback((file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      setSelectedFile(null)
      return
    }

    setError(null)
    setSelectedFile(file)
  }, [])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileSelect(e.dataTransfer.files[0])
      }
    },
    [handleFileSelect]
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return
    await onUpload(selectedFile, selectedBank || undefined)
  }

  const clearFile = () => {
    setSelectedFile(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    if (ext === 'pdf') {
      return <FileText className="h-8 w-8 text-red-500" />
    }
    return <FileSpreadsheet className="h-8 w-8 text-emerald-500" />
  }

  return (
    <Card className="border-slate-700 bg-slate-800/50">
      <CardContent className="p-6">
        {/* Drop Zone */}
        <div
          className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
            dragActive
              ? 'border-emerald-500 bg-emerald-500/10'
              : 'border-slate-600 hover:border-slate-500'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES}
            onChange={handleInputChange}
            className="hidden"
            disabled={isUploading}
          />

          {!selectedFile ? (
            <div className="space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-700">
                <Upload className="h-8 w-8 text-slate-400" />
              </div>
              <div>
                <p className="text-lg font-medium text-slate-200">
                  Drop your bank statement here
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  or{' '}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-emerald-400 hover:text-emerald-300 focus:outline-none"
                    disabled={isUploading}
                  >
                    browse files
                  </button>
                </p>
              </div>
              <p className="text-xs text-slate-500">
                Supports CSV, Excel (.xlsx, .xls), and PDF files up to 10MB
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {getFileIcon(selectedFile.name)}
                <div className="text-left">
                  <p className="font-medium text-slate-200">{selectedFile.name}</p>
                  <p className="text-sm text-slate-400">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={clearFile}
                disabled={isUploading}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <p className="mt-3 text-sm text-red-400">{error}</p>
        )}

        {/* Bank Selection */}
        {selectedFile && (
          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Bank (optional - helps with parsing)
              </label>
              <Select value={selectedBank} onValueChange={setSelectedBank}>
                <SelectTrigger className="w-full border-slate-600 bg-slate-700/50 text-slate-200">
                  <SelectValue placeholder="Select your bank" />
                </SelectTrigger>
                <SelectContent className="border-slate-600 bg-slate-800">
                  <SelectItem value="auto">Auto-detect</SelectItem>
                  {Object.entries(NIGERIAN_BANK_FORMATS)
                    .filter(([key]) => key !== 'generic')
                    .map(([key, format]) => (
                      <SelectItem key={key} value={key}>
                        {format.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Upload Button */}
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Import Transactions
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
