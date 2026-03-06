'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useModal } from '@/contexts/ModalContext'
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns'
import {
  analyzeTrend,
  detectBusinessAnomalies,
} from '@/lib/analytics'
import type { TrendAnalysisResult, BusinessMetricAnomaly } from '@/lib/analytics'
import { InsightsBanner, TrendIndicatorFromResult } from '@/components/analytics'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import {
  Package,
  AlertCircle,
  FileText,
  Users,
  Sparkles,
  Clock,
  ChevronRight,
  Receipt
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AICreateModal } from '@/components/modals/AICreateModal'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import { OnboardingProgress } from '@/components/dashboard/OnboardingProgress'
import { CalendarWidget } from '@/components/dashboard/CalendarWidget'
import { MetricsCardSkeleton } from '@/components/dashboard/MetricsCardSkeleton'
import { formatCurrency, formatCompactCurrency } from '@/lib/utils/currency'
import { useUserCurrency } from '@/hooks/useUserCurrency'

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
  const { openInvoiceModal, openCustomerModal, openProductModal, openExpenseModal, setOnSuccess } = useModal()
  const [loading, setLoading] = useState(true)
  const [showAICreate, setShowAICreate] = useState(false)
  const [topClient, setTopClient] = useState<{ name: string; revenue: number } | null>(null)
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
          .select('id, total, status, issue_date, due_date, client_id')
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

      // Compute top client by total paid revenue
      const clientRevMap: Record<string, number> = {}
      paidInvoices.forEach((inv: any) => {
        if (inv.client_id) {
          clientRevMap[inv.client_id] = (clientRevMap[inv.client_id] || 0) + (inv.total || 0)
        }
      })
      let topClientId = '', topClientRev = 0
      Object.entries(clientRevMap).forEach(([id, rev]) => {
        if (rev > topClientRev) { topClientId = id; topClientRev = rev }
      })
      if (topClientId) {
        const { data: topClientData } = await supabase
          .from('customers')
          .select('full_name, company_name')
          .eq('id', topClientId)
          .single()
        if (topClientData) {
          setTopClient({
            name: (topClientData as any).company_name || (topClientData as any).full_name || 'Unknown',
            revenue: topClientRev,
          })
        }
      }

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
            HEADER - Clear context with greeting (desktop only, mobile greeting in TopBar)
        ================================================================ */}
        <header className="hidden md:block">
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
                  'bg-gradient-to-br from-rose-950/30 to-quotla-dark/50',
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
                  'bg-gradient-to-br from-amber-950/30 to-quotla-dark/50',
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
        {/* ================================================================
            BUSINESS INSIGHTS - Collapsible accordion overview
        ================================================================ */}
        <section aria-labelledby="business-insights">
          <h2 id="business-insights" className="sr-only">Business Insights</h2>
          <Accordion type="single" collapsible defaultValue="insights">
            <Card className={cn(
              'overflow-hidden border',
              'bg-gradient-to-br from-quotla-dark/95 to-primary-800/50',
              'border-quotla-green/20 hover:border-quotla-green/40 transition-all duration-300'
            )}>
              <AccordionItem value="insights" className="border-none">
                <AccordionTrigger className="px-5 py-4 hover:no-underline [&>svg]:text-primary-400">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-quotla-orange" />
                    <span className={components.heading.card}>Business Insights</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-0 pb-0">
                  <div className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Revenue Trend */}
                    <div className="p-3 rounded-xl border bg-quotla-green/10 border-quotla-green/20">
                      <p className={cn(components.heading.tiny, 'mb-1.5')}>Revenue Trend</p>
                      <p className="text-xl font-semibold text-primary-50">
                        {formatCompactCurrency(stats.monthlyRevenue, currency)}
                      </p>
                      {revenueTrend && <TrendIndicatorFromResult result={revenueTrend} size="sm" className="mt-1" />}
                    </div>

                    {/* Top Client */}
                    <div className="p-3 rounded-xl border bg-quotla-orange/10 border-quotla-orange/20">
                      <p className={cn(components.heading.tiny, 'mb-1.5')}>Top Client</p>
                      <p className="text-sm font-semibold text-primary-50 truncate">
                        {topClient?.name ?? '—'}
                      </p>
                      {topClient && (
                        <p className="text-xs text-primary-400 mt-0.5">
                          {formatCompactCurrency(topClient.revenue, currency)}
                        </p>
                      )}
                    </div>

                    {/* Outstanding */}
                    <Link href="/business/sales">
                      <div className={cn(
                        'p-3 rounded-xl border h-full transition-colors cursor-pointer',
                        stats.overdueAmount > 0
                          ? 'bg-rose-950/20 border-rose-500/20 hover:border-rose-500/40'
                          : 'bg-primary-700/30 border-primary-600/30 hover:border-primary-600/50'
                      )}>
                        <p className={cn(components.heading.tiny, 'mb-1.5')}>Outstanding</p>
                        <p className={cn(
                          'text-xl font-semibold',
                          stats.overdueAmount > 0 ? 'text-rose-400' : 'text-primary-100'
                        )}>
                          {formatCompactCurrency(stats.pendingAmount + stats.overdueAmount, currency)}
                        </p>
                        <p className="text-xs text-primary-400 mt-0.5">
                          {stats.pendingInvoices + stats.overdueInvoices} invoice
                          {(stats.pendingInvoices + stats.overdueInvoices) !== 1 ? 's' : ''} pending
                        </p>
                      </div>
                    </Link>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Card>
          </Accordion>
        </section>

        {/* ================================================================
            QUICK ACTIONS - Inline button row
        ================================================================ */}
        <section aria-labelledby="quick-actions">
          <h2 id="quick-actions" className="sr-only">Quick Actions</h2>
          <div className="grid grid-cols-4 gap-1.5 md:flex md:flex-wrap md:gap-2 md:justify-center">
            <Button variant="outline" size="sm" className="gap-1 md:gap-2 text-xs w-full" onClick={() => { setOnSuccess(() => loadData()); openInvoiceModal() }}>
              <FileText className="w-3.5 h-3.5" />
              <span className="md:hidden">Invoice</span>
              <span className="hidden md:inline">New Invoice</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-1 md:gap-2 text-xs w-full" onClick={() => { setOnSuccess(() => loadData()); openCustomerModal() }}>
              <Users className="w-3.5 h-3.5" />
              <span className="md:hidden">Customer</span>
              <span className="hidden md:inline">Add Customer</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-1 md:gap-2 text-xs w-full" onClick={() => { setOnSuccess(() => loadData()); openProductModal() }}>
              <Package className="w-3.5 h-3.5" />
              <span className="md:hidden">Product</span>
              <span className="hidden md:inline">Add Product</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-1 md:gap-2 text-xs w-full" onClick={() => { setOnSuccess(() => loadData()); openExpenseModal() }}>
              <Receipt className="w-3.5 h-3.5" />
              <span className="md:hidden">Expense</span>
              <span className="hidden md:inline">New Expense</span>
            </Button>
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
            {/* Anomaly Insights */}
            <InsightsBanner
              anomalies={visibleAnomalies}
              onDismiss={handleDismissAnomaly}
              onDismissAll={handleDismissAllAnomalies}
              maxVisible={3}
              defaultExpanded={visibleAnomalies.some(a => a.severity === 'critical')}
            />

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
