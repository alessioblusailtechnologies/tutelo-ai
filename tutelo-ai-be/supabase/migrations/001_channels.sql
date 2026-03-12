-- ============================================
-- TUTELO.AI — Channels
-- ============================================

CREATE TABLE IF NOT EXISTS tutelo_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('email', 'whatsapp')),
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_tutelo_channels_user_id ON tutelo_channels(user_id);
CREATE INDEX idx_tutelo_channels_type ON tutelo_channels(type);

ALTER TABLE tutelo_channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own channels"
  ON tutelo_channels FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own channels"
  ON tutelo_channels FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own channels"
  ON tutelo_channels FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own channels"
  ON tutelo_channels FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER tutelo_channels_updated_at
  BEFORE UPDATE ON tutelo_channels
  FOR EACH ROW EXECUTE FUNCTION tutelo_update_updated_at();
