'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/dashboard/DataTable'
import { Plus } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/currency'

interface InvoiceRow {
  id: string
  invoice_number: string
  client_name: string
  title: string
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  total: number
  issue_date: string
  due_date: string | null
}

interface InvoiceListModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoices: InvoiceRow[]
  currency: string
  onView: (invoice: InvoiceRow) => void
  onEdit: (invoice: InvoiceRow) => void
  onDelete: (invoice: InvoiceRow) => void
  onAddInvoice: () => void
}

export function InvoiceListModal({
  open,
  onOpenChange,
  invoices,
  currency,
  onView,
  onEdit,
  onDelete,
  onAddInvoice,
}: InvoiceListModalProps) {
  const invoiceColumns = [
    { key: 'invoice_number', label: 'Invoice #' },
    { key: 'client_name', label: 'Customer' },
    { key: 'title', label: 'Title' },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => {
        const statusColors: Record<string, string> = {
          draft: 'bg-slate-500/20 text-slate-400',
          sent: 'bg-blue-500/20 text-blue-400',
          paid: 'bg-emerald-500/20 text-emerald-400',
          overdue: 'bg-rose-500/20 text-rose-400',
          cancelled: 'bg-slate-600/20 text-slate-500',
        }
        return (
          <Badge className={statusColors[value] || statusColors.draft}>
            {value}
          </Badge>
        )
      },
    },
    {
      key: 'total',
      label: 'Total',
      render: (value: number) => (
        <span className="text-emerald-400">
          {formatCurrency(value || 0, currency)}
        </span>
      ),
    },
    {
      key: 'issue_date',
      label: 'Issue Date',
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'due_date',
      label: 'Due Date',
      render: (value: string | null) =>
        value ? new Date(value).toLocaleDateString() : '-',
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-5xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">
              All Invoices
              <Badge className="ml-2 bg-slate-700 text-slate-300">
                {invoices.length}
              </Badge>
            </DialogTitle>
            <Button
              onClick={onAddInvoice}
              className="bg-cyan-500 hover:bg-cyan-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Invoice
            </Button>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto mt-4">
          <DataTable
            columns={invoiceColumns}
            data={invoices}
            searchPlaceholder="Search invoices..."
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
