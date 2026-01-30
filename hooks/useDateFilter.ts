'use client'

import { useMemo, useCallback } from 'react'
import {
  format,
  isWithinInterval,
  parseISO,
  startOfDay,
  endOfDay,
  differenceInDays,
} from 'date-fns'
import { useDateFilterContext } from '@/contexts/DateFilterContext'
import type { DateRangeValue } from '@/components/filters/types'

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook to consume the DateFilterContext with additional utility functions.
 * Use this hook in components that need to filter data by date range.
 */
export function useDateFilter() {
  const context = useDateFilterContext()

  // Format the current date range for display
  const formattedDateRange = useMemo(() => {
    const { dateRange } = context
    if (!dateRange.from && !dateRange.to) return 'All time'
    if (dateRange.from && dateRange.to) {
      if (dateRange.from.getTime() === dateRange.to.getTime()) {
        return format(dateRange.from, 'MMM d, yyyy')
      }
      return `${format(dateRange.from, 'MMM d')} - ${format(dateRange.to, 'MMM d, yyyy')}`
    }
    if (dateRange.from) return `From ${format(dateRange.from, 'MMM d, yyyy')}`
    if (dateRange.to) return `Until ${format(dateRange.to, 'MMM d, yyyy')}`
    return 'All time'
  }, [context.dateRange])

  // Get the number of days in the current filter range
  const daysInRange = useMemo(() => {
    const { dateRange } = context
    if (!dateRange.from || !dateRange.to) return null
    return differenceInDays(dateRange.to, dateRange.from) + 1
  }, [context.dateRange])

  // Build Supabase filter conditions for the date range
  const getSupabaseFilter = useCallback((columnName: string) => {
    const { dateRange } = context
    if (!dateRange.from && !dateRange.to) return null

    const conditions: { column: string; operator: string; value: string }[] = []

    if (dateRange.from) {
      conditions.push({
        column: columnName,
        operator: 'gte',
        value: format(startOfDay(dateRange.from), 'yyyy-MM-dd'),
      })
    }

    if (dateRange.to) {
      conditions.push({
        column: columnName,
        operator: 'lte',
        value: format(endOfDay(dateRange.to), 'yyyy-MM-dd'),
      })
    }

    return conditions
  }, [context.dateRange])

  // Apply date filter to a Supabase query builder
  const applyToSupabaseQuery = useCallback(<T extends { gte: (column: string, value: string) => T; lte: (column: string, value: string) => T }>(
    query: T,
    columnName: string
  ): T => {
    const { dateRange } = context
    let filteredQuery = query

    if (dateRange.from) {
      filteredQuery = filteredQuery.gte(columnName, format(startOfDay(dateRange.from), 'yyyy-MM-dd'))
    }

    if (dateRange.to) {
      filteredQuery = filteredQuery.lte(columnName, format(endOfDay(dateRange.to), 'yyyy-MM-dd'))
    }

    return filteredQuery
  }, [context.dateRange])

  // Filter an array by a date field (supporting string dates)
  const filterArrayByDate = useCallback(<T>(
    items: T[],
    getDate: (item: T) => string | Date | null | undefined
  ): T[] => {
    const { dateRange, isFilterActive } = context

    if (!isFilterActive) return items

    return items.filter(item => {
      const dateValue = getDate(item)
      if (!dateValue) return false

      const date = typeof dateValue === 'string' ? parseISO(dateValue) : dateValue

      if (dateRange.from && dateRange.to) {
        return isWithinInterval(date, {
          start: startOfDay(dateRange.from),
          end: endOfDay(dateRange.to),
        })
      }

      if (dateRange.from) {
        return date >= startOfDay(dateRange.from)
      }

      if (dateRange.to) {
        return date <= endOfDay(dateRange.to)
      }

      return true
    })
  }, [context])

  return {
    // Context values
    ...context,
    // Additional utilities
    formattedDateRange,
    daysInRange,
    getSupabaseFilter,
    applyToSupabaseQuery,
    filterArrayByDate,
  }
}

// ============================================================================
// TYPES
// ============================================================================

export type { DateRangeValue }