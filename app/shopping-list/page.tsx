'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { ShoppingListItem } from '@/types'
import Navbar from '@/components/Navbar'
import LoadingSpinner from '@/components/LoadingSpinner'
import { formatCurrency, DEFAULT_CURRENCY, getUserCurrency } from '@/lib/utils/currency'

export default function ShoppingListPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<ShoppingListItem[]>([])
  const [displayCurrency] = useState<string>(getUserCurrency() || DEFAULT_CURRENCY)
  const [filter, setFilter] = useState<'all' | 'pending' | 'purchased'>('pending')

  useEffect(() => {
    checkAuthAndLoad()
  }, [])

  const checkAuthAndLoad = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
      return
    }
    await loadShoppingList()
    setLoading(false)
  }

  const loadShoppingList = async () => {
    try {
      const { data, error } = await supabase
        .from('shopping_list')
        .select(`
          *,
          inventory_items (
            id,
            name,
            sku,
            unit_price,
            cost_price,
            quantity_on_hand,
            item_type,
            low_stock_threshold,
            track_inventory
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      setItems(data || [])
    } catch (error) {
      console.error('Error loading shopping list:', error)
    }
  }

  const filteredItems = items.filter(item => {
    if (filter === 'pending') return !item.is_purchased
    if (filter === 'purchased') return item.is_purchased
    return true
  })

  const handleMarkPurchased = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('shopping_list')
        .update({ is_purchased: !currentStatus })
        .eq('id', id)

      if (error) throw error

      await loadShoppingList()
    } catch (error) {
      console.error('Error updating item:', error)
      alert('Failed to update item')
    }
  }

  const handleUpdateQuantity = async (id: string, newQuantity: number) => {
    if (newQuantity < 1) return

    try {
      const { error } = await supabase
        .from('shopping_list')
        .update({ quantity_needed: newQuantity })
        .eq('id', id)

      if (error) throw error

      await loadShoppingList()
    } catch (error) {
      console.error('Error updating quantity:', error)
      alert('Failed to update quantity')
    }
  }

  const handleUpdatePriority = async (id: string, priority: 'low' | 'medium' | 'high' | 'urgent') => {
    try {
      const { error } = await supabase
        .from('shopping_list')
        .update({ priority })
        .eq('id', id)

      if (error) throw error

      await loadShoppingList()
    } catch (error) {
      console.error('Error updating priority:', error)
      alert('Failed to update priority')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this item from your shopping list?')) return

    try {
      const { error } = await supabase
        .from('shopping_list')
        .delete()
        .eq('id', id)

      if (error) throw error

      await loadShoppingList()
    } catch (error) {
      console.error('Error deleting item:', error)
      alert('Failed to delete item')
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-[#dc2626]/15 text-[#dc2626] border-[#dc2626]/30'
      case 'high':
        return 'bg-[#f97316]/15 text-[#f97316] border-[#f97316]/30'
      case 'medium':
        return 'bg-[#ce6203]/15 text-[#ce6203] border-[#ce6203]/30'
      default:
        return 'bg-[#6b7280]/15 text-[#6b7280] border-[#6b7280]/30'
    }
  }

  const stats = {
    total: items.length,
    pending: items.filter(item => !item.is_purchased).length,
    purchased: items.filter(item => item.is_purchased).length,
    totalValue: items
      .filter(item => !item.is_purchased)
      .reduce((sum, item) => sum + (item.quantity_needed * (item.inventory_items?.cost_price || 0)), 0)
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-[#0e1616] relative">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')]"></div>

      <Navbar />

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-16">
          <div className="flex justify-between items-center mb-12">
            <div className="relative">
              <div className="absolute -left-4 top-0 w-1 h-full bg-[#84cc16]"></div>
              <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#9ca3af] mb-3">
                Purchase Planning
              </div>
              <h1 className="text-5xl font-bold text-[#fffad6] mb-2 tracking-tight">Shopping List</h1>
              <p className="text-[#9ca3af] mt-2">Items you need to purchase or reorder</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-12">
            <div className="relative bg-gradient-to-br from-[#1a1f1f] to-[#0e1616] border-l-4 border-[#84cc16] rounded-lg p-7 shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#9ca3af] mb-2">
                Total Items
              </p>
              <p className="text-5xl font-bold tabular-nums tracking-tight text-[#fffad6]">
                {stats.total}
              </p>
            </div>

            <div className="relative bg-gradient-to-br from-[#1a1f1f] to-[#0e1616] border-l-4 border-[#ce6203] rounded-lg p-7 shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#9ca3af] mb-2">
                Pending
              </p>
              <p className="text-5xl font-bold tabular-nums tracking-tight text-[#ce6203]">
                {stats.pending}
              </p>
            </div>

            <div className="relative bg-gradient-to-br from-[#1a1f1f] to-[#0e1616] border-l-4 border-[#6b7280] rounded-lg p-7 shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#9ca3af] mb-2">
                Purchased
              </p>
              <p className="text-5xl font-bold tabular-nums tracking-tight text-[#6b7280]">
                {stats.purchased}
              </p>
            </div>

            <div className="relative bg-gradient-to-br from-[#1a1f1f] to-[#0e1616] border-l-4 border-[#f97316] rounded-lg p-7 shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#9ca3af] mb-2">
                Est. Cost
              </p>
              <p className="text-4xl font-bold tabular-nums tracking-tight text-[#fffad6]">
                {formatCurrency(stats.totalValue, displayCurrency)}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-[#1a1f1f] rounded-xl border border-[#2a2f2f] p-6 shadow-[0_4px_8px_rgba(0,0,0,0.3)]">
            <div className="flex gap-4">
              <button
                onClick={() => setFilter('all')}
                className={`px-6 py-3 rounded-lg border-2 transition-all font-semibold text-sm ${
                  filter === 'all'
                    ? 'bg-[#84cc16]/15 border-[#84cc16]/30 text-[#84cc16]'
                    : 'bg-transparent border-[#445642] text-[#fffad6] hover:bg-[#445642]/15'
                }`}
              >
                All Items ({stats.total})
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-6 py-3 rounded-lg border-2 transition-all font-semibold text-sm ${
                  filter === 'pending'
                    ? 'bg-[#ce6203]/15 border-[#ce6203]/30 text-[#ce6203]'
                    : 'bg-transparent border-[#445642] text-[#fffad6] hover:bg-[#445642]/15'
                }`}
              >
                Pending ({stats.pending})
              </button>
              <button
                onClick={() => setFilter('purchased')}
                className={`px-6 py-3 rounded-lg border-2 transition-all font-semibold text-sm ${
                  filter === 'purchased'
                    ? 'bg-[#6b7280]/15 border-[#6b7280]/30 text-[#6b7280]'
                    : 'bg-transparent border-[#445642] text-[#fffad6] hover:bg-[#445642]/15'
                }`}
              >
                Purchased ({stats.purchased})
              </button>
            </div>
          </div>
        </div>

        {/* Shopping List */}
        <div className="bg-[#1a1f1f] rounded-xl border border-[#2a2f2f] overflow-hidden shadow-[0_12px_24px_rgba(0,0,0,0.4)]">
          {filteredItems.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-[#84cc16]/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-[#84cc16]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[#fffad6] mb-2">
                {filter === 'purchased' ? 'No purchased items yet' : 'Your shopping list is empty'}
              </h3>
              <p className="text-sm text-[#9ca3af] mb-8">
                {filter === 'purchased'
                  ? 'Items marked as purchased will appear here'
                  : 'Add items from your inventory to get started'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#2a2f2f]">
                <thead className="bg-[#445642]/10">
                  <tr className="border-b-2 border-[#445642]">
                    <th className="px-5 py-4 text-left text-[10px] font-bold text-[#9ca3af] uppercase tracking-[0.1em]">Item</th>
                    <th className="px-5 py-4 text-left text-[10px] font-bold text-[#9ca3af] uppercase tracking-[0.1em]">SKU</th>
                    <th className="px-5 py-4 text-center text-[10px] font-bold text-[#9ca3af] uppercase tracking-[0.1em]">Quantity</th>
                    <th className="px-5 py-4 text-center text-[10px] font-bold text-[#9ca3af] uppercase tracking-[0.1em]">Priority</th>
                    <th className="px-5 py-4 text-right text-[10px] font-bold text-[#9ca3af] uppercase tracking-[0.1em]">Unit Cost</th>
                    <th className="px-5 py-4 text-right text-[10px] font-bold text-[#9ca3af] uppercase tracking-[0.1em]">Total</th>
                    <th className="px-5 py-4 text-center text-[10px] font-bold text-[#9ca3af] uppercase tracking-[0.1em]">Status</th>
                    <th className="px-5 py-4 text-right text-[10px] font-bold text-[#9ca3af] uppercase tracking-[0.1em]">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-[#1a1f1f] divide-y divide-[#fffad6]/4">
                  {filteredItems.map((item) => (
                    <tr
                      key={item.id}
                      className={`group relative border-b border-[#fffad6]/4 hover:bg-[#84cc16]/6 transition-colors ${
                        item.is_purchased ? 'opacity-50' : ''
                      }`}
                    >
                      <td className="absolute left-0 w-0 h-full bg-[#84cc16] group-hover:w-0.5 transition-all"></td>
                      <td className="px-5 py-3.5">
                        <div className="text-sm font-medium text-[#fffad6]">
                          {item.inventory_items?.name || 'Unknown Item'}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-[#9ca3af]">
                        {item.inventory_items?.sku || '-'}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity_needed - 1)}
                            className="w-7 h-7 rounded bg-[#1a1f1f] border border-[#445642] text-[#fffad6] hover:bg-[#445642]/15 transition-colors"
                          >
                            -
                          </button>
                          <span className="text-sm font-semibold text-[#fffad6] tabular-nums w-8 text-center">
                            {item.quantity_needed}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity_needed + 1)}
                            className="w-7 h-7 rounded bg-[#1a1f1f] border border-[#445642] text-[#fffad6] hover:bg-[#445642]/15 transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <select
                          value={item.priority}
                          onChange={(e) => handleUpdatePriority(item.id, e.target.value as any)}
                          className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide rounded border ${getPriorityColor(item.priority)} bg-transparent cursor-pointer`}
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                        </select>
                      </td>
                      <td className="px-5 py-3.5 text-right text-sm font-semibold text-[#fffad6] tabular-nums">
                        {formatCurrency(item.inventory_items?.cost_price || 0, displayCurrency)}
                      </td>
                      <td className="px-5 py-3.5 text-right text-sm font-semibold text-[#fffad6] tabular-nums">
                        {formatCurrency((item.inventory_items?.cost_price || 0) * item.quantity_needed, displayCurrency)}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <button
                          onClick={() => handleMarkPurchased(item.id, item.is_purchased)}
                          className={`px-4 py-2 text-xs font-bold uppercase tracking-wide rounded border transition-all ${
                            item.is_purchased
                              ? 'bg-[#6b7280]/15 text-[#6b7280] border-[#6b7280]/30 hover:bg-[#6b7280]/25'
                              : 'bg-[#84cc16]/15 text-[#84cc16] border-[#84cc16]/30 hover:bg-[#84cc16]/25'
                          }`}
                        >
                          {item.is_purchased ? '✓ Purchased' : 'Mark Done'}
                        </button>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-[#dc2626] hover:text-[#ef4444] font-medium text-sm transition-colors"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
