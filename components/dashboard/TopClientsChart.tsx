'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/ui/card'

interface ClientData {
  name: string
  revenue: number
  invoices: number
}

export default function TopClientsChart() {
  const { user } = useAuth()
  const [data, setData] = useState<ClientData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTopClients()
  }, [user])

  const loadTopClients = async () => {
    if (!user) return

    try {
      const { data: invoices, error } = await supabase
        .from('invoices')
        .select('client_id, total, status, customer:customers!client_id(id, full_name, company_name)')
        .eq('user_id', user.id)
        .eq('status', 'paid')

      if (error) {
        console.error('Supabase error:', error.message, error.details, error.hint)
        throw error
      }

      if (!invoices || invoices.length === 0) {
        setData([])
        return
      }

      // Group by customer
      const clientMap = new Map<string, { name: string; revenue: number; invoices: number }>()

      invoices.forEach(inv => {
        const customer = inv.customer as { id: string; full_name: string; company_name: string | null } | null
        const clientKey = customer?.id || inv.client_id || 'unknown'
        const clientName = customer?.company_name || customer?.full_name || 'Unknown Customer'

        if (!clientMap.has(clientKey)) {
          clientMap.set(clientKey, {
            name: clientName,
            revenue: 0,
            invoices: 0
          })
        }

        const clientData = clientMap.get(clientKey)!
        clientData.revenue += inv.total || 0
        clientData.invoices += 1
      })

      // Convert to array and sort by revenue
      const topClients = Array.from(clientMap.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)
        .map(client => ({
          name: client.name.length > 20 ? client.name.substring(0, 20) + '...' : client.name,
          revenue: Math.round(client.revenue),
          invoices: client.invoices
        }))

      setData(topClients)
    } catch (error) {
      console.error('Error loading top clients:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        error,
        userId: user?.id
      })
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

  if (data.length === 0) {
    return (
      <Card className="bg-slate-900/50 border border-slate-700 p-6">
        <h3 className="text-lg font-bold text-slate-100 mb-4">Top Clients</h3>
        <div className="flex items-center justify-center h-64 text-slate-500">
          <p>No paid invoices yet</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-900/50 border border-slate-700 p-6">
      <h3 className="text-lg font-bold text-slate-100 mb-4">Top 5 Clients by Revenue</h3>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="name"
            stroke="#64748b"
            style={{ fontSize: '12px' }}
            angle={-15}
            textAnchor="end"
            height={80}
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
            formatter={(value: number, name: string) => {
              if (name === 'revenue') return [`$${value.toLocaleString()}`, 'Revenue']
              return [value, 'Invoices']
            }}
          />
          <Bar dataKey="revenue" fill="#f97316" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
