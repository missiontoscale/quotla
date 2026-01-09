'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { Plus, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/dashboard/DataTable'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils/validation'

export default function InventoryPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) loadInventory()
  }, [user])

  const loadInventory = async () => {
    if (!user) return
    const { data } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
    if (data) setItems(data)
    setLoading(false)
  }

  const stats = {
    total: items.length,
    value: items.reduce((sum, item) => sum + (item.quantity_on_hand * item.cost_price), 0),
    lowStock: items.filter(i => i.track_inventory && i.quantity_on_hand <= i.low_stock_threshold).length,
  }

  const columns = [
    { key: 'sku', label: 'SKU', render: (v: string) => <span className="font-mono text-violet-400">{v || 'N/A'}</span> },
    { key: 'name', label: 'Product' },
    { key: 'category', label: 'Category', render: (v: string) => v || 'Uncategorized' },
    { key: 'quantity_on_hand', label: 'Stock', render: (v: number) => <span className="font-semibold">{v}</span> },
    {
      key: 'selling_price',
      label: 'Price',
      render: (v: number) => <span className="text-slate-100">{formatCurrency(v, 'USD')}</span>
    },
    {
      key: 'quantity_on_hand',
      label: 'Status',
      render: (v: number, row: any) => {
        if (!row.track_inventory) return <Badge className="bg-slate-500/20 text-slate-400">No tracking</Badge>
        if (v === 0) return <Badge className="bg-rose-500/20 text-rose-400">Out of stock</Badge>
        if (v <= row.low_stock_threshold) return <Badge className="bg-amber-500/20 text-amber-400">Low stock</Badge>
        return <Badge className="bg-emerald-500/20 text-emerald-400">In stock</Badge>
      }
    },
  ]

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
        <div>
          <h1 className="text-3xl text-slate-100">Products</h1>
          <p className="text-slate-400 mt-1">Manage your product inventory</p>
        </div>
        <Button className="bg-violet-500 hover:bg-violet-600 text-white" onClick={() => router.push('/platform/business/inventory')}>
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-900 border-slate-800 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Total Products</p>
              <p className="text-2xl font-bold text-slate-100">{stats.total}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-slate-900 border-slate-800 p-6">
          <div>
            <p className="text-sm font-medium text-slate-400">Inventory Value</p>
            <p className="text-2xl font-bold text-slate-100">{formatCurrency(stats.value, 'USD')}</p>
          </div>
        </Card>
        <Card className="bg-slate-900 border-slate-800 p-6">
          <div>
            <p className="text-sm font-medium text-slate-400">Low Stock Items</p>
            <p className="text-2xl font-bold text-amber-400">{stats.lowStock}</p>
          </div>
        </Card>
      </div>

      <DataTable
        columns={columns}
        data={items}
        onView={(row) => router.push(`/platform/business/inventory/${row.id}`)}
        onEdit={(row) => router.push(`/platform/business/inventory/${row.id}/edit`)}
        onDelete={async (row) => {
          if (confirm('Delete this item?')) {
            await supabase.from('inventory_items').delete().eq('id', row.id)
            loadInventory()
          }
        }}
      />
    </div>
  )
}
