'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { StockMovement } from '@/types/inventory'
import { ArrowUp, ArrowDown, Package, RefreshCw, ArrowLeftRight, AlertCircle, Undo } from 'lucide-react'
import { DataTable } from '@/components/dashboard/DataTable'
import { Badge } from '@/components/ui/badge'

interface StockMovementStats {
  stock_in_today: number
  stock_out_today: number
  adjustments_today: number
}

export default function StockMovementsPage() {
  const [loading, setLoading] = useState(true)
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [stats, setStats] = useState<StockMovementStats>({
    stock_in_today: 0,
    stock_out_today: 0,
    adjustments_today: 0
  })

  useEffect(() => {
    loadStockMovements()
  }, [])

  const loadStockMovements = async () => {
    try {
      const { data, error } = await supabase
        .from('stock_movements')
        .select(`
          *,
          inventory_item:inventory_items(
            id,
            name,
            sku,
            item_type
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error

      const stockMovements = (data || []) as StockMovement[]
      setMovements(stockMovements)

      // Calculate today's stats
      const today = new Date().toISOString().split('T')[0]
      const todayMovements = stockMovements.filter(m =>
        m.created_at.startsWith(today)
      )

      const calculatedStats: StockMovementStats = {
        stock_in_today: todayMovements
          .filter(m => ['purchase', 'return'].includes(m.movement_type))
          .reduce((sum, m) => sum + Math.abs(m.quantity_change), 0),
        stock_out_today: todayMovements
          .filter(m => ['sale', 'damage'].includes(m.movement_type))
          .reduce((sum, m) => sum + Math.abs(m.quantity_change), 0),
        adjustments_today: todayMovements
          .filter(m => ['adjustment', 'transfer'].includes(m.movement_type))
          .length
      }
      setStats(calculatedStats)
    } catch (error) {
      console.error('Error loading stock movements:', error)
    } finally {
      setLoading(false)
    }
  }

  const getMovementTypeInfo = (type: string) => {
    const types: Record<string, { color: string, icon: any, label: string }> = {
      purchase: { color: 'bg-emerald-500/20 text-emerald-400', icon: ArrowDown, label: 'Purchase' },
      sale: { color: 'bg-rose-500/20 text-rose-400', icon: ArrowUp, label: 'Sale' },
      adjustment: { color: 'bg-amber-500/20 text-amber-400', icon: RefreshCw, label: 'Adjustment' },
      return: { color: 'bg-blue-500/20 text-blue-400', icon: Undo, label: 'Return' },
      damage: { color: 'bg-red-500/20 text-red-400', icon: AlertCircle, label: 'Damage' },
      transfer: { color: 'bg-violet-500/20 text-violet-400', icon: ArrowLeftRight, label: 'Transfer' },
    }
    return types[type] || types['adjustment']
  }

  const columns = [
    {
      key: 'created_at',
      label: 'Date',
      render: (value: string) => new Date(value).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    {
      key: 'movement_type',
      label: 'Type',
      render: (value: string) => {
        const typeInfo = getMovementTypeInfo(value)
        const Icon = typeInfo.icon
        return (
          <Badge className={typeInfo.color}>
            <Icon className="w-3 h-3 mr-1" />
            {typeInfo.label}
          </Badge>
        )
      },
    },
    {
      key: 'inventory_item',
      label: 'Product',
      render: (value: any) => (
        <div>
          <div className="text-slate-200">{value?.name || 'Unknown'}</div>
          <div className="text-xs text-slate-500">{value?.sku || '-'}</div>
        </div>
      ),
    },
    {
      key: 'quantity_change',
      label: 'Quantity',
      render: (value: number) => (
        <span className={value > 0 ? 'text-emerald-400' : 'text-rose-400'}>
          {value > 0 ? '+' : ''}{value}
        </span>
      ),
    },
    {
      key: 'quantity_after',
      label: 'Stock After',
      render: (value: number) => <span className="text-slate-300">{value}</span>
    },
    {
      key: 'reference_type',
      label: 'Reference',
      render: (value: string, row: any) => {
        if (!value) return <span className="text-slate-500">-</span>
        return <span className="text-slate-400">{value.toUpperCase()}</span>
      }
    },
    {
      key: 'notes',
      label: 'Notes',
      render: (value: string) => value ? (
        <span className="text-slate-400 text-sm truncate max-w-xs block">{value}</span>
      ) : <span className="text-slate-500">-</span>
    },
  ]

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center">
          <ArrowLeftRight className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl text-slate-100">Stock Movements</h1>
          <p className="text-slate-400 mt-1">Track all inventory movements and adjustments</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Stock In (Today)</p>
              <h3 className="text-2xl text-slate-100 mt-1">+{stats.stock_in_today}</h3>
            </div>
            <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <ArrowDown className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Stock Out (Today)</p>
              <h3 className="text-2xl text-slate-100 mt-1">-{stats.stock_out_today}</h3>
            </div>
            <div className="w-12 h-12 bg-rose-500/20 rounded-lg flex items-center justify-center">
              <ArrowUp className="w-6 h-6 text-rose-400" />
            </div>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Adjustments (Today)</p>
              <h3 className="text-2xl text-slate-100 mt-1">{stats.adjustments_today}</h3>
            </div>
            <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-amber-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Movements Table */}
      {movements.length > 0 ? (
        <DataTable
          columns={columns}
          data={movements}
          searchPlaceholder="Search movements..."
        />
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-12 text-center">
          <Package className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No stock movements recorded yet</p>
          <p className="text-slate-500 text-sm mt-2">
            Stock movements will appear here when inventory changes occur
          </p>
        </div>
      )}
    </div>
  )
}
