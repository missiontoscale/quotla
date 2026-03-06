'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { DollarSign, FileText, Clock, TrendingUp } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/currency'
import { useUserCurrency } from '@/hooks/useUserCurrency'
import { QuickStatsSkeleton } from './QuickStatsSkeleton'

interface QuickStatsData {
  todayRevenue: number
  pendingInvoices: number
  overdueInvoices: number
  monthlyGrowth: number
}

export function QuickStats() {
  const { user } = useAuth()
  const { currency } = useUserCurrency()
  const [stats, setStats] = useState<QuickStatsData>({
    todayRevenue: 0,
    pendingInvoices: 0,
    overdueInvoices: 0,
    monthlyGrowth: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) fetchStats()
  }, [user])

  const fetchStats = async () => {
    if (!user) return

    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayIso = today.toISOString()

      const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0)

      // Fetch invoices - pre-filter by relevant statuses to reduce data transfer
      // Only need 'paid' (for revenue), 'sent' (pending), and 'overdue' statuses
      const { data: invoices } = await supabase
        .from('invoices')
        .select('status, total, issue_date, updated_at')
        .eq('user_id', user.id)
        .in('status', ['paid', 'sent', 'overdue'])

      if (invoices) {
        // Today's revenue (invoices marked paid today)
        const todayRevenue = invoices
          .filter(inv => inv.status === 'paid' && inv.updated_at >= todayIso)
          .reduce((sum, inv) => sum + (inv.total || 0), 0)

        // Pending invoices
        const pendingInvoices = invoices.filter(inv => inv.status === 'sent').length

        // Overdue invoices
        const overdueInvoices = invoices.filter(inv => inv.status === 'overdue').length

        // Monthly growth calculation
        const thisMonthRevenue = invoices
          .filter(inv => inv.status === 'paid' && new Date(inv.issue_date) >= thisMonth)
          .reduce((sum, inv) => sum + (inv.total || 0), 0)

        const lastMonthRevenue = invoices
          .filter(inv => {
            const date = new Date(inv.issue_date)
            return inv.status === 'paid' && date >= lastMonth && date <= lastMonthEnd
          })
          .reduce((sum, inv) => sum + (inv.total || 0), 0)

        const monthlyGrowth = lastMonthRevenue > 0
          ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
          : thisMonthRevenue > 0 ? 100 : 0

        setStats({
          todayRevenue,
          pendingInvoices,
          overdueInvoices,
          monthlyGrowth
        })
      }
    } catch (error) {
      console.error('Error fetching quick stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <QuickStatsSkeleton />
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div className="flex items-center gap-3 p-3 bg-primary-700/30 border border-primary-600/50 rounded-lg">
        <div className="w-9 h-9 bg-quotla-green/15 rounded-lg flex items-center justify-center">
          <DollarSign className="w-4 h-4 text-emerald-400" />
        </div>
        <div>
          <p className="text-[0.68rem] text-primary-400 uppercase tracking-wider">Today</p>
          <p className="text-sm font-semibold text-primary-100">{formatCurrency(stats.todayRevenue, currency)}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 p-3 bg-primary-700/30 border border-primary-600/50 rounded-lg">
        <div className="w-9 h-9 bg-primary-500/10 rounded-lg flex items-center justify-center">
          <FileText className="w-4 h-4 text-primary-300" />
        </div>
        <div>
          <p className="text-[0.68rem] text-primary-400 uppercase tracking-wider">Pending</p>
          <p className="text-sm font-semibold text-primary-100">{stats.pendingInvoices} invoices</p>
        </div>
      </div>

      <div className="flex items-center gap-3 p-3 bg-primary-700/30 border border-primary-600/50 rounded-lg">
        <div className="w-9 h-9 bg-quotla-orange/10 rounded-lg flex items-center justify-center">
          <Clock className="w-4 h-4 text-quotla-orange" />
        </div>
        <div>
          <p className="text-[0.68rem] text-primary-400 uppercase tracking-wider">Overdue</p>
          <p className="text-sm font-semibold text-primary-100">{stats.overdueInvoices} invoices</p>
        </div>
      </div>

      <div className="flex items-center gap-3 p-3 bg-primary-700/30 border border-primary-600/50 rounded-lg">
        <div className="w-9 h-9 bg-quotla-green/15 rounded-lg flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
        </div>
        <div>
          <p className="text-[0.68rem] text-primary-400 uppercase tracking-wider">This Month</p>
          <p className={`text-sm font-semibold ${stats.monthlyGrowth >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {stats.monthlyGrowth >= 0 ? '+' : ''}{stats.monthlyGrowth.toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  )
}
