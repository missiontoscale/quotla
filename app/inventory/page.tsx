'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { InventoryItem, InventoryStats, InventoryFilters } from '@/types/inventory'
import Navbar from '@/components/Navbar'
import LoadingSpinner from '@/components/LoadingSpinner'

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

  useEffect(() => {
    checkAuthAndLoad()
  }, [])

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
    <div className="min-h-screen bg-quotla-light relative">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[url('/images/patterns/grid/Quotla%20grid%20pattern%20light.svg')] bg-center opacity-[0.02] pointer-events-none" style={{backgroundSize: '150%'}}></div>

      <Navbar />

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
              <p className="text-gray-600 mt-1">Track products, manage stock, and monitor inventory value</p>
            </div>
            <Link
              href="/inventory/new"
              className="px-4 py-2 bg-quotla-orange text-white rounded-lg hover:bg-secondary-600 transition-colors shadow-sm"
            >
              + Add Item
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Items</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total_items}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-500">
                {stats.total_products} products • {stats.total_services} services
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    ${stats.total_value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-500">
                At cost value
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Low Stock</p>
                  <p className="text-2xl font-bold text-orange-600 mt-1">{stats.low_stock_count}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-500">
                Need reordering
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Out of Stock</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">{stats.out_of_stock_count}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-500">
                Urgent attention needed
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Search items..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-quotla-orange focus:border-transparent"
                />
              </div>
              <div>
                <select
                  value={filters.item_type || ''}
                  onChange={(e) => setFilters({ ...filters, item_type: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-quotla-orange focus:border-transparent"
                >
                  <option value="">All Types</option>
                  <option value="product">Products</option>
                  <option value="service">Services</option>
                </select>
              </div>
              <div>
                <button
                  onClick={() => setFilters({ ...filters, is_low_stock: !filters.is_low_stock })}
                  className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                    filters.is_low_stock
                      ? 'bg-orange-50 border-orange-300 text-orange-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {filters.is_low_stock ? '✓ ' : ''}Low Stock Only
                </button>
              </div>
              <div>
                <Link
                  href="/inventory/suppliers"
                  className="block w-full px-4 py-2 text-center border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Manage Suppliers
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No inventory items</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by adding your first item.</p>
              <div className="mt-6">
                <Link
                  href="/inventory/new"
                  className="inline-flex items-center px-4 py-2 bg-quotla-orange text-white rounded-lg hover:bg-secondary-600"
                >
                  + Add Item
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredItems.map((item) => {
                    const isLowStock = item.track_inventory && item.quantity_on_hand <= item.low_stock_threshold
                    const isOutOfStock = item.track_inventory && item.quantity_on_hand === 0

                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                            {item.description && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">{item.description}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.sku || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            item.item_type === 'product'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {item.item_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {item.track_inventory ? (
                            <div>
                              <span className={`text-sm font-medium ${
                                isOutOfStock ? 'text-red-600' : isLowStock ? 'text-orange-600' : 'text-gray-900'
                              }`}>
                                {item.quantity_on_hand}
                              </span>
                              {isLowStock && (
                                <span className="ml-2 text-xs text-orange-600">⚠️ Low</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${item.unit_price.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${(item.quantity_on_hand * item.cost_price).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            href={`/inventory/${item.id}/edit`}
                            className="text-quotla-orange hover:text-secondary-600 mr-4"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-900"
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
