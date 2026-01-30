// YoY Comparisons
export {
  getYoYDateRange,
  getYearlyMonthRanges,
  calculateYoYComparison,
  calculateYoYFromArrays,
  filterByDateRange,
  buildYoYChartData,
  buildPartialYoYChartData,
} from './yoy-comparisons'

export type {
  YoYDateRange,
  YoYComparisonResult,
  YoYMonthlyDataPoint,
  YoYConfig,
} from './yoy-comparisons'

// Trend Analysis
export {
  linearRegression,
  analyzeTrend,
  simpleMovingAverage,
  exponentialMovingAverage,
  getMovingAverage,
  classifyChangeStrength,
  formatTrendDescription,
} from './trend-analysis'

export type {
  TrendDirection,
  TrendStrength,
  TrendAnalysisResult,
  TrendDataPoint,
  MovingAverageResult,
  MovingAverageConfig,
} from './trend-analysis'

// Anomaly Detection
export {
  calculateMean,
  calculateStdDev,
  calculateZScore,
  calculateStatisticalBounds,
  detectAnomalies,
  detectAnomaliesWithTimestamps,
  detectThresholdBreaches,
  detectAnomaliesMovingWindow,
  detectBusinessAnomalies,
  isAnomaly,
  getAnomalyChartPoints,
} from './anomaly-detection'

export type {
  Anomaly,
  AnomalySeverity,
  AnomalyType,
  AnomalyDetectionResult,
  AnomalyDetectionConfig,
  StatisticalBounds,
  ThresholdConfig,
  MovingWindowConfig,
  BusinessMetricAnomaly,
  MonthlyMetrics,
} from './anomaly-detection'
