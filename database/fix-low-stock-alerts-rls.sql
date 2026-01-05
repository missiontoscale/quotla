-- ================================================================
-- FIX: Add missing INSERT policy for low_stock_alerts table
-- ================================================================
-- The trigger check_low_stock_alert() tries to INSERT into low_stock_alerts
-- but there's no INSERT policy, causing RLS violations
-- ================================================================

-- Add INSERT policy for low_stock_alerts (system can create alerts)
CREATE POLICY "System can create low stock alerts" ON low_stock_alerts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ================================================================
-- ISSUE RESOLVED! 🎉
-- ================================================================
-- New inventory items will now properly trigger low stock alerts
-- without violating RLS policies
-- ================================================================
