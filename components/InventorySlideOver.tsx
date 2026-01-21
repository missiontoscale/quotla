'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { formatCurrency } from '@/lib/utils/validation'
import { useUserCurrency } from '@/hooks/useUserCurrency'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet'
import { Button } from './ui/button'
import { Package, AlertCircle } from 'lucide-react'

interface InventoryItem {
  id: string
  name: string
  sku: string
  description: string | null
  category: string | null
  unit_price: number
  cost_price: number
  quantity_on_hand: number
  low_stock_threshold: number
  track_inventory: boolean
  is_active: boolean
  currency: string
  created_at: string
  updated_at: string
}

interface InventorySlideOverProps {
  isOpen: boolean
  onClose: () => void
}

export default function InventorySlideOver({ isOpen, onClose }: InventorySlideOverProps) {
  const { user } = useAuth()
  const { currency: userCurrency } = useUserCurrency()
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'low-stock' | 'out-of-stock'>('all')

  useEffect(() => {
    if (isOpen) {
      loadItems()
    }
  }, [user, isOpen])

  const loadItems = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (!error && data) {
      setItems(data)
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    const { error } = await supabase
      .from('inventory_items')
      .update({ is_active: false })
      .eq('id', id)

    if (!error) {
      setItems(items.filter((item) => item.id !== id))
    }
  }

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFilter =
      filter === 'all' ||
      (filter === 'low-stock' && item.track_inventory && item.quantity_on_hand <= item.low_stock_threshold && item.quantity_on_hand > 0) ||
      (filter === 'out-of-stock' && item.quantity_on_hand === 0)

    return matchesSearch && matchesFilter
  })

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-2xl bg-slate-950 border-l-4 border-l-cyan-500 border-y-2 border-r-2 border-slate-800 rounded-none overflow-y-auto">
        <SheetHeader className="border-b-2 border-slate-800 pb-4">
          <SheetTitle className="text-2xl font-black text-slate-100 uppercase tracking-wide">
            Products Inventory
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6 py-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/business/products" className="flex-1" onClick={onClose}>
              <Button className="w-full bg-cyan-600 hover:bg-cyan-500 rounded-none font-bold uppercase">
                Add New Product
              </Button>
            </Link>
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => setFilter('all')}
              size="sm"
              variant={filter === 'all' ? 'default' : 'outline'}
              className={`rounded-none font-bold uppercase text-xs ${
                filter === 'all'
                  ? 'bg-cyan-600 hover:bg-cyan-500'
                  : 'border-slate-700 hover:bg-slate-800'
              }`}
            >
              All Items
            </Button>
            <Button
              onClick={() => setFilter('low-stock')}
              size="sm"
              variant={filter === 'low-stock' ? 'default' : 'outline'}
              className={`rounded-none font-bold uppercase text-xs ${
                filter === 'low-stock'
                  ? 'bg-orange-600 hover:bg-orange-500'
                  : 'border-slate-700 hover:bg-slate-800'
              }`}
            >
              Low Stock
            </Button>
            <Button
              onClick={() => setFilter('out-of-stock')}
              size="sm"
              variant={filter === 'out-of-stock' ? 'default' : 'outline'}
              className={`rounded-none font-bold uppercase text-xs ${
                filter === 'out-of-stock'
                  ? 'bg-red-600 hover:bg-red-500'
                  : 'border-slate-700 hover:bg-slate-800'
              }`}
            >
              Out of Stock
            </Button>
          </div>

          {/* Search */}
          <div>
            <input
              type="text"
              placeholder="Search by name, SKU, or category..."
              className="w-full px-4 py-3 bg-slate-900 border-2 border-slate-800 rounded-none text-slate-200 placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none font-mono text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Items List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-none h-12 w-12 border-4 border-cyan-500 border-t-transparent"></div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12 bg-slate-900/50 border-2 border-slate-800 rounded-none">
              <Package className="w-16 h-16 mx-auto mb-4 text-slate-600" />
              <p className="text-slate-400 mb-4">
                {searchQuery || filter !== 'all' ? 'No items match your filters' : 'No products in inventory'}
              </p>
              <Link href="/business/products" onClick={onClose}>
                <Button className="bg-cyan-600 hover:bg-cyan-500 rounded-none font-bold uppercase">
                  Add Your First Product
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item) => {
                const isLowStock = item.track_inventory && item.quantity_on_hand <= item.low_stock_threshold
                const isOutOfStock = item.quantity_on_hand === 0

                return (
                  <div
                    key={item.id}
                    className={`p-4 bg-slate-900/80 border-l-4 border-slate-700 hover:border-cyan-500 transition-all ${
                      isOutOfStock ? 'border-l-red-500 bg-red-950/20' :
                      isLowStock ? 'border-l-orange-500 bg-orange-950/20' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-slate-100">{item.name}</h4>
                          {isOutOfStock && (
                            <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-red-500 text-white rounded-none">
                              Out of Stock
                            </span>
                          )}
                          {!isOutOfStock && isLowStock && (
                            <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-orange-500 text-white rounded-none">
                              Low Stock
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                          <span>SKU: {item.sku}</span>
                          {item.category && (
                            <>
                              <span>•</span>
                              <span>{item.category}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-black text-cyan-400">
                          {formatCurrency(item.unit_price, item.currency || userCurrency)}
                        </div>
                        {item.track_inventory && (
                          <div className={`text-xs mt-1 font-mono ${
                            isOutOfStock ? 'text-red-400' :
                            isLowStock ? 'text-orange-400' : 'text-slate-500'
                          }`}>
                            Stock: {item.quantity_on_hand}
                          </div>
                        )}
                      </div>
                    </div>

                    {item.description && (
                      <p className="text-sm text-slate-400 mb-3 line-clamp-2">{item.description}</p>
                    )}

                    <div className="flex gap-2 pt-3 border-t border-slate-800">
                      <Link href={`/inventory/${item.id}`} onClick={onClose}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-slate-700 hover:bg-slate-800 rounded-none text-xs font-bold uppercase"
                        >
                          View
                        </Button>
                      </Link>
                      <Link href={`/inventory/${item.id}/edit`} onClick={onClose}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-slate-700 hover:bg-slate-800 rounded-none text-xs font-bold uppercase"
                        >
                          Edit
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(item.id)}
                        className="border-red-700 hover:bg-red-950 text-red-400 rounded-none text-xs font-bold uppercase"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Summary Stats */}
          {filteredItems.length > 0 && (
            <div className="grid grid-cols-2 gap-3 pt-4 border-t-2 border-slate-800">
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-none">
                <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Total Items</div>
                <div className="text-2xl font-black text-slate-200">{filteredItems.length}</div>
              </div>
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-none">
                <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Total Value</div>
                <div className="text-2xl font-black text-cyan-400">
                  {formatCurrency(
                    filteredItems.reduce((sum, item) => sum + item.quantity_on_hand * item.cost_price, 0),
                    filteredItems[0]?.currency || userCurrency
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
