'use client'

import { useState, useEffect } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/ui/card'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface RevenueData {
  month: string
  revenue: number
  invoices: number
}

export default function RevenueChart() {
  const { user } = useAuth()
  const [data, setData] = useState<RevenueData[]>([])
  const [loading, setLoading] = useState(true)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [percentageChange, setPercentageChange] = useState(0)

  useEffect(() => {
    loadRevenueData()
  }, [user])

  const loadRevenueData = async () => {
    if (!user) return

    try {
      // Get last 6 months
      const endDate = new Date()
      const startDate = subMonths(endDate, 5)

      const months = eachMonthOfInterval({ start: startDate, end: endDate })

      const { data: invoices, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'paid')
        .gte('issue_date', format(startDate, 'yyyy-MM-dd'))
        .lte('issue_date', format(endDate, 'yyyy-MM-dd'))

      if (error) throw error

      // Group by month
      const monthlyData = months.map(month => {
        const monthStart = startOfMonth(month)
        const monthEnd = endOfMonth(month)

        const monthInvoices = invoices?.filter(inv => {
          const invDate = new Date(inv.issue_date)
          return invDate >= monthStart && invDate <= monthEnd
        }) || []

        const revenue = monthInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0)

        return {
          month: format(month, 'MMM yyyy'),
          revenue: Math.round(revenue),
          invoices: monthInvoices.length
        }
      })

      setData(monthlyData)

      // Calculate total revenue
      const total = monthlyData.reduce((sum, item) => sum + item.revenue, 0)
      setTotalRevenue(total)

      // Calculate percentage change (last month vs previous month)
      if (monthlyData.length >= 2) {
        const lastMonth = monthlyData[monthlyData.length - 1].revenue
        const previousMonth = monthlyData[monthlyData.length - 2].revenue

        if (previousMonth > 0) {
          const change = ((lastMonth - previousMonth) / previousMonth) * 100
          setPercentageChange(Math.round(change * 10) / 10)
        }
      }
    } catch (error) {
      console.error('Error loading revenue data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="bg-slate-900/50 border border-slate-700 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-800 rounded w-1/3"></div>
          <div className="h-64 bg-slate-800 rounded"></div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-900/50 border border-slate-700 p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-100 mb-1">Revenue Overview</h3>
          <p className="text-sm text-slate-500">Last 6 months</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-slate-100">
            ${totalRevenue.toLocaleString()}
          </div>
          {percentageChange !== 0 && (
            <div className={`flex items-center gap-1 text-sm font-semibold ${
              percentageChange > 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {percentageChange > 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>{Math.abs(percentageChange)}%</span>
            </div>
          )}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="month"
            stroke="#64748b"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#64748b"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `$${value.toLocaleString()}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#f1f5f9'
            }}
            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#f97316"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorRevenue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  )
}
