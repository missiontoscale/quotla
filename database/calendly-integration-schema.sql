-- Calendly Integration Schema
-- Creates tables for storing Calendly OAuth connections and scheduled meetings
-- Run this migration in Supabase SQL Editor

-- ============================================================
-- Table: calendly_connections
-- Purpose: Store OAuth 2.0 tokens and Calendly account info
-- ============================================================

CREATE TABLE IF NOT EXISTS calendly_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- OAuth tokens
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,

  -- Calendly user info
  calendly_user_uri TEXT NOT NULL,
  calendly_email TEXT NOT NULL,
  calendly_organization_uri TEXT,

  -- Settings
  default_event_type_uri TEXT, -- User's preferred event type for quick scheduling
  webhook_subscription_uri TEXT, -- Active webhook subscription

  -- Metadata
  is_active BOOLEAN DEFAULT true,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id) -- One Calendly connection per user
);

-- Enable Row Level Security
ALTER TABLE calendly_connections ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own connections
CREATE POLICY "Users can manage their own Calendly connections"
  ON calendly_connections
  FOR ALL
  USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_calendly_connections_user_id ON calendly_connections(user_id);

-- ============================================================
-- Table: scheduled_meetings
-- Purpose: Track meetings scheduled via Calendly integration
-- ============================================================

CREATE TABLE IF NOT EXISTS scheduled_meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,

  -- Calendly event data
  calendly_event_uri TEXT NOT NULL UNIQUE,
  calendly_invitee_uri TEXT NOT NULL,
  event_type_name TEXT NOT NULL,

  -- Meeting details
  invitee_email TEXT NOT NULL,
  invitee_name TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT, -- Video link, phone, etc.

  -- Status
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'canceled', 'completed')),
  canceled_at TIMESTAMP WITH TIME ZONE,
  canceled_by TEXT, -- 'host' or 'invitee'
  cancellation_reason TEXT,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(calendly_event_uri)
);

-- Enable Row Level Security
ALTER TABLE scheduled_meetings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own meetings
CREATE POLICY "Users can manage their own scheduled meetings"
  ON scheduled_meetings
  FOR ALL
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_scheduled_meetings_user_id ON scheduled_meetings(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_meetings_client_id ON scheduled_meetings(client_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_meetings_quote_id ON scheduled_meetings(quote_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_meetings_invoice_id ON scheduled_meetings(invoice_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_meetings_start_time ON scheduled_meetings(start_time);
CREATE INDEX IF NOT EXISTS idx_scheduled_meetings_status ON scheduled_meetings(status);

-- ============================================================
-- Function: Update updated_at timestamp automatically
-- ============================================================

CREATE OR REPLACE FUNCTION update_calendly_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
DROP TRIGGER IF EXISTS update_calendly_connections_updated_at ON calendly_connections;
CREATE TRIGGER update_calendly_connections_updated_at
  BEFORE UPDATE ON calendly_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_calendly_updated_at();

DROP TRIGGER IF EXISTS update_scheduled_meetings_updated_at ON scheduled_meetings;
CREATE TRIGGER update_scheduled_meetings_updated_at
  BEFORE UPDATE ON scheduled_meetings
  FOR EACH ROW
  EXECUTE FUNCTION update_calendly_updated_at();

-- ============================================================
-- Comments for documentation
-- ============================================================

COMMENT ON TABLE calendly_connections IS 'Stores OAuth 2.0 tokens and account information for Calendly integration';
COMMENT ON TABLE scheduled_meetings IS 'Tracks meetings scheduled via Calendly, linked to clients, quotes, and invoices';

COMMENT ON COLUMN calendly_connections.access_token IS 'Encrypted OAuth 2.0 access token for Calendly API';
COMMENT ON COLUMN calendly_connections.refresh_token IS 'Encrypted OAuth 2.0 refresh token for renewing access';
COMMENT ON COLUMN calendly_connections.token_expires_at IS 'Timestamp when the access token expires';
COMMENT ON COLUMN calendly_connections.calendly_user_uri IS 'Unique Calendly user identifier (URI format)';
COMMENT ON COLUMN calendly_connections.webhook_subscription_uri IS 'URI of the active webhook subscription for receiving Calendly events';

COMMENT ON COLUMN scheduled_meetings.calendly_event_uri IS 'Unique Calendly event identifier from webhook';
COMMENT ON COLUMN scheduled_meetings.status IS 'Current status: scheduled, canceled, or completed';
COMMENT ON COLUMN scheduled_meetings.location IS 'Meeting location (video call link, phone number, or physical address)';
