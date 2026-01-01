'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { LowStockAlert } from '@/types/inventory'
import Link from 'next/link'

export default function LowStockAlerts() {
  const [alerts, setAlerts] = useState<LowStockAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    loadAlerts()
  }, [])

  const loadAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('low_stock_alerts')
        .select(`
          *,
          inventory_item:inventory_items(*)
        `)
        .eq('is_acknowledged', false)
        .order('triggered_at', { ascending: false })

      if (error) throw error

      setAlerts(data || [])
    } catch (error) {
      console.error('Error loading alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  const acknowledgeAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('low_stock_alerts')
        .update({
          is_acknowledged: true,
          acknowledged_at: new Date().toISOString()
        })
        .eq('id', alertId)

      if (error) throw error

      // Remove from local state
      setAlerts(alerts.filter(a => a.id !== alertId))
    } catch (error) {
      console.error('Error acknowledging alert:', error)
      alert('Failed to acknowledge alert')
    }
  }

  const acknowledgeAll = async () => {
    try {
      const alertIds = alerts.map(a => a.id)

      const { error } = await supabase
        .from('low_stock_alerts')
        .update({
          is_acknowledged: true,
          acknowledged_at: new Date().toISOString()
        })
        .in('id', alertIds)

      if (error) throw error

      setAlerts([])
    } catch (error) {
      console.error('Error acknowledging all alerts:', error)
      alert('Failed to acknowledge alerts')
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  if (alerts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
        <svg className="mx-auto h-12 w-12 text-green-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-sm font-medium text-gray-900 mb-1">All stock levels good!</h3>
        <p className="text-sm text-gray-500">No low stock alerts at the moment.</p>
      </div>
    )
  }

  const displayedAlerts = showAll ? alerts : alerts.slice(0, 5)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="h-5 w-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900">Low Stock Alerts</h3>
          <span className="px-2 py-0.5 text-xs font-semibold bg-orange-100 text-orange-800 rounded-full">
            {alerts.length}
          </span>
        </div>
        {alerts.length > 0 && (
          <button
            onClick={acknowledgeAll}
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Acknowledge all
          </button>
        )}
      </div>

      {/* Alert List */}
      <div className="divide-y divide-gray-100">
        {displayedAlerts.map((alert) => (
          <div key={alert.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Link
                    href={`/inventory/${alert.inventory_item_id}/edit`}
                    className="font-medium text-gray-900 hover:text-quotla-orange truncate"
                  >
                    {alert.inventory_item?.name}
                  </Link>
                  {alert.inventory_item?.sku && (
                    <span className="text-xs text-gray-500 px-2 py-0.5 bg-gray-100 rounded">
                      {alert.inventory_item.sku}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    Current: <strong>{alert.quantity_at_trigger}</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                    </svg>
                    Threshold: {alert.threshold}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(alert.triggered_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => acknowledgeAlert(alert.id)}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              >
                Dismiss
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Show More/Less */}
      {alerts.length > 5 && (
        <div className="px-6 py-3 border-t border-gray-200 text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm text-quotla-orange hover:text-secondary-600 font-medium transition-colors"
          >
            {showAll ? 'Show less' : `Show ${alerts.length - 5} more`}
          </button>
        </div>
      )}
    </div>
  )
}
