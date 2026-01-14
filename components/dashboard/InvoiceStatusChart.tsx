'use client'

import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/ui/card'

const COLORS = {
  paid: '#22c55e',
  sent: '#3b82f6',
  draft: '#64748b',
  overdue: '#ef4444',
}

interface StatusData {
  name: string
  value: number
  color: string
}

export default function InvoiceStatusChart() {
  const { user } = useAuth()
  const [data, setData] = useState<StatusData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStatusData()
  }, [user])

  const loadStatusData = async () => {
    if (!user) return

    try {
      const { data: invoices, error } = await supabase
        .from('invoices')
        .select('status')
        .eq('user_id', user.id)

      if (error) throw error

      // Count by status
      const statusCounts = (invoices || []).reduce((acc, inv) => {
        const status = inv.status || 'draft'
        acc[status] = (acc[status] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // Convert to chart data
      const chartData = Object.entries(statusCounts).map(([status, count]) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value: count,
        color: COLORS[status as keyof typeof COLORS] || '#64748b'
      }))

      setData(chartData)
    } catch (error) {
      console.error('Error loading status data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="bg-slate-900/50 border border-slate-700 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-800 rounded w-1/2"></div>
          <div className="h-64 bg-slate-800 rounded-full mx-auto w-64"></div>
        </div>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card className="bg-slate-900/50 border border-slate-700 p-6">
        <h3 className="text-lg font-bold text-slate-100 mb-4">Invoice Status</h3>
        <div className="flex items-center justify-center h-64 text-slate-500">
          <p>No invoices yet</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-900/50 border border-slate-700 p-6">
      <h3 className="text-lg font-bold text-slate-100 mb-4">Invoice Status Distribution</h3>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({name, percent}) => `${name} (${(percent * 100).toFixed(0)}%)`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#f1f5f9'
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm text-slate-300">
              {item.name}: <span className="font-semibold">{item.value}</span>
            </span>
          </div>
        ))}
      </div>
    </Card>
  )
}
