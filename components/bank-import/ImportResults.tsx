'use client'

import { useState } from 'react'
import {
  ArrowDownCircle,
  ArrowUpCircle,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Undo2,
  ChevronDown,
  ChevronUp,
  FileText,
  Receipt,
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ImportResult, CategorizedTransaction } from '@/types/bank-import'
import { formatCurrency } from '@/lib/utils/currency'

interface ImportResultsProps {
  result: ImportResult
  onUndo?: () => void
  isUndoing?: boolean
  currency?: string
}

export function ImportResults({
  result,
  onUndo,
  isUndoing,
  currency = 'NGN',
}: ImportResultsProps) {
  const [showTransactions, setShowTransactions] = useState(false)

  const { summary, transactions } = result

  const successfulImports = transactions.filter((t) => t.imported)
  const failedImports = transactions.filter((t) => !t.imported && t.error)
  const skippedImports = transactions.filter(
    (t) => !t.imported && t.error?.startsWith('Skipped')
  )

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-slate-700 bg-slate-800/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Processed</p>
                <p className="text-2xl font-bold text-slate-200">
                  {summary.totalTransactions}
                </p>
              </div>
              <FileText className="h-8 w-8 text-slate-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-800/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Expenses Imported</p>
                <p className="text-2xl font-bold text-red-400">
                  {summary.importedExpenses}
                </p>
              </div>
              <ArrowDownCircle className="h-8 w-8 text-red-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-800/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Income Imported</p>
                <p className="text-2xl font-bold text-emerald-400">
                  {summary.importedIncome}
                </p>
              </div>
              <ArrowUpCircle className="h-8 w-8 text-emerald-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-800/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Skipped</p>
                <p className="text-2xl font-bold text-slate-400">
                  {summary.skippedTransactions}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-slate-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoice Stats */}
      {(summary.invoicesMarkedPaid > 0 || summary.newInvoicesCreated > 0) && (
        <Card className="border-emerald-800 bg-emerald-900/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-6">
              <Receipt className="h-8 w-8 text-emerald-500" />
              <div className="flex gap-6">
                {summary.invoicesMarkedPaid > 0 && (
                  <div>
                    <p className="text-sm text-emerald-300">Invoices Marked Paid</p>
                    <p className="text-xl font-bold text-emerald-400">
                      {summary.invoicesMarkedPaid}
                    </p>
                  </div>
                )}
                {summary.newInvoicesCreated > 0 && (
                  <div>
                    <p className="text-sm text-emerald-300">New Invoices Created</p>
                    <p className="text-xl font-bold text-emerald-400">
                      {summary.newInvoicesCreated}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transaction Details */}
      <Collapsible open={showTransactions} onOpenChange={setShowTransactions}>
        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader className="pb-3">
            <CollapsibleTrigger asChild>
              <div className="flex cursor-pointer items-center justify-between">
                <CardTitle className="text-lg text-slate-200">
                  Transaction Details
                </CardTitle>
                <Button variant="ghost" size="sm">
                  {showTransactions ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </CollapsibleTrigger>
          </CardHeader>

          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="max-h-96 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-slate-400">Status</TableHead>
                      <TableHead className="text-slate-400">Date</TableHead>
                      <TableHead className="text-slate-400">Description</TableHead>
                      <TableHead className="text-slate-400">Type</TableHead>
                      <TableHead className="text-slate-400">Category</TableHead>
                      <TableHead className="text-right text-slate-400">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx, index) => (
                      <TransactionRow
                        key={index}
                        transaction={tx}
                        currency={currency}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        {onUndo && (
          <Button
            variant="outline"
            onClick={onUndo}
            disabled={isUndoing}
            className="border-red-800 text-red-400 hover:bg-red-900/20"
          >
            <Undo2 className="mr-2 h-4 w-4" />
            {isUndoing ? 'Undoing...' : 'Undo Import'}
          </Button>
        )}
      </div>
    </div>
  )
}

function TransactionRow({
  transaction,
  currency,
}: {
  transaction: CategorizedTransaction
  currency: string
}) {
  const getStatusIcon = () => {
    if (transaction.imported) {
      return <CheckCircle2 className="h-4 w-4 text-emerald-500" />
    }
    if (transaction.error?.startsWith('Skipped')) {
      return <AlertCircle className="h-4 w-4 text-amber-500" />
    }
    return <XCircle className="h-4 w-4 text-red-500" />
  }

  const getTypeBadge = () => {
    switch (transaction.type) {
      case 'expense':
        return (
          <Badge variant="outline" className="border-red-800 text-red-400">
            Expense
          </Badge>
        )
      case 'income':
        return (
          <Badge variant="outline" className="border-emerald-800 text-emerald-400">
            Income
          </Badge>
        )
      case 'transfer':
        return (
          <Badge variant="outline" className="border-blue-800 text-blue-400">
            Transfer
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="border-slate-600 text-slate-400">
            Unknown
          </Badge>
        )
    }
  }

  return (
    <TableRow className="border-slate-700">
      <TableCell>
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          {transaction.error && !transaction.imported && (
            <span className="text-xs text-slate-500" title={transaction.error}>
              {transaction.error.length > 30
                ? transaction.error.substring(0, 30) + '...'
                : transaction.error}
            </span>
          )}
        </div>
      </TableCell>
      <TableCell className="text-slate-300">
        {transaction.date.toLocaleDateString()}
      </TableCell>
      <TableCell className="max-w-xs truncate text-slate-300" title={transaction.description}>
        {transaction.description}
      </TableCell>
      <TableCell>{getTypeBadge()}</TableCell>
      <TableCell className="text-slate-400">
        {transaction.category || '-'}
      </TableCell>
      <TableCell
        className={`text-right font-medium ${
          transaction.amount < 0 ? 'text-red-400' : 'text-emerald-400'
        }`}
      >
        {formatCurrency(Math.abs(transaction.amount), currency)}
      </TableCell>
    </TableRow>
  )
}
