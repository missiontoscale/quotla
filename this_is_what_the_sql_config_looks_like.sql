-- =====================================================
-- DATABASE SCHEMA CONFIGURATION
-- This file documents the SQL schema for the application
-- =====================================================

-- =====================================================
-- CUSTOMERS TABLE
-- Main table for storing customer/client records
-- =====================================================
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  company_name VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  outstanding_balance DECIMAL(12, 2) DEFAULT 0,
  preferred_currency VARCHAR(10) DEFAULT 'NGN',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES for customers
CREATE INDEX idx_customers_user_id ON customers(user_id);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_is_active ON customers(is_active);
CREATE INDEX idx_customers_company_name ON customers(company_name);

-- RLS for customers
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own customers" ON customers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own customers" ON customers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own customers" ON customers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own customers" ON customers
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- INVOICES TABLE
-- Main table for storing invoice records
-- =====================================================
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
  invoice_number VARCHAR(255) NOT NULL,
  title VARCHAR(255),
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  issue_date DATE NOT NULL,
  due_date DATE,
  currency VARCHAR(10) DEFAULT 'USD',
  subtotal DECIMAL(12, 2) DEFAULT 0,
  tax_rate DECIMAL(5, 2) DEFAULT 0,
  tax_amount DECIMAL(12, 2) DEFAULT 0,
  total DECIMAL(12, 2) DEFAULT 0,
  notes TEXT,
  payment_terms TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- INVOICE_ITEMS TABLE
-- Line items for each invoice
CREATE TABLE invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity DECIMAL(10, 2) DEFAULT 1,
  unit_price DECIMAL(12, 2) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  sort_order INTEGER DEFAULT 0,
  inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_client_id ON invoices(client_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_issue_date ON invoices(issue_date);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- Users can only see their own invoices
CREATE POLICY "Users can view own invoices" ON invoices
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own invoices" ON invoices
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own invoices" ON invoices
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own invoices" ON invoices
  FOR DELETE USING (auth.uid() = user_id);

-- Invoice items follow parent invoice's user_id
CREATE POLICY "Users can view own invoice items" ON invoice_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own invoice items" ON invoice_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own invoice items" ON invoice_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own invoice items" ON invoice_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND invoices.user_id = auth.uid()
    )
  );

-- =====================================================
-- TYPESCRIPT TYPES (for reference)
-- =====================================================
/*
interface Invoice {
  id: string
  user_id: string
  client_id: string | null
  quote_id: string | null
  invoice_number: string
  title: string | null
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  issue_date: string
  due_date: string | null
  currency: string
  subtotal: number
  tax_rate: number
  tax_amount: number
  total: number
  notes: string | null
  payment_terms: string | null
  created_at: string
  updated_at: string
}

interface InvoiceItem {
  id: string
  invoice_id: string
  description: string
  quantity: number
  unit_price: number
  amount: number
  sort_order: number
  inventory_item_id?: string
  created_at: string
}

const INVOICE_STATUSES = ['draft', 'sent', 'paid', 'overdue', 'cancelled'] as const
*/
