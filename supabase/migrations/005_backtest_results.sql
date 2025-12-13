-- supabase/migrations/005_backtest_results.sql
-- Backtest Results Table

CREATE TABLE IF NOT EXISTS backtest_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bot_id UUID NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
  total_return DECIMAL(10, 2),
  sharpe_ratio DECIMAL(10, 2),
  win_rate DECIMAL(5, 2),
  profit_factor DECIMAL(10, 2),
  max_drawdown DECIMAL(5, 2),
  total_trades INTEGER,
  equity_curve JSONB,
  trades JSONB,
  metrics JSONB,
  config JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_backtest_results_bot_id ON backtest_results(bot_id);
CREATE INDEX idx_backtest_results_created_at ON backtest_results(created_at DESC);

-- Row Level Security
ALTER TABLE backtest_results ENABLE ROW LEVEL SECURITY;

-- Users can only view backtest results for their own bots
CREATE POLICY "Users can view own backtest results"
  ON backtest_results FOR SELECT
  USING (
    bot_id IN (
      SELECT id FROM bots WHERE user_id = auth.uid()
    )
  );

-- Users can insert backtest results for their own bots
CREATE POLICY "Users can insert own backtest results"
  ON backtest_results FOR INSERT
  WITH CHECK (
    bot_id IN (
      SELECT id FROM bots WHERE user_id = auth.uid()
    )
  );

-- Users can delete their own backtest results
CREATE POLICY "Users can delete own backtest results"
  ON backtest_results FOR DELETE
  USING (
    bot_id IN (
      SELECT id FROM bots WHERE user_id = auth.uid()
    )
  );

-- ============================================================

-- supabase/migrations/006_license_validations.sql
-- License Validation Tracking Table

CREATE TABLE IF NOT EXISTS license_validations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  license_key TEXT NOT NULL,
  bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
  ip_address TEXT,
  user_agent TEXT,
  success BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_license_validations_key ON license_validations(license_key);
CREATE INDEX idx_license_validations_created_at ON license_validations(created_at DESC);
CREATE INDEX idx_license_validations_bot_id ON license_validations(bot_id);

-- No RLS needed - this is for internal tracking only

-- ============================================================

-- supabase/migrations/007_rpc_functions.sql
-- Database Functions

-- Function to increment license usage atomically
CREATE OR REPLACE FUNCTION increment_license_usage(key TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE licenses 
  SET usage_count = usage_count + 1,
      last_used_at = NOW()
  WHERE license_key = key;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get bot statistics
CREATE OR REPLACE FUNCTION get_bot_stats(bot_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_backtests', (SELECT COUNT(*) FROM backtest_results WHERE bot_id = bot_uuid),
    'total_licenses', (SELECT COUNT(*) FROM licenses WHERE bot_id = bot_uuid AND is_active = true),
    'latest_backtest', (
      SELECT json_build_object(
        'total_return', total_return,
        'win_rate', win_rate,
        'created_at', created_at
      )
      FROM backtest_results
      WHERE bot_id = bot_uuid
      ORDER BY created_at DESC
      LIMIT 1
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup expired licenses
CREATE OR REPLACE FUNCTION cleanup_expired_licenses()
RETURNS INTEGER AS $$
DECLARE
  affected_rows INTEGER;
BEGIN
  UPDATE licenses
  SET is_active = false
  WHERE expires_at < NOW()
    AND is_active = true;
  
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  RETURN affected_rows;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================

-- supabase/migrations/008_update_existing_tables.sql
-- Add missing fields to existing tables

-- Update bots table
ALTER TABLE bots ADD COLUMN IF NOT EXISTS strategy_name TEXT;
ALTER TABLE bots ADD COLUMN IF NOT EXISTS template TEXT;

-- Update licenses table
ALTER TABLE licenses ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMPTZ;
ALTER TABLE licenses ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMPTZ;

-- Update subscriptions table
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_bots_updated_at
  BEFORE UPDATE ON bots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();