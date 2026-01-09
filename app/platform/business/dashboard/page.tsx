'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { Quote, Invoice } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { format } from 'date-fns'
import { formatCurrency } from '@/lib/utils/validation'
import { DollarSign, Package, AlertCircle, Users } from 'lucide-react'
import { StatCard } from '@/components/dashboard/StatCard'
import { Card } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']

export default function DashboardPage() {
  const { user } = useAuth()
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [inventoryStats, setInventoryStats] = useState({
    total_items: 0,
    low_stock_count: 0,
    total_value: 0
  })

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = async () => {
    if (!user) return

    const [quotesRes, invoicesRes, inventoryRes] = await Promise.all([
      supabase
        .from('quotes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50),
      supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50),
      supabase
        .from('inventory_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true),
    ])

    if (quotesRes.data) setQuotes(quotesRes.data)
    if (invoicesRes.data) setInvoices(invoicesRes.data)

    if (inventoryRes.data) {
      const items = inventoryRes.data
      setInventoryStats({
        total_items: items.length,
        low_stock_count: items.filter(item =>
          item.track_inventory && item.quantity_on_hand <= item.low_stock_threshold
        ).length,
        total_value: items.reduce((sum, item) =>
          sum + (item.quantity_on_hand * item.cost_price), 0
        )
      })
    }

    setLoading(false)
  }

  const stats = {
    totalRevenue: invoices.filter((i) => i.status === 'paid').reduce((sum, invoice) => sum + invoice.total, 0),
    paidInvoices: invoices.filter((i) => i.status === 'paid').length,
    pendingInvoices: invoices.filter((i) => i.status === 'sent').length,
    outstandingRevenue: invoices.filter((i) => i.status === 'sent').reduce((sum, invoice) => sum + invoice.total, 0),
  }

  // Sales data for last 6 months
  const salesData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date()
    date.setMonth(date.getMonth() - (5 - i))
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)

    const monthInvoices = invoices.filter(inv => {
      const invDate = new Date(inv.created_at)
      return invDate >= monthStart && invDate <= monthEnd
    })

    const monthQuotes = quotes.filter(q => {
      const qDate = new Date(q.created_at)
      return qDate >= monthStart && qDate <= monthEnd
    })

    return {
      month: format(monthStart, 'MMM'),
      sales: monthInvoices.reduce((sum, inv) => sum + inv.total, 0),
      purchases: monthQuotes.reduce((sum, q) => sum + q.total, 0),
    }
  })

  const categoryData = [
    { name: 'Electronics', value: 35 },
    { name: 'Furniture', value: 25 },
    { name: 'Clothing', value: 20 },
    { name: 'Food', value: 15 },
    { name: 'Other', value: 5 },
  ]

  const recentActivity = [
    ...invoices.slice(0, 2).map(inv => ({
      id: inv.id,
      type: 'sale',
      description: `Invoice #${inv.invoice_number} created`,
      amount: formatCurrency(inv.total, inv.currency),
      time: format(new Date(inv.created_at), 'h:mm a')
    })),
    ...quotes.slice(0, 2).map(q => ({
      id: q.id,
      type: 'purchase',
      description: `Quote #${q.quote_number}`,
      amount: formatCurrency(q.total, q.currency),
      time: format(new Date(q.created_at), 'h:mm a')
    }))
  ].slice(0, 4)

  const lowStockItems = [
    { id: 1, name: 'Sample Product 1', sku: 'SKU-001', current: 12, minimum: 50, status: 'critical' },
    { id: 2, name: 'Sample Product 2', sku: 'SKU-002', current: 28, minimum: 100, status: 'critical' },
    { id: 3, name: 'Sample Product 3', sku: 'SKU-003', current: 45, minimum: 75, status: 'warning' },
    { id: 4, name: 'Sample Product 4', sku: 'SKU-004', current: 18, minimum: 30, status: 'warning' },
  ].slice(0, inventoryStats.low_stock_count)

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
        <h1 className="text-3xl text-slate-100">Dashboard Overview</h1>
        <div className="text-sm text-slate-400">Last updated: {new Date().toLocaleString()}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Sales"
          value={formatCurrency(stats.totalRevenue, invoices[0]?.currency || 'USD')}
          change="+12.5% from last month"
          changeType="positive"
          icon={DollarSign}
          iconColor="from-violet-400 to-purple-500"
        />
        <StatCard
          title="Stock Value"
          value={formatCurrency(inventoryStats.total_value, invoices[0]?.currency || 'USD')}
          change="+5.2% from last month"
          changeType="positive"
          icon={Package}
          iconColor="from-cyan-400 to-blue-500"
        />
        <StatCard
          title="Outstanding Payments"
          value={formatCurrency(stats.outstandingRevenue, invoices[0]?.currency || 'USD')}
          change="-8.1% from last month"
          changeType="positive"
          icon={AlertCircle}
          iconColor="from-amber-400 to-orange-500"
        />
        <StatCard
          title="Active Customers"
          value={stats.paidInvoices.toString()}
          change="+18 new this month"
          changeType="positive"
          icon={Users}
          iconColor="from-emerald-400 to-green-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-slate-800 p-6">
          <h3 className="text-lg text-slate-100 mb-4">Sales & Purchases Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Line type="monotone" dataKey="sales" stroke="#8b5cf6" strokeWidth={2} />
              <Line type="monotone" dataKey="purchases" stroke="#06b6d4" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="bg-slate-900 border-slate-800 p-6">
          <h3 className="text-lg text-slate-100 mb-4">Inventory by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-slate-800 p-6">
          <h3 className="text-lg text-slate-100 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start justify-between py-3 border-b border-slate-800 last:border-0">
                <div className="flex-1">
                  <p className="text-slate-200 text-sm">{activity.description}</p>
                  <p className="text-slate-500 text-xs mt-1">{activity.time}</p>
                </div>
                <span className="text-violet-400">{activity.amount}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-slate-900 border-slate-800 p-6">
          <h3 className="text-lg text-slate-100 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-400" />
            Low Stock Alerts
          </h3>
          <div className="space-y-3">
            {lowStockItems.length > 0 ? (
              lowStockItems.map((item) => (
                <div key={item.id} className="p-3 bg-slate-800 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-slate-200 text-sm">{item.name}</p>
                      <p className="text-slate-500 text-xs">SKU: {item.sku}</p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        item.status === 'critical' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>Current: {item.current}</span>
                    <span>•</span>
                    <span>Min: {item.minimum}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-center py-8">All stock levels are healthy</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
