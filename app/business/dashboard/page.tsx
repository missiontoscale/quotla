'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { format } from 'date-fns'
import { Package, AlertCircle, Users, TrendingUp, Sparkles } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import ClientsSlideOver from '@/components/ClientsSlideOver'
import InventorySlideOver from '@/components/InventorySlideOver'
import { AICreateModal } from '@/components/modals/AICreateModal'
import RevenueChart from '@/components/dashboard/RevenueChart'
import TopClientsChart from '@/components/dashboard/TopClientsChart'

export default function DashboardPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [inventoryStats, setInventoryStats] = useState({
    total_items: 0,
    low_stock_count: 0,
    total_value: 0
  })
  const [inventoryItems, setInventoryItems] = useState<any[]>([])
  const [showClients, setShowClients] = useState(false)
  const [showInventory, setShowInventory] = useState(false)
  const [showAICreate, setShowAICreate] = useState(false)

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = async () => {
    if (!user) return

    const inventoryRes = await supabase
      .from('inventory_items')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)

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

  const lowStockItems = inventoryItems.filter(item =>
    item.track_inventory && item.quantity_on_hand <= item.low_stock_threshold
  ).slice(0, 4)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent"></div>
          <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-2 border-orange-300 opacity-20"></div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6 pb-8 max-w-[1600px] mx-auto px-4 md:px-6">
        {/* Modern Header */}
        <div className="relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-50 tracking-tight">
                Dashboard
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                {format(new Date(), 'EEEE, MMMM d, yyyy')}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowAICreate(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-sm font-semibold"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                AI Create
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid - Modern Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Total Products */}
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 p-5 hover:border-purple-500/40 transition-all duration-300">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium text-purple-400 uppercase tracking-wider mb-2">Total Products</p>
                <p className="text-2xl font-bold text-slate-50">{inventoryStats.total_items}</p>
                <p className="text-xs text-slate-500 mt-2">In inventory</p>
              </div>
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-purple-400" />
              </div>
            </div>
          </Card>

          {/* Low Stock Items */}
          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 p-5 hover:border-orange-500/40 transition-all duration-300">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium text-orange-400 uppercase tracking-wider mb-2">Low Stock</p>
                <p className="text-2xl font-bold text-slate-50">{inventoryStats.low_stock_count}</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-3 h-3 text-orange-400" />
                  <span className="text-xs text-slate-500">Items need restock</span>
                </div>
              </div>
              <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-orange-400" />
              </div>
            </div>
          </Card>

          {/* Inventory Value */}
          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 p-5 hover:border-green-500/40 transition-all duration-300">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium text-green-400 uppercase tracking-wider mb-2">Inventory Value</p>
                <p className="text-2xl font-bold text-slate-50">${inventoryStats.total_value.toLocaleString()}</p>
                <p className="text-xs text-slate-500 mt-2">Total cost value</p>
              </div>
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-green-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 lg:grid-cols-2 gap-3">
          <button
            onClick={() => setShowClients(true)}
            className="group p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 rounded-lg transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-500/20 group-hover:bg-cyan-500/30 rounded-lg flex items-center justify-center transition-colors">
                <Users className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-200">Clients</p>
                <p className="text-xs text-slate-500">Manage</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setShowInventory(true)}
            className="group p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-purple-500/50 rounded-lg transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 group-hover:bg-purple-500/30 rounded-lg flex items-center justify-center transition-colors">
                <Package className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-200">Products</p>
                <p className="text-xs text-slate-500">View all</p>
              </div>
            </div>
          </button>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueChart />
          <TopClientsChart />
        </div>

        {/* Low Stock Alerts */}
        {inventoryStats.low_stock_count > 0 && (
          <Card className="bg-gradient-to-br from-red-950/30 to-slate-900/50 border-2 border-red-500/30 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">Stock Alerts</h3>
                <p className="text-xs text-red-400 font-semibold">{inventoryStats.low_stock_count} items need attention</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {lowStockItems.map((item) => (
                <div key={item.id} className="p-4 bg-slate-900/60 border border-red-500/20 rounded-lg hover:border-red-500/40 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-sm font-semibold text-slate-200 line-clamp-1">{item.name}</div>
                    <span className={`px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                      item.quantity_on_hand === 0 ? 'bg-red-500 text-white' :
                      item.quantity_on_hand <= item.low_stock_threshold / 2 ? 'bg-red-500 text-white' :
                      'bg-orange-500 text-white'
                    } rounded`}>
                      {item.quantity_on_hand === 0 ? 'EMPTY' : 'LOW'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mb-3">{item.sku || 'No SKU'}</div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Stock: <span className="text-red-400 font-bold">{item.quantity_on_hand}</span></span>
                    <span className="text-slate-500">Min: {item.low_stock_threshold}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Modals and Slide-overs */}
      <AICreateModal
        open={showAICreate}
        onOpenChange={setShowAICreate}
      />
      <ClientsSlideOver
        isOpen={showClients}
        onClose={() => setShowClients(false)}
      />
      <InventorySlideOver
        isOpen={showInventory}
        onClose={() => setShowInventory(false)}
      />
    </>
  )
}
