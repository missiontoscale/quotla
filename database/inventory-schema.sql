-- ================================================================
-- QUOTLA INVENTORY MANAGEMENT SYSTEM - DATABASE SCHEMA
-- ================================================================
-- Comprehensive inventory management similar to QuickBooks
-- Features:
-- - Product/Service inventory tracking
-- - Stock quantity management
-- - Real-time stock value tracking
-- - Purchase orders
-- - Supplier management
-- - Low stock alerts
-- - Stock movement history
-- ================================================================

-- ================================================================
-- PART 1: SUPPLIERS TABLE
-- ================================================================

CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  postal_code TEXT,
  tax_id TEXT,
  payment_terms TEXT, -- e.g., "Net 30", "Net 60"
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for suppliers
CREATE INDEX IF NOT EXISTS idx_suppliers_user_id ON suppliers(user_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);
CREATE INDEX IF NOT EXISTS idx_suppliers_is_active ON suppliers(is_active);

-- Enable RLS
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for suppliers
CREATE POLICY "Users can view their own suppliers" ON suppliers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own suppliers" ON suppliers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own suppliers" ON suppliers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own suppliers" ON suppliers
  FOR DELETE USING (auth.uid() = user_id);


-- ================================================================
-- PART 2: INVENTORY ITEMS TABLE
-- ================================================================

CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic Information
  name TEXT NOT NULL,
  sku TEXT, -- Stock Keeping Unit
  description TEXT,
  category TEXT,
  item_type VARCHAR(20) DEFAULT 'product' CHECK (item_type IN ('product', 'service')),

  -- Pricing
  unit_price DECIMAL(15, 2) NOT NULL DEFAULT 0,
  cost_price DECIMAL(15, 2) DEFAULT 0, -- Cost per unit (what you pay)
  currency VARCHAR(3) DEFAULT 'USD',

  -- Stock Management (for products only)
  track_inventory BOOLEAN DEFAULT TRUE,
  quantity_on_hand INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 10,
  reorder_quantity INTEGER DEFAULT 20,

  -- Supplier Information
  default_supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,

  -- Additional Fields
  tax_rate DECIMAL(5, 2) DEFAULT 0, -- Tax percentage (e.g., 7.5 for 7.5%)
  is_active BOOLEAN DEFAULT TRUE,
  image_url TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Unique constraint for SKU per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_inventory_items_user_sku
  ON inventory_items(user_id, sku) WHERE sku IS NOT NULL;

-- Indexes for inventory_items
CREATE INDEX IF NOT EXISTS idx_inventory_items_user_id ON inventory_items(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category);
CREATE INDEX IF NOT EXISTS idx_inventory_items_item_type ON inventory_items(item_type);
CREATE INDEX IF NOT EXISTS idx_inventory_items_is_active ON inventory_items(is_active);
CREATE INDEX IF NOT EXISTS idx_inventory_items_low_stock ON inventory_items(quantity_on_hand, low_stock_threshold)
  WHERE track_inventory = TRUE;

-- Enable RLS
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for inventory_items
CREATE POLICY "Users can view their own inventory items" ON inventory_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own inventory items" ON inventory_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inventory items" ON inventory_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own inventory items" ON inventory_items
  FOR DELETE USING (auth.uid() = user_id);


-- ================================================================
-- PART 3: PURCHASE ORDERS TABLE
-- ================================================================

CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,

  -- PO Details
  po_number TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'received', 'partial', 'cancelled')),

  -- Dates
  order_date DATE DEFAULT CURRENT_DATE,
  expected_delivery_date DATE,
  received_date DATE,

  -- Financial
  subtotal DECIMAL(15, 2) DEFAULT 0,
  tax_amount DECIMAL(15, 2) DEFAULT 0,
  total_amount DECIMAL(15, 2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'USD',

  -- Additional Information
  notes TEXT,
  shipping_address TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Unique constraint for PO number per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_purchase_orders_user_po_number
  ON purchase_orders(user_id, po_number);

-- Indexes for purchase_orders
CREATE INDEX IF NOT EXISTS idx_purchase_orders_user_id ON purchase_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier_id ON purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_order_date ON purchase_orders(order_date DESC);

-- Enable RLS
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own purchase orders" ON purchase_orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own purchase orders" ON purchase_orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own purchase orders" ON purchase_orders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own purchase orders" ON purchase_orders
  FOR DELETE USING (auth.uid() = user_id);


-- ================================================================
-- PART 4: PURCHASE ORDER LINE ITEMS
-- ================================================================

CREATE TABLE IF NOT EXISTS purchase_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE SET NULL,

  -- Item Details (snapshot at time of order)
  item_name TEXT NOT NULL,
  description TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  quantity_received INTEGER DEFAULT 0,

  -- Pricing
  unit_cost DECIMAL(15, 2) NOT NULL,
  subtotal DECIMAL(15, 2) GENERATED ALWAYS AS (quantity * unit_cost) STORED,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_po_id ON purchase_order_items(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_inventory_id ON purchase_order_items(inventory_item_id);

-- Enable RLS (inherits from purchase_orders)
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view PO items through PO" ON purchase_order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM purchase_orders
      WHERE purchase_orders.id = purchase_order_items.purchase_order_id
      AND purchase_orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage PO items through PO" ON purchase_order_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM purchase_orders
      WHERE purchase_orders.id = purchase_order_items.purchase_order_id
      AND purchase_orders.user_id = auth.uid()
    )
  );


-- ================================================================
-- PART 5: STOCK MOVEMENTS / INVENTORY HISTORY
-- ================================================================

CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,

  -- Movement Details
  movement_type VARCHAR(30) NOT NULL CHECK (movement_type IN (
    'purchase', 'sale', 'adjustment', 'return', 'damage', 'transfer'
  )),
  quantity_change INTEGER NOT NULL, -- Positive for increase, negative for decrease
  quantity_before INTEGER NOT NULL,
  quantity_after INTEGER NOT NULL,

  -- Reference
  reference_type VARCHAR(30), -- 'quote', 'invoice', 'purchase_order', 'manual'
  reference_id UUID, -- ID of the related quote/invoice/PO

  -- Financial Impact
  unit_value DECIMAL(15, 2), -- Value per unit at time of movement
  total_value DECIMAL(15, 2), -- Total impact on inventory value

  -- Additional Info
  notes TEXT,
  performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_stock_movements_user_id ON stock_movements(user_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_inventory_id ON stock_movements(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_type ON stock_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at ON stock_movements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stock_movements_reference ON stock_movements(reference_type, reference_id);

-- Enable RLS
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own stock movements" ON stock_movements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create stock movements" ON stock_movements
  FOR INSERT WITH CHECK (auth.uid() = user_id);


-- ================================================================
-- PART 6: LOW STOCK ALERTS
-- ================================================================

CREATE TABLE IF NOT EXISTS low_stock_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,

  -- Alert Details
  triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  quantity_at_trigger INTEGER NOT NULL,
  threshold INTEGER NOT NULL,
  is_acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_at TIMESTAMP WITH TIME ZONE,

  -- Notification
  notification_sent BOOLEAN DEFAULT FALSE,
  notification_sent_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_low_stock_alerts_user_id ON low_stock_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_low_stock_alerts_item_id ON low_stock_alerts(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_low_stock_alerts_acknowledged ON low_stock_alerts(is_acknowledged);
CREATE INDEX IF NOT EXISTS idx_low_stock_alerts_triggered_at ON low_stock_alerts(triggered_at DESC);

-- Enable RLS
ALTER TABLE low_stock_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own alerts" ON low_stock_alerts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own alerts" ON low_stock_alerts
  FOR UPDATE USING (auth.uid() = user_id);


-- ================================================================
-- PART 7: FUNCTIONS AND TRIGGERS
-- ================================================================

-- Function to update inventory quantity and create stock movement
CREATE OR REPLACE FUNCTION update_inventory_quantity(
  p_inventory_item_id UUID,
  p_quantity_change INTEGER,
  p_movement_type VARCHAR(30),
  p_reference_type VARCHAR(30) DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  v_user_id UUID;
  v_current_quantity INTEGER;
  v_new_quantity INTEGER;
  v_unit_value DECIMAL(15, 2);
BEGIN
  -- Get current item details
  SELECT user_id, quantity_on_hand, cost_price
  INTO v_user_id, v_current_quantity, v_unit_value
  FROM inventory_items
  WHERE id = p_inventory_item_id;

  -- Calculate new quantity
  v_new_quantity := v_current_quantity + p_quantity_change;

  -- Update inventory item
  UPDATE inventory_items
  SET quantity_on_hand = v_new_quantity,
      updated_at = NOW()
  WHERE id = p_inventory_item_id;

  -- Create stock movement record
  INSERT INTO stock_movements (
    user_id,
    inventory_item_id,
    movement_type,
    quantity_change,
    quantity_before,
    quantity_after,
    reference_type,
    reference_id,
    unit_value,
    total_value,
    notes,
    performed_by
  ) VALUES (
    v_user_id,
    p_inventory_item_id,
    p_movement_type,
    p_quantity_change,
    v_current_quantity,
    v_new_quantity,
    p_reference_type,
    p_reference_id,
    v_unit_value,
    v_unit_value * ABS(p_quantity_change),
    p_notes,
    auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Function to check and create low stock alerts
CREATE OR REPLACE FUNCTION check_low_stock_alert()
RETURNS TRIGGER AS $$
BEGIN
  -- Only check if tracking inventory
  IF NEW.track_inventory = TRUE THEN
    -- If quantity dropped below threshold
    IF NEW.quantity_on_hand <= NEW.low_stock_threshold
       AND (OLD.quantity_on_hand IS NULL OR OLD.quantity_on_hand > NEW.low_stock_threshold) THEN

      -- Create alert
      INSERT INTO low_stock_alerts (
        user_id,
        inventory_item_id,
        quantity_at_trigger,
        threshold
      ) VALUES (
        NEW.user_id,
        NEW.id,
        NEW.quantity_on_hand,
        NEW.low_stock_threshold
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for low stock alerts
DROP TRIGGER IF EXISTS trigger_check_low_stock ON inventory_items;
CREATE TRIGGER trigger_check_low_stock
AFTER INSERT OR UPDATE OF quantity_on_hand ON inventory_items
FOR EACH ROW
EXECUTE FUNCTION check_low_stock_alert();


-- Function to update PO totals when items change
CREATE OR REPLACE FUNCTION update_purchase_order_totals()
RETURNS TRIGGER AS $$
DECLARE
  v_subtotal DECIMAL(15, 2);
  v_tax_amount DECIMAL(15, 2);
  v_total DECIMAL(15, 2);
BEGIN
  -- Calculate totals from line items
  SELECT
    COALESCE(SUM(subtotal), 0)
  INTO v_subtotal
  FROM purchase_order_items
  WHERE purchase_order_id = COALESCE(NEW.purchase_order_id, OLD.purchase_order_id);

  -- Calculate tax (assuming 7.5% - adjust as needed)
  v_tax_amount := v_subtotal * 0.075;
  v_total := v_subtotal + v_tax_amount;

  -- Update purchase order
  UPDATE purchase_orders
  SET
    subtotal = v_subtotal,
    tax_amount = v_tax_amount,
    total_amount = v_total,
    updated_at = NOW()
  WHERE id = COALESCE(NEW.purchase_order_id, OLD.purchase_order_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update PO totals
DROP TRIGGER IF EXISTS trigger_update_po_totals ON purchase_order_items;
CREATE TRIGGER trigger_update_po_totals
AFTER INSERT OR UPDATE OR DELETE ON purchase_order_items
FOR EACH ROW
EXECUTE FUNCTION update_purchase_order_totals();


-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
DROP TRIGGER IF EXISTS update_suppliers_updated_at ON suppliers;
CREATE TRIGGER update_suppliers_updated_at
BEFORE UPDATE ON suppliers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_inventory_items_updated_at ON inventory_items;
CREATE TRIGGER update_inventory_items_updated_at
BEFORE UPDATE ON inventory_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_purchase_orders_updated_at ON purchase_orders;
CREATE TRIGGER update_purchase_orders_updated_at
BEFORE UPDATE ON purchase_orders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


-- ================================================================
-- PART 8: HELPER VIEWS FOR REPORTING
-- ================================================================

-- View for inventory valuation
CREATE OR REPLACE VIEW inventory_valuation AS
SELECT
  ii.id,
  ii.user_id,
  ii.name,
  ii.sku,
  ii.category,
  ii.quantity_on_hand,
  ii.cost_price,
  ii.unit_price,
  (ii.quantity_on_hand * ii.cost_price) AS total_cost_value,
  (ii.quantity_on_hand * ii.unit_price) AS total_retail_value,
  ((ii.quantity_on_hand * ii.unit_price) - (ii.quantity_on_hand * ii.cost_price)) AS potential_profit
FROM inventory_items ii
WHERE ii.track_inventory = TRUE
  AND ii.is_active = TRUE;

-- View for low stock items
CREATE OR REPLACE VIEW low_stock_items AS
SELECT
  ii.id,
  ii.user_id,
  ii.name,
  ii.sku,
  ii.category,
  ii.quantity_on_hand,
  ii.low_stock_threshold,
  ii.reorder_quantity,
  s.name AS supplier_name,
  s.id AS supplier_id
FROM inventory_items ii
LEFT JOIN suppliers s ON ii.default_supplier_id = s.id
WHERE ii.track_inventory = TRUE
  AND ii.is_active = TRUE
  AND ii.quantity_on_hand <= ii.low_stock_threshold
ORDER BY (ii.quantity_on_hand - ii.low_stock_threshold) ASC;


-- ================================================================
-- SETUP COMPLETE! 🎉
-- ================================================================
--
-- This schema provides:
-- ✅ Product and service inventory tracking
-- ✅ Real-time quantity and value management
-- ✅ Supplier management
-- ✅ Purchase order system
-- ✅ Stock movement history
-- ✅ Automated low stock alerts
-- ✅ Inventory valuation reporting
--
-- Next steps:
-- 1. Run this schema in your Supabase SQL editor
-- 2. Build the UI components for inventory management
-- 3. Integrate with quotes and invoices
-- 4. Set up automated notifications for low stock
-- ================================================================
