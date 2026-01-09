'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { Quote, Invoice } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { format } from 'date-fns'
import { formatCurrency } from '@/lib/utils/validation'
import { DollarSign, Package, AlertCircle, Users, FileText, ShoppingCart, Plus, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import InvoicesSlideOver from '@/components/InvoicesSlideOver'
import QuotesSlideOver from '@/components/QuotesSlideOver'
import ClientsSlideOver from '@/components/ClientsSlideOver'
import InventorySlideOver from '@/components/InventorySlideOver'

const COLORS = ['#ff6b35', '#f7931e', '#c1121f', '#0077b6', '#7209b7', '#4cc9f0', '#06ffa5']

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
  const [inventoryItems, setInventoryItems] = useState<any[]>([])
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
  const [showInvoices, setShowInvoices] = useState(false)
  const [showQuotes, setShowQuotes] = useState(false)
  const [showClients, setShowClients] = useState(false)
  const [showInventory, setShowInventory] = useState(false)

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

  // Group inventory by category
  const categoryData = inventoryItems.reduce((acc, item) => {
    const category = item.category || 'Uncategorized'
    const existing = acc.find(c => c.name === category)
    if (existing) {
      existing.value += 1
      existing.totalValue += item.quantity_on_hand * item.cost_price
    } else {
      acc.push({
        name: category,
        value: 1,
        totalValue: item.quantity_on_hand * item.cost_price
      })
    }
    return acc
  }, [] as { name: string; value: number; totalValue: number }[])
  .sort((a, b) => b.value - a.value)
  .slice(0, 7) // Top 7 categories

  // Invoice status distribution
  const invoiceStatusData = [
    { status: 'Paid', count: invoices.filter(i => i.status === 'paid').length, fill: '#10b981' },
    { status: 'Sent', count: invoices.filter(i => i.status === 'sent').length, fill: '#06b6d4' },
    { status: 'Draft', count: invoices.filter(i => i.status === 'draft').length, fill: '#94a3b8' },
    { status: 'Overdue', count: invoices.filter(i => i.status === 'overdue').length, fill: '#ef4444' },
    { status: 'Cancelled', count: invoices.filter(i => i.status === 'cancelled').length, fill: '#64748b' },
  ].filter(item => item.count > 0)

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
        <div className="relative">
          <div className="animate-spin rounded-none h-16 w-16 border-4 border-orange-500 border-t-transparent"></div>
          <div className="absolute inset-0 animate-ping rounded-none h-16 w-16 border-2 border-orange-300 opacity-20"></div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-8 pb-8">
        {/* Header - Brutalist Style */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-blue-500/5"></div>
          <div className="relative border-l-8 border-orange-500 pl-6 py-4">
            <h1 className="text-5xl md:text-6xl font-black text-slate-50 tracking-tight uppercase" style={{ fontFamily: 'system-ui' }}>
              Command
              <span className="block text-2xl md:text-3xl text-orange-500 mt-1">Center</span>
            </h1>
            <div className="mt-3 text-xs text-slate-500 uppercase tracking-widest font-mono">
              {format(new Date(), 'EEEE, MMMM d, yyyy • HH:mm')}
            </div>
          </div>
        </div>

        {/* Quick Actions - Mobile First */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Button
            onClick={() => setShowInvoices(true)}
            className="h-24 bg-gradient-to-br from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 border-2 border-orange-400/20 flex flex-col items-center justify-center gap-2 rounded-sm shadow-lg shadow-orange-900/20"
          >
            <FileText className="w-6 h-6" />
            <span className="text-xs font-bold uppercase tracking-wide">Invoices</span>
          </Button>
          <Button
            onClick={() => setShowQuotes(true)}
            className="h-24 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 border-2 border-blue-400/20 flex flex-col items-center justify-center gap-2 rounded-sm shadow-lg shadow-blue-900/20"
          >
            <ShoppingCart className="w-6 h-6" />
            <span className="text-xs font-bold uppercase tracking-wide">Quotes</span>
          </Button>
          <Button
            onClick={() => setShowClients(true)}
            className="h-24 bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 border-2 border-purple-400/20 flex flex-col items-center justify-center gap-2 rounded-sm shadow-lg shadow-purple-900/20"
          >
            <Users className="w-6 h-6" />
            <span className="text-xs font-bold uppercase tracking-wide">Clients</span>
          </Button>
          <Button
            onClick={() => setShowInventory(true)}
            className="h-24 bg-gradient-to-br from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 border-2 border-cyan-400/20 flex flex-col items-center justify-center gap-2 rounded-sm shadow-lg shadow-cyan-900/20"
          >
            <Package className="w-6 h-6" />
            <span className="text-xs font-bold uppercase tracking-wide">Products</span>
          </Button>
        </div>

        {/* Stats - Asymmetric Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Large Featured Stat */}
          <div className="lg:col-span-2 relative">
            <div className="absolute -top-2 -left-2 w-full h-full bg-orange-500/10 rounded-none"></div>
            <Card className="relative bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-orange-500/30 p-8 rounded-sm">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="text-xs uppercase tracking-widest text-orange-400 font-bold mb-2">Total Revenue</div>
                  <div className="text-5xl md:text-6xl font-black text-slate-50 tracking-tight">
                    {formatCurrency(stats.totalRevenue, invoices[0]?.currency || 'USD')}
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-green-400 font-semibold">+12.5%</span>
                    <span className="text-xs text-slate-500">vs last month</span>
                  </div>
                </div>
                <div className="w-16 h-16 bg-orange-500/20 border-2 border-orange-500 rounded-none flex items-center justify-center">
                  <DollarSign className="w-8 h-8 text-orange-400" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-6 border-t-2 border-slate-700">
                <div>
                  <div className="text-2xl font-bold text-slate-200">{stats.paidInvoices}</div>
                  <div className="text-xs text-slate-500 uppercase tracking-wide">Paid</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-200">{stats.pendingInvoices}</div>
                  <div className="text-xs text-slate-500 uppercase tracking-wide">Pending</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-200">{invoices.length}</div>
                  <div className="text-xs text-slate-500 uppercase tracking-wide">Total</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Side Stats */}
          <div className="space-y-4">
            <Card className="bg-slate-900/80 border-2 border-blue-500/30 p-6 rounded-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <Package className="w-8 h-8 text-blue-400" />
                  <div className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2 py-1 rounded-none border border-blue-500/30">
                    +5.2%
                  </div>
                </div>
                <div className="text-xs uppercase tracking-widest text-blue-400 font-bold mb-2">Stock Value</div>
                <div className="text-3xl font-black text-slate-50">
                  {formatCurrency(inventoryStats.total_value, invoices[0]?.currency || 'USD')}
                </div>
                <div className="text-xs text-slate-500 mt-2">{inventoryStats.total_items} items</div>
              </div>
            </Card>

            <Card className="bg-slate-900/80 border-2 border-purple-500/30 p-6 rounded-sm relative overflow-hidden">
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/5 rounded-full -ml-16 -mb-16"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <AlertCircle className="w-8 h-8 text-purple-400" />
                  <div className="text-xs font-mono text-purple-400 bg-purple-500/10 px-2 py-1 rounded-none border border-purple-500/30">
                    -8.1%
                  </div>
                </div>
                <div className="text-xs uppercase tracking-widest text-purple-400 font-bold mb-2">Outstanding</div>
                <div className="text-3xl font-black text-slate-50">
                  {formatCurrency(stats.outstandingRevenue, invoices[0]?.currency || 'USD')}
                </div>
                <div className="text-xs text-slate-500 mt-2">{stats.pendingInvoices} unpaid</div>
              </div>
            </Card>
          </div>
        </div>

        {/* Recent Activity - Timeline Style */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="bg-slate-900/80 border-l-4 border-l-orange-500 border-y-2 border-r-2 border-slate-800 p-6 rounded-none">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-black text-slate-100 uppercase tracking-wide">Recent Invoices</h3>
                <p className="text-xs text-slate-500 mt-1">Latest transactions</p>
              </div>
              <Button
                onClick={() => setShowInvoices(true)}
                size="sm"
                className="bg-orange-600 hover:bg-orange-500 rounded-none text-xs font-bold uppercase"
              >
                View All
              </Button>
            </div>
            <div className="space-y-3">
              {invoices.slice(0, 5).map((invoice) => (
                <button
                  key={invoice.id}
                  onClick={() => setSelectedInvoice(invoice)}
                  className="w-full text-left p-4 bg-slate-800/50 border-l-2 border-l-orange-500/50 hover:border-l-orange-400 hover:bg-slate-800 transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-200 group-hover:text-orange-400 transition-colors">
                          {invoice.invoice_number}
                        </span>
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded-none ${
                          invoice.status === 'paid' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                          invoice.status === 'sent' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                          invoice.status === 'overdue' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                          'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                        }`}>
                          {invoice.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1 font-mono">
                        {format(new Date(invoice.issue_date), 'MMM d, yyyy')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-slate-200 group-hover:text-orange-400 transition-colors">
                        {formatCurrency(invoice.total, invoice.currency)}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
              {invoices.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">No invoices yet</p>
                </div>
              )}
            </div>
          </Card>

          <Card className="bg-slate-900/80 border-l-4 border-l-blue-500 border-y-2 border-r-2 border-slate-800 p-6 rounded-none">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-black text-slate-100 uppercase tracking-wide">Recent Quotes</h3>
                <p className="text-xs text-slate-500 mt-1">Latest proposals</p>
              </div>
              <Button
                onClick={() => setShowQuotes(true)}
                size="sm"
                className="bg-blue-600 hover:bg-blue-500 rounded-none text-xs font-bold uppercase"
              >
                View All
              </Button>
            </div>
            <div className="space-y-3">
              {quotes.slice(0, 5).map((quote) => (
                <button
                  key={quote.id}
                  onClick={() => setSelectedQuote(quote)}
                  className="w-full text-left p-4 bg-slate-800/50 border-l-2 border-l-blue-500/50 hover:border-l-blue-400 hover:bg-slate-800 transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-200 group-hover:text-blue-400 transition-colors">
                          {quote.quote_number}
                        </span>
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded-none ${
                          quote.status === 'approved' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                          quote.status === 'sent' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                          quote.status === 'rejected' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                          'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                        }`}>
                          {quote.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1 font-mono">
                        {format(new Date(quote.issue_date), 'MMM d, yyyy')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-slate-200 group-hover:text-blue-400 transition-colors">
                        {formatCurrency(quote.total, quote.currency)}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
              {quotes.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">No quotes yet</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Low Stock Alerts */}
        {inventoryStats.low_stock_count > 0 && (
          <Card className="bg-gradient-to-br from-red-950/30 to-slate-900/80 border-2 border-red-500/40 p-6 rounded-none">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-red-500/20 border-2 border-red-500 rounded-none flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-100 uppercase tracking-wide">Stock Alerts</h3>
                <p className="text-xs text-red-400 font-bold">{inventoryStats.low_stock_count} items need attention</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {lowStockItems.map((item) => (
                <div key={item.id} className="p-4 bg-slate-900/60 border border-red-500/20 rounded-none">
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-sm font-bold text-slate-200">{item.name}</div>
                    <span className={`px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                      item.status === 'critical' ? 'bg-red-500 text-white' : 'bg-orange-500 text-white'
                    } rounded-none`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 font-mono mb-2">{item.sku}</div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Stock: <span className="text-red-400 font-bold">{item.current}</span></span>
                    <span className="text-slate-500">Min: {item.minimum}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Modals and Slide-overs */}
      <InvoicesSlideOver
        isOpen={showInvoices}
        onClose={() => setShowInvoices(false)}
      />
      <QuotesSlideOver
        isOpen={showQuotes}
        onClose={() => setShowQuotes(false)}
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
        <DialogContent className="bg-slate-900 border-2 border-orange-500/30 max-w-2xl rounded-none">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-100 uppercase">
              Invoice Details
            </DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-800/50 rounded-none">
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Invoice Number</div>
                  <div className="font-bold text-slate-200">{selectedInvoice.invoice_number}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Status</div>
                  <div className={`inline-block px-2 py-1 text-xs font-bold uppercase rounded-none ${
                    selectedInvoice.status === 'paid' ? 'bg-green-500/20 text-green-400' :
                    selectedInvoice.status === 'sent' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-slate-500/20 text-slate-400'
                  }`}>
                    {selectedInvoice.status}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Issue Date</div>
                  <div className="font-mono text-sm text-slate-300">
                    {format(new Date(selectedInvoice.issue_date), 'MMM d, yyyy')}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Total Amount</div>
                  <div className="text-xl font-black text-orange-400">
                    {formatCurrency(selectedInvoice.total, selectedInvoice.currency)}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Link href={`/invoices/${selectedInvoice.id}`} className="flex-1">
                  <Button className="w-full bg-orange-600 hover:bg-orange-500 rounded-none font-bold uppercase">
                    View Full Invoice
                  </Button>
                </Link>
                <Link href={`/invoices/${selectedInvoice.id}/edit`}>
                  <Button variant="outline" className="border-slate-700 hover:bg-slate-800 rounded-none font-bold uppercase">
                    Edit
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Quote Detail Dialog */}
      <Dialog open={!!selectedQuote} onOpenChange={(open) => !open && setSelectedQuote(null)}>
        <DialogContent className="bg-slate-900 border-2 border-blue-500/30 max-w-2xl rounded-none">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-100 uppercase">
              Quote Details
            </DialogTitle>
          </DialogHeader>
          {selectedQuote && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-800/50 rounded-none">
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Quote Number</div>
                  <div className="font-bold text-slate-200">{selectedQuote.quote_number}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Status</div>
                  <div className={`inline-block px-2 py-1 text-xs font-bold uppercase rounded-none ${
                    selectedQuote.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                    selectedQuote.status === 'sent' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-slate-500/20 text-slate-400'
                  }`}>
                    {selectedQuote.status}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Issue Date</div>
                  <div className="font-mono text-sm text-slate-300">
                    {format(new Date(selectedQuote.issue_date), 'MMM d, yyyy')}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Total Amount</div>
                  <div className="text-xl font-black text-blue-400">
                    {formatCurrency(selectedQuote.total, selectedQuote.currency)}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Link href={`/quotes/${selectedQuote.id}`} className="flex-1">
                  <Button className="w-full bg-blue-600 hover:bg-blue-500 rounded-none font-bold uppercase">
                    View Full Quote
                  </Button>
                </Link>
                <Link href={`/quotes/${selectedQuote.id}/edit`}>
                  <Button variant="outline" className="border-slate-700 hover:bg-slate-800 rounded-none font-bold uppercase">
                    Edit
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
