'use client'

import { useState } from 'react'
import { Upload, History, HelpCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { BankStatementUploader } from '@/components/bank-import/BankStatementUploader'
import { ImportResults } from '@/components/bank-import/ImportResults'
import { ImportResult } from '@/types/bank-import'
import { toast } from 'sonner'

interface BankImportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function BankImportModal({ open, onOpenChange, onSuccess }: BankImportModalProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [isUndoing, setIsUndoing] = useState(false)

  const handleUpload = async (file: File, bankHint?: string) => {
    setIsUploading(true)
    setImportResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      if (bankHint && bankHint !== 'auto') {
        formData.append('bank', bankHint)
      }

      const response = await fetch('/api/bank-import/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Import failed')
      }

      // Convert date strings back to Date objects
      const result: ImportResult = {
        ...data,
        transactions: data.transactions.map((tx: any) => ({
          ...tx,
          date: new Date(tx.date),
        })),
      }

      setImportResult(result)

      toast.success(
        `Imported ${result.summary.importedExpenses} expenses and ${result.summary.importedIncome} income transactions`
      )

      onSuccess?.()
    } catch (error) {
      console.error('Import error:', error)
      toast.error(error instanceof Error ? error.message : 'Import failed')
    } finally {
      setIsUploading(false)
    }
  }

  const handleUndo = async () => {
    if (!importResult?.batchId) return

    setIsUndoing(true)

    try {
      const response = await fetch(`/api/bank-import/${importResult.batchId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Undo failed')
      }

      setImportResult(null)
      toast.success('Import undone successfully')
      onSuccess?.()
    } catch (error) {
      console.error('Undo error:', error)
      toast.error(error instanceof Error ? error.message : 'Undo failed')
    } finally {
      setIsUndoing(false)
    }
  }

  const handleClose = () => {
    if (!isUploading) {
      setImportResult(null)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-slate-700 bg-slate-900">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                <Upload className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <DialogTitle className="text-xl text-slate-100">
                  Import Bank Statement
                </DialogTitle>
                <p className="text-sm text-slate-400 mt-0.5">
                  Upload to automatically import transactions
                </p>
              </div>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-slate-400">
                    <HelpCircle className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs border-slate-700 bg-slate-800 text-slate-200">
                  <p className="font-medium">How it works:</p>
                  <ul className="mt-2 list-inside list-disc text-sm text-slate-400">
                    <li>Upload CSV, Excel, or PDF bank statement</li>
                    <li>Expenses are automatically categorized</li>
                    <li>Income is matched to existing invoices</li>
                    <li>Duplicate transactions are skipped</li>
                  </ul>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Upload Section */}
          <BankStatementUploader onUpload={handleUpload} isUploading={isUploading} />

          {/* Results Section */}
          {importResult && (
            <div>
              <div className="mb-4 flex items-center gap-2">
                <History className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-semibold text-slate-200">Import Results</h3>
              </div>
              <ImportResults
                result={importResult}
                onUndo={handleUndo}
                isUndoing={isUndoing}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
