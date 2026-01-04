-- Expense Tracking Schema for Business Owners
-- Enables businesses to track expenses, categorize spending, and calculate profit/loss

-- =====================================================
-- EXPENSES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Expense details
  description TEXT NOT NULL,
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  category VARCHAR(100) NOT NULL,

  -- Date and tracking
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method VARCHAR(50), -- cash, card, bank_transfer, etc.

  -- Categorization
  is_tax_deductible BOOLEAN DEFAULT false,
  is_recurring BOOLEAN DEFAULT false,
  recurring_frequency VARCHAR(20), -- monthly, quarterly, yearly

  -- References
  vendor_name VARCHAR(255),
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,

  -- Receipt storage
  receipt_url TEXT,
  notes TEXT,

  -- Tags for custom categorization
  tags TEXT[], -- Array of tags

  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'reimbursed', 'rejected')),

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- EXPENSE CATEGORIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS expense_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  name VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(7), -- Hex color code
  icon VARCHAR(50), -- Icon identifier

  -- Budget tracking
  monthly_budget DECIMAL(15, 2),

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, name)
);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;

-- Expenses policies
CREATE POLICY "Users can view their own expenses"
  ON expenses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own expenses"
  ON expenses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expenses"
  ON expenses FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own expenses"
  ON expenses FOR DELETE
  USING (auth.uid() = user_id);

-- Expense categories policies
CREATE POLICY "Users can view their own expense categories"
  ON expense_categories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own expense categories"
  ON expense_categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expense categories"
  ON expense_categories FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own expense categories"
  ON expense_categories FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_date ON expenses(expense_date);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_expenses_supplier ON expenses(supplier_id);
CREATE INDEX idx_expenses_status ON expenses(status);
CREATE INDEX idx_expenses_tax_deductible ON expenses(is_tax_deductible);
CREATE INDEX idx_expense_categories_user_id ON expense_categories(user_id);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_expenses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_expenses_updated_at();

CREATE TRIGGER expense_categories_updated_at
  BEFORE UPDATE ON expense_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_expenses_updated_at();

-- =====================================================
-- DEFAULT EXPENSE CATEGORIES
-- =====================================================

-- Note: These will be inserted when user creates their first expense
-- Using a function that can be called from the application

CREATE OR REPLACE FUNCTION create_default_expense_categories(p_user_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO expense_categories (user_id, name, description, color, monthly_budget)
  VALUES
    (p_user_id, 'Office Supplies', 'Pens, paper, printer ink, etc.', '#3B82F6', NULL),
    (p_user_id, 'Software & Tools', 'SaaS subscriptions, software licenses', '#8B5CF6', NULL),
    (p_user_id, 'Marketing & Advertising', 'Ads, campaigns, promotional materials', '#EC4899', NULL),
    (p_user_id, 'Travel & Transport', 'Business travel, fuel, parking', '#10B981', NULL),
    (p_user_id, 'Utilities', 'Internet, phone, electricity', '#F59E0B', NULL),
    (p_user_id, 'Professional Services', 'Consultants, accountants, lawyers', '#6366F1', NULL),
    (p_user_id, 'Rent & Facilities', 'Office rent, coworking space', '#EF4444', NULL),
    (p_user_id, 'Equipment & Hardware', 'Computers, furniture, machinery', '#14B8A6', NULL),
    (p_user_id, 'Training & Development', 'Courses, books, conferences', '#F97316', NULL),
    (p_user_id, 'Miscellaneous', 'Other business expenses', '#6B7280', NULL)
  ON CONFLICT (user_id, name) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- VIEWS FOR REPORTING
-- =====================================================

-- Monthly expense summary
CREATE OR REPLACE VIEW monthly_expense_summary AS
SELECT
  user_id,
  DATE_TRUNC('month', expense_date) as month,
  category,
  currency,
  COUNT(*) as expense_count,
  SUM(amount) as total_amount,
  AVG(amount) as avg_amount,
  SUM(CASE WHEN is_tax_deductible THEN amount ELSE 0 END) as tax_deductible_amount
FROM expenses
WHERE status != 'rejected'
GROUP BY user_id, DATE_TRUNC('month', expense_date), category, currency;

-- Category spending overview
CREATE OR REPLACE VIEW category_spending_overview AS
SELECT
  e.user_id,
  e.category,
  ec.monthly_budget,
  DATE_TRUNC('month', e.expense_date) as month,
  SUM(e.amount) as total_spent,
  COUNT(*) as transaction_count,
  CASE
    WHEN ec.monthly_budget IS NOT NULL AND ec.monthly_budget > 0
    THEN (SUM(e.amount) / ec.monthly_budget * 100)
    ELSE NULL
  END as budget_utilization_percent
FROM expenses e
LEFT JOIN expense_categories ec ON e.category = ec.name AND e.user_id = ec.user_id
WHERE e.status != 'rejected'
GROUP BY e.user_id, e.category, ec.monthly_budget, DATE_TRUNC('month', e.expense_date);

-- =====================================================
-- PROFIT & LOSS VIEW (Combines Revenue and Expenses)
-- =====================================================

CREATE OR REPLACE VIEW profit_loss_summary AS
SELECT
  COALESCE(revenue.user_id, expenses.user_id) as user_id,
  COALESCE(revenue.month, expenses.month) as month,
  COALESCE(revenue.currency, expenses.currency) as currency,
  COALESCE(revenue.total_revenue, 0) as total_revenue,
  COALESCE(expenses.total_expenses, 0) as total_expenses,
  COALESCE(revenue.total_revenue, 0) - COALESCE(expenses.total_expenses, 0) as net_profit,
  CASE
    WHEN COALESCE(revenue.total_revenue, 0) > 0
    THEN ((COALESCE(revenue.total_revenue, 0) - COALESCE(expenses.total_expenses, 0)) / revenue.total_revenue * 100)
    ELSE 0
  END as profit_margin_percent
FROM (
  -- Revenue from paid invoices
  SELECT
    user_id,
    DATE_TRUNC('month', payment_date) as month,
    currency,
    SUM(total) as total_revenue
  FROM invoices
  WHERE status = 'paid' AND payment_date IS NOT NULL
  GROUP BY user_id, DATE_TRUNC('month', payment_date), currency
) revenue
FULL OUTER JOIN (
  -- Total expenses
  SELECT
    user_id,
    DATE_TRUNC('month', expense_date) as month,
    currency,
    SUM(amount) as total_expenses
  FROM expenses
  WHERE status != 'rejected'
  GROUP BY user_id, DATE_TRUNC('month', expense_date), currency
) expenses
ON revenue.user_id = expenses.user_id
  AND revenue.month = expenses.month
  AND revenue.currency = expenses.currency;

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Calculate total expenses for a date range
CREATE OR REPLACE FUNCTION get_expenses_total(
  p_user_id UUID,
  p_start_date DATE,
  p_end_date DATE,
  p_category VARCHAR DEFAULT NULL
)
RETURNS DECIMAL AS $$
DECLARE
  v_total DECIMAL;
BEGIN
  SELECT COALESCE(SUM(amount), 0)
  INTO v_total
  FROM expenses
  WHERE user_id = p_user_id
    AND expense_date BETWEEN p_start_date AND p_end_date
    AND status != 'rejected'
    AND (p_category IS NULL OR category = p_category);

  RETURN v_total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get budget utilization for a category
CREATE OR REPLACE FUNCTION get_budget_utilization(
  p_user_id UUID,
  p_category VARCHAR,
  p_month DATE DEFAULT CURRENT_DATE
)
RETURNS JSON AS $$
DECLARE
  v_budget DECIMAL;
  v_spent DECIMAL;
  v_result JSON;
BEGIN
  -- Get monthly budget
  SELECT monthly_budget INTO v_budget
  FROM expense_categories
  WHERE user_id = p_user_id AND name = p_category;

  -- Get spent amount for the month
  SELECT COALESCE(SUM(amount), 0) INTO v_spent
  FROM expenses
  WHERE user_id = p_user_id
    AND category = p_category
    AND DATE_TRUNC('month', expense_date) = DATE_TRUNC('month', p_month)
    AND status != 'rejected';

  -- Build result
  v_result := json_build_object(
    'category', p_category,
    'budget', v_budget,
    'spent', v_spent,
    'remaining', COALESCE(v_budget, 0) - v_spent,
    'utilization_percent',
      CASE
        WHEN v_budget IS NOT NULL AND v_budget > 0
        THEN (v_spent / v_budget * 100)
        ELSE NULL
      END
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE expenses IS 'Business expense tracking for profit/loss calculations';
COMMENT ON TABLE expense_categories IS 'User-defined expense categories with budget tracking';
COMMENT ON VIEW monthly_expense_summary IS 'Monthly aggregated expense data by category';
COMMENT ON VIEW category_spending_overview IS 'Spending vs budget analysis by category';
COMMENT ON VIEW profit_loss_summary IS 'Complete profit & loss statement combining revenue and expenses';
