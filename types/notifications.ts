// Notification System Types

export type NotificationType =
  | 'low_stock'
  | 'invoice_paid'
  | 'invoice_overdue'
  | 'new_order'
  | 'payment_received'
  | 'quote_accepted'
  | 'quote_rejected'
  | 'system'

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  priority: NotificationPriority
  is_read: boolean
  read_at?: string
  action_url?: string
  metadata?: Record<string, unknown>
  created_at: string
}

export interface NotificationGroup {
  date: string
  label: string
  notifications: Notification[]
}

// Helper to get notification icon and color based on type
export const notificationConfig: Record<NotificationType, {
  icon: string
  color: string
  bgColor: string
}> = {
  low_stock: {
    icon: 'Package',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10'
  },
  invoice_paid: {
    icon: 'CheckCircle',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10'
  },
  invoice_overdue: {
    icon: 'AlertCircle',
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/10'
  },
  new_order: {
    icon: 'ShoppingCart',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10'
  },
  payment_received: {
    icon: 'DollarSign',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10'
  },
  quote_accepted: {
    icon: 'ThumbsUp',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10'
  },
  quote_rejected: {
    icon: 'ThumbsDown',
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/10'
  },
  system: {
    icon: 'Info',
    color: 'text-slate-400',
    bgColor: 'bg-slate-500/10'
  }
}
