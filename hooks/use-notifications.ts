'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Notification, NotificationGroup } from '@/types/notifications'

interface UseNotificationsReturn {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  error: string | null
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (id: string) => Promise<void>
  clearAll: () => Promise<void>
  refresh: () => Promise<void>
  groupedNotifications: NotificationGroup[]
}

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setNotifications([])
        return
      }

      const { data, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (fetchError) throw fetchError

      setNotifications(data || [])
    } catch (err) {
      console.error('Error fetching notifications:', err)
      setError('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }, [])

  const markAsRead = useCallback(async (id: string) => {
    try {
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() } as never)
        .eq('id', id)

      if (updateError) throw updateError

      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n)
      )
    } catch (err) {
      console.error('Error marking notification as read:', err)
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error: updateError } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() } as never)
        .eq('user_id', user.id)
        .eq('is_read', false)

      if (updateError) throw updateError

      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
      )
    } catch (err) {
      console.error('Error marking all notifications as read:', err)
    }
  }, [])

  const deleteNotification = useCallback(async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      setNotifications(prev => prev.filter(n => n.id !== id))
    } catch (err) {
      console.error('Error deleting notification:', err)
    }
  }, [])

  const clearAll = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error: deleteError } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id)

      if (deleteError) throw deleteError

      setNotifications([])
    } catch (err) {
      console.error('Error clearing notifications:', err)
    }
  }, [])

  // Group notifications by date
  const groupedNotifications = useCallback((): NotificationGroup[] => {
    const groups: Map<string, Notification[]> = new Map()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)

    notifications.forEach(notification => {
      const notifDate = new Date(notification.created_at)
      notifDate.setHours(0, 0, 0, 0)

      let key: string
      let label: string

      if (notifDate.getTime() === today.getTime()) {
        key = 'today'
        label = 'Today'
      } else if (notifDate.getTime() === yesterday.getTime()) {
        key = 'yesterday'
        label = 'Yesterday'
      } else if (notifDate >= weekAgo) {
        key = 'this_week'
        label = 'This Week'
      } else {
        key = 'older'
        label = 'Older'
      }

      if (!groups.has(key)) {
        groups.set(key, [])
      }
      groups.get(key)!.push(notification)
    })

    const orderedKeys = ['today', 'yesterday', 'this_week', 'older']
    const labelMap: Record<string, string> = {
      today: 'Today',
      yesterday: 'Yesterday',
      this_week: 'This Week',
      older: 'Older'
    }

    return orderedKeys
      .filter(key => groups.has(key))
      .map(key => ({
        date: key,
        label: labelMap[key],
        notifications: groups.get(key)!
      }))
  }, [notifications])

  // Initial fetch
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Real-time subscription
  useEffect(() => {
    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const channel = supabase
        .channel('notifications-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            const newNotification = payload.new as Notification
            setNotifications(prev => [newNotification, ...prev])
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            const deletedId = payload.old.id
            setNotifications(prev => prev.filter(n => n.id !== deletedId))
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }

    setupSubscription()
  }, [])

  const unreadCount = notifications.filter(n => !n.is_read).length

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    refresh: fetchNotifications,
    groupedNotifications: groupedNotifications()
  }
}
