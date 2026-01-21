'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { format, isToday, isTomorrow, addDays, isBefore, startOfDay } from 'date-fns'
import Link from 'next/link'
import { Calendar, AlertCircle, FileText, ChevronRight } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/currency'
import { useUserCurrency } from '@/hooks/useUserCurrency'

interface DueItem {
  id: string
  type: 'invoice'
  number: string
  clientName: string
  amount: number
  dueDate: string
  status: string
  isOverdue: boolean
}

export function CalendarWidget() {
  const { user } = useAuth()
  const { currency } = useUserCurrency()
  const [dueItems, setDueItems] = useState<DueItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) fetchDueItems()
  }, [user])

  const fetchDueItems = async () => {
    if (!user) return

    try {
      const today = startOfDay(new Date())
      const nextWeek = addDays(today, 7)

      // Fetch invoices with due dates
      const { data: invoices } = await supabase
        .from('invoices')
        .select('id, invoice_number, status, total, due_date, client_id, customers:client_id(full_name, company_name)')
        .eq('user_id', user.id)
        .in('status', ['sent', 'overdue'])
        .not('due_date', 'is', null)
        .order('due_date', { ascending: true })
        .limit(10)

      if (invoices) {
        const items: DueItem[] = invoices.map((inv: any) => ({
          id: inv.id,
          type: 'invoice',
          number: inv.invoice_number,
          clientName: inv.customers?.company_name || inv.customers?.full_name || 'Unknown',
          amount: inv.total,
          dueDate: inv.due_date,
          status: inv.status,
          isOverdue: isBefore(new Date(inv.due_date), today)
        }))

        setDueItems(items)
      }
    } catch (error) {
      console.error('Error fetching due items:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDueDate = (dateStr: string) => {
    const date = new Date(dateStr)
    if (isToday(date)) return 'Today'
    if (isTomorrow(date)) return 'Tomorrow'
    return format(date, 'MMM d')
  }

  const getDueDateColor = (dateStr: string, isOverdue: boolean) => {
    if (isOverdue) return 'text-rose-400'
    const date = new Date(dateStr)
    if (isToday(date)) return 'text-amber-400'
    if (isTomorrow(date)) return 'text-amber-400'
    return 'text-slate-400'
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-14 bg-slate-800/50 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  if (dueItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-3">
          <Calendar className="w-5 h-5 text-slate-500" />
        </div>
        <p className="text-sm text-slate-400">No upcoming due dates</p>
        <p className="text-xs text-slate-500 mt-1">Invoice due dates will appear here</p>
      </div>
    )
  }

  const overdueCount = dueItems.filter(i => i.isOverdue).length

  return (
    <div className="space-y-3">
      {overdueCount > 0 && (
        <div className="flex items-center gap-2 p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg">
          <AlertCircle className="w-4 h-4 text-rose-400" />
          <span className="text-xs text-rose-400 font-medium">{overdueCount} overdue invoice{overdueCount > 1 ? 's' : ''}</span>
        </div>
      )}

      <div className="space-y-1">
        {dueItems.slice(0, 5).map((item) => (
          <Link
            key={item.id}
            href="/business/sales"
            className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-800/50 transition-colors group"
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${
              item.isOverdue
                ? 'bg-rose-500/10 border-rose-500/20'
                : 'bg-slate-800/50 border-slate-700/50'
            }`}>
              <FileText className={`w-4 h-4 ${item.isOverdue ? 'text-rose-400' : 'text-slate-400'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-slate-200 truncate">#{item.number}</p>
                <span className={`text-xs font-medium ${getDueDateColor(item.dueDate, item.isOverdue)}`}>
                  {formatDueDate(item.dueDate)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-slate-500 truncate">{item.clientName}</p>
                <span className="text-xs text-slate-400">{formatCurrency(item.amount, currency)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {dueItems.length > 5 && (
        <Link
          href="/business/sales"
          className="flex items-center justify-center gap-1 p-2 text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          View all {dueItems.length} items
          <ChevronRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  )
}
