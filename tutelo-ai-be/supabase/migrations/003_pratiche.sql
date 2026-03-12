-- ============================================
-- TUTELO.AI — Pratiche (Case Workspaces)
-- ============================================

CREATE TABLE IF NOT EXISTS tutelo_pratiche (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('preventivo', 'sinistro', 'rinnovo', 'richiesta_documenti', 'appuntamento', 'aggiornamento_polizza')),
  status TEXT NOT NULL DEFAULT 'aperta' CHECK (status IN ('aperta', 'in_lavorazione', 'in_attesa', 'completata', 'annullata')),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  priority TEXT NOT NULL DEFAULT 'med' CHECK (priority IN ('high', 'med', 'low')),
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  message_id UUID REFERENCES tutelo_messages(id) ON DELETE SET NULL,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_tutelo_pratiche_user_id ON tutelo_pratiche(user_id);
CREATE INDEX idx_tutelo_pratiche_type ON tutelo_pratiche(type);
CREATE INDEX idx_tutelo_pratiche_status ON tutelo_pratiche(status);

ALTER TABLE tutelo_pratiche ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pratiche"
  ON tutelo_pratiche FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own pratiche"
  ON tutelo_pratiche FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pratiche"
  ON tutelo_pratiche FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own pratiche"
  ON tutelo_pratiche FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER tutelo_pratiche_updated_at
  BEFORE UPDATE ON tutelo_pratiche
  FOR EACH ROW EXECUTE FUNCTION tutelo_update_updated_at();

-- ============================================
-- Notes / Comments
-- ============================================

CREATE TABLE IF NOT EXISTS tutelo_pratica_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pratica_id UUID NOT NULL REFERENCES tutelo_pratiche(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_tutelo_pratica_notes_pratica_id ON tutelo_pratica_notes(pratica_id);

ALTER TABLE tutelo_pratica_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view notes of own pratiche"
  ON tutelo_pratica_notes FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM tutelo_pratiche
    WHERE tutelo_pratiche.id = tutelo_pratica_notes.pratica_id
    AND tutelo_pratiche.user_id = auth.uid()
  ));
CREATE POLICY "Users can insert notes for own pratiche"
  ON tutelo_pratica_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own notes"
  ON tutelo_pratica_notes FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- Artifacts (AI-generated documents)
-- ============================================

CREATE TABLE IF NOT EXISTS tutelo_pratica_artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pratica_id UUID NOT NULL REFERENCES tutelo_pratiche(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('preventivo_bozza', 'denuncia_sinistro', 'proposta_rinnovo', 'richiesta_documenti', 'lettera', 'altro')),
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  ai_model TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_tutelo_pratica_artifacts_pratica_id ON tutelo_pratica_artifacts(pratica_id);

ALTER TABLE tutelo_pratica_artifacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view artifacts of own pratiche"
  ON tutelo_pratica_artifacts FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM tutelo_pratiche
    WHERE tutelo_pratiche.id = tutelo_pratica_artifacts.pratica_id
    AND tutelo_pratiche.user_id = auth.uid()
  ));
CREATE POLICY "Users can insert artifacts for own pratiche"
  ON tutelo_pratica_artifacts FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM tutelo_pratiche
    WHERE tutelo_pratiche.id = tutelo_pratica_artifacts.pratica_id
    AND tutelo_pratiche.user_id = auth.uid()
  ));
CREATE POLICY "Users can update artifacts of own pratiche"
  ON tutelo_pratica_artifacts FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM tutelo_pratiche
    WHERE tutelo_pratiche.id = tutelo_pratica_artifacts.pratica_id
    AND tutelo_pratiche.user_id = auth.uid()
  ));
CREATE POLICY "Users can delete artifacts of own pratiche"
  ON tutelo_pratica_artifacts FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM tutelo_pratiche
    WHERE tutelo_pratiche.id = tutelo_pratica_artifacts.pratica_id
    AND tutelo_pratiche.user_id = auth.uid()
  ));

CREATE TRIGGER tutelo_pratica_artifacts_updated_at
  BEFORE UPDATE ON tutelo_pratica_artifacts
  FOR EACH ROW EXECUTE FUNCTION tutelo_update_updated_at();
