'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import {
  FileText,
  DollarSign,
  Package,
  Users,
  AlertCircle,
  Clock,
  ChevronRight
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils/currency'
import { useUserCurrency } from '@/hooks/useUserCurrency'

interface ActivityItem {
  id: string
  type: 'invoice_created' | 'invoice_paid' | 'invoice_sent' | 'invoice_overdue' | 'customer_added' | 'low_stock'
  title: string
  description: string
  timestamp: string
  link?: string
  amount?: number
}

interface ActivityFeedProps {
  /** Maximum number of items to display. Defaults to 8. */
  limit?: number
  /** Show "View More" link at the bottom */
  showViewMore?: boolean
  /** Callback when "View More" is clicked */
  onViewMore?: () => void
}

export function ActivityFeed({ limit = 8, showViewMore = false, onViewMore }: ActivityFeedProps) {
  const { user } = useAuth()
  const { currency } = useUserCurrency()
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) fetchActivities()
  }, [user])

  const fetchActivities = async () => {
    if (!user) return

    try {
      const activityList: ActivityItem[] = []

      // Fetch recent invoices
      const { data: invoices } = await supabase
        .from('invoices')
        .select('id, invoice_number, status, total, created_at, updated_at, client_id, customers:client_id(full_name, company_name)')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(10)

      if (invoices) {
        invoices.forEach((inv: any) => {
          const clientName = inv.customers?.company_name || inv.customers?.full_name || 'Unknown'

          if (inv.status === 'paid') {
            activityList.push({
              id: `inv-paid-${inv.id}`,
              type: 'invoice_paid',
              title: 'Payment received',
              description: `Invoice #${inv.invoice_number} from ${clientName}`,
              timestamp: inv.updated_at,
              link: `/business/sales`,
              amount: inv.total
            })
          } else if (inv.status === 'overdue') {
            activityList.push({
              id: `inv-overdue-${inv.id}`,
              type: 'invoice_overdue',
              title: 'Invoice overdue',
              description: `Invoice #${inv.invoice_number} for ${clientName}`,
              timestamp: inv.updated_at,
              link: `/business/sales`,
              amount: inv.total
            })
          } else if (inv.status === 'sent') {
            activityList.push({
              id: `inv-sent-${inv.id}`,
              type: 'invoice_sent',
              title: 'Invoice sent',
              description: `Invoice #${inv.invoice_number} to ${clientName}`,
              timestamp: inv.updated_at,
              link: `/business/sales`,
              amount: inv.total
            })
          }
        })
      }

      // Fetch recent customers
      const { data: customers } = await supabase
        .from('customers')
        .select('id, full_name, company_name, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (customers) {
        customers.forEach((cust: any) => {
          activityList.push({
            id: `cust-${cust.id}`,
            type: 'customer_added',
            title: 'New customer',
            description: cust.company_name || cust.full_name,
            timestamp: cust.created_at,
            link: `/business/sales`
          })
        })
      }

      // Fetch low stock items
      const { data: lowStock } = await supabase
        .from('inventory_items')
        .select('id, name, quantity_on_hand, low_stock_threshold, updated_at')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .eq('track_inventory', true)
        .order('updated_at', { ascending: false })
        .limit(5)

      if (lowStock) {
        lowStock
          .filter(item => item.quantity_on_hand <= item.low_stock_threshold)
          .forEach((item: any) => {
            activityList.push({
              id: `stock-${item.id}`,
              type: 'low_stock',
              title: 'Low stock alert',
              description: `${item.name} (${item.quantity_on_hand} remaining)`,
              timestamp: item.updated_at,
              link: `/business/products`
            })
          })
      }

      // Sort by timestamp and limit
      activityList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      setActivities(activityList.slice(0, limit))
    } catch (error) {
      console.error('Error fetching activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const getIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'invoice_paid':
        return <DollarSign className="w-4 h-4 text-emerald-400" />
      case 'invoice_sent':
        return <FileText className="w-4 h-4 text-blue-400" />
      case 'invoice_overdue':
        return <AlertCircle className="w-4 h-4 text-rose-400" />
      case 'customer_added':
        return <Users className="w-4 h-4 text-cyan-400" />
      case 'low_stock':
        return <Package className="w-4 h-4 text-amber-400" />
      default:
        return <Clock className="w-4 h-4 text-slate-400" />
    }
  }

  const getIconBg = (type: ActivityItem['type']) => {
    switch (type) {
      case 'invoice_paid':
        return 'bg-emerald-500/10 border-emerald-500/20'
      case 'invoice_sent':
        return 'bg-blue-500/10 border-blue-500/20'
      case 'invoice_overdue':
        return 'bg-rose-500/10 border-rose-500/20'
      case 'customer_added':
        return 'bg-cyan-500/10 border-cyan-500/20'
      case 'low_stock':
        return 'bg-amber-500/10 border-amber-500/20'
      default:
        return 'bg-slate-500/10 border-slate-500/20'
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="w-8 h-8 bg-slate-800 rounded-lg" />
            <div className="flex-1">
              <div className="h-4 bg-slate-800 rounded w-1/3 mb-2" />
              <div className="h-3 bg-slate-800/50 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-3">
          <Clock className="w-5 h-5 text-slate-500" />
        </div>
        <p className="text-sm text-slate-400">No recent activity</p>
        <p className="text-xs text-slate-500 mt-1">Activity will appear here as you use Quotla</p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {activities.map((activity) => {
        const content = (
          <div className="flex gap-3 p-2 rounded-lg hover:bg-slate-800/50 transition-colors group">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border flex-shrink-0 ${getIconBg(activity.type)}`}>
              {getIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-slate-200 truncate">{activity.title}</p>
                {activity.amount && (
                  <span className={`text-xs font-medium ${activity.type === 'invoice_paid' ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {formatCurrency(activity.amount, currency)}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 truncate">{activity.description}</p>
              <p className="text-[0.68rem] text-slate-600 mt-0.5">
                {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
              </p>
            </div>
          </div>
        )

        if (activity.link) {
          return (
            <Link key={activity.id} href={activity.link}>
              {content}
            </Link>
          )
        }

        return <div key={activity.id}>{content}</div>
      })}

      {showViewMore && (
        <button
          onClick={onViewMore}
          className="w-full flex items-center justify-center gap-1 py-2 mt-2 text-sm text-slate-400 hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-800/50"
        >
          View More
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
