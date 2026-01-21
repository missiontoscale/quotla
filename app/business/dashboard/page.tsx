'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns'
import {
  Package,
  AlertCircle,
  FileText,
  Users,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  TrendingUp,
  Clock,
  ChevronRight,
  Wallet,
  Target
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AICreateModal } from '@/components/modals/AICreateModal'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import { OnboardingProgress } from '@/components/dashboard/OnboardingProgress'
import { CalendarWidget } from '@/components/dashboard/CalendarWidget'
import { formatCurrency, DEFAULT_CURRENCY } from '@/lib/utils/currency'
import { useUserCurrency } from '@/hooks/useUserCurrency'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts'
import {
  dashboardColors as colors,
  dashboardComponents as components,
  dashboardSpacing as spacing,
  cn
} from '@/hooks/use-dashboard-theme'

// ============================================================================
// TYPES
// ============================================================================

interface DashboardStats {
  // Revenue metrics
  totalRevenue: number
  monthlyRevenue: number
  lastMonthRevenue: number
  revenueGrowth: number
  grossProfit: number
  profitMargin: number
  // Invoice metrics
  pendingInvoices: number
  pendingAmount: number
  overdueInvoices: number
  overdueAmount: number
  // Inventory metrics
  totalProducts: number
  lowStockCount: number
  inventoryValue: number
  // Customer metrics
  totalCustomers: number
  newCustomersThisMonth: number
  avgRevenuePerCustomer: number
}

interface MonthlyData {
  month: string
  revenue: number
  expenses: number
  profit: number
}

interface LowStockItem {
  id: string
  name: string
  sku: string | null
  quantity_on_hand: number
  low_stock_threshold: number
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function DashboardPage() {
  const { user, profile } = useAuth()
  const { currency } = useUserCurrency()
  const [loading, setLoading] = useState(true)
  const [showAICreate, setShowAICreate] = useState(false)
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    monthlyRevenue: 0,
    lastMonthRevenue: 0,
    revenueGrowth: 0,
    grossProfit: 0,
    profitMargin: 0,
    pendingInvoices: 0,
    pendingAmount: 0,
    overdueInvoices: 0,
    overdueAmount: 0,
    totalProducts: 0,
    lowStockCount: 0,
    inventoryValue: 0,
    totalCustomers: 0,
    newCustomersThisMonth: 0,
    avgRevenuePerCustomer: 0
  })
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([])
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])

  // Date ranges for comparison
  const dateRanges = useMemo(() => {
    const now = new Date()
    const thisMonthStart = startOfMonth(now)
    const lastMonthStart = startOfMonth(subMonths(now, 1))
    const lastMonthEnd = endOfMonth(subMonths(now, 1))
    return { thisMonthStart, lastMonthStart, lastMonthEnd }
  }, [])

  useEffect(() => {
    if (user) loadData()
  }, [user])

  const loadData = async () => {
    if (!user) return

    try {
      // Parallel fetch for better performance
      const [inventoryResult, invoiceResult, customerResult] = await Promise.all([
        // Inventory data
        supabase
          .from('inventory_items')
          .select('id, name, sku, quantity_on_hand, low_stock_threshold, cost_price, track_inventory')
          .eq('user_id', user.id)
          .eq('is_active', true),
        // Invoice data with more details
        supabase
          .from('invoices')
          .select('id, total, status, issue_date, due_date')
          .eq('user_id', user.id),
        // Customer data with creation date
        supabase
          .from('customers')
          .select('id, created_at')
          .eq('user_id', user.id)
          .eq('is_active', true)
      ])

      const inventoryData = inventoryResult.data || []
      const invoiceData = invoiceResult.data || []
      const customerData = customerResult.data || []

      // Calculate inventory stats
      const lowStock = inventoryData.filter(item =>
        item.track_inventory && item.quantity_on_hand <= item.low_stock_threshold
      )
      setLowStockItems(lowStock.slice(0, 5) as LowStockItem[])

      const inventoryValue = inventoryData.reduce((sum, item) =>
        sum + (item.quantity_on_hand * (item.cost_price || 0)), 0
      )

      // Calculate revenue metrics with comparison
      const paidInvoices = invoiceData.filter(inv => inv.status === 'paid')
      const totalRevenue = paidInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0)

      const thisMonthPaid = paidInvoices.filter(inv =>
        new Date(inv.issue_date) >= dateRanges.thisMonthStart
      )
      const monthlyRevenue = thisMonthPaid.reduce((sum, inv) => sum + (inv.total || 0), 0)

      const lastMonthPaid = paidInvoices.filter(inv => {
        const date = new Date(inv.issue_date)
        return date >= dateRanges.lastMonthStart && date <= dateRanges.lastMonthEnd
      })
      const lastMonthRevenue = lastMonthPaid.reduce((sum, inv) => sum + (inv.total || 0), 0)

      const revenueGrowth = lastMonthRevenue > 0
        ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
        : monthlyRevenue > 0 ? 100 : 0

      // Calculate invoice status metrics
      const pendingInvoices = invoiceData.filter(inv => inv.status === 'sent')
      const overdueInvoices = invoiceData.filter(inv => inv.status === 'overdue')

      // Calculate customer metrics
      const newCustomersThisMonth = customerData.filter(c =>
        new Date(c.created_at) >= dateRanges.thisMonthStart
      ).length

      // Calculate gross profit and margin from invoice items
      let totalCogs = 0
      if (paidInvoices.length > 0) {
        const paidInvoiceIds = paidInvoices.map(inv => inv.id)
        const { data: invoiceItemsData } = await supabase
          .from('invoice_items')
          .select('quantity, inventory_item_id')
          .in('invoice_id', paidInvoiceIds)

        if (invoiceItemsData && invoiceItemsData.length > 0) {
          const inventoryItemIds = (invoiceItemsData as any[])
            .map((item: any) => item.inventory_item_id)
            .filter((id: string | null): id is string => id !== null)

          if (inventoryItemIds.length > 0) {
            const { data: inventoryCosts } = await supabase
              .from('inventory_items')
              .select('id, cost_price')
              .in('id', inventoryItemIds)

            const costMap = (inventoryCosts || []).reduce((acc: Record<string, number>, item: any) => {
              acc[item.id] = item.cost_price || 0
              return acc
            }, {})

            totalCogs = (invoiceItemsData as any[]).reduce((sum: number, item: any) => {
              const costPrice = item.inventory_item_id ? (costMap[item.inventory_item_id] || 0) : 0
              return sum + (costPrice * item.quantity)
            }, 0)
          }
        }
      }

      const grossProfit = totalRevenue - totalCogs
      const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0
      const avgRevenuePerCustomer = customerData.length > 0 ? totalRevenue / customerData.length : 0

      // Build monthly trend data (last 6 months)
      const sixMonthsAgo = subMonths(new Date(), 5)
      const months = eachMonthOfInterval({ start: startOfMonth(sixMonthsAgo), end: new Date() })

      // Fetch expenses for trend data
      const { data: expensesData } = await supabase
        .from('expenses')
        .select('amount, expense_date')
        .eq('user_id', user.id)
        .gte('expense_date', format(sixMonthsAgo, 'yyyy-MM-dd'))

      const monthlyTrend: MonthlyData[] = months.map(month => {
        const monthStart = startOfMonth(month)
        const monthEnd = endOfMonth(month)
        const monthLabel = format(month, 'MMM')

        const monthRevenue = paidInvoices
          .filter(inv => {
            const date = new Date(inv.issue_date)
            return date >= monthStart && date <= monthEnd
          })
          .reduce((sum, inv) => sum + (inv.total || 0), 0)

        const monthExpenses = (expensesData || [])
          .filter((exp: any) => {
            const date = new Date(exp.expense_date)
            return date >= monthStart && date <= monthEnd
          })
          .reduce((sum: number, exp: any) => sum + (exp.amount || 0), 0)

        return {
          month: monthLabel,
          revenue: monthRevenue,
          expenses: monthExpenses,
          profit: monthRevenue - monthExpenses
        }
      })

      setMonthlyData(monthlyTrend)

      setStats({
        totalRevenue,
        monthlyRevenue,
        lastMonthRevenue,
        revenueGrowth,
        grossProfit,
        profitMargin,
        pendingInvoices: pendingInvoices.length,
        pendingAmount: pendingInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0),
        overdueInvoices: overdueInvoices.length,
        overdueAmount: overdueInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0),
        totalProducts: inventoryData.length,
        lowStockCount: lowStock.length,
        inventoryValue,
        totalCustomers: customerData.length,
        newCustomersThisMonth,
        avgRevenuePerCustomer
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }, [])

  // Determine if user needs attention on any critical metrics
  const hasUrgentItems = stats.overdueInvoices > 0 || stats.lowStockCount > 0

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className={cn(components.spinner, 'h-12 w-12')} />
        </div>
      </div>
    )
  }

  return (
    <>
      <div className={cn(spacing.page, 'max-w-[1400px] mx-auto')}>
        {/* ================================================================
            HEADER - Clear context with primary action
        ================================================================ */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className={components.heading.page}>
              {greeting}{profile?.company_name ? `, ${profile.company_name}` : ''}
            </h1>
            <p className={cn(colors.text.muted, 'text-sm mt-0.5')}>
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
          <Button
            onClick={() => setShowAICreate(true)}
            className={cn(components.button.primary, 'text-sm h-9')}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            AI Create
          </Button>
        </header>

        {/* ================================================================
            URGENT ALERTS - Surface critical items immediately
            Principle: Highlight anomalies and urgent information
        ================================================================ */}
        {hasUrgentItems && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {stats.overdueInvoices > 0 && (
              <Link href="/business/sales">
                <Card className={cn(
                  'p-4 border transition-all cursor-pointer group',
                  'bg-gradient-to-br from-rose-950/30 to-slate-900/50',
                  'border-rose-500/20 hover:border-rose-500/40'
                )}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-rose-500/15 rounded-xl flex items-center justify-center">
                        <Clock className="w-5 h-5 text-rose-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-rose-400">
                          {stats.overdueInvoices} Overdue Invoice{stats.overdueInvoices > 1 ? 's' : ''}
                        </p>
                        <p className="text-xs text-slate-400">
                          {formatCurrency(stats.overdueAmount, currency)} outstanding
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-rose-400/50 group-hover:text-rose-400 transition-colors" />
                  </div>
                </Card>
              </Link>
            )}

            {stats.lowStockCount > 0 && (
              <Link href="/business/products">
                <Card className={cn(
                  'p-4 border transition-all cursor-pointer group',
                  'bg-gradient-to-br from-amber-950/30 to-slate-900/50',
                  'border-amber-500/20 hover:border-amber-500/40'
                )}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-500/15 rounded-xl flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-amber-400">
                          {stats.lowStockCount} Low Stock Item{stats.lowStockCount > 1 ? 's' : ''}
                        </p>
                        <p className="text-xs text-slate-400">
                          Requires restocking
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-amber-400/50 group-hover:text-amber-400 transition-colors" />
                  </div>
                </Card>
              </Link>
            )}
          </div>
        )}

        {/* ================================================================
            PRIMARY KPIs - Strategic metrics with visual hierarchy
            Principle: Most critical data at top, contextualized
        ================================================================ */}
        <section aria-labelledby="primary-metrics">
          <h2 id="primary-metrics" className="sr-only">Primary Business Metrics</h2>

          {/* Primary KPI Row - Revenue & Profit */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            {/* Revenue with Trend Chart */}
            <Card className={cn(
              'p-5 border lg:col-span-2',
              colors.bg.primary, colors.border.default
            )}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Revenue Trend</p>
                  <div className="flex items-baseline gap-3 mt-1">
                    <p className="text-2xl font-bold text-slate-100">
                      {formatCurrency(stats.monthlyRevenue, currency)}
                    </p>
                    {stats.revenueGrowth !== 0 && (
                      <span className={cn(
                        'flex items-center gap-0.5 text-sm font-medium px-2 py-0.5 rounded-full',
                        stats.revenueGrowth > 0
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-rose-500/10 text-rose-400'
                      )}>
                        {stats.revenueGrowth > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {Math.abs(stats.revenueGrowth).toFixed(1)}%
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">This month vs last month</p>
                </div>
                <Link href="/business/sales" className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                  View Sales <ChevronRight className="w-3 h-3" />
                </Link>
              </div>

              {/* Revenue Area Chart */}
              <div className="h-[140px] mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 11 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(0)}k` : value}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                      formatter={(value: number) => [formatCurrency(value, currency), 'Revenue']}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10b981"
                      strokeWidth={2}
                      fill="url(#revenueGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Profit Margin & Gross Profit */}
            <Card className={cn(
              'p-5 border',
              colors.bg.primary, colors.border.default
            )}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-teal-500/10 rounded-xl flex items-center justify-center">
                  <Target className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Profit Margin</p>
                  <p className="text-2xl font-bold text-slate-100">{stats.profitMargin.toFixed(1)}%</p>
                </div>
              </div>

              {/* Visual margin indicator */}
              <div className="mb-4">
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(stats.profitMargin, 100)}%` }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Gross Profit</span>
                  <span className="text-sm font-semibold text-emerald-400">
                    {formatCurrency(stats.grossProfit, currency)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Total Revenue</span>
                  <span className="text-sm font-medium text-slate-300">
                    {formatCurrency(stats.totalRevenue, currency)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Avg/Customer</span>
                  <span className="text-sm font-medium text-slate-300">
                    {formatCurrency(stats.avgRevenuePerCustomer, currency)}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Secondary KPI Row - Operational Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Pending Invoices */}
            <Link href="/business/sales">
              <Card className={cn(
                'p-4 border transition-all cursor-pointer group hover:border-cyan-500/30',
                colors.bg.primary, colors.border.default
              )}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500">Pending</p>
                    <p className="text-lg font-semibold text-slate-100">{stats.pendingInvoices}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2 truncate">
                  {formatCurrency(stats.pendingAmount, currency)} awaiting
                </p>
              </Card>
            </Link>

            {/* Outstanding */}
            <Link href="/business/sales">
              <Card className={cn(
                'p-4 border transition-all cursor-pointer group hover:border-amber-500/30',
                colors.bg.primary, colors.border.default
              )}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-amber-500/10 rounded-lg flex items-center justify-center">
                    <Wallet className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500">Outstanding</p>
                    <p className="text-lg font-semibold text-slate-100">
                      {formatCurrency(stats.pendingAmount + stats.overdueAmount, currency)}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Accounts receivable
                </p>
              </Card>
            </Link>

            {/* Customers */}
            <Link href="/business/sales">
              <Card className={cn(
                'p-4 border transition-all cursor-pointer group hover:border-purple-500/30',
                colors.bg.primary, colors.border.default
              )}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-purple-500/10 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500">Customers</p>
                    <p className="text-lg font-semibold text-slate-100">{stats.totalCustomers}</p>
                  </div>
                </div>
                {stats.newCustomersThisMonth > 0 ? (
                  <p className="text-xs text-emerald-400 mt-2">+{stats.newCustomersThisMonth} this month</p>
                ) : (
                  <p className="text-xs text-slate-500 mt-2">Active accounts</p>
                )}
              </Card>
            </Link>

            {/* Inventory */}
            <Link href="/business/products">
              <Card className={cn(
                'p-4 border transition-all cursor-pointer group hover:border-violet-500/30',
                colors.bg.primary, colors.border.default
              )}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-violet-500/10 rounded-lg flex items-center justify-center">
                    <Package className="w-4 h-4 text-violet-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500">Inventory</p>
                    <p className="text-lg font-semibold text-slate-100">
                      {formatCurrency(stats.inventoryValue, currency)}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2">{stats.totalProducts} products</p>
              </Card>
            </Link>
          </div>
        </section>

        {/* ================================================================
            MAIN CONTENT GRID - Two-column layout
            Principle: Logical grouping, clear sections
        ================================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Activity & Alerts (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions - Streamlined */}
            <section aria-labelledby="quick-actions">
              <h2 id="quick-actions" className={cn(components.heading.section, 'mb-3')}>
                Quick Actions
              </h2>
              <div className="grid grid-cols-3 gap-3">
                <Link href="/business/sales">
                  <Card className={cn(
                    'p-3 border transition-all cursor-pointer group text-center',
                    colors.bg.primary, colors.border.default,
                    'hover:border-cyan-500/30 hover:bg-cyan-500/5'
                  )}>
                    <FileText className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
                    <span className="text-sm font-medium text-slate-200">New Invoice</span>
                  </Card>
                </Link>

                <Link href="/business/sales">
                  <Card className={cn(
                    'p-3 border transition-all cursor-pointer group text-center',
                    colors.bg.primary, colors.border.default,
                    'hover:border-purple-500/30 hover:bg-purple-500/5'
                  )}>
                    <Users className="w-5 h-5 text-purple-400 mx-auto mb-2" />
                    <span className="text-sm font-medium text-slate-200">Add Customer</span>
                  </Card>
                </Link>

                <Link href="/business/products">
                  <Card className={cn(
                    'p-3 border transition-all cursor-pointer group text-center',
                    colors.bg.primary, colors.border.default,
                    'hover:border-green-500/30 hover:bg-green-500/5'
                  )}>
                    <Package className="w-5 h-5 text-green-400 mx-auto mb-2" />
                    <span className="text-sm font-medium text-slate-200">Add Product</span>
                  </Card>
                </Link>
              </div>
            </section>

            {/* Activity Feed - Primary information flow */}
            <Card className={components.card.base}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={components.heading.card}>Recent Activity</h2>
                <span className="text-xs text-slate-500">Last 7 days</span>
              </div>
              <ActivityFeed />
            </Card>

            {/* Low Stock Details - Contextual drill-down */}
            {stats.lowStockCount > 0 && lowStockItems.length > 0 && (
              <Card className={cn(
                'p-5 border',
                'bg-gradient-to-br from-amber-950/20 to-slate-900/50',
                'border-amber-500/20'
              )}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <h2 className={components.heading.card}>Low Stock Items</h2>
                  </div>
                  <Link
                    href="/business/products"
                    className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
                  >
                    View all
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="space-y-2">
                  {lowStockItems.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        'flex items-center justify-between p-3 rounded-lg border',
                        colors.bg.primary, colors.border.default
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-200 truncate">{item.name}</p>
                        <p className="text-xs text-slate-500">{item.sku || 'No SKU'}</p>
                      </div>
                      <div className="text-right ml-4">
                        <p className={cn(
                          'text-sm font-semibold',
                          item.quantity_on_hand === 0 ? 'text-rose-400' : 'text-amber-400'
                        )}>
                          {item.quantity_on_hand} left
                        </p>
                        <p className="text-xs text-slate-500">Threshold: {item.low_stock_threshold}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Right Column - Sidebar widgets (1/3 width) */}
          <aside className="space-y-6">
            {/* Onboarding - Contextual guidance */}
            <OnboardingProgress />

            {/* Due Dates - Time-sensitive information */}
            <Card className={components.card.base}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={components.heading.card}>Upcoming Due Dates</h2>
              </div>
              <CalendarWidget />
            </Card>
          </aside>
        </div>
      </div>

      {/* AI Create Modal */}
      <AICreateModal
        open={showAICreate}
        onOpenChange={setShowAICreate}
      />
    </>
  )
}
