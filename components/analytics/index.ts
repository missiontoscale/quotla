// AVITPF Metrics
export {
  AVITPFMetric,
  CompactAVITPFMetric,
  LargeAVITPFMetric,
} from './AVITPFMetric'
export type { AVITPFMetricProps } from './AVITPFMetric'

// Trend Indicators
export {
  TrendIndicator,
  TrendIndicatorFromResult,
  InlineTrend,
  TrendBadge,
} from './TrendIndicator'

// YoY Charts
export { YoYChart, CompactYoYChart } from './YoYChart'

// Anomaly Detection Components
export { AlertsBanner, CompactAlertsBanner } from './AlertsBanner'
export {
  AnomalyDot,
  AnomalyActiveDot,
  AnomalyBoundsDefs,
  AnomalyLegendItem,
  AnomalyChartLegend,
  AnomalyTooltipContent,
  BoundLabel,
  enrichChartDataWithAnomalies,
} from './AnomalyHighlight'
export type { AnomalyPoint } from './AnomalyHighlight'

// Re-export types from lib
export type {
  TrendDirection,
  TrendStrength,
  TrendAnalysisResult,
} from '@/lib/analytics/trend-analysis'

export type {
  YoYComparisonResult,
  YoYMonthlyDataPoint,
} from '@/lib/analytics/yoy-comparisons'

export type {
  Anomaly,
  AnomalySeverity,
  AnomalyType,
  AnomalyDetectionResult,
  BusinessMetricAnomaly,
} from '@/lib/analytics/anomaly-detection'
