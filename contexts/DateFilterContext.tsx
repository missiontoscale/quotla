'use client'

import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react'
import { startOfMonth, endOfMonth, subMonths, startOfWeek, endOfWeek, subDays } from 'date-fns'
import type { DateRangeValue } from '@/components/filters/types'

// ============================================================================
// TYPES
// ============================================================================

export interface DateFilterContextValue {
  // Current date range
  dateRange: DateRangeValue
  // Set date range
  setDateRange: (range: DateRangeValue) => void
  // Clear date range (reset to default)
  clearDateRange: () => void
  // Check if a date is within the current range
  isDateInRange: (date: Date | string) => boolean
  // Filter an array of items by date
  filterByDateRange: <T>(items: T[], dateKey: keyof T | ((item: T) => Date | string | null)) => T[]
  // Check if filter is active (has a date range set)
  isFilterActive: boolean
  // Preset helpers
  setThisMonth: () => void
  setLastMonth: () => void
  setLast7Days: () => void
  setLast30Days: () => void
  setThisWeek: () => void
}

// ============================================================================
// CONTEXT
// ============================================================================

const DateFilterContext = createContext<DateFilterContextValue | undefined>(undefined)

// ============================================================================
// PROVIDER
// ============================================================================

interface DateFilterProviderProps {
  children: ReactNode
  defaultRange?: DateRangeValue
}

export function DateFilterProvider({ children, defaultRange }: DateFilterProviderProps) {
  // Default to no filter (show all data)
  const [dateRange, setDateRangeState] = useState<DateRangeValue>(
    defaultRange || { from: null, to: null }
  )

  const setDateRange = useCallback((range: DateRangeValue) => {
    setDateRangeState(range)
  }, [])

  const clearDateRange = useCallback(() => {
    setDateRangeState({ from: null, to: null })
  }, [])

  const isFilterActive = useMemo(() => {
    return dateRange.from !== null || dateRange.to !== null
  }, [dateRange])

  const isDateInRange = useCallback((date: Date | string): boolean => {
    if (!dateRange.from && !dateRange.to) return true

    const checkDate = typeof date === 'string' ? new Date(date) : date

    // Normalize to start of day for comparison
    const normalizedDate = new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate())

    if (dateRange.from && dateRange.to) {
      const fromDate = new Date(dateRange.from.getFullYear(), dateRange.from.getMonth(), dateRange.from.getDate())
      const toDate = new Date(dateRange.to.getFullYear(), dateRange.to.getMonth(), dateRange.to.getDate())
      return normalizedDate >= fromDate && normalizedDate <= toDate
    }

    if (dateRange.from) {
      const fromDate = new Date(dateRange.from.getFullYear(), dateRange.from.getMonth(), dateRange.from.getDate())
      return normalizedDate >= fromDate
    }

    if (dateRange.to) {
      const toDate = new Date(dateRange.to.getFullYear(), dateRange.to.getMonth(), dateRange.to.getDate())
      return normalizedDate <= toDate
    }

    return true
  }, [dateRange])

  const filterByDateRange = useCallback(<T,>(
    items: T[],
    dateKey: keyof T | ((item: T) => Date | string | null)
  ): T[] => {
    if (!isFilterActive) return items

    return items.filter(item => {
      const dateValue = typeof dateKey === 'function'
        ? dateKey(item)
        : item[dateKey]

      if (!dateValue) return false

      return isDateInRange(dateValue as Date | string)
    })
  }, [isFilterActive, isDateInRange])

  // Preset helpers
  const setThisMonth = useCallback(() => {
    const now = new Date()
    setDateRangeState({
      from: startOfMonth(now),
      to: endOfMonth(now)
    })
  }, [])

  const setLastMonth = useCallback(() => {
    const lastMonth = subMonths(new Date(), 1)
    setDateRangeState({
      from: startOfMonth(lastMonth),
      to: endOfMonth(lastMonth)
    })
  }, [])

  const setLast7Days = useCallback(() => {
    const now = new Date()
    setDateRangeState({
      from: subDays(now, 6),
      to: now
    })
  }, [])

  const setLast30Days = useCallback(() => {
    const now = new Date()
    setDateRangeState({
      from: subDays(now, 29),
      to: now
    })
  }, [])

  const setThisWeek = useCallback(() => {
    const now = new Date()
    setDateRangeState({
      from: startOfWeek(now, { weekStartsOn: 1 }),
      to: endOfWeek(now, { weekStartsOn: 1 })
    })
  }, [])

  const value = useMemo<DateFilterContextValue>(() => ({
    dateRange,
    setDateRange,
    clearDateRange,
    isDateInRange,
    filterByDateRange,
    isFilterActive,
    setThisMonth,
    setLastMonth,
    setLast7Days,
    setLast30Days,
    setThisWeek,
  }), [
    dateRange,
    setDateRange,
    clearDateRange,
    isDateInRange,
    filterByDateRange,
    isFilterActive,
    setThisMonth,
    setLastMonth,
    setLast7Days,
    setLast30Days,
    setThisWeek,
  ])

  return (
    <DateFilterContext.Provider value={value}>
      {children}
    </DateFilterContext.Provider>
  )
}

// ============================================================================
// HOOK
// ============================================================================

export function useDateFilterContext(): DateFilterContextValue {
  const context = useContext(DateFilterContext)
  if (context === undefined) {
    throw new Error('useDateFilterContext must be used within a DateFilterProvider')
  }
  return context
}