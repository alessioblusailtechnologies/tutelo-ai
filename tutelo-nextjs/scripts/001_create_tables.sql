-- ============================================
-- tutelo-nextjs: Creazione tabelle principali
-- Prefisso: tutelonxtjs_
-- ============================================

-- Conversazioni
CREATE TABLE IF NOT EXISTS tutelonxtjs_conversations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text,
  user_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Messaggi
CREATE TABLE IF NOT EXISTS tutelonxtjs_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id uuid NOT NULL REFERENCES tutelonxtjs_conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Indice per query messaggi per conversazione
CREATE INDEX IF NOT EXISTS idx_tutelonxtjs_messages_conversation
  ON tutelonxtjs_messages (conversation_id, created_at);

-- Indice per query conversazioni per utente
CREATE INDEX IF NOT EXISTS idx_tutelonxtjs_conversations_user
  ON tutelonxtjs_conversations (user_id, updated_at DESC);
