// ============================================================================
// TYPES
// ============================================================================

export type AnomalySeverity = 'info' | 'warning' | 'critical'
export type AnomalyType = 'spike' | 'drop' | 'unusual_pattern' | 'missing_data' | 'threshold_breach'

export interface Anomaly {
  id: string
  type: AnomalyType
  severity: AnomalySeverity
  title: string
  description: string
  value: number
  expectedValue: number
  deviation: number
  index: number
  timestamp?: Date
  metric: string
}

export interface AnomalyDetectionResult {
  anomalies: Anomaly[]
  mean: number
  stdDev: number
  upperBound: number
  lowerBound: number
  zScores: number[]
}

export interface AnomalyDetectionConfig {
  /** Z-score threshold for anomaly detection (default: 2.5) */
  zScoreThreshold?: number
  /** Minimum number of data points required (default: 3) */
  minDataPoints?: number
  /** Metric name for display purposes */
  metricName?: string
  /** Whether to detect spikes (values above upper bound) */
  detectSpikes?: boolean
  /** Whether to detect drops (values below lower bound) */
  detectDrops?: boolean
  /** Custom thresholds - if set, overrides statistical bounds */
  customUpperThreshold?: number
  customLowerThreshold?: number
  /** Severity thresholds based on z-score magnitude */
  severityThresholds?: {
    warning: number
    critical: number
  }
}

export interface StatisticalBounds {
  mean: number
  stdDev: number
  upperBound: number
  lowerBound: number
  variance: number
  min: number
  max: number
}

// ============================================================================
// STATISTICAL HELPERS
// ============================================================================

/**
 * Calculate mean of an array of numbers
 */
export function calculateMean(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((sum, val) => sum + val, 0) / values.length
}

/**
 * Calculate standard deviation of an array of numbers
 */
export function calculateStdDev(values: number[], mean?: number): number {
  if (values.length < 2) return 0
  const avg = mean ?? calculateMean(values)
  const squaredDiffs = values.map((val) => Math.pow(val - avg, 2))
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length
  return Math.sqrt(variance)
}

/**
 * Calculate z-score for a value
 */
export function calculateZScore(value: number, mean: number, stdDev: number): number {
  if (stdDev === 0) return 0
  return (value - mean) / stdDev
}

/**
 * Calculate statistical bounds for a dataset
 */
export function calculateStatisticalBounds(
  values: number[],
  numStdDevs: number = 2
): StatisticalBounds {
  const mean = calculateMean(values)
  const stdDev = calculateStdDev(values, mean)
  const variance = stdDev * stdDev

  return {
    mean,
    stdDev,
    upperBound: mean + numStdDevs * stdDev,
    lowerBound: mean - numStdDevs * stdDev,
    variance,
    min: Math.min(...values),
    max: Math.max(...values),
  }
}

// ============================================================================
// ANOMALY DETECTION
// ============================================================================

/**
 * Detect anomalies in a dataset using z-score method
 */
export function detectAnomalies(
  values: number[],
  config: AnomalyDetectionConfig = {}
): AnomalyDetectionResult {
  const {
    zScoreThreshold = 2.5,
    minDataPoints = 3,
    metricName = 'Value',
    detectSpikes = true,
    detectDrops = true,
    customUpperThreshold,
    customLowerThreshold,
    severityThresholds = { warning: 2, critical: 3 },
  } = config

  // Initialize result with defaults
  const emptyResult: AnomalyDetectionResult = {
    anomalies: [],
    mean: 0,
    stdDev: 0,
    upperBound: 0,
    lowerBound: 0,
    zScores: [],
  }

  if (values.length < minDataPoints) {
    return emptyResult
  }

  const mean = calculateMean(values)
  const stdDev = calculateStdDev(values, mean)

  // Calculate bounds
  const upperBound = customUpperThreshold ?? mean + zScoreThreshold * stdDev
  const lowerBound = customLowerThreshold ?? mean - zScoreThreshold * stdDev

  // Calculate z-scores for all values
  const zScores = values.map((val) => calculateZScore(val, mean, stdDev))

  // Detect anomalies
  const anomalies: Anomaly[] = []

  values.forEach((value, index) => {
    const zScore = zScores[index]
    const absZScore = Math.abs(zScore)

    // Determine if this point is an anomaly
    const isSpike = detectSpikes && value > upperBound
    const isDrop = detectDrops && value < lowerBound

    if (isSpike || isDrop) {
      const type: AnomalyType = isSpike ? 'spike' : 'drop'
      const severity = getSeverityFromZScore(absZScore, severityThresholds)
      const deviation = ((value - mean) / mean) * 100

      anomalies.push({
        id: `anomaly-${metricName.toLowerCase().replace(/\s+/g, '-')}-${index}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type,
        severity,
        title: formatAnomalyTitle(type, metricName, severity),
        description: formatAnomalyDescription(type, value, mean, deviation),
        value,
        expectedValue: mean,
        deviation,
        index,
        metric: metricName,
      })
    }
  })

  return {
    anomalies,
    mean,
    stdDev,
    upperBound,
    lowerBound,
    zScores,
  }
}

/**
 * Detect anomalies with timestamps
 */
export function detectAnomaliesWithTimestamps<T>(
  data: T[],
  config: AnomalyDetectionConfig & {
    valueAccessor: (item: T) => number
    timestampAccessor?: (item: T) => Date
  }
): AnomalyDetectionResult {
  const { valueAccessor, timestampAccessor, ...detectionConfig } = config
  const values = data.map(valueAccessor)

  const result = detectAnomalies(values, detectionConfig)

  // Add timestamps to anomalies if accessor provided
  if (timestampAccessor) {
    result.anomalies = result.anomalies.map((anomaly) => ({
      ...anomaly,
      timestamp: timestampAccessor(data[anomaly.index]),
    }))
  }

  return result
}

// ============================================================================
// THRESHOLD-BASED DETECTION
// ============================================================================

export interface ThresholdConfig {
  metric: string
  upperThreshold?: number
  lowerThreshold?: number
  severity?: AnomalySeverity
}

/**
 * Detect threshold breaches for business metrics
 */
export function detectThresholdBreaches(
  value: number,
  config: ThresholdConfig
): Anomaly | null {
  const { metric, upperThreshold, lowerThreshold, severity = 'warning' } = config

  if (upperThreshold !== undefined && value > upperThreshold) {
    const deviation = ((value - upperThreshold) / upperThreshold) * 100
    return {
      id: `threshold-upper-${Date.now()}`,
      type: 'threshold_breach',
      severity,
      title: `${metric} exceeds threshold`,
      description: `${metric} is ${deviation.toFixed(1)}% above the threshold of ${upperThreshold}`,
      value,
      expectedValue: upperThreshold,
      deviation,
      index: 0,
      metric,
    }
  }

  if (lowerThreshold !== undefined && value < lowerThreshold) {
    const deviation = ((lowerThreshold - value) / lowerThreshold) * 100
    return {
      id: `threshold-lower-${Date.now()}`,
      type: 'threshold_breach',
      severity,
      title: `${metric} below threshold`,
      description: `${metric} is ${deviation.toFixed(1)}% below the minimum threshold of ${lowerThreshold}`,
      value,
      expectedValue: lowerThreshold,
      deviation: -deviation,
      index: 0,
      metric,
    }
  }

  return null
}

// ============================================================================
// MOVING WINDOW ANOMALY DETECTION
// ============================================================================

export interface MovingWindowConfig extends AnomalyDetectionConfig {
  windowSize?: number
}

/**
 * Detect anomalies using a moving window approach
 * More suitable for trending data
 */
export function detectAnomaliesMovingWindow(
  values: number[],
  config: MovingWindowConfig = {}
): AnomalyDetectionResult {
  const { windowSize = 5, ...detectionConfig } = config

  if (values.length < windowSize + 1) {
    return detectAnomalies(values, detectionConfig)
  }

  const anomalies: Anomaly[] = []
  const zScores: number[] = new Array(values.length).fill(0)

  // For each point, calculate bounds from the previous window
  for (let i = windowSize; i < values.length; i++) {
    const window = values.slice(i - windowSize, i)
    const windowMean = calculateMean(window)
    const windowStdDev = calculateStdDev(window, windowMean)
    const currentValue = values[i]
    const zScore = calculateZScore(currentValue, windowMean, windowStdDev)
    zScores[i] = zScore

    const threshold = detectionConfig.zScoreThreshold ?? 2.5
    const absZScore = Math.abs(zScore)

    if (absZScore > threshold) {
      const type: AnomalyType = currentValue > windowMean ? 'spike' : 'drop'
      const severity = getSeverityFromZScore(absZScore, detectionConfig.severityThresholds)
      const deviation = ((currentValue - windowMean) / windowMean) * 100

      anomalies.push({
        id: `anomaly-mw-${(detectionConfig.metricName || 'value').toLowerCase().replace(/\s+/g, '-')}-${i}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type,
        severity,
        title: formatAnomalyTitle(type, detectionConfig.metricName || 'Value', severity),
        description: formatAnomalyDescription(type, currentValue, windowMean, deviation),
        value: currentValue,
        expectedValue: windowMean,
        deviation,
        index: i,
        metric: detectionConfig.metricName || 'Value',
      })
    }
  }

  // Calculate overall stats for reference
  const mean = calculateMean(values)
  const stdDev = calculateStdDev(values, mean)

  return {
    anomalies,
    mean,
    stdDev,
    upperBound: mean + (detectionConfig.zScoreThreshold ?? 2.5) * stdDev,
    lowerBound: mean - (detectionConfig.zScoreThreshold ?? 2.5) * stdDev,
    zScores,
  }
}

// ============================================================================
// BUSINESS METRICS ANOMALY DETECTION
// ============================================================================

export interface BusinessMetricAnomaly extends Anomaly {
  recommendation?: string
  impact?: 'positive' | 'negative' | 'neutral'
}

export interface MonthlyMetrics {
  revenue: number
  expenses: number
  profit: number
  invoiceCount?: number
  customerCount?: number
}

/**
 * Detect anomalies in business metrics with context-aware recommendations
 */
export function detectBusinessAnomalies(
  monthlyData: MonthlyMetrics[],
  config: AnomalyDetectionConfig = {}
): BusinessMetricAnomaly[] {
  const allAnomalies: BusinessMetricAnomaly[] = []

  // Revenue anomalies
  const revenueValues = monthlyData.map((m) => m.revenue)
  const revenueResult = detectAnomalies(revenueValues, {
    ...config,
    metricName: 'Revenue',
  })
  revenueResult.anomalies.forEach((a) => {
    const impact = a.type === 'spike' ? 'positive' : 'negative'
    const recommendation =
      a.type === 'spike'
        ? 'Investigate what drove this revenue spike to potentially replicate success'
        : 'Review sales activities and market conditions that may have caused this drop'
    allAnomalies.push({ ...a, impact, recommendation })
  })

  // Expenses anomalies
  const expenseValues = monthlyData.map((m) => m.expenses)
  const expenseResult = detectAnomalies(expenseValues, {
    ...config,
    metricName: 'Expenses',
  })
  expenseResult.anomalies.forEach((a) => {
    const impact = a.type === 'spike' ? 'negative' : 'positive'
    const recommendation =
      a.type === 'spike'
        ? 'Review expense categories to identify unexpected costs'
        : 'Cost savings identified - evaluate if this is sustainable'
    allAnomalies.push({ ...a, impact, recommendation })
  })

  // Profit anomalies
  const profitValues = monthlyData.map((m) => m.profit)
  const profitResult = detectAnomalies(profitValues, {
    ...config,
    metricName: 'Profit',
  })
  profitResult.anomalies.forEach((a) => {
    const impact = a.type === 'spike' ? 'positive' : 'negative'
    const recommendation =
      a.type === 'spike'
        ? 'Analyze profit drivers to understand and maintain this performance'
        : 'Urgent: Review both revenue and expenses to address profit decline'
    allAnomalies.push({ ...a, impact, recommendation })
  })

  return allAnomalies
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getSeverityFromZScore(
  absZScore: number,
  thresholds: { warning: number; critical: number } = { warning: 2, critical: 3 }
): AnomalySeverity {
  if (absZScore >= thresholds.critical) return 'critical'
  if (absZScore >= thresholds.warning) return 'warning'
  return 'info'
}

function formatAnomalyTitle(
  type: AnomalyType,
  metricName: string,
  severity: AnomalySeverity
): string {
  const severityPrefix = severity === 'critical' ? 'Critical: ' : ''

  switch (type) {
    case 'spike':
      return `${severityPrefix}Unusual ${metricName} spike`
    case 'drop':
      return `${severityPrefix}Unexpected ${metricName} drop`
    case 'threshold_breach':
      return `${severityPrefix}${metricName} threshold breach`
    case 'unusual_pattern':
      return `${severityPrefix}Unusual ${metricName} pattern`
    case 'missing_data':
      return `${metricName} data gap detected`
    default:
      return `${metricName} anomaly detected`
  }
}

function formatAnomalyDescription(
  type: AnomalyType,
  value: number,
  expectedValue: number,
  deviation: number
): string {
  const absDeviation = Math.abs(deviation).toFixed(1)
  const direction = deviation > 0 ? 'above' : 'below'

  switch (type) {
    case 'spike':
      return `Value is ${absDeviation}% ${direction} the expected range`
    case 'drop':
      return `Value is ${absDeviation}% ${direction} the expected range`
    default:
      return `Value deviates ${absDeviation}% from expected`
  }
}

/**
 * Check if a single value is anomalous based on historical data
 */
export function isAnomaly(
  value: number,
  historicalValues: number[],
  threshold: number = 2.5
): boolean {
  if (historicalValues.length < 3) return false

  const mean = calculateMean(historicalValues)
  const stdDev = calculateStdDev(historicalValues, mean)
  const zScore = calculateZScore(value, mean, stdDev)

  return Math.abs(zScore) > threshold
}

/**
 * Get anomaly points formatted for chart highlighting
 */
export function getAnomalyChartPoints(
  result: AnomalyDetectionResult
): { index: number; value: number; severity: AnomalySeverity }[] {
  return result.anomalies.map((a) => ({
    index: a.index,
    value: a.value,
    severity: a.severity,
  }))
}