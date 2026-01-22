'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import {
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Undo2,
  ChevronRight,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { BankStatementImport } from '@/types/bank-import'

interface ImportHistoryProps {
  onUndoSuccess?: () => void
}

export function ImportHistory({ onUndoSuccess }: ImportHistoryProps) {
  const [imports, setImports] = useState<BankStatementImport[]>([])
  const [loading, setLoading] = useState(true)
  const [undoing, setUndoing] = useState<string | null>(null)

  const fetchImports = async () => {
    try {
      const response = await fetch('/api/bank-import')
      if (response.ok) {
        const data = await response.json()
        setImports(data.imports || [])
      }
    } catch (error) {
      console.error('Failed to fetch imports:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchImports()
  }, [])

  const handleUndo = async (importId: string) => {
    setUndoing(importId)
    try {
      const response = await fetch(`/api/bank-import/${importId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Refresh the list
        await fetchImports()
        onUndoSuccess?.()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to undo import')
      }
    } catch (error) {
      console.error('Failed to undo import:', error)
      alert('Failed to undo import')
    } finally {
      setUndoing(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-emerald-900/50 text-emerald-400">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Completed
          </Badge>
        )
      case 'failed':
        return (
          <Badge className="bg-red-900/50 text-red-400">
            <XCircle className="mr-1 h-3 w-3" />
            Failed
          </Badge>
        )
      case 'undone':
        return (
          <Badge className="bg-slate-700 text-slate-400">
            <Undo2 className="mr-1 h-3 w-3" />
            Undone
          </Badge>
        )
      case 'processing':
        return (
          <Badge className="bg-blue-900/50 text-blue-400">
            <Clock className="mr-1 h-3 w-3" />
            Processing
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getFileIcon = (fileType: string) => {
    if (fileType === 'pdf') {
      return <FileText className="h-5 w-5 text-red-400" />
    }
    return <FileSpreadsheet className="h-5 w-5 text-emerald-400" />
  }

  if (loading) {
    return (
      <Card className="border-slate-700 bg-slate-800/50">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </CardContent>
      </Card>
    )
  }

  if (imports.length === 0) {
    return (
      <Card className="border-slate-700 bg-slate-800/50">
        <CardContent className="py-12 text-center">
          <FileSpreadsheet className="mx-auto h-12 w-12 text-slate-600" />
          <p className="mt-4 text-slate-400">No import history yet</p>
          <p className="text-sm text-slate-500">
            Upload a bank statement to get started
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-slate-700 bg-slate-800/50">
      <CardHeader>
        <CardTitle className="text-lg text-slate-200">Import History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700">
              <TableHead className="text-slate-400">File</TableHead>
              <TableHead className="text-slate-400">Date</TableHead>
              <TableHead className="text-slate-400">Bank</TableHead>
              <TableHead className="text-slate-400">Transactions</TableHead>
              <TableHead className="text-slate-400">Status</TableHead>
              <TableHead className="text-right text-slate-400">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {imports.map((imp) => (
              <TableRow key={imp.id} className="border-slate-700">
                <TableCell>
                  <div className="flex items-center gap-3">
                    {getFileIcon(imp.file_type)}
                    <span className="max-w-[200px] truncate text-slate-300" title={imp.file_name}>
                      {imp.file_name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-slate-400">
                  {format(new Date(imp.created_at), 'MMM d, yyyy')}
                </TableCell>
                <TableCell className="text-slate-400">
                  {imp.bank_name || '-'}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-300">{imp.total_transactions}</span>
                    <span className="text-slate-500">total</span>
                    {imp.imported_expenses > 0 && (
                      <span className="text-red-400">
                        ({imp.imported_expenses} exp)
                      </span>
                    )}
                    {imp.imported_income > 0 && (
                      <span className="text-emerald-400">
                        ({imp.imported_income} inc)
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(imp.status)}</TableCell>
                <TableCell className="text-right">
                  {imp.status === 'completed' && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={undoing === imp.id}
                          className="text-slate-400 hover:text-red-400"
                        >
                          {undoing === imp.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Undo2 className="h-4 w-4" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="border-slate-700 bg-slate-800">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-slate-200">
                            Undo Import?
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-slate-400">
                            This will delete all {imp.imported_expenses} expenses imported from{' '}
                            <strong>{imp.file_name}</strong>. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="border-slate-600 bg-slate-700 text-slate-200 hover:bg-slate-600">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleUndo(imp.id)}
                            className="bg-red-600 text-white hover:bg-red-700"
                          >
                            Undo Import
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
