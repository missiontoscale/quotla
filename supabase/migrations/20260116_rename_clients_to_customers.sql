-- =====================================================
-- MIGRATION: Rename clients to customers
-- This migration creates the customers table and updates
-- all foreign key references from clients to customers
-- =====================================================

-- Step 1: Create the customers table with the correct schema
-- (This matches what the application is already using)
CREATE TABLE IF NOT EXISTS customers (
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

-- Step 2: Migrate data from clients to customers (if clients table exists and has data)
-- This will copy existing client data to the new customers table
INSERT INTO customers (id, user_id, full_name, contact_person, email, phone, company_name, address, city, state, postal_code, country, is_active, created_at, updated_at)
SELECT
  id,
  user_id,
  name as full_name,
  name as contact_person, -- Use name as contact_person since clients table doesn't have it
  email,
  phone,
  company_name,
  address,
  city,
  state,
  postal_code,
  country,
  true as is_active,
  created_at,
  updated_at
FROM clients
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE customers.id = clients.id)
ON CONFLICT (id) DO NOTHING;

-- Step 3: Drop existing foreign key constraints on invoices
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_client_id_fkey;

-- Step 4: Drop existing foreign key constraints on quotes
ALTER TABLE quotes DROP CONSTRAINT IF EXISTS quotes_client_id_fkey;

-- Step 5: Add new foreign key constraints referencing customers table
ALTER TABLE invoices
  ADD CONSTRAINT invoices_client_id_fkey
  FOREIGN KEY (client_id)
  REFERENCES customers(id)
  ON DELETE SET NULL;

ALTER TABLE quotes
  ADD CONSTRAINT quotes_client_id_fkey
  FOREIGN KEY (client_id)
  REFERENCES customers(id)
  ON DELETE SET NULL;

-- Step 6: Create indexes for customers table
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_is_active ON customers(is_active);
CREATE INDEX IF NOT EXISTS idx_customers_company_name ON customers(company_name);

-- Step 7: Enable Row Level Security on customers
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Step 8: Create RLS policies for customers table
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own customers" ON customers;
DROP POLICY IF EXISTS "Users can insert own customers" ON customers;
DROP POLICY IF EXISTS "Users can update own customers" ON customers;
DROP POLICY IF EXISTS "Users can delete own customers" ON customers;

-- Create new policies
CREATE POLICY "Users can view own customers" ON customers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own customers" ON customers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own customers" ON customers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own customers" ON customers
  FOR DELETE USING (auth.uid() = user_id);

-- Step 9: Create updated_at trigger for customers
CREATE OR REPLACE FUNCTION update_customers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS customers_updated_at ON customers;
CREATE TRIGGER customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_customers_updated_at();

-- Step 10: Update scheduled_meetings table if it exists (for Calendly integration)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'scheduled_meetings'
  ) THEN
    -- Drop old constraint if exists
    ALTER TABLE scheduled_meetings DROP CONSTRAINT IF EXISTS scheduled_meetings_client_id_fkey;

    -- Add new constraint referencing customers
    ALTER TABLE scheduled_meetings
      ADD CONSTRAINT scheduled_meetings_client_id_fkey
      FOREIGN KEY (client_id)
      REFERENCES customers(id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- Step 11: Update time_entries table if it exists (for time tracking)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'time_entries'
  ) THEN
    -- Drop old constraint if exists
    ALTER TABLE time_entries DROP CONSTRAINT IF EXISTS time_entries_client_id_fkey;

    -- Add new constraint referencing customers
    ALTER TABLE time_entries
      ADD CONSTRAINT time_entries_client_id_fkey
      FOREIGN KEY (client_id)
      REFERENCES customers(id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- =====================================================
-- OPTIONAL: Drop the old clients table after verification
-- Uncomment the following line ONLY after confirming the migration worked:
-- DROP TABLE IF EXISTS clients;
-- =====================================================
