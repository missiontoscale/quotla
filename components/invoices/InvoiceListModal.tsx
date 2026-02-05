'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/dashboard/DataTable'
import { Plus, Download } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/currency'
import { supabase } from '@/lib/supabase/client'
import { exportToPDF, exportToWord, exportToPNG, exportToJSON } from '@/lib/export'
import type { Profile, InvoiceWithItems, InvoiceItem } from '@/types'

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
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<string | null>(null)
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null)
      }
    }

    if (openDropdownId) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [openDropdownId])

  const handleDownload = async (invoiceId: string, format: 'pdf' | 'word' | 'png' | 'json') => {
    setDownloadingInvoiceId(invoiceId)
    setOpenDropdownId(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      // Fetch invoice with items
      const { data: invoiceData } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .single()

      const { data: itemsData } = await supabase
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('sort_order')

      // Fetch customer data if client_id exists
      let customerData = null
      if (invoiceData?.client_id) {
        const { data } = await supabase
          .from('customers')
          .select('*')
          .eq('id', invoiceData.client_id)
          .single()
        customerData = data
      }

      if (invoiceData && itemsData) {
        const invoiceWithItems: InvoiceWithItems = {
          ...invoiceData,
          items: itemsData as InvoiceItem[],
          client: customerData
        }

        const exportData = {
          type: 'invoice' as const,
          data: invoiceWithItems,
          profile: profileData
        }

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
      }
    } catch (err) {
      console.error('Error downloading invoice:', err)
    } finally {
      setDownloadingInvoiceId(null)
    }
  }

  const invoiceColumns = [
    { key: 'invoice_number', label: 'Invoice #' },
    { key: 'client_name', label: 'Customer' },
    { key: 'title', label: 'Title' },
    {
      key: 'status',
      label: '',
      render: (value: string) => {
        const dotColors: Record<string, string> = {
          draft: 'bg-slate-400',
          sent: 'bg-blue-400',
          paid: 'bg-emerald-400',
          overdue: 'bg-rose-400',
          cancelled: 'bg-slate-500',
        }
        return (
          <span
            className={`w-2.5 h-2.5 rounded-full inline-block ${dotColors[value] || dotColors.draft}`}
            title={value}
          />
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
    {
      key: 'actions',
      label: '',
      render: (value: any, row: InvoiceRow) => (
        <div className="relative" ref={openDropdownId === row.id ? dropdownRef : null}>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              setOpenDropdownId(openDropdownId === row.id ? null : row.id)
            }}
            disabled={downloadingInvoiceId === row.id}
            className="text-slate-400 hover:text-cyan-400 hover:bg-slate-800 h-11 w-11 md:h-7 md:w-7"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </Button>
          {openDropdownId === row.id && (
            <div className="absolute right-0 bottom-full mb-2 md:bottom-auto md:top-full md:mt-2 w-48 rounded-md shadow-lg bg-slate-800 ring-1 ring-slate-700 z-50">
              <div className="py-1" role="menu">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDownload(row.id, 'pdf')
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"
                  role="menuitem"
                >
                  📄 PDF Document
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDownload(row.id, 'word')
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"
                  role="menuitem"
                >
                  📝 Word Document
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDownload(row.id, 'png')
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"
                  role="menuitem"
                >
                  🖼️ PNG Image
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDownload(row.id, 'json')
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"
                  role="menuitem"
                >
                  📋 JSON Data
                </button>
              </div>
            </div>
          )}
        </div>
      ),
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-2xl md:max-w-5xl max-h-[85vh] overflow-hidden flex flex-col px-3 md:px-4">
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
        <div className="flex flex-wrap items-center gap-3 mt-3 px-1">
          {[
            { label: 'Draft', color: 'bg-slate-400' },
            { label: 'Sent', color: 'bg-blue-400' },
            { label: 'Paid', color: 'bg-emerald-400' },
            { label: 'Overdue', color: 'bg-rose-400' },
            { label: 'Cancelled', color: 'bg-slate-500' },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${s.color}`} />
              <span className="text-xs text-slate-400">{s.label}</span>
            </div>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto mt-2">
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
