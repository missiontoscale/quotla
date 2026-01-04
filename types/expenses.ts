// Expense Tracking Types for Business Owners

export interface Expense {
  id: string
  user_id: string

  // Expense details
  description: string
  amount: number
  currency: string
  category: string

  // Date and tracking
  expense_date: string
  payment_method?: string

  // Categorization
  is_tax_deductible: boolean
  is_recurring: boolean
  recurring_frequency?: 'monthly' | 'quarterly' | 'yearly'

  // References
  vendor_name?: string
  supplier_id?: string
  invoice_id?: string

  // Receipt storage
  receipt_url?: string
  notes?: string

  // Tags
  tags?: string[]

  // Status
  status: 'pending' | 'approved' | 'reimbursed' | 'rejected'

  // Metadata
  created_at: string
  updated_at: string
}

export interface ExpenseCategory {
  id: string
  user_id: string

  name: string
  description?: string
  color?: string
  icon?: string

  // Budget tracking
  monthly_budget?: number

  // Metadata
  created_at: string
  updated_at: string
}

export interface CreateExpenseInput {
  description: string
  amount: number
  currency?: string
  category: string
  expense_date?: string
  payment_method?: string
  is_tax_deductible?: boolean
  is_recurring?: boolean
  recurring_frequency?: 'monthly' | 'quarterly' | 'yearly'
  vendor_name?: string
  supplier_id?: string
  invoice_id?: string
  receipt_url?: string
  notes?: string
  tags?: string[]
}

export interface UpdateExpenseInput {
  description?: string
  amount?: number
  currency?: string
  category?: string
  expense_date?: string
  payment_method?: string
  is_tax_deductible?: boolean
  is_recurring?: boolean
  recurring_frequency?: 'monthly' | 'quarterly' | 'yearly'
  vendor_name?: string
  supplier_id?: string
  invoice_id?: string
  receipt_url?: string
  notes?: string
  tags?: string[]
  status?: 'pending' | 'approved' | 'reimbursed' | 'rejected'
}

export interface CreateExpenseCategoryInput {
  name: string
  description?: string
  color?: string
  icon?: string
  monthly_budget?: number
}

export interface MonthlyExpenseSummary {
  user_id: string
  month: string
  category: string
  currency: string
  expense_count: number
  total_amount: number
  avg_amount: number
  tax_deductible_amount: number
}

export interface CategorySpendingOverview {
  user_id: string
  category: string
  monthly_budget?: number
  month: string
  total_spent: number
  transaction_count: number
  budget_utilization_percent?: number
}

export interface ProfitLossSummary {
  user_id: string
  month: string
  currency: string
  total_revenue: number
  total_expenses: number
  net_profit: number
  profit_margin_percent: number
}

export interface ExpenseFilters {
  category?: string
  start_date?: string
  end_date?: string
  status?: 'pending' | 'approved' | 'reimbursed' | 'rejected'
  is_tax_deductible?: boolean
  min_amount?: number
  max_amount?: number
  vendor_name?: string
  tags?: string[]
}

export interface ExpenseStats {
  total_expenses: number
  tax_deductible_expenses: number
  pending_expenses: number
  approved_expenses: number
  by_category: Record<string, number>
  recent_expenses: Expense[]
}

// Default categories for new users
export const DEFAULT_EXPENSE_CATEGORIES = [
  { name: 'Office Supplies', color: '#3B82F6', icon: '📎' },
  { name: 'Software & Tools', color: '#8B5CF6', icon: '💻' },
  { name: 'Marketing & Advertising', color: '#EC4899', icon: '📢' },
  { name: 'Travel & Transport', color: '#10B981', icon: '🚗' },
  { name: 'Utilities', color: '#F59E0B', icon: '⚡' },
  { name: 'Professional Services', color: '#6366F1', icon: '👔' },
  { name: 'Rent & Facilities', color: '#EF4444', icon: '🏢' },
  { name: 'Equipment & Hardware', color: '#14B8A6', icon: '🖥️' },
  { name: 'Training & Development', color: '#F97316', icon: '📚' },
  { name: 'Miscellaneous', color: '#6B7280', icon: '📋' },
] as const
