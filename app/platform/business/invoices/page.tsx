'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { Invoice } from '@/types'
import { format } from 'date-fns'
import { formatCurrency } from '@/lib/utils/validation'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/dashboard/DataTable'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { DollarSign, Clock } from 'lucide-react'

export default function InvoicesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'draft' | 'sent' | 'paid' | 'overdue'>('all')

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

  const handleDelete = async (invoice: any) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return

    const { error } = await supabase.from('invoices').delete().eq('id', invoice.id)

    if (!error) {
      setInvoices(invoices.filter((i) => i.id !== invoice.id))
    }
  }

  const stats = {
    totalRevenue: invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0),
    outstanding: invoices.filter(i => i.status === 'sent' || i.status === 'overdue').reduce((sum, i) => sum + i.total, 0),
    paid: invoices.filter(i => i.status === 'paid').length,
    pending: invoices.filter(i => i.status === 'sent' || i.status === 'overdue').length,
  }

  const columns = [
    {
      key: 'invoice_number',
      label: 'Invoice #',
      render: (value: string) => <span className="font-mono text-violet-400">{value}</span>
    },
    {
      key: 'client',
      label: 'Customer',
      render: (value: any) => value?.name || 'N/A'
    },
    {
      key: 'created_at',
      label: 'Date',
      render: (value: string) => format(new Date(value), 'MMM d, yyyy')
    },
    {
      key: 'due_date',
      label: 'Due Date',
      render: (value: string) => value ? format(new Date(value), 'MMM d, yyyy') : 'N/A'
    },
    {
      key: 'total',
      label: 'Amount',
      render: (value: number, row: any) => (
        <span className="font-semibold text-slate-100">
          {formatCurrency(value, row.currency || 'USD')}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => {
        const statusColors: Record<string, string> = {
          paid: 'bg-emerald-500/20 text-emerald-400',
          sent: 'bg-amber-500/20 text-amber-400',
          overdue: 'bg-rose-500/20 text-rose-400',
          draft: 'bg-slate-500/20 text-slate-400',
        }
        return (
          <Badge className={statusColors[value] || statusColors.draft}>
            {value}
          </Badge>
        )
      },
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-slate-100">Invoices</h1>
          <p className="text-slate-400 mt-1">Manage sales invoices and billing</p>
        </div>
        <Button
          className="bg-violet-500 hover:bg-violet-600 text-white"
          onClick={() => router.push('/platform/business/invoices')}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-slate-800 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Total Revenue</p>
              <p className="text-2xl font-bold text-slate-100">
                {formatCurrency(stats.totalRevenue, invoices[0]?.currency || 'USD')}
              </p>
              <p className="text-xs text-slate-500 mt-1">{stats.paid} paid invoices</p>
            </div>
          </div>
        </Card>

        <Card className="bg-slate-900 border-slate-800 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Outstanding</p>
              <p className="text-2xl font-bold text-slate-100">
                {formatCurrency(stats.outstanding, invoices[0]?.currency || 'USD')}
              </p>
              <p className="text-xs text-slate-500 mt-1">{stats.pending} pending invoices</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-800">
        {[
          { label: 'All', value: 'all' },
          { label: 'Draft', value: 'draft' },
          { label: 'Sent', value: 'sent' },
          { label: 'Paid', value: 'paid' },
          { label: 'Overdue', value: 'overdue' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value as any)}
            className={`px-4 py-2 text-sm font-medium transition-colors relative ${
              filter === tab.value
                ? 'text-violet-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            {tab.label}
            {filter === tab.value && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500"></div>
            )}
          </button>
        ))}
      </div>

      {/* Invoices Table */}
      <DataTable
        columns={columns}
        data={invoices}
        onView={(row) => router.push(`/platform/business/invoices/${row.id}`)}
        onEdit={(row) => router.push(`/platform/business/invoices/${row.id}/edit`)}
        onDelete={handleDelete}
      />
    </div>
  )
}
