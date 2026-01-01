-- Project Profitability Tracking Schema
-- Tracks costs, revenue, and profitability metrics for projects

-- Project Costs Table (for tracking expenses)
CREATE TABLE IF NOT EXISTS project_costs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Association
    quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,

    -- Cost details
    description TEXT NOT NULL,
    cost_type VARCHAR(50) NOT NULL CHECK (cost_type IN ('labor', 'materials', 'overhead', 'software', 'contractor', 'other')),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',

    -- Date and status
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    is_reimbursable BOOLEAN DEFAULT false,
    reimbursed BOOLEAN DEFAULT false,

    -- Additional metadata
    notes TEXT,
    receipt_url TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Metrics View (combines quotes, invoices, costs, and time tracking)
CREATE OR REPLACE VIEW project_profitability AS
SELECT
    q.id AS quote_id,
    q.user_id,
    q.client_id,
    c.name AS client_name,
    q.quote_number,
    q.total AS quoted_amount,

    -- Invoice data
    i.id AS invoice_id,
    i.invoice_number,
    i.total AS invoiced_amount,
    CASE WHEN i.status = 'paid' THEN i.total ELSE 0 END AS amount_paid,
    i.status AS invoice_status,

    -- Calculate costs
    COALESCE(SUM(pc.amount), 0) AS total_costs,
    COALESCE(SUM(CASE WHEN pc.cost_type = 'labor' THEN pc.amount ELSE 0 END), 0) AS labor_costs,
    COALESCE(SUM(CASE WHEN pc.cost_type = 'materials' THEN pc.amount ELSE 0 END), 0) AS materials_costs,
    COALESCE(SUM(CASE WHEN pc.cost_type = 'overhead' THEN pc.amount ELSE 0 END), 0) AS overhead_costs,
    COALESCE(SUM(CASE WHEN pc.cost_type = 'other' THEN pc.amount ELSE 0 END), 0) AS other_costs,

    -- Calculate time tracking costs
    COALESCE(SUM(te.billable_amount), 0) AS time_tracking_billable,
    COALESCE(SUM(EXTRACT(EPOCH FROM (te.end_time - te.start_time)) / 3600), 0) AS total_hours,

    -- Calculate profitability
    COALESCE(CASE WHEN i.status = 'paid' THEN i.total ELSE 0 END, 0) - COALESCE(SUM(pc.amount), 0) AS profit,
    CASE
        WHEN COALESCE(CASE WHEN i.status = 'paid' THEN i.total ELSE 0 END, 0) > 0 THEN
            ROUND(((COALESCE(CASE WHEN i.status = 'paid' THEN i.total ELSE 0 END, 0) - COALESCE(SUM(pc.amount), 0)) / COALESCE(CASE WHEN i.status = 'paid' THEN i.total ELSE 0 END, 0) * 100), 2)
        ELSE 0
    END AS profit_margin_percentage,

    q.created_at AS quote_date,
    i.created_at AS invoice_date

FROM quotes q
LEFT JOIN clients c ON q.client_id = c.id
LEFT JOIN invoices i ON q.id = i.quote_id
LEFT JOIN project_costs pc ON (pc.quote_id = q.id OR pc.invoice_id = i.id)
LEFT JOIN time_entries te ON (te.quote_id = q.id OR te.invoice_id = i.id)
GROUP BY
    q.id, q.user_id, q.client_id, c.name, q.quote_number, q.total, q.created_at,
    i.id, i.invoice_number, i.total, i.status, i.created_at;

-- Budget Tracking Table
CREATE TABLE IF NOT EXISTS project_budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Association
    quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,

    -- Budget details
    budget_amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',

    -- Budget categories
    labor_budget DECIMAL(10, 2),
    materials_budget DECIMAL(10, 2),
    overhead_budget DECIMAL(10, 2),
    other_budget DECIMAL(10, 2),

    -- Alerts
    alert_threshold_percentage INTEGER DEFAULT 80, -- Alert when 80% of budget is used
    alert_sent BOOLEAN DEFAULT false,

    notes TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_project_costs_user_id ON project_costs(user_id);
CREATE INDEX IF NOT EXISTS idx_project_costs_quote_id ON project_costs(quote_id);
CREATE INDEX IF NOT EXISTS idx_project_costs_invoice_id ON project_costs(invoice_id);
CREATE INDEX IF NOT EXISTS idx_project_costs_client_id ON project_costs(client_id);
CREATE INDEX IF NOT EXISTS idx_project_costs_date ON project_costs(date);
CREATE INDEX IF NOT EXISTS idx_project_budgets_user_id ON project_budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_project_budgets_quote_id ON project_budgets(quote_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_profitability_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_project_costs_timestamp ON project_costs;
CREATE TRIGGER update_project_costs_timestamp
    BEFORE UPDATE ON project_costs
    FOR EACH ROW
    EXECUTE FUNCTION update_profitability_updated_at();

DROP TRIGGER IF EXISTS update_project_budgets_timestamp ON project_budgets;
CREATE TRIGGER update_project_budgets_timestamp
    BEFORE UPDATE ON project_budgets
    FOR EACH ROW
    EXECUTE FUNCTION update_profitability_updated_at();

-- Row Level Security (RLS)
ALTER TABLE project_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_budgets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for project_costs
CREATE POLICY "Users can view their own project costs"
    ON project_costs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own project costs"
    ON project_costs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own project costs"
    ON project_costs FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own project costs"
    ON project_costs FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for project_budgets
CREATE POLICY "Users can view their own project budgets"
    ON project_budgets FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own project budgets"
    ON project_budgets FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own project budgets"
    ON project_budgets FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own project budgets"
    ON project_budgets FOR DELETE
    USING (auth.uid() = user_id);

-- Comments for documentation
COMMENT ON TABLE project_costs IS 'Tracks all costs associated with projects for profitability analysis';
COMMENT ON TABLE project_budgets IS 'Stores budget information for projects with alert thresholds';
COMMENT ON VIEW project_profitability IS 'Aggregated view of project profitability metrics combining quotes, invoices, costs, and time tracking';
COMMENT ON COLUMN project_costs.cost_type IS 'Type of cost: labor, materials, overhead, software, contractor, or other';
COMMENT ON COLUMN project_budgets.alert_threshold_percentage IS 'Percentage of budget usage that triggers an alert (default 80%)';
