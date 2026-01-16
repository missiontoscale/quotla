'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { InventoryItem, InventoryStats } from '@/types/inventory'
import { formatCurrency } from '@/lib/utils/currency'
import { useDisplayCurrency } from '@/hooks/useUserCurrency'
import { CURRENCIES } from '@/types'
import { Plus, Package, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/dashboard/DataTable'
import { Badge } from '@/components/ui/badge'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { TopBar } from '@/components/dashboard/TopBar'
import { AddInventoryItemDialog } from '@/components/inventory/AddInventoryItemDialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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
  const { userCurrency, displayCurrency, setDisplayCurrency, isConverted } = useDisplayCurrency()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)

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
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*, suppliers(*)')
        .order('created_at', { ascending: false })

      if (error) throw error

      const inventoryItems = (data || []) as InventoryItem[]
      setItems(inventoryItems)

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

  const handleDelete = async (row: any) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', row.id)

      if (error) throw error
      await loadInventory()
    } catch (error) {
      console.error('Error deleting item:', error)
      alert('Failed to delete item')
    }
  }

  const handleEdit = (row: any) => {
    router.push(`/inventory/${row.id}/edit`)
  }

  const handleView = (row: any) => {
    router.push(`/inventory/${row.id}`)
  }

  const columns = [
    {
      key: 'sku',
      label: 'SKU',
      render: (value: string) => value || '-'
    },
    {
      key: 'name',
      label: 'Product Name',
      render: (value: string, row: any) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-800 rounded flex items-center justify-center">
            <Package className="w-4 h-4 text-slate-400" />
          </div>
          <div>
            <div className="font-medium">{value}</div>
            {row.description && (
              <div className="text-xs text-slate-500 truncate max-w-xs">{row.description}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'item_type',
      label: 'Type',
      render: (value: string) => {
        const statusColors = {
          'product': 'bg-emerald-500/20 text-emerald-400',
          'service': 'bg-violet-500/20 text-violet-400',
        }
        return (
          <Badge className={statusColors[value as keyof typeof statusColors]}>
            {value}
          </Badge>
        )
      },
    },
    {
      key: 'quantity_on_hand',
      label: 'Stock',
      render: (value: number, row: any) => {
        if (!row.track_inventory) return <span className="text-slate-500">-</span>

        const isLowStock = value <= row.low_stock_threshold
        const isOutOfStock = value === 0

        return (
          <div className="flex items-center gap-2">
            <span className={`font-medium ${
              isOutOfStock ? 'text-rose-400' : isLowStock ? 'text-amber-400' : 'text-slate-300'
            }`}>
              {value}
            </span>
            {isOutOfStock && (
              <Badge className="bg-rose-500/20 text-rose-400 text-xs">OUT</Badge>
            )}
            {isLowStock && !isOutOfStock && (
              <Badge className="bg-amber-500/20 text-amber-400 text-xs">LOW</Badge>
            )}
          </div>
        )
      },
    },
    {
      key: 'unit_price',
      label: 'Price',
      render: (value: number) => formatCurrency(value, displayCurrency)
    },
    {
      key: 'cost_price',
      label: 'Cost',
      render: (value: number) => formatCurrency(value, displayCurrency)
    },
  ]

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h1 className="text-[1.62rem] sm:text-[1.8rem] text-slate-100 leading-tight">Products & Inventory</h1>
                <p className="text-slate-400 mt-1 text-[0.81rem]">Manage your product catalog and stock levels</p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="flex items-center gap-2">
                  <Select value={displayCurrency} onValueChange={setDisplayCurrency}>
                    <SelectTrigger className="w-[120px] bg-slate-800 border-slate-700 text-slate-100 h-9 text-[0.81rem]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800">
                      {CURRENCIES.map((curr) => (
                        <SelectItem key={curr.code} value={curr.code}>
                          {curr.symbol} {curr.code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isConverted && (
                    <div className="flex items-center gap-1 text-xs text-amber-400">
                      <RefreshCw className="w-3 h-3" />
                      <span>Converted</span>
                    </div>
                  )}
                </div>
                <Button
                  onClick={() => setAddDialogOpen(true)}
                  className="bg-violet-500 hover:bg-violet-600 text-white text-[0.81rem] h-9 flex-1 sm:flex-none"
                >
                  <Plus className="w-3.5 h-3.5 mr-2" />
                  Add Product
                </Button>
              </div>
            </div>

            <AddInventoryItemDialog
              open={addDialogOpen}
              onOpenChange={setAddDialogOpen}
              onSuccess={loadInventory}
            />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 sm:p-5">
                <div className="text-[0.81rem] text-slate-400 mb-1">Total Items</div>
                <div className="text-[1.62rem] sm:text-[1.8rem] font-bold text-slate-100">{stats.total_items}</div>
                <div className="text-[0.72rem] text-slate-500 mt-2">
                  {stats.total_products} products · {stats.total_services} services
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 sm:p-5">
                <div className="text-[0.81rem] text-slate-400 mb-1">Total Value</div>
                <div className="text-[1.62rem] sm:text-[1.8rem] font-bold text-emerald-400">
                  {formatCurrency(stats.total_value, displayCurrency)}
                </div>
                <div className="text-[0.72rem] text-slate-500 mt-2">At cost value</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 sm:p-5">
                <div className="text-[0.81rem] text-slate-400 mb-1">Low Stock</div>
                <div className="text-[1.62rem] sm:text-[1.8rem] font-bold text-amber-400">{stats.low_stock_count}</div>
                <div className="text-[0.72rem] text-slate-500 mt-2">Need reordering</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 sm:p-5">
                <div className="text-[0.81rem] text-slate-400 mb-1">Out of Stock</div>
                <div className="text-[1.62rem] sm:text-[1.8rem] font-bold text-rose-400">{stats.out_of_stock_count}</div>
                <div className="text-[0.72rem] text-slate-500 mt-2">Urgent attention</div>
              </div>
            </div>

            <DataTable
              columns={columns}
              data={items}
              searchPlaceholder="Search products..."
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        </main>
      </div>
    </div>
  )
}
