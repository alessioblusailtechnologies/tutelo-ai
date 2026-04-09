-- ============================================
-- tutelo-nextjs: Row Level Security policies
-- ============================================

-- Abilita RLS sulle tabelle
ALTER TABLE tutelonxtjs_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutelonxtjs_messages ENABLE ROW LEVEL SECURITY;

-- Policy: il service_role può fare tutto (usato dal backend Next.js)
-- Le API routes usano supabaseAdmin con service_role_key,
-- che bypassa automaticamente le RLS.

-- Policy: lettura pubblica per anon (opzionale, rimuovere in produzione)
CREATE POLICY "Allow anon read conversations"
  ON tutelonxtjs_conversations
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon insert conversations"
  ON tutelonxtjs_conversations
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anon read messages"
  ON tutelonxtjs_messages
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon insert messages"
  ON tutelonxtjs_messages
  FOR INSERT
  TO anon
  WITH CHECK (true);
