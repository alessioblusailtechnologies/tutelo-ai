-- ============================================
-- tutelo-nextjs: Tabella preventivi
-- ============================================

CREATE TABLE IF NOT EXISTS tutelonxtjs_preventivi (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  contatto_id uuid NOT NULL REFERENCES tutelonxtjs_persone(id) ON DELETE CASCADE,
  tipo text NOT NULL CHECK (tipo IN ('rc_auto', 'casa', 'vita', 'infortuni', 'rc_professionale', 'altro')),
  stato text NOT NULL DEFAULT 'bozza' CHECK (stato IN ('bozza', 'calcolato', 'inviato', 'accettato', 'rifiutato')),
  parametri jsonb NOT NULL DEFAULT '{}',
  risultati jsonb DEFAULT '[]',
  note text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tutelonxtjs_preventivi_contatto
  ON tutelonxtjs_preventivi (contatto_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_tutelonxtjs_preventivi_stato
  ON tutelonxtjs_preventivi (stato);

CREATE INDEX IF NOT EXISTS idx_tutelonxtjs_preventivi_tipo
  ON tutelonxtjs_preventivi (tipo);

-- Trigger auto-update updated_at
CREATE OR REPLACE FUNCTION tutelonxtjs_update_preventivo_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_tutelonxtjs_preventivo_updated ON tutelonxtjs_preventivi;

CREATE TRIGGER trg_tutelonxtjs_preventivo_updated
  BEFORE UPDATE ON tutelonxtjs_preventivi
  FOR EACH ROW
  EXECUTE FUNCTION tutelonxtjs_update_preventivo_timestamp();

-- RLS
ALTER TABLE tutelonxtjs_preventivi ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon full access preventivi"
  ON tutelonxtjs_preventivi FOR ALL TO anon USING (true) WITH CHECK (true);
