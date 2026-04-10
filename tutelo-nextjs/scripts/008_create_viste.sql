-- ============================================
-- tutelo-nextjs: Tabella viste personalizzate
-- ============================================

CREATE TABLE IF NOT EXISTS tutelonxtjs_viste (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text,
  name text NOT NULL,
  description text,
  prompt text,                      -- original user prompt
  definition jsonb NOT NULL,        -- view definition (entity, filters, group_by, ...)
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tutelonxtjs_viste_user
  ON tutelonxtjs_viste (user_id, updated_at DESC);

-- Trigger auto-update updated_at
CREATE OR REPLACE FUNCTION tutelonxtjs_update_vista_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_tutelonxtjs_vista_updated ON tutelonxtjs_viste;

CREATE TRIGGER trg_tutelonxtjs_vista_updated
  BEFORE UPDATE ON tutelonxtjs_viste
  FOR EACH ROW
  EXECUTE FUNCTION tutelonxtjs_update_vista_timestamp();

-- RLS
ALTER TABLE tutelonxtjs_viste ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon full access viste"
  ON tutelonxtjs_viste FOR ALL TO anon USING (true) WITH CHECK (true);
