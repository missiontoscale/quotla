'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns'
import {
  analyzeTrend,
  detectBusinessAnomalies,
} from '@/lib/analytics'
import type { TrendAnalysisResult, BusinessMetricAnomaly } from '@/lib/analytics'
import { AlertsBanner, AVITPFMetric, LargeAVITPFMetric, CompactAVITPFMetric } from '@/components/analytics'
import {
  Package,
  AlertCircle,
  FileText,
  Users,
  Sparkles,
  Clock,
  ChevronRight,
  Wallet,
  Receipt
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { AICreateModal } from '@/components/modals/AICreateModal'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import { OnboardingProgress } from '@/components/dashboard/OnboardingProgress'
import { CalendarWidget } from '@/components/dashboard/CalendarWidget'
import { MetricsCardSkeleton } from '@/components/dashboard/MetricsCardSkeleton'
import { formatCurrency, formatCompactCurrency } from '@/lib/utils/currency'
import { useUserCurrency } from '@/hooks/useUserCurrency'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Line,
  Legend
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
  // Sales count (paid invoices)
  salesCount: number
  lastMonthSalesCount: number
  // Inventory metrics
  totalProducts: number
  lowStockCount: number
  inventoryValue: number
  stockQuantity: number
  lastMonthStockQuantity: number
  // Customer metrics
  totalCustomers: number
  newCustomersThisMonth: number
  lastMonthCustomers: number
  avgRevenuePerCustomer: number
}

interface MonthlyData {
  month: string
  revenue: number
  expenses: number
  profit: number
  unitsSold: number
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
  return <DashboardContent />
}

function DashboardContent() {
  const { user, profile } = useAuth()
  const { currency } = useUserCurrency()
  const [loading, setLoading] = useState(true)
  const [showAICreate, setShowAICreate] = useState(false)
  const [chartMode, setChartMode] = useState<'revenue' | 'volume'>('revenue')
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
    salesCount: 0,
    lastMonthSalesCount: 0,
    totalProducts: 0,
    lowStockCount: 0,
    inventoryValue: 0,
    stockQuantity: 0,
    lastMonthStockQuantity: 0,
    totalCustomers: 0,
    newCustomersThisMonth: 0,
    lastMonthCustomers: 0,
    avgRevenuePerCustomer: 0,
  })
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([])
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [revenueTrend, setRevenueTrend] = useState<TrendAnalysisResult | null>(null)
  const [anomalies, setAnomalies] = useState<BusinessMetricAnomaly[]>([])
  const [dismissedAnomalyIds, setDismissedAnomalyIds] = useState<Set<string>>(new Set())

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

      // Calculate total stock quantity
      const stockQuantity = inventoryData.reduce((sum, item) =>
        sum + (item.quantity_on_hand || 0), 0
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

      // Calculate sales count (number of paid invoices)
      const salesCount = thisMonthPaid.length
      const lastMonthSalesCount = lastMonthPaid.length

      // Calculate invoice status metrics
      const pendingInvoices = invoiceData.filter(inv => inv.status === 'sent')
      const overdueInvoices = invoiceData.filter(inv => inv.status === 'overdue')

      // Calculate customer metrics
      const newCustomersThisMonth = customerData.filter(c =>
        new Date(c.created_at) >= dateRanges.thisMonthStart
      ).length

      const lastMonthNewCustomers = customerData.filter(c => {
        const date = new Date(c.created_at)
        return date >= dateRanges.lastMonthStart && date <= dateRanges.lastMonthEnd
      }).length

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

      // Fetch invoice items for units sold calculation
      const paidInvoiceIds = paidInvoices.map(inv => inv.id)
      const { data: allInvoiceItems } = await supabase
        .from('invoice_items')
        .select('quantity, invoice_id')
        .in('invoice_id', paidInvoiceIds.length > 0 ? paidInvoiceIds : [''])

      // Create a map of invoice dates for units sold calculation
      const invoiceDateMap = paidInvoices.reduce((acc: Record<string, Date>, inv) => {
        acc[inv.id] = new Date(inv.issue_date)
        return acc
      }, {})

      const monthlyTrend: MonthlyData[] = months.map(month => {
        const monthStart = startOfMonth(month)
        const monthEnd = endOfMonth(month)
        const monthLabel = format(month, 'MMM')

        // Get invoices for this month
        const monthInvoices = paidInvoices.filter(inv => {
          const date = new Date(inv.issue_date)
          return date >= monthStart && date <= monthEnd
        })
        const monthInvoiceIds = monthInvoices.map(inv => inv.id)

        const monthRevenue = monthInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0)

        const monthExpenses = (expensesData || [])
          .filter((exp: any) => {
            const date = new Date(exp.expense_date)
            return date >= monthStart && date <= monthEnd
          })
          .reduce((sum: number, exp: any) => sum + (exp.amount || 0), 0)

        // Calculate units sold for this month
        const monthUnitsSold = (allInvoiceItems || [])
          .filter((item: any) => monthInvoiceIds.includes(item.invoice_id))
          .reduce((sum: number, item: any) => sum + (item.quantity || 0), 0)

        return {
          month: monthLabel,
          revenue: monthRevenue,
          expenses: monthExpenses,
          profit: monthRevenue - monthExpenses,
          unitsSold: monthUnitsSold
        }
      })

      setMonthlyData(monthlyTrend)

      // Analyze revenue trend
      const revenueValues = monthlyTrend.map(m => m.revenue)
      const trendResult = analyzeTrend(revenueValues)
      setRevenueTrend(trendResult)

      // Detect anomalies in business metrics
      const detectedAnomalies = detectBusinessAnomalies(monthlyTrend, {
        zScoreThreshold: 2,
        minDataPoints: 3,
      })
      setAnomalies(detectedAnomalies)

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
        salesCount,
        lastMonthSalesCount,
        totalProducts: inventoryData.length,
        lowStockCount: lowStock.length,
        inventoryValue,
        stockQuantity,
        lastMonthStockQuantity: stockQuantity, // Snapshot comparison not available yet
        totalCustomers: customerData.length,
        newCustomersThisMonth,
        lastMonthCustomers: lastMonthNewCustomers,
        avgRevenuePerCustomer,
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

  // Filter out dismissed anomalies
  const visibleAnomalies = useMemo(() =>
    anomalies.filter(a => !dismissedAnomalyIds.has(a.id)),
    [anomalies, dismissedAnomalyIds]
  )

  const handleDismissAnomaly = (id: string) => {
    setDismissedAnomalyIds(prev => new Set([...prev, id]))
  }

  const handleDismissAllAnomalies = () => {
    setDismissedAnomalyIds(new Set(anomalies.map(a => a.id)))
  }

  // Calculate month-over-month growth for expenses and profit
  const lastMonthExpenses = monthlyData[monthlyData.length - 2]?.expenses || 0
  const currentMonthExpenses = monthlyData[monthlyData.length - 1]?.expenses || 0
  const expensesGrowth = lastMonthExpenses > 0
    ? ((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100
    : 0

  const lastMonthProfit = monthlyData[monthlyData.length - 2]?.profit || 0
  const currentMonthProfit = monthlyData[monthlyData.length - 1]?.profit || 0
  const profitGrowth = lastMonthProfit > 0
    ? ((currentMonthProfit - lastMonthProfit) / lastMonthProfit) * 100
    : 0

  if (loading) {
    return (
      <div className="space-y-4 max-w-[1400px] mx-auto px-3 md:px-4">
        <MetricsCardSkeleton />
        <MetricsCardSkeleton />
      </div>
    )
  }

  return (
    <>
      <div className={cn(spacing.page, 'max-w-[1400px] mx-auto')}>
        {/* ================================================================
            HEADER - Clear context with greeting
        ================================================================ */}
        <header>
          <h1 className={components.heading.page}>
            {greeting}{profile?.company_name ? `, ${profile.company_name}` : ''}
          </h1>
          <p className={cn(colors.text.muted, 'text-sm mt-0.5')}>
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
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
                        <p className="text-xs text-primary-400">
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
                        <p className="text-xs text-primary-400">
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
            OVERVIEW PANE - AVITPF Metrics with Toggle Chart
        ================================================================ */}
        <section aria-labelledby="overview-metrics">
          <h2 id="overview-metrics" className="sr-only">Overview Metrics</h2>

          {/* Overview Card */}
          <Card className={cn(
            'p-6 border shadow-lg',
            'bg-gradient-to-br from-quotla-dark/95 to-primary-800/50',
            'border-quotla-green/20 hover:border-quotla-green/40 transition-all duration-300',
            'shadow-quotla-dark/50'
          )}>
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <p className={cn('text-xs font-medium uppercase tracking-wider', colors.text.muted)}>OVERVIEW</p>
              <Link href="/business/sales" className="text-xs text-quotla-orange hover:text-secondary-400 flex items-center gap-1 transition-colors">
                View Sales <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {/* First Row: Revenue + Profit/Expenses */}
            {/* Mobile: Single card containing all three metrics */}
            {/* Desktop: Two-column layout with separate styled divs */}
            <div className="mb-4">
              {/* Mobile Layout - Single Card */}
              <div className={cn(
                'md:hidden p-4 rounded-xl border backdrop-blur-sm',
                'bg-primary-700/30 border-quotla-green/20'
              )}>
                <LargeAVITPFMetric
                  label="Revenue"
                  value={stats.monthlyRevenue}
                  change={stats.revenueGrowth}
                  currency={currency}
                  colorScheme="green"
                />
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className={cn(
                    'p-3 rounded-lg border backdrop-blur-sm',
                    'bg-primary-800/30 border-emerald-500/20'
                  )}>
                    <CompactAVITPFMetric
                      label="Profit"
                      value={currentMonthProfit}
                      change={profitGrowth}
                      currency={currency}
                      colorScheme="emerald"
                    />
                  </div>
                  <div className={cn(
                    'p-3 rounded-lg border backdrop-blur-sm',
                    'bg-primary-800/30 border-rose-500/20'
                  )}>
                    <CompactAVITPFMetric
                      label="Expenses"
                      value={currentMonthExpenses}
                      change={expensesGrowth}
                      currency={currency}
                      colorScheme="rose"
                      invertColors
                    />
                  </div>
                </div>
              </div>

              {/* Desktop Layout - Two Columns */}
              <div className="hidden md:grid md:grid-cols-2 gap-4">
                <div className={cn(
                  'p-4 rounded-xl border backdrop-blur-sm',
                  'bg-primary-700/30 border-quotla-green/20'
                )}>
                  <LargeAVITPFMetric
                    label="Revenue"
                    value={stats.monthlyRevenue}
                    change={stats.revenueGrowth}
                    currency={currency}
                    colorScheme="green"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className={cn(
                    'p-3 rounded-xl border backdrop-blur-sm',
                    'bg-primary-700/30 border-emerald-500/20'
                  )}>
                    <CompactAVITPFMetric
                      label="Profit"
                      value={currentMonthProfit}
                      change={profitGrowth}
                      currency={currency}
                      colorScheme="emerald"
                    />
                  </div>
                  <div className={cn(
                    'p-3 rounded-xl border backdrop-blur-sm',
                    'bg-primary-700/30 border-rose-500/20'
                  )}>
                    <CompactAVITPFMetric
                      label="Expenses"
                      value={currentMonthExpenses}
                      change={expensesGrowth}
                      currency={currency}
                      colorScheme="rose"
                      invertColors
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Second Row: Sales + Customers/Stock */}
            {/* Mobile: Single card containing all three metrics */}
            {/* Desktop: Two-column layout with separate styled divs */}
            <div className="mb-6">
              {/* Mobile Layout - Single Card */}
              <div className={cn(
                'md:hidden p-4 rounded-xl border backdrop-blur-sm',
                'bg-primary-700/30 border-quotla-orange/20'
              )}>
                <LargeAVITPFMetric
                  label="Sales"
                  value={stats.salesCount}
                  change={stats.salesCount - stats.lastMonthSalesCount}
                  isInteger
                  colorScheme="orange"
                />
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className={cn(
                    'p-3 rounded-lg border backdrop-blur-sm',
                    'bg-primary-800/30 border-teal-500/20'
                  )}>
                    <CompactAVITPFMetric
                      label="Customers"
                      value={stats.totalCustomers}
                      change={stats.newCustomersThisMonth - stats.lastMonthCustomers}
                      isInteger
                      colorScheme="teal"
                    />
                  </div>
                  <div className={cn(
                    'p-3 rounded-lg border backdrop-blur-sm',
                    'bg-primary-800/30 border-emerald-500/20'
                  )}>
                    <CompactAVITPFMetric
                      label="Stock"
                      value={stats.stockQuantity}
                      change={stats.stockQuantity - stats.lastMonthStockQuantity}
                      isInteger
                      colorScheme="emerald"
                    />
                  </div>
                </div>
              </div>

              {/* Desktop Layout - Two Columns */}
              <div className="hidden md:grid md:grid-cols-2 gap-4">
                <div className={cn(
                  'p-4 rounded-xl border backdrop-blur-sm',
                  'bg-primary-700/30 border-quotla-orange/20'
                )}>
                  <LargeAVITPFMetric
                    label="Sales"
                    value={stats.salesCount}
                    change={stats.salesCount - stats.lastMonthSalesCount}
                    isInteger
                    colorScheme="orange"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className={cn(
                    'p-3 rounded-xl border backdrop-blur-sm',
                    'bg-primary-700/30 border-teal-500/20'
                  )}>
                    <CompactAVITPFMetric
                      label="Customers"
                      value={stats.totalCustomers}
                      change={stats.newCustomersThisMonth - stats.lastMonthCustomers}
                      isInteger
                      colorScheme="teal"
                    />
                  </div>
                  <div className={cn(
                    'p-3 rounded-xl border backdrop-blur-sm',
                    'bg-primary-700/30 border-emerald-500/20'
                  )}>
                    <CompactAVITPFMetric
                      label="Stock"
                      value={stats.stockQuantity}
                      change={stats.stockQuantity - stats.lastMonthStockQuantity}
                      isInteger
                      colorScheme="emerald"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Third Row: Toggle Chart */}
            <div className="mb-4">
              <div className="flex justify-center mb-4">
                <ToggleGroup
                  type="single"
                  value={chartMode}
                  onValueChange={(value) => value && setChartMode(value as 'revenue' | 'volume')}
                  className="bg-slate-800/50 rounded-lg p-1"
                >
                  <ToggleGroupItem
                    value="revenue"
                    className="text-xs px-6 py-1.5 rounded-md data-[state=on]:bg-slate-700 data-[state=on]:text-white"
                  >
                    Revenue
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="volume"
                    className="text-xs px-6 py-1.5 rounded-md data-[state=on]:bg-slate-700 data-[state=on]:text-white"
                  >
                    Volume
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  {chartMode === 'revenue' ? (
                    <ComposedChart data={monthlyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#445642" stopOpacity={0.5}/>
                          <stop offset="95%" stopColor="#445642" stopOpacity={0.05}/>
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#8a8a66', fontSize: 11 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#8a8a66', fontSize: 11 }}
                        tickFormatter={(value) => {
                          if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
                          if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
                          return value
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0e1616',
                          border: '1px solid #445642',
                          borderRadius: '8px',
                          fontSize: '12px',
                          color: '#fffad6'
                        }}
                        formatter={(value: number, name: string) => {
                          const labels: Record<string, string> = {
                            revenue: 'Revenue',
                            expenses: 'Expenses',
                            profit: 'Profit'
                          }
                          return [formatCurrency(value, currency), labels[name] || name]
                        }}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                        formatter={(value) => {
                          const labels: Record<string, string> = {
                            revenue: 'Revenue',
                            expenses: 'Expenses',
                            profit: 'Profit'
                          }
                          return labels[value] || value
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#445642"
                        strokeWidth={2}
                        fill="url(#revenueGradient)"
                        name="revenue"
                      />
                      <Line
                        type="monotone"
                        dataKey="expenses"
                        stroke="#ef4444"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ fill: '#ef4444', r: 3 }}
                        name="expenses"
                      />
                      <Line
                        type="monotone"
                        dataKey="profit"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ fill: '#10b981', r: 3 }}
                        name="profit"
                      />
                    </ComposedChart>
                  ) : (
                    <AreaChart data={monthlyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.5}/>
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0.05}/>
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#8a8a66', fontSize: 11 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#8a8a66', fontSize: 11 }}
                        tickFormatter={(value) => {
                          if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
                          if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
                          return value
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0e1616',
                          border: '1px solid #f97316',
                          borderRadius: '8px',
                          fontSize: '12px',
                          color: '#fffad6'
                        }}
                        formatter={(value: number) => [value.toLocaleString(), 'Units Sold']}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                        formatter={() => 'Units Sold'}
                      />
                      <Area
                        type="monotone"
                        dataKey="unitsSold"
                        stroke="#f97316"
                        strokeWidth={2}
                        fill="url(#volumeGradient)"
                        name="unitsSold"
                      />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          </Card>

        </section>

        {/* ================================================================
            QUICK ACTIONS - Inline button row
        ================================================================ */}
        <section aria-labelledby="quick-actions">
          <h2 id="quick-actions" className="sr-only">Quick Actions</h2>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link href="/business/sales">
              <Button variant="outline" size="sm" className="gap-2 text-xs">
                <FileText className="w-3.5 h-3.5" /> New Invoice
              </Button>
            </Link>
            <Link href="/business/sales">
              <Button variant="outline" size="sm" className="gap-2 text-xs">
                <Users className="w-3.5 h-3.5" /> Add Customer
              </Button>
            </Link>
            <Link href="/business/products">
              <Button variant="outline" size="sm" className="gap-2 text-xs">
                <Package className="w-3.5 h-3.5" /> Add Product
              </Button>
            </Link>
            <Link href="/business/expenses">
              <Button variant="outline" size="sm" className="gap-2 text-xs">
                <Receipt className="w-3.5 h-3.5" /> New Expense
              </Button>
            </Link>
          </div>
        </section>

        {/* ================================================================
            MAIN CONTENT GRID - Two-column layout
        ================================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Activity & Alerts (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Activity Feed - Primary information flow */}
            <Card className={components.card.base}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={components.heading.card}>Recent Activity</h2>
                <Link href="/business/sales" className="text-xs text-quotla-orange hover:text-secondary-400 flex items-center gap-1 transition-colors">
                  View More <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <ActivityFeed limit={3} />
            </Card>

            {/* AI Create Button */}
            <div className="flex justify-center">
              <Button
                onClick={() => setShowAICreate(true)}
                className={cn(components.button.primary, 'text-sm h-9 w-full max-w-xs')}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                AI Create
              </Button>
            </div>

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
                        <p className="text-sm font-medium text-primary-100 truncate">{item.name}</p>
                        <p className="text-xs text-primary-400">{item.sku || 'No SKU'}</p>
                      </div>
                      <div className="text-right ml-4">
                        <p className={cn(
                          'text-sm font-semibold',
                          item.quantity_on_hand === 0 ? 'text-rose-400' : 'text-amber-400'
                        )}>
                          {item.quantity_on_hand} left
                        </p>
                        <p className="text-xs text-primary-400">Threshold: {item.low_stock_threshold}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Right Column - Sidebar widgets (1/3 width) */}
          <aside className="space-y-6">
            {/* Anomaly Alerts - Surface detected anomalies */}
            {visibleAnomalies.length > 0 && (
              <AlertsBanner
                anomalies={visibleAnomalies}
                onDismiss={handleDismissAnomaly}
                onDismissAll={handleDismissAllAnomalies}
                maxVisible={3}
                collapsible
                defaultExpanded={visibleAnomalies.some(a => a.severity === 'critical')}
              />
            )}

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
