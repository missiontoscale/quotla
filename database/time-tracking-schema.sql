-- Time Tracking Feature Schema
-- Enables users to track time spent on projects, clients, and tasks

-- Time Entries Table
CREATE TABLE IF NOT EXISTS time_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Association (can be linked to client, quote, invoice, or standalone)
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,

    -- Time tracking details
    description TEXT NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER, -- Calculated when time entry is stopped

    -- Billing information
    is_billable BOOLEAN DEFAULT true,
    hourly_rate DECIMAL(10, 2),
    billable_amount DECIMAL(10, 2), -- Calculated: (duration_seconds / 3600) * hourly_rate

    -- Status
    status VARCHAR(20) DEFAULT 'running' CHECK (status IN ('running', 'stopped', 'billed')),

    -- Additional metadata
    tags TEXT[], -- Array of tags for categorization
    notes TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Time Entry Templates (for recurring tasks)
CREATE TABLE IF NOT EXISTS time_entry_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    name VARCHAR(255) NOT NULL,
    description TEXT,
    default_hourly_rate DECIMAL(10, 2),
    is_billable BOOLEAN DEFAULT true,
    tags TEXT[],

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_client_id ON time_entries(client_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_quote_id ON time_entries(quote_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_invoice_id ON time_entries(invoice_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_start_time ON time_entries(start_time);
CREATE INDEX IF NOT EXISTS idx_time_entries_status ON time_entries(status);
CREATE INDEX IF NOT EXISTS idx_time_entry_templates_user_id ON time_entry_templates(user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_time_entries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on time_entries
DROP TRIGGER IF EXISTS update_time_entries_timestamp ON time_entries;
CREATE TRIGGER update_time_entries_timestamp
    BEFORE UPDATE ON time_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_time_entries_updated_at();

-- Trigger to update updated_at on time_entry_templates
DROP TRIGGER IF EXISTS update_time_entry_templates_timestamp ON time_entry_templates;
CREATE TRIGGER update_time_entry_templates_timestamp
    BEFORE UPDATE ON time_entry_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_time_entries_updated_at();

-- Function to calculate billable amount when stopping a time entry
CREATE OR REPLACE FUNCTION calculate_time_entry_billable_amount()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate duration if end_time is set and start_time exists
    IF NEW.end_time IS NOT NULL AND NEW.start_time IS NOT NULL THEN
        NEW.duration_seconds = EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time))::INTEGER;

        -- Calculate billable amount if hourly rate is set and entry is billable
        IF NEW.is_billable AND NEW.hourly_rate IS NOT NULL THEN
            NEW.billable_amount = ROUND((NEW.duration_seconds::DECIMAL / 3600) * NEW.hourly_rate, 2);
        END IF;

        -- Update status to stopped if it was running
        IF NEW.status = 'running' THEN
            NEW.status = 'stopped';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate billable amount
DROP TRIGGER IF EXISTS calculate_billable_amount ON time_entries;
CREATE TRIGGER calculate_billable_amount
    BEFORE INSERT OR UPDATE ON time_entries
    FOR EACH ROW
    EXECUTE FUNCTION calculate_time_entry_billable_amount();

-- Row Level Security (RLS)
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entry_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for time_entries
CREATE POLICY "Users can view their own time entries"
    ON time_entries FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own time entries"
    ON time_entries FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own time entries"
    ON time_entries FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own time entries"
    ON time_entries FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for time_entry_templates
CREATE POLICY "Users can view their own templates"
    ON time_entry_templates FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own templates"
    ON time_entry_templates FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates"
    ON time_entry_templates FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates"
    ON time_entry_templates FOR DELETE
    USING (auth.uid() = user_id);

-- Comments for documentation
COMMENT ON TABLE time_entries IS 'Stores time tracking entries for projects, clients, and tasks';
COMMENT ON TABLE time_entry_templates IS 'Stores reusable templates for common time tracking tasks';
COMMENT ON COLUMN time_entries.duration_seconds IS 'Duration in seconds, calculated when time entry is stopped';
COMMENT ON COLUMN time_entries.billable_amount IS 'Amount to bill client, calculated as (duration_hours * hourly_rate)';
