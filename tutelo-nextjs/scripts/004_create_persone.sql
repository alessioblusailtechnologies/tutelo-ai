-- ============================================
-- tutelo-nextjs: Tabella persone (anagrafica)
-- ============================================

CREATE TABLE IF NOT EXISTS tutelonxtjs_persone (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL,
  cognome text NOT NULL,
  email text,
  telefono text,
  codice_fiscale text,
  status text NOT NULL DEFAULT 'lead' CHECK (status IN ('lead', 'prospect', 'cliente', 'ex_cliente')),
  fonte text DEFAULT 'manuale' CHECK (fonte IN ('preventivo', 'manuale', 'email', 'whatsapp', 'assistente')),
  note text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tutelonxtjs_persone_status
  ON tutelonxtjs_persone (status);

CREATE INDEX IF NOT EXISTS idx_tutelonxtjs_persone_nome
  ON tutelonxtjs_persone (cognome, nome);

CREATE INDEX IF NOT EXISTS idx_tutelonxtjs_persone_cf
  ON tutelonxtjs_persone (codice_fiscale)
  WHERE codice_fiscale IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_tutelonxtjs_persone_email
  ON tutelonxtjs_persone (email)
  WHERE email IS NOT NULL;

-- RLS
ALTER TABLE tutelonxtjs_persone ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon full access persone"
  ON tutelonxtjs_persone FOR ALL TO anon USING (true) WITH CHECK (true);
