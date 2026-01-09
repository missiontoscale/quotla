'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { Quote } from '@/types'
import { format } from 'date-fns'
import { formatCurrency } from '@/lib/utils/validation'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/dashboard/DataTable'
import { Badge } from '@/components/ui/badge'

export default function QuotesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'draft' | 'sent' | 'approved' | 'rejected'>('all')

  useEffect(() => {
    if (user) {
      loadQuotes()
    }
  }, [user, filter])

  const loadQuotes = async () => {
    if (!user) return

    setLoading(true)
    let query = supabase
      .from('quotes')
      .select('*, client:clients(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (filter !== 'all') {
      query = query.eq('status', filter)
    }

    const { data, error } = await query
    if (!error && data) setQuotes(data)
    setLoading(false)
  }

  const columns = [
    {
      key: 'quote_number',
      label: 'Quote #',
      render: (value: string) => <span className="font-mono text-cyan-400">{value}</span>
    },
    { key: 'client', label: 'Customer', render: (value: any) => value?.name || 'N/A' },
    { key: 'created_at', label: 'Date', render: (value: string) => format(new Date(value), 'MMM d, yyyy') },
    {
      key: 'total',
      label: 'Amount',
      render: (value: number, row: any) => (
        <span className="font-semibold text-slate-100">{formatCurrency(value, row.currency || 'USD')}</span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => {
        const colors: Record<string, string> = {
          approved: 'bg-emerald-500/20 text-emerald-400',
          sent: 'bg-cyan-500/20 text-cyan-400',
          rejected: 'bg-rose-500/20 text-rose-400',
          draft: 'bg-slate-500/20 text-slate-400',
        }
        return <Badge className={colors[value] || colors.draft}>{value}</Badge>
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
          <h1 className="text-3xl text-slate-100">Quotes</h1>
          <p className="text-slate-400 mt-1">Manage quotes and proposals</p>
        </div>
        <Button className="bg-violet-500 hover:bg-violet-600 text-white" onClick={() => router.push('/platform/business/create')}>
          <Plus className="w-4 h-4 mr-2" />
          Create Quote
        </Button>
      </div>

      <div className="flex gap-2 border-b border-slate-800">
        {[
          { label: 'All', value: 'all' },
          { label: 'Draft', value: 'draft' },
          { label: 'Sent', value: 'sent' },
          { label: 'Approved', value: 'approved' },
          { label: 'Rejected', value: 'rejected' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value as any)}
            className={`px-4 py-2 text-sm font-medium transition-colors relative ${
              filter === tab.value ? 'text-violet-400' : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            {tab.label}
            {filter === tab.value && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500"></div>}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={quotes}
        onView={(row) => router.push(`/platform/business/quotes/${row.id}`)}
        onEdit={(row) => router.push(`/platform/business/quotes/${row.id}/edit`)}
        onDelete={async (row) => {
          if (confirm('Delete this quote?')) {
            await supabase.from('quotes').delete().eq('id', row.id)
            loadQuotes()
          }
        }}
      />
    </div>
  )
}
