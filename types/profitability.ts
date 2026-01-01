// Project Profitability Tracking Types

export type CostType = 'labor' | 'materials' | 'overhead' | 'software' | 'contractor' | 'other'

export interface ProjectCost {
  id: string
  user_id: string

  // Association
  quote_id?: string | null
  invoice_id?: string | null
  client_id?: string | null

  // Cost details
  description: string
  cost_type: CostType
  amount: number
  currency: string

  // Date and status
  date: string
  is_reimbursable: boolean
  reimbursed: boolean

  // Additional metadata
  notes?: string | null
  receipt_url?: string | null

  // Timestamps
  created_at: string
  updated_at: string
}

export interface ProjectBudget {
  id: string
  user_id: string

  // Association
  quote_id?: string | null
  invoice_id?: string | null

  // Budget details
  budget_amount: number
  currency: string

  // Budget categories
  labor_budget?: number | null
  materials_budget?: number | null
  overhead_budget?: number | null
  other_budget?: number | null

  // Alerts
  alert_threshold_percentage: number
  alert_sent: boolean

  notes?: string | null

  created_at: string
  updated_at: string
}

export interface ProjectProfitability {
  quote_id: string
  user_id: string
  client_id?: string | null
  client_name?: string | null
  quote_number: string
  quoted_amount: number

  // Invoice data
  invoice_id?: string | null
  invoice_number?: string | null
  invoiced_amount?: number | null
  amount_paid?: number | null
  invoice_status?: string | null

  // Costs breakdown
  total_costs: number
  labor_costs: number
  materials_costs: number
  overhead_costs: number
  other_costs: number

  // Time tracking
  time_tracking_billable: number
  total_hours: number

  // Profitability metrics
  profit: number
  profit_margin_percentage: number

  quote_date: string
  invoice_date?: string | null
}

export interface CreateProjectCostInput {
  description: string
  cost_type: CostType
  amount: number
  quote_id?: string
  invoice_id?: string
  client_id?: string
  currency?: string
  date?: string
  is_reimbursable?: boolean
  notes?: string
  receipt_url?: string
}

export interface CreateProjectBudgetInput {
  budget_amount: number
  quote_id?: string
  invoice_id?: string
  currency?: string
  labor_budget?: number
  materials_budget?: number
  overhead_budget?: number
  other_budget?: number
  alert_threshold_percentage?: number
  notes?: string
}

export interface ProfitabilitySummary {
  total_revenue: number
  total_costs: number
  total_profit: number
  average_profit_margin: number
  projects_count: number
  profitable_projects: number
  unprofitable_projects: number
}

export interface BudgetStatus {
  budget: ProjectBudget
  spent: number
  remaining: number
  percentage_used: number
  is_over_budget: boolean
  is_near_threshold: boolean
}
