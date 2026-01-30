// ============================================================================
// TYPES
// ============================================================================

export type TrendDirection = 'up' | 'down' | 'flat'
export type TrendStrength = 'weak' | 'moderate' | 'strong'

export interface TrendAnalysisResult {
  direction: TrendDirection
  strength: TrendStrength
  slope: number
  rSquared: number
  percentageChange: number
  projectedNextValue: number | null
}

export interface TrendDataPoint {
  index: number
  value: number
  label?: string
}

export interface MovingAverageResult {
  value: number
  period: number
  dataPoints: number[]
}

export interface MovingAverageConfig {
  period: number
  type?: 'simple' | 'exponential'
}

// ============================================================================
// LINEAR REGRESSION
// ============================================================================

/**
 * Calculate simple linear regression (y = mx + b)
 */
export function linearRegression(
  points: TrendDataPoint[]
): { slope: number; intercept: number; rSquared: number } {
  const n = points.length
  if (n < 2) {
    return { slope: 0, intercept: 0, rSquared: 0 }
  }

  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumX2 = 0

  for (const point of points) {
    sumX += point.index
    sumY += point.value
    sumXY += point.index * point.value
    sumX2 += point.index * point.index
  }

  const denominator = n * sumX2 - sumX * sumX
  if (denominator === 0) {
    return { slope: 0, intercept: sumY / n, rSquared: 0 }
  }

  const slope = (n * sumXY - sumX * sumY) / denominator
  const intercept = (sumY - slope * sumX) / n

  // Calculate R-squared
  const meanY = sumY / n
  let ssTotal = 0,
    ssResidual = 0

  for (const point of points) {
    const predicted = slope * point.index + intercept
    ssTotal += Math.pow(point.value - meanY, 2)
    ssResidual += Math.pow(point.value - predicted, 2)
  }

  const rSquared = ssTotal === 0 ? 0 : 1 - ssResidual / ssTotal

  return { slope, intercept, rSquared }
}

// ============================================================================
// TREND ANALYSIS
// ============================================================================

/**
 * Analyze trend from an array of values
 */
export function analyzeTrend(
  values: number[],
  options?: {
    flatThreshold?: number
    strongThreshold?: number
    moderateThreshold?: number
  }
): TrendAnalysisResult {
  const {
    flatThreshold = 0.02,
    strongThreshold = 0.7,
    moderateThreshold = 0.3,
  } = options || {}

  if (values.length < 2) {
    return {
      direction: 'flat',
      strength: 'weak',
      slope: 0,
      rSquared: 0,
      percentageChange: 0,
      projectedNextValue: null,
    }
  }

  const points: TrendDataPoint[] = values.map((value, index) => ({
    index,
    value,
  }))

  const { slope, intercept, rSquared } = linearRegression(points)

  // Calculate percentage change
  const firstValue = values[0]
  const lastValue = values[values.length - 1]
  const percentageChange =
    firstValue !== 0
      ? ((lastValue - firstValue) / firstValue) * 100
      : lastValue > 0
        ? 100
        : 0

  // Determine direction
  let direction: TrendDirection = 'flat'
  const normalizedSlope = firstValue !== 0 ? slope / firstValue : slope

  if (Math.abs(normalizedSlope) > flatThreshold) {
    direction = slope > 0 ? 'up' : 'down'
  }

  // Determine strength based on R-squared
  let strength: TrendStrength = 'weak'
  if (rSquared >= strongThreshold) {
    strength = 'strong'
  } else if (rSquared >= moderateThreshold) {
    strength = 'moderate'
  }

  // Project next value
  const nextIndex = values.length
  const projectedNextValue = slope * nextIndex + intercept

  return {
    direction,
    strength,
    slope,
    rSquared,
    percentageChange,
    projectedNextValue,
  }
}

// ============================================================================
// MOVING AVERAGES
// ============================================================================

/**
 * Calculate simple moving average
 */
export function simpleMovingAverage(values: number[], period: number): number[] {
  if (values.length < period) {
    return []
  }

  const result: number[] = []

  for (let i = period - 1; i < values.length; i++) {
    const window = values.slice(i - period + 1, i + 1)
    const average = window.reduce((sum, val) => sum + val, 0) / period
    result.push(average)
  }

  return result
}

/**
 * Calculate exponential moving average
 */
export function exponentialMovingAverage(
  values: number[],
  period: number
): number[] {
  if (values.length < period) {
    return []
  }

  const multiplier = 2 / (period + 1)
  const result: number[] = []

  // First EMA is SMA
  const firstSMA =
    values.slice(0, period).reduce((sum, val) => sum + val, 0) / period
  result.push(firstSMA)

  // Calculate subsequent EMAs
  for (let i = period; i < values.length; i++) {
    const ema =
      (values[i] - result[result.length - 1]) * multiplier +
      result[result.length - 1]
    result.push(ema)
  }

  return result
}

/**
 * Get the latest moving average value with context
 */
export function getMovingAverage(
  values: number[],
  config: MovingAverageConfig
): MovingAverageResult | null {
  const { period, type = 'simple' } = config

  if (values.length < period) {
    return null
  }

  const maValues =
    type === 'exponential'
      ? exponentialMovingAverage(values, period)
      : simpleMovingAverage(values, period)

  if (maValues.length === 0) {
    return null
  }

  return {
    value: maValues[maValues.length - 1],
    period,
    dataPoints: maValues,
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Classify a percentage change into trend strength
 */
export function classifyChangeStrength(percentageChange: number): TrendStrength {
  const absChange = Math.abs(percentageChange)

  if (absChange >= 20) return 'strong'
  if (absChange >= 5) return 'moderate'
  return 'weak'
}

/**
 * Format trend for display
 */
export function formatTrendDescription(result: TrendAnalysisResult): string {
  const sign = result.percentageChange >= 0 ? '+' : ''
  const percentage = `${sign}${result.percentageChange.toFixed(1)}%`

  if (result.direction === 'flat') {
    return `${percentage} (stable)`
  }

  const directionWord = result.direction === 'up' ? 'upward' : 'downward'
  return `${percentage} ${result.strength} ${directionWord} trend`
}
