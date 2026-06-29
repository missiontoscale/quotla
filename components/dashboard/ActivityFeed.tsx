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
  ChevronRight,
  Receipt
} from 'lucide-react'
import { Button } from '@/components/ui/button'
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
  invoiceId?: string
}

interface ActivityFeedProps {
  limit?: number
  showViewMore?: boolean
  onViewMore?: () => void
  onInvoiceClick?: (invoiceId: string) => void
}

export function ActivityFeed({ limit = 8, showViewMore = false, onViewMore, onInvoiceClick }: ActivityFeedProps) {
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

      const { data: invoices } = await supabase
        .from('invoices')
        .select('id, invoice_number, status, total, created_at, updated_at, client_id, customers:client_id(full_name, company_name)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
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
              amount: inv.total,
              invoiceId: inv.id
            })
          } else if (inv.status === 'overdue') {
            activityList.push({
              id: `inv-overdue-${inv.id}`,
              type: 'invoice_overdue',
              title: 'Invoice overdue',
              description: `Invoice #${inv.invoice_number} for ${clientName}`,
              timestamp: inv.updated_at,
              link: `/business/sales`,
              amount: inv.total,
              invoiceId: inv.id
            })
          } else if (inv.status === 'sent') {
            activityList.push({
              id: `inv-sent-${inv.id}`,
              type: 'invoice_sent',
              title: 'Invoice sent',
              description: `Invoice #${inv.invoice_number} to ${clientName}`,
              timestamp: inv.updated_at,
              link: `/business/sales`,
              amount: inv.total,
              invoiceId: inv.id
            })
          } else if (inv.status === 'draft') {
            activityList.push({
              id: `inv-created-${inv.id}`,
              type: 'invoice_created',
              title: 'Invoice created',
              description: `Invoice #${inv.invoice_number} for ${clientName}`,
              timestamp: inv.created_at,
              link: `/business/sales`,
              amount: inv.total,
              invoiceId: inv.id
            })
          }
        })
      }

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
        return <DollarSign className="w-4 h-4 text-quotla-green" />
      case 'invoice_created':
      case 'invoice_sent':
        return <FileText className="w-4 h-4 text-quotla-orange" />
      case 'invoice_overdue':
        return <AlertCircle className="w-4 h-4 text-rose-400" />
      case 'customer_added':
        return <Users className="w-4 h-4 text-quotla-orange" />
      case 'low_stock':
        return <Package className="w-4 h-4 text-amber-400" />
      default:
        return <Clock className="w-4 h-4 text-primary-400" />
    }
  }

  const getStatusBadge = (type: ActivityItem['type']) => {
    const base = 'inline-flex items-center px-2 py-0.5 rounded-full text-[0.65rem] font-medium'
    switch (type) {
      case 'invoice_paid':
        return <span className={`${base} bg-quotla-green/20 text-quotla-green`}>Paid</span>
      case 'invoice_overdue':
        return <span className={`${base} bg-rose-500/20 text-rose-400`}>Overdue</span>
      case 'invoice_sent':
        return <span className={`${base} bg-quotla-orange/20 text-quotla-orange`}>Sent</span>
      case 'invoice_created':
        return <span className={`${base} bg-primary-600/20 text-primary-400`}>Draft</span>
      case 'customer_added':
        return <span className={`${base} bg-quotla-orange/20 text-quotla-orange`}>New</span>
      case 'low_stock':
        return <span className={`${base} bg-amber-500/20 text-amber-400`}>Alert</span>
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="p-6 bg-quotla-dark/90 border border-quotla-orange/20 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 bg-primary-700 rounded w-32 animate-pulse" />
          <div className="h-8 bg-primary-700 rounded w-20 animate-pulse" />
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-8 h-8 bg-primary-700 rounded-lg" />
              <div className="flex-1">
                <div className="h-4 bg-primary-700 rounded w-1/3 mb-2" />
                <div className="h-3 bg-primary-700/50 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="p-6 bg-quotla-dark/90 border border-quotla-orange/20 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-primary-50 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-quotla-orange" />
            Recent Activity
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 bg-primary-700 rounded-full flex items-center justify-center mb-3">
            <Clock className="w-5 h-5 text-primary-500" />
          </div>
          <p className="text-sm text-primary-400">No recent activity</p>
          <p className="text-xs text-primary-500 mt-1">Activity will appear here as you use Quotla</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-quotla-dark/90 border border-quotla-orange/20 rounded-2xl transition-all duration-300 hover:border-quotla-orange/40">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-primary-50 flex items-center gap-2">
          <Receipt className="w-5 h-5 text-quotla-orange" />
          Recent Activity
        </h2>
        {showViewMore && (
          <Button
            variant="outline"
            size="sm"
            onClick={onViewMore}
            className="border-primary-600 text-primary-300 hover:text-primary-50 hover:border-primary-400 h-9 px-3"
          >
            View More
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>

      <div className="space-y-1">
        {activities.map((activity) => {
          const isInvoiceType = activity.type.startsWith('invoice_')

          const content = (
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-primary-700/50 transition-colors cursor-pointer group">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center border bg-primary-700/30 border-primary-600 flex-shrink-0">
                {getIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-primary-100 truncate">{activity.title}</p>
                    {getStatusBadge(activity.type)}
                  </div>
                  <p className="text-xs text-primary-500 truncate">{activity.description}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {activity.amount && (
                    <span className={`text-xs font-medium ${activity.type === 'invoice_paid' ? 'text-quotla-green' : 'text-primary-400'}`}>
                      {formatCurrency(activity.amount, currency)}
                    </span>
                  )}
                  <span className="text-[0.65rem] text-primary-500/70 whitespace-nowrap">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          )

          if (isInvoiceType && activity.invoiceId && onInvoiceClick) {
            return (
              <button
                key={activity.id}
                type="button"
                className="w-full text-left"
                onClick={() => onInvoiceClick(activity.invoiceId!)}
              >
                {content}
              </button>
            )
          }

          if (activity.link) {
            return (
              <Link key={activity.id} href={activity.link}>
                {content}
              </Link>
            )
          }

          return <div key={activity.id}>{content}</div>
        })}
      </div>
    </div>
  )
}
