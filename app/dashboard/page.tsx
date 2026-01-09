'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { Quote, Invoice } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'
import { formatCurrency } from '@/lib/utils/validation'
import { DollarSign, Package, AlertCircle, Users, FileText, Plus, TrendingUp, TrendingDown, Clock, CheckCircle, XCircle, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import InvoicesSlideOver from '@/components/InvoicesSlideOver'
import ClientsSlideOver from '@/components/ClientsSlideOver'
import InventorySlideOver from '@/components/InventorySlideOver'

export default function DashboardPage() {
  const { user } = useAuth()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [inventoryStats, setInventoryStats] = useState({
    total_items: 0,
    low_stock_count: 0,
    total_value: 0
  })
  const [inventoryItems, setInventoryItems] = useState<any[]>([])
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [showInvoices, setShowInvoices] = useState(false)
  const [showClients, setShowClients] = useState(false)
  const [showInventory, setShowInventory] = useState(false)

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = async () => {
    if (!user) return

    const [invoicesRes, inventoryRes] = await Promise.all([
      supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100),
      supabase
        .from('inventory_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true),
    ])

    if (invoicesRes.data) setInvoices(invoicesRes.data)

    if (inventoryRes.data) {
      const items = inventoryRes.data
      setInventoryItems(items)
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

  // Calculate stats
  const currentMonth = new Date()
  const lastMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)

  const currentMonthInvoices = invoices.filter(inv => {
    const invDate = new Date(inv.created_at)
    return invDate >= startOfMonth(currentMonth) && invDate <= endOfMonth(currentMonth)
  })

  const lastMonthInvoices = invoices.filter(inv => {
    const invDate = new Date(inv.created_at)
    return invDate >= startOfMonth(lastMonth) && invDate <= endOfMonth(lastMonth)
  })

  const currentMonthRevenue = currentMonthInvoices.filter(i => i.status === 'paid').reduce((sum, inv) => sum + inv.total, 0)
  const lastMonthRevenue = lastMonthInvoices.filter(i => i.status === 'paid').reduce((sum, inv) => sum + inv.total, 0)
  const revenueChange = lastMonthRevenue > 0 ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0

  const stats = {
    totalRevenue: invoices.filter((i) => i.status === 'paid').reduce((sum, invoice) => sum + invoice.total, 0),
    paidInvoices: invoices.filter((i) => i.status === 'paid').length,
    pendingInvoices: invoices.filter((i) => i.status === 'sent').length,
    overdueInvoices: invoices.filter((i) => i.status === 'overdue').length,
    draftInvoices: invoices.filter((i) => i.status === 'draft').length,
    outstandingRevenue: invoices.filter((i) => i.status === 'sent').reduce((sum, invoice) => sum + invoice.total, 0),
    avgInvoiceValue: invoices.length > 0 ? invoices.reduce((sum, inv) => sum + inv.total, 0) / invoices.length : 0,
    currentMonthRevenue,
    revenueChange
  }

  // Revenue data for last 7 months
  const revenueData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setMonth(date.getMonth() - (6 - i))
    const monthStart = startOfMonth(date)
    const monthEnd = endOfMonth(date)

    const monthInvoices = invoices.filter(inv => {
      const invDate = new Date(inv.created_at)
      return invDate >= monthStart && invDate <= monthEnd && inv.status === 'paid'
    })

    return {
      month: format(monthStart, 'MMM'),
      revenue: monthInvoices.reduce((sum, inv) => sum + inv.total, 0),
      count: monthInvoices.length
    }
  })

  // Invoice status distribution
  const invoiceStatusData = [
    { status: 'Paid', count: stats.paidInvoices, color: '#10b981' },
    { status: 'Pending', count: stats.pendingInvoices, color: '#3b82f6' },
    { status: 'Overdue', count: stats.overdueInvoices, color: '#ef4444' },
    { status: 'Draft', count: stats.draftInvoices, color: '#64748b' },
  ].filter(item => item.count > 0)

  // Last 30 days activity
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), 29 - i)
    const dayInvoices = invoices.filter(inv => {
      const invDate = new Date(inv.created_at)
      return format(invDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    })

    return {
      day: format(date, 'd'),
      date: format(date, 'MMM d'),
      total: dayInvoices.reduce((sum, inv) => sum + inv.total, 0),
      count: dayInvoices.length
    }
  })

  const lowStockItems = inventoryItems
    .filter(item => item.track_inventory && item.quantity_on_hand <= item.low_stock_threshold)
    .slice(0, 8)

  const maxRevenue = Math.max(...revenueData.map(d => d.revenue), 1)
  const maxDailyTotal = Math.max(...last30Days.map(d => d.total), 1)
  const totalStatusCount = invoiceStatusData.reduce((sum, item) => sum + item.count, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="relative">
          <div className="animate-spin rounded-none h-16 w-16 border-4 border-orange-500 border-t-transparent"></div>
          <div className="absolute inset-0 animate-ping rounded-none h-16 w-16 border-2 border-orange-300 opacity-20"></div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4 md:space-y-6 pb-8 px-4 md:px-0">
        {/* Header with Date */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 pt-4 md:pt-0">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
              Dashboard
            </h1>
            <p className="text-sm md:text-base text-slate-400 mt-1 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowInvoices(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400"
            >
              <FileText className="w-4 h-4 mr-2" />
              View Invoices
            </Button>
          </div>
        </div>

        {/* Quick Actions - Mobile First */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button
            onClick={() => setShowInvoices(true)}
            variant="outline"
            className="h-20 md:h-24 bg-slate-900/50 border-slate-800 hover:bg-slate-800 hover:border-blue-500/50 flex flex-col items-center justify-center gap-2 transition-all"
          >
            <FileText className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
            <span className="text-xs font-semibold">Invoices</span>
          </Button>
          <Button
            onClick={() => setShowClients(true)}
            variant="outline"
            className="h-20 md:h-24 bg-slate-900/50 border-slate-800 hover:bg-slate-800 hover:border-purple-500/50 flex flex-col items-center justify-center gap-2 transition-all"
          >
            <Users className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
            <span className="text-xs font-semibold">Clients</span>
          </Button>
          <Button
            onClick={() => setShowInventory(true)}
            variant="outline"
            className="h-20 md:h-24 bg-slate-900/50 border-slate-800 hover:bg-slate-800 hover:border-emerald-500/50 flex flex-col items-center justify-center gap-2 transition-all"
          >
            <Package className="w-5 h-5 md:w-6 md:h-6 text-emerald-400" />
            <span className="text-xs font-semibold">Products</span>
          </Button>
          <Link href="/create" className="h-20 md:h-24">
            <Button
              variant="outline"
              className="w-full h-full bg-gradient-to-br from-orange-900/30 to-orange-800/20 border-orange-500/30 hover:bg-orange-800/40 hover:border-orange-400 flex flex-col items-center justify-center gap-2 transition-all"
            >
              <Plus className="w-5 h-5 md:w-6 md:h-6 text-orange-400" />
              <span className="text-xs font-semibold text-orange-300">Create New</span>
            </Button>
          </Link>
        </div>

        {/* Key Metrics - 4 Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Revenue */}
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20 p-4 md:p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                revenueChange >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {revenueChange >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(revenueChange).toFixed(1)}%
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-400 font-medium">Total Revenue</p>
              <p className="text-2xl md:text-3xl font-bold text-white">
                {formatCurrency(stats.totalRevenue, invoices[0]?.currency || 'USD')}
              </p>
              <p className="text-xs text-slate-500">{stats.paidInvoices} paid invoices</p>
            </div>
          </Card>

          {/* Outstanding */}
          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20 p-4 md:p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Clock className="w-5 h-5 md:w-6 md:h-6 text-orange-400" />
              </div>
              <div className="text-xs font-semibold px-2 py-1 rounded-full bg-orange-500/20 text-orange-400">
                {stats.pendingInvoices}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-400 font-medium">Outstanding</p>
              <p className="text-2xl md:text-3xl font-bold text-white">
                {formatCurrency(stats.outstandingRevenue, invoices[0]?.currency || 'USD')}
              </p>
              <p className="text-xs text-slate-500">Pending payment</p>
            </div>
          </Card>

          {/* Average Invoice */}
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20 p-4 md:p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <FileText className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
              </div>
              <div className="text-xs font-semibold px-2 py-1 rounded-full bg-purple-500/20 text-purple-400">
                AVG
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-400 font-medium">Avg Invoice</p>
              <p className="text-2xl md:text-3xl font-bold text-white">
                {formatCurrency(stats.avgInvoiceValue, invoices[0]?.currency || 'USD')}
              </p>
              <p className="text-xs text-slate-500">{invoices.length} total invoices</p>
            </div>
          </Card>

          {/* Stock Value */}
          <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20 p-4 md:p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <Package className="w-5 h-5 md:w-6 md:h-6 text-emerald-400" />
              </div>
              {inventoryStats.low_stock_count > 0 && (
                <div className="text-xs font-semibold px-2 py-1 rounded-full bg-red-500/20 text-red-400">
                  {inventoryStats.low_stock_count} low
                </div>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-400 font-medium">Stock Value</p>
              <p className="text-2xl md:text-3xl font-bold text-white">
                {formatCurrency(inventoryStats.total_value, invoices[0]?.currency || 'USD')}
              </p>
              <p className="text-xs text-slate-500">{inventoryStats.total_items} items</p>
            </div>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Revenue Trend - 7 Months */}
          <Card className="lg:col-span-2 bg-slate-900/50 border-slate-800 p-4 md:p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base md:text-lg font-semibold text-white">Revenue Trend</h3>
                <p className="text-xs text-slate-400 mt-1">Last 7 months</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
                <span>Revenue</span>
              </div>
            </div>
            <div className="space-y-3">
              {revenueData.map((item, i) => {
                const height = (item.revenue / maxRevenue) * 100
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 md:w-10 text-xs text-slate-400 font-medium">{item.month}</div>
                    <div className="flex-1 bg-slate-800/50 rounded-full h-8 md:h-10 relative overflow-hidden">
                      <div
                        className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500 ease-out rounded-full"
                        style={{ width: `${height}%` }}
                      />
                      <div className="absolute inset-0 flex items-center px-3 justify-between">
                        <span className="text-xs font-semibold text-white z-10">
                          {item.count > 0 && `${item.count} invoices`}
                        </span>
                        <span className="text-xs font-bold text-white z-10">
                          {item.revenue > 0 && formatCurrency(item.revenue, invoices[0]?.currency || 'USD')}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Invoice Status Distribution */}
          <Card className="bg-slate-900/50 border-slate-800 p-4 md:p-6">
            <div className="mb-6">
              <h3 className="text-base md:text-lg font-semibold text-white">Invoice Status</h3>
              <p className="text-xs text-slate-400 mt-1">Current breakdown</p>
            </div>
            <div className="space-y-4">
              {invoiceStatusData.map((item, i) => {
                const percentage = (item.count / totalStatusCount) * 100
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-sm"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm text-slate-300">{item.status}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">{item.count}</span>
                        <span className="text-xs font-semibold text-white min-w-[3rem] text-right">
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-800/50 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full transition-all duration-500 ease-out rounded-full"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: item.color
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
            {invoiceStatusData.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm">No invoice data</p>
              </div>
            )}
          </Card>
        </div>

        {/* Recent Invoices & 30-Day Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Recent Invoices */}
          <Card className="bg-slate-900/50 border-slate-800 p-4 md:p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base md:text-lg font-semibold text-white">Recent Invoices</h3>
                <p className="text-xs text-slate-400 mt-1">Latest activity</p>
              </div>
              <Button
                onClick={() => setShowInvoices(true)}
                size="sm"
                variant="outline"
                className="border-blue-500/30 hover:bg-blue-500/10 text-blue-400"
              >
                View All
              </Button>
            </div>
            <div className="space-y-2">
              {invoices.slice(0, 6).map((invoice) => (
                <button
                  key={invoice.id}
                  onClick={() => setSelectedInvoice(invoice)}
                  className="w-full text-left p-3 bg-slate-800/30 hover:bg-slate-800/60 border border-slate-800 hover:border-slate-700 rounded-lg transition-all group"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-white truncate">
                          {invoice.invoice_number}
                        </span>
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded-full ${
                          invoice.status === 'paid' ? 'bg-green-500/20 text-green-400' :
                          invoice.status === 'sent' ? 'bg-blue-500/20 text-blue-400' :
                          invoice.status === 'overdue' ? 'bg-red-500/20 text-red-400' :
                          'bg-slate-500/20 text-slate-400'
                        }`}>
                          {invoice.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">
                        {format(new Date(invoice.issue_date), 'MMM d, yyyy')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm md:text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                        {formatCurrency(invoice.total, invoice.currency)}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
              {invoices.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">No invoices yet</p>
                  <Button
                    onClick={() => setShowInvoices(true)}
                    size="sm"
                    className="mt-4 bg-blue-600 hover:bg-blue-500"
                  >
                    Create Invoice
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* 30-Day Activity */}
          <Card className="bg-slate-900/50 border-slate-800 p-4 md:p-6">
            <div className="mb-6">
              <h3 className="text-base md:text-lg font-semibold text-white">30-Day Activity</h3>
              <p className="text-xs text-slate-400 mt-1">Daily invoice totals</p>
            </div>
            <div className="flex items-end justify-between gap-0.5 h-48">
              {last30Days.map((day, i) => {
                const height = day.total > 0 ? (day.total / maxDailyTotal) * 100 : 2
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                    <div className="w-full flex items-end" style={{ height: '11rem' }}>
                      <div
                        className={`w-full rounded-t-sm transition-all duration-300 ${
                          day.count > 0
                            ? 'bg-gradient-to-t from-purple-600 to-purple-400 hover:from-purple-500 hover:to-purple-300'
                            : 'bg-slate-800/30'
                        }`}
                        style={{ height: `${height}%` }}
                        title={`${day.date}: ${day.count} invoice(s) - ${formatCurrency(day.total, invoices[0]?.currency || 'USD')}`}
                      />
                    </div>
                    {i % 5 === 0 && (
                      <div className="text-[9px] text-slate-600 font-medium">{day.day}</div>
                    )}
                  </div>
                )
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Hover for details</span>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-sm"></div>
                  <span className="text-slate-400">Revenue</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Low Stock Alerts */}
        {inventoryStats.low_stock_count > 0 && (
          <Card className="bg-gradient-to-br from-red-500/5 to-slate-900/50 border-red-500/20 p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
              <div className="flex items-center gap-3 flex-1">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-white">Low Stock Alerts</h3>
                  <p className="text-xs text-red-400 mt-0.5">{inventoryStats.low_stock_count} items need restocking</p>
                </div>
              </div>
              <Button
                onClick={() => setShowInventory(true)}
                size="sm"
                variant="outline"
                className="border-red-500/30 hover:bg-red-500/10 text-red-400 self-start md:self-auto"
              >
                Manage Stock
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {lowStockItems.map((item) => {
                const percentage = item.low_stock_threshold > 0
                  ? (item.quantity_on_hand / item.low_stock_threshold) * 100
                  : 0
                const isCritical = percentage < 50
                return (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-900/60 border border-red-500/20 rounded-lg hover:border-red-500/40 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="text-sm font-semibold text-white truncate flex-1">{item.name || 'Unnamed Item'}</div>
                      <span className={`px-1.5 py-0.5 text-[9px] font-bold uppercase rounded-full ${
                        isCritical ? 'bg-red-500 text-white' : 'bg-orange-500 text-white'
                      }`}>
                        {isCritical ? 'Critical' : 'Low'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mb-3">{item.sku || 'N/A'}</div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Current</span>
                        <span className="text-red-400 font-bold">{item.quantity_on_hand}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Minimum</span>
                        <span className="text-slate-500">{item.low_stock_threshold}</span>
                      </div>
                      <div className="w-full bg-slate-800/50 rounded-full h-1.5 mt-2">
                        <div
                          className={`h-full rounded-full ${
                            isCritical ? 'bg-red-500' : 'bg-orange-500'
                          }`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        )}
      </div>

      {/* Modals and Slide-overs */}
      <InvoicesSlideOver
        isOpen={showInvoices}
        onClose={() => setShowInvoices(false)}
      />
      <ClientsSlideOver
        isOpen={showClients}
        onClose={() => setShowClients(false)}
      />
      <InventorySlideOver
        isOpen={showInventory}
        onClose={() => setShowInventory(false)}
      />

      {/* Invoice Detail Dialog */}
      <Dialog open={!!selectedInvoice} onOpenChange={(open) => !open && setSelectedInvoice(null)}>
        <DialogContent className="bg-slate-900 border-slate-800 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl md:text-2xl font-bold text-white">
              Invoice Details
            </DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <div className="text-xs text-slate-400 mb-2">Invoice Number</div>
                  <div className="font-semibold text-white">{selectedInvoice.invoice_number}</div>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <div className="text-xs text-slate-400 mb-2">Status</div>
                  <div className={`inline-block px-3 py-1 text-xs font-bold uppercase rounded-full ${
                    selectedInvoice.status === 'paid' ? 'bg-green-500/20 text-green-400' :
                    selectedInvoice.status === 'sent' ? 'bg-blue-500/20 text-blue-400' :
                    selectedInvoice.status === 'overdue' ? 'bg-red-500/20 text-red-400' :
                    'bg-slate-500/20 text-slate-400'
                  }`}>
                    {selectedInvoice.status}
                  </div>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <div className="text-xs text-slate-400 mb-2">Issue Date</div>
                  <div className="text-sm text-slate-300">
                    {format(new Date(selectedInvoice.issue_date), 'MMMM d, yyyy')}
                  </div>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <div className="text-xs text-slate-400 mb-2">Total Amount</div>
                  <div className="text-xl font-bold text-blue-400">
                    {formatCurrency(selectedInvoice.total, selectedInvoice.currency)}
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Link href={`/invoices/${selectedInvoice.id}`} className="flex-1">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400">
                    View Full Invoice
                  </Button>
                </Link>
                <Link href={`/invoices/${selectedInvoice.id}/edit`}>
                  <Button variant="outline" className="border-slate-700 hover:bg-slate-800">
                    Edit Invoice
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
