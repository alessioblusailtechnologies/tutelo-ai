-- ============================================
-- TUTELO.AI — Link messages to channels + dedup
-- ============================================

ALTER TABLE tutelo_messages ADD COLUMN IF NOT EXISTS external_id TEXT;
ALTER TABLE tutelo_messages ADD COLUMN IF NOT EXISTS channel_id UUID REFERENCES tutelo_channels(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_tutelo_messages_external_id
  ON tutelo_messages(user_id, external_id)
  WHERE external_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_tutelo_messages_channel_id
  ON tutelo_messages(channel_id);
