-- =====================================================
-- NOTIFICATIONS TABLE
-- Table for storing user notifications
-- =====================================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN (
    'low_stock',
    'invoice_paid',
    'invoice_overdue',
    'new_order',
    'payment_received',
    'quote_accepted',
    'quote_rejected',
    'system'
  )),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  action_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES for notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = false;

-- RLS for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications" ON notifications
  FOR DELETE USING (auth.uid() = user_id);

-- System can insert notifications for any user (using service role)
CREATE POLICY "Service role can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- =====================================================
-- FUNCTION: Create notification helper
-- =====================================================
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type VARCHAR(50),
  p_title VARCHAR(255),
  p_message TEXT,
  p_priority VARCHAR(20) DEFAULT 'medium',
  p_action_url TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, type, title, message, priority, action_url, metadata)
  VALUES (p_user_id, p_type, p_title, p_message, p_priority, p_action_url, p_metadata)
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$;

-- =====================================================
-- TRIGGER: Auto-create notification on invoice status change
-- =====================================================
CREATE OR REPLACE FUNCTION notify_invoice_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Notify when invoice becomes paid
  IF NEW.status = 'paid' AND (OLD.status IS NULL OR OLD.status != 'paid') THEN
    PERFORM create_notification(
      NEW.user_id,
      'invoice_paid',
      'Invoice Paid',
      'Invoice #' || NEW.invoice_number || ' has been marked as paid.',
      'medium',
      '/invoices/' || NEW.id,
      jsonb_build_object('invoice_id', NEW.id, 'invoice_number', NEW.invoice_number, 'amount', NEW.total)
    );
  END IF;

  -- Notify when invoice becomes overdue
  IF NEW.status = 'overdue' AND (OLD.status IS NULL OR OLD.status != 'overdue') THEN
    PERFORM create_notification(
      NEW.user_id,
      'invoice_overdue',
      'Invoice Overdue',
      'Invoice #' || NEW.invoice_number || ' is now overdue.',
      'high',
      '/invoices/' || NEW.id,
      jsonb_build_object('invoice_id', NEW.id, 'invoice_number', NEW.invoice_number, 'amount', NEW.total)
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for invoice status changes
DROP TRIGGER IF EXISTS trigger_invoice_status_notification ON invoices;
CREATE TRIGGER trigger_invoice_status_notification
  AFTER UPDATE OF status ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION notify_invoice_status_change();

-- =====================================================
-- TRIGGER: Auto-create notification on low stock
-- =====================================================
CREATE OR REPLACE FUNCTION notify_low_stock()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if quantity dropped below threshold
  IF NEW.track_inventory = true
     AND NEW.quantity_on_hand <= NEW.low_stock_threshold
     AND (OLD.quantity_on_hand IS NULL OR OLD.quantity_on_hand > OLD.low_stock_threshold) THEN
    PERFORM create_notification(
      NEW.user_id,
      'low_stock',
      'Low Stock Alert',
      NEW.name || ' is running low. Current quantity: ' || NEW.quantity_on_hand || ', Threshold: ' || NEW.low_stock_threshold,
      'high',
      '/inventory/' || NEW.id || '/edit',
      jsonb_build_object('item_id', NEW.id, 'item_name', NEW.name, 'quantity', NEW.quantity_on_hand, 'threshold', NEW.low_stock_threshold)
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for low stock notifications
DROP TRIGGER IF EXISTS trigger_low_stock_notification ON inventory_items;
CREATE TRIGGER trigger_low_stock_notification
  AFTER UPDATE OF quantity_on_hand ON inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION notify_low_stock();
