-- ================================================================
-- Shopping List Schema
-- ================================================================
-- Allows users to create a shopping list by adding items from inventory
-- that they need to purchase or reorder
-- ================================================================

-- Create shopping_list table
CREATE TABLE IF NOT EXISTS shopping_list (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  quantity_needed INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  is_purchased BOOLEAN DEFAULT FALSE,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  purchased_at TIMESTAMP WITH TIME ZONE,

  -- Prevent duplicate items in the same user's shopping list
  UNIQUE(user_id, inventory_item_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_shopping_list_user_id ON shopping_list(user_id);
CREATE INDEX IF NOT EXISTS idx_shopping_list_is_purchased ON shopping_list(is_purchased);
CREATE INDEX IF NOT EXISTS idx_shopping_list_priority ON shopping_list(priority);

-- ================================================================
-- Row Level Security (RLS) Policies
-- ================================================================

-- Enable RLS
ALTER TABLE shopping_list ENABLE ROW LEVEL SECURITY;

-- Users can view their own shopping list items
CREATE POLICY "Users can view their own shopping list" ON shopping_list
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own shopping list items
CREATE POLICY "Users can add to their shopping list" ON shopping_list
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own shopping list items
CREATE POLICY "Users can update their shopping list items" ON shopping_list
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own shopping list items
CREATE POLICY "Users can delete their shopping list items" ON shopping_list
  FOR DELETE USING (auth.uid() = user_id);

-- ================================================================
-- Trigger to update updated_at timestamp
-- ================================================================

CREATE OR REPLACE FUNCTION update_shopping_list_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;

  -- Automatically set purchased_at when marked as purchased
  IF NEW.is_purchased = TRUE AND OLD.is_purchased = FALSE THEN
    NEW.purchased_at = CURRENT_TIMESTAMP;
  END IF;

  -- Clear purchased_at if unmarked
  IF NEW.is_purchased = FALSE AND OLD.is_purchased = TRUE THEN
    NEW.purchased_at = NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER shopping_list_updated_at
  BEFORE UPDATE ON shopping_list
  FOR EACH ROW
  EXECUTE FUNCTION update_shopping_list_updated_at();

-- ================================================================
-- Helper function to add item to shopping list
-- ================================================================

CREATE OR REPLACE FUNCTION add_to_shopping_list(
  p_inventory_item_id UUID,
  p_quantity_needed INTEGER DEFAULT 1,
  p_notes TEXT DEFAULT NULL,
  p_priority TEXT DEFAULT 'medium'
)
RETURNS UUID AS $$
DECLARE
  v_shopping_list_id UUID;
  v_user_id UUID;
BEGIN
  -- Get current user
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Insert or update if exists
  INSERT INTO shopping_list (user_id, inventory_item_id, quantity_needed, notes, priority)
  VALUES (v_user_id, p_inventory_item_id, p_quantity_needed, p_notes, p_priority)
  ON CONFLICT (user_id, inventory_item_id)
  DO UPDATE SET
    quantity_needed = shopping_list.quantity_needed + p_quantity_needed,
    updated_at = CURRENT_TIMESTAMP
  RETURNING id INTO v_shopping_list_id;

  RETURN v_shopping_list_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- DONE! Shopping list functionality ready
-- ================================================================
