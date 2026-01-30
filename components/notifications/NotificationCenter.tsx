'use client'

import { useState } from 'react'
import { useNotifications } from '@/hooks/use-notifications'
import { Notification, NotificationType } from '@/types/notifications'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import {
  Bell,
  Package,
  CheckCircle,
  AlertCircle,
  ShoppingCart,
  DollarSign,
  ThumbsUp,
  ThumbsDown,
  Info,
  X,
  Check,
  Trash2,
  ExternalLink,
  Loader2
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

const iconMap: Record<NotificationType, React.ElementType> = {
  low_stock: Package,
  invoice_paid: CheckCircle,
  invoice_overdue: AlertCircle,
  new_order: ShoppingCart,
  payment_received: DollarSign,
  quote_accepted: ThumbsUp,
  quote_rejected: ThumbsDown,
  system: Info
}

const colorMap: Record<NotificationType, { icon: string; bg: string; border: string }> = {
  low_stock: {
    icon: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20'
  },
  invoice_paid: {
    icon: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20'
  },
  invoice_overdue: {
    icon: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20'
  },
  new_order: {
    icon: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20'
  },
  payment_received: {
    icon: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20'
  },
  quote_accepted: {
    icon: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20'
  },
  quote_rejected: {
    icon: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20'
  },
  system: {
    icon: 'text-slate-400',
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/20'
  }
}

function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete
}: {
  notification: Notification
  onMarkAsRead: (id: string) => void
  onDelete: (id: string) => void
}) {
  const [isHovered, setIsHovered] = useState(false)
  const Icon = iconMap[notification.type] || Info
  const colors = colorMap[notification.type] || colorMap.system

  const timeAgo = formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })

  const content = (
    <div
      className={cn(
        'group relative px-4 py-3 transition-all duration-200',
        !notification.is_read && 'bg-slate-800/50',
        'hover:bg-slate-800/80'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Unread indicator */}
      {!notification.is_read && (
        <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-quotla-orange" />
      )}

      <div className="flex gap-3">
        {/* Icon */}
        <div className={cn(
          'flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center border',
          colors.bg,
          colors.border
        )}>
          <Icon className={cn('w-4 h-4', colors.icon)} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={cn(
              'text-[0.81rem] font-medium truncate',
              notification.is_read ? 'text-slate-300' : 'text-slate-100'
            )}>
              {notification.title}
            </h4>

            {/* Actions - show on hover */}
            <div className={cn(
              'flex items-center gap-0.5 transition-opacity duration-200',
              isHovered ? 'opacity-100' : 'opacity-0'
            )}>
              {!notification.is_read && (
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onMarkAsRead(notification.id)
                  }}
                  className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-emerald-400 transition-colors"
                  title="Mark as read"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onDelete(notification.id)
                }}
                className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-rose-400 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <p className={cn(
            'text-[0.75rem] mt-0.5 line-clamp-2',
            notification.is_read ? 'text-slate-500' : 'text-slate-400'
          )}>
            {notification.message}
          </p>

          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[0.68rem] text-slate-500">
              {timeAgo}
            </span>
            {notification.action_url && (
              <span className="text-[0.68rem] text-quotla-orange flex items-center gap-0.5">
                View details
                <ExternalLink className="w-2.5 h-2.5" />
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  if (notification.action_url) {
    return (
      <Link
        href={notification.action_url}
        onClick={() => !notification.is_read && onMarkAsRead(notification.id)}
      >
        {content}
      </Link>
    )
  }

  return content
}

export function NotificationCenter() {
  const {
    notifications,
    unreadCount,
    loading,
    groupedNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll
  } = useNotifications()

  const [open, setOpen] = useState(false)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-slate-400 hover:text-slate-100 h-9 w-9"
        >
          <Bell className="w-4.5 h-4.5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center p-0 bg-quotla-orange text-white text-[0.68rem] font-semibold border-0">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-[360px] sm:w-[400px] p-0 bg-slate-900 border-slate-800 shadow-2xl"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <h3 className="text-[0.9rem] font-semibold text-slate-100">Notifications</h3>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 text-[0.68rem] font-medium bg-quotla-orange/20 text-quotla-orange rounded">
                {unreadCount} new
              </span>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[0.75rem] text-slate-400 hover:text-slate-200 px-2 py-1 rounded hover:bg-slate-800 transition-colors"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={clearAll}
                className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors"
                title="Clear all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <ScrollArea className="max-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-slate-500 animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-3">
                <Bell className="w-6 h-6 text-slate-500" />
              </div>
              <p className="text-[0.81rem] text-slate-400 font-medium">No notifications yet</p>
              <p className="text-[0.75rem] text-slate-500 mt-1 text-center">
                We&apos;ll notify you when something important happens
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/50">
              {groupedNotifications.map((group) => (
                <div key={group.date}>
                  {/* Group header */}
                  <div className="px-4 py-2 bg-slate-800/30 sticky top-0 z-10">
                    <span className="text-[0.68rem] font-medium text-slate-500 uppercase tracking-wider">
                      {group.label}
                    </span>
                  </div>

                  {/* Notifications in group */}
                  <div className="divide-y divide-slate-800/30">
                    {group.notifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={markAsRead}
                        onDelete={deleteNotification}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

      </DropdownMenuContent>
    </DropdownMenu>
  )
}
