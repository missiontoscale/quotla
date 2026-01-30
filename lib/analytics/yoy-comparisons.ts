import {
  subYears,
  startOfMonth,
  endOfMonth,
  eachMonthOfInterval,
  format,
} from 'date-fns'

// ============================================================================
// TYPES
// ============================================================================

/**
 * Represents a date range for YoY comparison
 */
export interface YoYDateRange {
  current: {
    start: Date
    end: Date
  }
  previous: {
    start: Date
    end: Date
  }
}

/**
 * Result of a YoY comparison calculation
 */
export interface YoYComparisonResult {
  currentValue: number
  previousValue: number
  absoluteChange: number
  percentageChange: number | null
  direction: 'up' | 'down' | 'flat'
}

/**
 * Monthly data point for YoY chart
 */
export interface YoYMonthlyDataPoint {
  month: string
  monthIndex: number
  currentYear: number
  previousYear: number
  currentYearLabel: string
  previousYearLabel: string
}

/**
 * Configuration for YoY calculations
 */
export interface YoYConfig<T = unknown> {
  dateAccessor: (item: T) => Date | string | null
  valueAccessor: (item: T) => number
  aggregation?: 'sum' | 'count' | 'average'
}

// ============================================================================
// DATE RANGE HELPERS
// ============================================================================

/**
 * Get the corresponding date range from the previous year
 */
export function getYoYDateRange(currentRange: {
  from: Date | null
  to: Date | null
}): YoYDateRange {
  const now = new Date()
  const currentStart = currentRange.from || startOfMonth(now)
  const currentEnd = currentRange.to || endOfMonth(now)

  return {
    current: {
      start: currentStart,
      end: currentEnd,
    },
    previous: {
      start: subYears(currentStart, 1),
      end: subYears(currentEnd, 1),
    },
  }
}

/**
 * Get month-by-month date ranges for a full year
 */
export function getYearlyMonthRanges(
  year: number
): Array<{ start: Date; end: Date; label: string }> {
  const yearStart = new Date(year, 0, 1)
  const yearEnd = new Date(year, 11, 31)

  const months = eachMonthOfInterval({ start: yearStart, end: yearEnd })

  return months.map((month) => ({
    start: startOfMonth(month),
    end: endOfMonth(month),
    label: format(month, 'MMM'),
  }))
}

// ============================================================================
// COMPARISON CALCULATIONS
// ============================================================================

/**
 * Calculate YoY comparison for a single metric
 */
export function calculateYoYComparison(
  currentValue: number,
  previousValue: number
): YoYComparisonResult {
  const absoluteChange = currentValue - previousValue

  let percentageChange: number | null = null
  if (previousValue !== 0) {
    percentageChange = (absoluteChange / previousValue) * 100
  } else if (currentValue > 0) {
    percentageChange = 100
  }

  let direction: 'up' | 'down' | 'flat' = 'flat'
  if (absoluteChange > 0) direction = 'up'
  else if (absoluteChange < 0) direction = 'down'

  return {
    currentValue,
    previousValue,
    absoluteChange,
    percentageChange,
    direction,
  }
}

/**
 * Calculate YoY comparison from arrays of data
 */
export function calculateYoYFromArrays<T>(
  currentData: T[],
  previousData: T[],
  config: YoYConfig<T>
): YoYComparisonResult {
  const { valueAccessor, aggregation = 'sum' } = config

  const aggregate = (items: T[]): number => {
    if (items.length === 0) return 0

    switch (aggregation) {
      case 'count':
        return items.length
      case 'average':
        const total = items.reduce((sum, item) => sum + valueAccessor(item), 0)
        return total / items.length
      case 'sum':
      default:
        return items.reduce((sum, item) => sum + valueAccessor(item), 0)
    }
  }

  const currentValue = aggregate(currentData)
  const previousValue = aggregate(previousData)

  return calculateYoYComparison(currentValue, previousValue)
}

/**
 * Filter array by date range
 */
export function filterByDateRange<T>(
  items: T[],
  dateAccessor: (item: T) => Date | string | null,
  range: { start: Date; end: Date }
): T[] {
  return items.filter((item) => {
    const dateValue = dateAccessor(item)
    if (!dateValue) return false

    const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue
    return date >= range.start && date <= range.end
  })
}

// ============================================================================
// CHART DATA BUILDERS
// ============================================================================

/**
 * Build monthly YoY chart data for dual-line comparison
 */
export function buildYoYChartData<T>(
  allData: T[],
  config: YoYConfig<T>,
  currentYear?: number
): YoYMonthlyDataPoint[] {
  const year = currentYear || new Date().getFullYear()
  const previousYear = year - 1

  const currentYearRanges = getYearlyMonthRanges(year)
  const previousYearRanges = getYearlyMonthRanges(previousYear)

  const { dateAccessor, valueAccessor, aggregation = 'sum' } = config

  const aggregate = (items: T[]): number => {
    if (items.length === 0) return 0
    switch (aggregation) {
      case 'count':
        return items.length
      case 'average':
        return (
          items.reduce((s, i) => s + valueAccessor(i), 0) / items.length
        )
      default:
        return items.reduce((s, i) => s + valueAccessor(i), 0)
    }
  }

  return currentYearRanges.map((range, index) => {
    const currentMonthData = filterByDateRange(allData, dateAccessor, range)
    const previousMonthData = filterByDateRange(
      allData,
      dateAccessor,
      previousYearRanges[index]
    )

    return {
      month: range.label,
      monthIndex: index,
      currentYear: aggregate(currentMonthData),
      previousYear: aggregate(previousMonthData),
      currentYearLabel: String(year),
      previousYearLabel: String(previousYear),
    }
  })
}

/**
 * Build YoY chart data up to a specific month (for partial year)
 */
export function buildPartialYoYChartData<T>(
  allData: T[],
  config: YoYConfig<T>,
  upToMonth?: number
): YoYMonthlyDataPoint[] {
  const now = new Date()
  const currentMonth = upToMonth ?? now.getMonth()
  const fullData = buildYoYChartData(allData, config)

  return fullData.filter((point) => point.monthIndex <= currentMonth)
}
