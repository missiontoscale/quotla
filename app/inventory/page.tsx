'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { InventoryItem, InventoryStats, InventoryFilters } from '@/types/inventory'
import Navbar from '@/components/Navbar'
import LoadingSpinner from '@/components/LoadingSpinner'
import CurrencySelector from '@/components/CurrencySelector'
import { formatCurrency, DEFAULT_CURRENCY, getUserCurrency, setUserCurrency } from '@/lib/utils/currency'

export default function InventoryPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<InventoryItem[]>([])
  const [stats, setStats] = useState<InventoryStats>({
    total_items: 0,
    total_value: 0,
    low_stock_count: 0,
    out_of_stock_count: 0,
    total_products: 0,
    total_services: 0
  })
  const [filters, setFilters] = useState<InventoryFilters>({
    search: '',
    is_active: true
  })
  const [displayCurrency, setDisplayCurrency] = useState<string>(DEFAULT_CURRENCY)

  useEffect(() => {
    checkAuthAndLoad()
    // Load user's preferred currency
    const savedCurrency = getUserCurrency()
    setDisplayCurrency(savedCurrency)
  }, [])

  const handleCurrencyChange = (newCurrency: string) => {
    setDisplayCurrency(newCurrency)
    setUserCurrency(newCurrency)
  }

  const checkAuthAndLoad = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
      return
    }
    await loadInventory()
    setLoading(false)
  }

  const loadInventory = async () => {
    try {
      let query = supabase
        .from('inventory_items')
        .select('*, suppliers(*)')
        .order('created_at', { ascending: false })

      if (filters.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active)
      }

      if (filters.item_type) {
        query = query.eq('item_type', filters.item_type)
      }

      if (filters.category) {
        query = query.eq('category', filters.category)
      }

      const { data, error } = await query

      if (error) throw error

      const inventoryItems = data || []
      setItems(inventoryItems)

      // Calculate stats
      const calculatedStats: InventoryStats = {
        total_items: inventoryItems.length,
        total_value: inventoryItems.reduce((sum, item) =>
          sum + (item.quantity_on_hand * item.cost_price), 0
        ),
        low_stock_count: inventoryItems.filter(item =>
          item.track_inventory && item.quantity_on_hand <= item.low_stock_threshold
        ).length,
        out_of_stock_count: inventoryItems.filter(item =>
          item.track_inventory && item.quantity_on_hand === 0
        ).length,
        total_products: inventoryItems.filter(item => item.item_type === 'product').length,
        total_services: inventoryItems.filter(item => item.item_type === 'service').length
      }
      setStats(calculatedStats)

    } catch (error) {
      console.error('Error loading inventory:', error)
    }
  }

  const filteredItems = items.filter(item => {
    if (filters.search) {
      const search = filters.search.toLowerCase()
      return (
        item.name.toLowerCase().includes(search) ||
        item.sku?.toLowerCase().includes(search) ||
        item.description?.toLowerCase().includes(search)
      )
    }
    if (filters.is_low_stock) {
      return item.track_inventory && item.quantity_on_hand <= item.low_stock_threshold
    }
    return true
  })

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', id)

      if (error) throw error

      await loadInventory()
    } catch (error) {
      console.error('Error deleting item:', error)
      alert('Failed to delete item')
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-[#0e1616] relative">
      {/* Subtle noise texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')]"></div>

      <Navbar />

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-16">
          <div className="flex justify-between items-center mb-12">
            <div className="relative">
              <div className="absolute -left-4 top-0 w-1 h-full bg-[#ce6203]"></div>
              <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#9ca3af] mb-3">
                Inventory Control
              </div>
              <h1 className="text-5xl font-bold text-[#fffad6] mb-2 tracking-tight">Stock Management</h1>
              <p className="text-[#9ca3af] mt-2">Track products, manage stock, and monitor inventory value</p>
            </div>
            <Link
              href="/inventory/new"
              className="group px-8 py-4 bg-[#ce6203] text-white font-semibold rounded-lg border-2 border-white/10 shadow-[0_4px_12px_rgba(206,98,3,0.4)] hover:shadow-[0_6px_16px_rgba(206,98,3,0.5)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150"
            >
              <span className="flex items-center gap-2">
                Add Item
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
            {/* Total Items Card */}
            <div className="relative bg-gradient-to-br from-[#1a1f1f] to-[#0e1616] border-l-4 border-[#ce6203] rounded-lg p-7 shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#9ca3af] mb-2">
                    Total Items
                  </p>
                  <p className="text-5xl font-bold tabular-nums tracking-tight text-[#fffad6]" style={{fontVariantNumeric: 'tabular-nums'}}>
                    {stats.total_items}
                  </p>
                </div>
              </div>
              <div className="text-xs text-[#6b7280] mt-4">
                {stats.total_products} products · {stats.total_services} services
              </div>
            </div>

            {/* Total Value Card */}
            <div className="relative bg-gradient-to-br from-[#1a1f1f] to-[#0e1616] border-l-4 border-[#84cc16] rounded-lg p-7 shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#9ca3af] mb-2">
                    Total Value
                  </p>
                  <p className="text-4xl font-bold tabular-nums tracking-tight text-[#fffad6]" style={{fontVariantNumeric: 'tabular-nums'}}>
                    {formatCurrency(stats.total_value, displayCurrency)}
                  </p>
                </div>
              </div>
              <div className="text-xs text-[#6b7280] mt-4">
                At cost value
              </div>
            </div>

            {/* Low Stock Card */}
            <div className="relative bg-gradient-to-br from-[#1a1f1f] to-[#0e1616] border-l-4 border-[#f97316] rounded-lg p-7 shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#9ca3af] mb-2">
                    Low Stock
                  </p>
                  <p className="text-5xl font-bold tabular-nums tracking-tight text-[#f97316]" style={{fontVariantNumeric: 'tabular-nums'}}>
                    {stats.low_stock_count}
                  </p>
                </div>
              </div>
              <div className="text-xs text-[#6b7280] mt-4">
                Need reordering
              </div>
            </div>

            {/* Out of Stock Card */}
            <div className="relative bg-gradient-to-br from-[#1a1f1f] to-[#0e1616] border-l-4 border-[#dc2626] rounded-lg p-7 shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#9ca3af] mb-2">
                    Out of Stock
                  </p>
                  <p className="text-5xl font-bold tabular-nums tracking-tight text-[#dc2626]" style={{fontVariantNumeric: 'tabular-nums'}}>
                    {stats.out_of_stock_count}
                  </p>
                </div>
              </div>
              <div className="text-xs text-[#6b7280] mt-4">
                Urgent attention
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-[#1a1f1f] rounded-xl border border-[#2a2f2f] p-6 shadow-[0_4px_8px_rgba(0,0,0,0.3)]">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Search items..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full bg-[#1a1f1f]/60 text-[#fffad6] border-0 border-b-2 border-[#374151] px-1 py-3.5 focus:outline-none focus:border-b-3 focus:border-[#ce6203] transition-all duration-150 placeholder:text-[#6b7280]"
                />
              </div>
              <div>
                <select
                  value={filters.item_type || ''}
                  onChange={(e) => setFilters({ ...filters, item_type: e.target.value as any })}
                  className="w-full bg-[#1a1f1f]/60 text-[#fffad6] border-0 border-b-2 border-[#374151] px-1 py-3.5 focus:outline-none focus:border-b-3 focus:border-[#ce6203] transition-all duration-150"
                >
                  <option value="">All Types</option>
                  <option value="product">Products</option>
                  <option value="service">Services</option>
                </select>
              </div>
              <div>
                <CurrencySelector
                  value={displayCurrency}
                  onChange={handleCurrencyChange}
                  showLabel={false}
                />
              </div>
              <div>
                <button
                  onClick={() => setFilters({ ...filters, is_low_stock: !filters.is_low_stock })}
                  className={`w-full px-4 py-3.5 rounded-lg border-2 transition-all font-semibold text-sm ${
                    filters.is_low_stock
                      ? 'bg-[#f97316]/15 border-[#f97316]/30 text-[#f97316]'
                      : 'bg-transparent border-[#445642] text-[#fffad6] hover:bg-[#445642]/15'
                  }`}
                >
                  Low Stock Only
                </button>
              </div>
              <div>
                <Link
                  href="/inventory/suppliers"
                  className="block w-full px-4 py-3.5 text-center border-2 border-[#445642] rounded-lg text-[#fffad6] hover:bg-[#445642]/15 transition-all font-semibold text-sm"
                >
                  Manage Suppliers
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="bg-[#1a1f1f] rounded-xl border border-[#2a2f2f] overflow-hidden shadow-[0_12px_24px_rgba(0,0,0,0.4)]">
          {filteredItems.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-[#ce6203]/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-[#ce6203]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[#fffad6] mb-2">No inventory items</h3>
              <p className="text-sm text-[#9ca3af] mb-8">Get started by adding your first item.</p>
              <Link
                href="/inventory/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#ce6203] text-white font-semibold rounded-lg border-2 border-white/10 shadow-[0_4px_12px_rgba(206,98,3,0.4)] hover:shadow-[0_6px_16px_rgba(206,98,3,0.5)] hover:-translate-y-0.5 transition-all duration-150"
              >
                Add Item →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#2a2f2f]">
                <thead className="bg-[#445642]/10">
                  <tr className="border-b-2 border-[#445642]">
                    <th className="px-5 py-4 text-left text-[10px] font-bold text-[#9ca3af] uppercase tracking-[0.1em]">Item</th>
                    <th className="px-5 py-4 text-left text-[10px] font-bold text-[#9ca3af] uppercase tracking-[0.1em]">SKU</th>
                    <th className="px-5 py-4 text-left text-[10px] font-bold text-[#9ca3af] uppercase tracking-[0.1em]">Type</th>
                    <th className="px-5 py-4 text-left text-[10px] font-bold text-[#9ca3af] uppercase tracking-[0.1em]">Stock</th>
                    <th className="px-5 py-4 text-right text-[10px] font-bold text-[#9ca3af] uppercase tracking-[0.1em]">Unit Price</th>
                    <th className="px-5 py-4 text-right text-[10px] font-bold text-[#9ca3af] uppercase tracking-[0.1em]">Value</th>
                    <th className="px-5 py-4 text-right text-[10px] font-bold text-[#9ca3af] uppercase tracking-[0.1em]">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-[#1a1f1f] divide-y divide-[#fffad6]/4">
                  {filteredItems.map((item) => {
                    const isLowStock = item.track_inventory && item.quantity_on_hand <= item.low_stock_threshold
                    const isOutOfStock = item.track_inventory && item.quantity_on_hand === 0

                    return (
                      <tr key={item.id} className="group relative border-b border-[#fffad6]/4 hover:bg-[#ce6203]/6 transition-colors cursor-pointer">
                        <td className="absolute left-0 w-0 h-full bg-[#ce6203] group-hover:w-0.5 transition-all"></td>
                        <td className="px-5 py-3.5">
                          <div>
                            <div className="text-sm font-medium text-[#fffad6]">{item.name}</div>
                            {item.description && (
                              <div className="text-xs text-[#9ca3af] truncate max-w-xs mt-1">{item.description}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-[#9ca3af]">
                          {item.sku || '-'}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide rounded border ${
                            item.item_type === 'product'
                              ? 'bg-[#84cc16]/15 text-[#84cc16] border-[#84cc16]/30'
                              : 'bg-[#ce6203]/15 text-[#ce6203] border-[#ce6203]/30'
                          }`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                            {item.item_type}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          {item.track_inventory ? (
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-semibold tabular-nums ${
                                isOutOfStock ? 'text-[#dc2626]' : isLowStock ? 'text-[#f97316]' : 'text-[#fffad6]'
                              }`} style={{fontVariantNumeric: 'tabular-nums'}}>
                                {item.quantity_on_hand}
                              </span>
                              {isLowStock && !isOutOfStock && (
                                <span className="text-xs font-bold text-[#f97316] uppercase">Low</span>
                              )}
                              {isOutOfStock && (
                                <span className="text-xs font-bold text-[#dc2626] uppercase">Out</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-[#6b7280]">-</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right text-sm font-semibold text-[#fffad6] tabular-nums" style={{fontVariantNumeric: 'tabular-nums'}}>
                          {formatCurrency(item.unit_price, displayCurrency)}
                        </td>
                        <td className="px-5 py-3.5 text-right text-sm font-semibold text-[#fffad6] tabular-nums" style={{fontVariantNumeric: 'tabular-nums'}}>
                          {formatCurrency(item.quantity_on_hand * item.cost_price, displayCurrency)}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <Link
                            href={`/inventory/${item.id}/edit`}
                            className="text-[#ce6203] hover:text-[#f97316] font-medium text-sm mr-4 transition-colors"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-[#dc2626] hover:text-[#ef4444] font-medium text-sm transition-colors"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
