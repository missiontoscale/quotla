'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { Invoice } from '@/types'
import { format } from 'date-fns'
import { formatCurrency } from '@/lib/utils/validation'
import LoadingSpinner from '@/components/LoadingSpinner'
import { AddInvoiceDialog } from '@/components/invoices/AddInvoiceDialog'
import { DataTable } from '@/components/dashboard/DataTable'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, FileText, DollarSign, Clock, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/card'

export default function InvoicesPage() {
  const { user } = useAuth()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editInvoiceId, setEditInvoiceId] = useState<string | undefined>(undefined)
  const [dialogMode, setDialogMode] = useState<'create' | 'view' | 'edit'>('create')

  useEffect(() => {
    if (user) {
      loadInvoices()
    }
  }, [user, filter])

  const loadInvoices = async () => {
    if (!user) return

    setLoading(true)
    let query = supabase
      .from('invoices')
      .select('*, client:clients(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (filter !== 'all') {
      query = query.eq('status', filter)
    }

    const { data, error } = await query

    if (!error && data) {
      setInvoices(data)
    }
    setLoading(false)
  }

  const filteredInvoices = invoices.filter(invoice => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      invoice.invoice_number?.toLowerCase().includes(search) ||
      invoice.title?.toLowerCase().includes(search) ||
      invoice.client?.name?.toLowerCase().includes(search)
    )
  })

  const stats = {
    total: invoices.length,
    draft: invoices.filter(i => i.status === 'draft').length,
    sent: invoices.filter(i => i.status === 'sent').length,
    paid: invoices.filter(i => i.status === 'paid').length,
    overdue: invoices.filter(i => i.status === 'overdue').length,
    cancelled: invoices.filter(i => i.status === 'cancelled').length,
    totalRevenue: invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0),
    outstanding: invoices.filter(i => i.status === 'sent' || i.status === 'overdue').reduce((sum, i) => sum + i.total, 0),
  }

  const handleView = (row: any) => {
    setEditInvoiceId(row.id)
    setDialogMode('view')
    setAddDialogOpen(true)
  }

  const handleEdit = (row: any) => {
    setEditInvoiceId(row.id)
    setDialogMode('edit')
    setAddDialogOpen(true)
  }

  const handleDelete = async (row: any) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return

    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', row.id)
        .eq('user_id', user?.id)

      if (error) throw error

      loadInvoices()
    } catch (error) {
      console.error('Error deleting invoice:', error)
      alert('Failed to delete invoice')
    }
  }

  const columns = [
    {
      key: 'invoice_number',
      label: 'Invoice #',
    },
    {
      key: 'title',
      label: 'Title',
      render: (value: string) => value || '-'
    },
    {
      key: 'client',
      label: 'Client',
      render: (value: any) => value?.name || '-'
    },
    {
      key: 'total',
      label: 'Amount',
      render: (value: number, row: any) => formatCurrency(value, row.currency || 'USD')
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => {
        const statusColors: Record<string, string> = {
          draft: 'bg-slate-500/20 text-slate-400',
          sent: 'bg-blue-500/20 text-blue-400',
          paid: 'bg-emerald-500/20 text-emerald-400',
          overdue: 'bg-rose-500/20 text-rose-400',
          cancelled: 'bg-amber-500/20 text-amber-400',
        }
        return (
          <Badge className={statusColors[value] || statusColors.draft}>
            {value}
          </Badge>
        )
      },
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (value: string) => format(new Date(value), 'MMM d, yyyy')
    },
    {
      key: 'due_date',
      label: 'Due Date',
      render: (value: string) => value ? format(new Date(value), 'MMM d, yyyy') : '-'
    },
  ]

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-md:space-y-4">
      <style jsx global>{`
        @media (max-width: 768px) {
          .space-y-6 {
            font-size: 0.9rem;
          }
          .space-y-6 h1 {
            font-size: 1.5rem !important;
          }
          .space-y-6 h3 {
            font-size: 1.25rem !important;
          }
          .space-y-6 .text-sm,
          .space-y-6 .text-xs {
            font-size: 0.75rem !important;
          }
          .space-y-6 button,
          .space-y-6 input {
            padding: 0.5rem 0.75rem !important;
          }
        }

        /* Reduce scrollbar size by 30% */
        ::-webkit-scrollbar {
          width: 7px;
          height: 7px;
        }
        ::-webkit-scrollbar-track {
          background: rgb(15 23 42 / 0.5);
        }
        ::-webkit-scrollbar-thumb {
          background: rgb(71 85 105 / 0.8);
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgb(100 116 139);
        }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between max-md:flex-col max-md:items-start max-md:gap-3">
        <div className="flex items-center gap-4 max-md:gap-3">
          <div className="w-12 h-12 max-md:w-10 max-md:h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
            <FileText className="w-6 h-6 max-md:w-5 max-md:h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl max-md:text-2xl text-slate-100">Invoices</h1>
            <p className="text-slate-400 mt-1 text-sm max-md:text-xs">Manage all your invoices in one place</p>
          </div>
        </div>
        <Button
          onClick={() => {
            setEditInvoiceId(undefined)
            setDialogMode('create')
            setAddDialogOpen(true)
          }}
          className="bg-cyan-500 hover:bg-cyan-600 text-white max-md:w-full max-md:text-sm"
        >
          <Plus className="w-4 h-4 max-md:w-3.5 max-md:h-3.5 mr-2" />
          New Invoice
        </Button>
      </div>

      {/* Add/Edit Invoice Dialog */}
      <AddInvoiceDialog
        open={addDialogOpen}
        onOpenChange={(open) => {
          setAddDialogOpen(open)
          if (!open) {
            setEditInvoiceId(undefined)
            setDialogMode('create')
          }
        }}
        onSuccess={loadInvoices}
        invoiceId={editInvoiceId}
        mode={dialogMode}
      />

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-md:gap-4">
        <Card className="bg-slate-900 border-slate-800 p-6 max-md:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm max-md:text-xs">Total Revenue</p>
              <h3 className="text-2xl max-md:text-xl text-slate-100 mt-1">
                {formatCurrency(stats.totalRevenue, invoices[0]?.currency || 'USD')}
              </h3>
              <p className="text-xs text-slate-500 mt-1">{stats.paid} paid invoices</p>
            </div>
            <div className="w-12 h-12 max-md:w-10 max-md:h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 max-md:w-5 max-md:h-5 text-emerald-400" />
            </div>
          </div>
        </Card>

        <Card className="bg-slate-900 border-slate-800 p-6 max-md:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm max-md:text-xs">Outstanding</p>
              <h3 className="text-2xl max-md:text-xl text-slate-100 mt-1">
                {formatCurrency(stats.outstanding, invoices[0]?.currency || 'USD')}
              </h3>
              <p className="text-xs text-slate-500 mt-1">{stats.sent + stats.overdue} pending</p>
            </div>
            <div className="w-12 h-12 max-md:w-10 max-md:h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 max-md:w-5 max-md:h-5 text-amber-400" />
            </div>
          </div>
        </Card>

        <Card className="bg-slate-900 border-slate-800 p-6 max-md:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm max-md:text-xs">Total Invoices</p>
              <h3 className="text-2xl max-md:text-xl text-slate-100 mt-1">{stats.total}</h3>
            </div>
            <div className="w-12 h-12 max-md:w-10 max-md:h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 max-md:w-5 max-md:h-5 text-cyan-400" />
            </div>
          </div>
        </Card>

        <Card className="bg-slate-900 border-slate-800 p-6 max-md:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm max-md:text-xs">Overdue</p>
              <h3 className="text-2xl max-md:text-xl text-rose-400 mt-1">{stats.overdue}</h3>
            </div>
            <div className="w-12 h-12 max-md:w-10 max-md:h-10 bg-rose-500/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 max-md:w-5 max-md:h-5 text-rose-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 max-md:gap-1.5">
        {[
          { label: 'All', value: stats.total, filter: 'all' },
          { label: 'Draft', value: stats.draft, filter: 'draft' },
          { label: 'Sent', value: stats.sent, filter: 'sent' },
          { label: 'Paid', value: stats.paid, filter: 'paid' },
          { label: 'Overdue', value: stats.overdue, filter: 'overdue' },
          { label: 'Cancelled', value: stats.cancelled, filter: 'cancelled' },
        ].map((stat) => (
          <button
            key={stat.filter}
            onClick={() => setFilter(stat.filter as typeof filter)}
            className={`flex-shrink-0 px-4 py-2 max-md:px-3 max-md:py-1.5 rounded-lg text-sm max-md:text-xs font-medium transition-all ${
              filter === stat.filter
                ? 'bg-cyan-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {stat.label} ({stat.value})
          </button>
        ))}
      </div>

      {/* Invoices Table */}
      {filteredInvoices.length > 0 ? (
        <DataTable
          columns={columns}
          data={filteredInvoices}
          searchPlaceholder="Search invoices..."
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-12 max-md:p-8 text-center">
          <FileText className="w-12 h-12 max-md:w-10 max-md:h-10 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 max-md:text-sm">
            {searchTerm ? 'No invoices found' : 'No invoices yet'}
          </p>
          <p className="text-slate-500 text-sm max-md:text-xs mt-2">
            {searchTerm
              ? 'Try adjusting your search terms'
              : 'Start by creating your first invoice'}
          </p>
          {!searchTerm && (
            <Button
              onClick={() => {
                setEditInvoiceId(undefined)
                setDialogMode('create')
                setAddDialogOpen(true)
              }}
              className="mt-6 max-md:mt-4 bg-cyan-500 hover:bg-cyan-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Invoice
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
