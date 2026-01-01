-- ================================================================
-- ADD INVENTORY TRACKING TO QUOTES AND INVOICES
-- ================================================================
-- This migration adds inventory item tracking to quote and invoice line items
-- Allows automatic stock deduction when quotes/invoices are created
-- ================================================================

-- Add inventory_item_id to quote_items
ALTER TABLE quote_items
ADD COLUMN IF NOT EXISTS inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE SET NULL;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_quote_items_inventory_id ON quote_items(inventory_item_id);

-- Add inventory_item_id to invoice_items
ALTER TABLE invoice_items
ADD COLUMN IF NOT EXISTS inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE SET NULL;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_invoice_items_inventory_id ON invoice_items(inventory_item_id);

-- ================================================================
-- FUNCTION: Auto-deduct inventory when invoice is created/updated
-- ================================================================

CREATE OR REPLACE FUNCTION handle_invoice_inventory()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process if invoice is being marked as 'sent' or 'paid'
  IF (TG_OP = 'INSERT' AND NEW.status IN ('sent', 'paid')) OR
     (TG_OP = 'UPDATE' AND OLD.status = 'draft' AND NEW.status IN ('sent', 'paid')) THEN

    -- Get all line items for this invoice with inventory tracking
    DECLARE
      item RECORD;
    BEGIN
      FOR item IN
        SELECT ii.inventory_item_id, ii.quantity, ii.description
        FROM invoice_items ii
        WHERE ii.invoice_id = NEW.id
          AND ii.inventory_item_id IS NOT NULL
      LOOP
        -- Deduct inventory using the helper function
        PERFORM update_inventory_quantity(
          p_inventory_item_id := item.inventory_item_id,
          p_quantity_change := -item.quantity,  -- Negative for decrease
          p_movement_type := 'sale',
          p_reference_type := 'invoice',
          p_reference_id := NEW.id,
          p_notes := 'Sold via invoice #' || NEW.invoice_number
        );
      END LOOP;
    END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for invoice inventory deduction
DROP TRIGGER IF EXISTS trigger_invoice_inventory ON invoices;
CREATE TRIGGER trigger_invoice_inventory
AFTER INSERT OR UPDATE ON invoices
FOR EACH ROW
EXECUTE FUNCTION handle_invoice_inventory();

-- ================================================================
-- FUNCTION: Auto-deduct inventory when quote is converted
-- ================================================================

CREATE OR REPLACE FUNCTION handle_quote_inventory()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process if quote is being marked as 'approved'
  IF (TG_OP = 'UPDATE' AND OLD.status != 'approved' AND NEW.status = 'approved') THEN

    -- Get all line items for this quote with inventory tracking
    DECLARE
      item RECORD;
    BEGIN
      FOR item IN
        SELECT qi.inventory_item_id, qi.quantity, qi.description
        FROM quote_items qi
        WHERE qi.quote_id = NEW.id
          AND qi.inventory_item_id IS NOT NULL
      LOOP
        -- Deduct inventory using the helper function
        PERFORM update_inventory_quantity(
          p_inventory_item_id := item.inventory_item_id,
          p_quantity_change := -item.quantity,  -- Negative for decrease
          p_movement_type := 'sale',
          p_reference_type := 'quote',
          p_reference_id := NEW.id,
          p_notes := 'Sold via quote #' || NEW.quote_number
        );
      END LOOP;
    END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for quote inventory deduction
DROP TRIGGER IF EXISTS trigger_quote_inventory ON quotes;
CREATE TRIGGER trigger_quote_inventory
AFTER UPDATE ON quotes
FOR EACH ROW
EXECUTE FUNCTION handle_quote_inventory();

-- ================================================================
-- HELPER VIEW: Items with inventory status
-- ================================================================

-- View to see which quote/invoice items are linked to inventory
CREATE OR REPLACE VIEW quote_items_with_inventory AS
SELECT
  qi.*,
  ii.name AS inventory_item_name,
  ii.sku,
  ii.quantity_on_hand,
  ii.track_inventory,
  CASE
    WHEN ii.id IS NULL THEN 'No inventory link'
    WHEN NOT ii.track_inventory THEN 'Not tracked'
    WHEN ii.quantity_on_hand >= qi.quantity THEN 'In stock'
    WHEN ii.quantity_on_hand > 0 THEN 'Low stock'
    ELSE 'Out of stock'
  END AS stock_status
FROM quote_items qi
LEFT JOIN inventory_items ii ON qi.inventory_item_id = ii.id;

CREATE OR REPLACE VIEW invoice_items_with_inventory AS
SELECT
  ii.*,
  inv.name AS inventory_item_name,
  inv.sku,
  inv.quantity_on_hand,
  inv.track_inventory,
  CASE
    WHEN inv.id IS NULL THEN 'No inventory link'
    WHEN NOT inv.track_inventory THEN 'Not tracked'
    WHEN inv.quantity_on_hand >= ii.quantity THEN 'In stock'
    WHEN inv.quantity_on_hand > 0 THEN 'Low stock'
    ELSE 'Out of stock'
  END AS stock_status
FROM invoice_items ii
LEFT JOIN inventory_items inv ON ii.inventory_item_id = inv.id;

-- ================================================================
-- SETUP COMPLETE! 🎉
-- ================================================================
--
-- What this migration adds:
-- ✅ inventory_item_id column to quote_items and invoice_items
-- ✅ Automatic stock deduction when invoices are sent/paid
-- ✅ Automatic stock deduction when quotes are approved
-- ✅ Stock movement history tracking
-- ✅ Helper views to check inventory status
--
-- Next steps:
-- 1. Run this migration in Supabase SQL editor
-- 2. Update UI to allow selecting inventory items in quotes/invoices
-- 3. Show stock availability warnings when creating documents
-- 4. Display stock status in quote/invoice views
-- ================================================================
