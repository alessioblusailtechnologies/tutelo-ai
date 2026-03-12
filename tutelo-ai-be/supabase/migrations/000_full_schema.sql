-- ============================================
-- TUTELO.AI — Full Database Schema
-- Prefix: tutelo_
-- ============================================

-- ============================================
-- 1. PROFILES
-- ============================================
CREATE TABLE IF NOT EXISTS tutelo_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'Agente',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE tutelo_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON tutelo_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON tutelo_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON tutelo_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- 2. MESSAGES (Inbox)
-- ============================================
CREATE TABLE IF NOT EXISTS tutelo_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  from_name TEXT NOT NULL,
  from_email TEXT,
  from_phone TEXT,
  subject TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL CHECK (source IN ('email', 'whatsapp')),
  tag TEXT NOT NULL DEFAULT 'nuovo' CHECK (tag IN ('sinistro', 'preventivo', 'rinnovo', 'richiesta', 'nuovo')),
  tag_label TEXT DEFAULT 'Da classificare',
  priority TEXT CHECK (priority IN ('high', 'med')),
  priority_label TEXT,
  is_read BOOLEAN DEFAULT false,
  ai_badge TEXT,
  received_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_tutelo_messages_user_id ON tutelo_messages(user_id);
CREATE INDEX idx_tutelo_messages_tag ON tutelo_messages(tag);
CREATE INDEX idx_tutelo_messages_is_read ON tutelo_messages(is_read);

ALTER TABLE tutelo_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own messages"
  ON tutelo_messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages"
  ON tutelo_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own messages"
  ON tutelo_messages FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own messages"
  ON tutelo_messages FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 3. AI ANALYSES (per message)
-- ============================================
CREATE TABLE IF NOT EXISTS tutelo_ai_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES tutelo_messages(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  confidence TEXT DEFAULT 'alta',
  generation_time_ms INTEGER DEFAULT 0,
  entities JSONB DEFAULT '[]'::jsonb,
  proposed_actions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_tutelo_ai_analyses_message_id ON tutelo_ai_analyses(message_id);

ALTER TABLE tutelo_ai_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view analyses of own messages"
  ON tutelo_ai_analyses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tutelo_messages
      WHERE tutelo_messages.id = tutelo_ai_analyses.message_id
      AND tutelo_messages.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert analyses for own messages"
  ON tutelo_ai_analyses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tutelo_messages
      WHERE tutelo_messages.id = tutelo_ai_analyses.message_id
      AND tutelo_messages.user_id = auth.uid()
    )
  );

-- ============================================
-- 4. AI ACTIONS (suggested actions strip)
-- ============================================
CREATE TABLE IF NOT EXISTS tutelo_ai_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message_id UUID REFERENCES tutelo_messages(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('urgent', 'info', 'warn', 'soft')),
  type_label TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  primary_button_label TEXT NOT NULL,
  primary_button_color TEXT,
  secondary_button_label TEXT NOT NULL DEFAULT 'Ignora',
  is_dismissed BOOLEAN DEFAULT false,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_tutelo_ai_actions_user_id ON tutelo_ai_actions(user_id);

ALTER TABLE tutelo_ai_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ai actions"
  ON tutelo_ai_actions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ai actions"
  ON tutelo_ai_actions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ai actions"
  ON tutelo_ai_actions FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- 5. AGENTS
-- ============================================
CREATE TABLE IF NOT EXISTS tutelo_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  icon TEXT DEFAULT '🤖',
  icon_bg TEXT DEFAULT '#EBF2FF',
  trigger_type TEXT NOT NULL DEFAULT 'manual' CHECK (trigger_type IN ('scheduled', 'message', 'manual')),
  trigger_label TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('running', 'paused', 'draft')),
  ai_provider TEXT NOT NULL DEFAULT 'openai' CHECK (ai_provider IN ('claude', 'openai')),
  ai_model TEXT NOT NULL DEFAULT 'gpt-4o-mini',
  instructions TEXT,
  output_channels JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_tutelo_agents_user_id ON tutelo_agents(user_id);
CREATE INDEX idx_tutelo_agents_status ON tutelo_agents(status);

ALTER TABLE tutelo_agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own agents"
  ON tutelo_agents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own agents"
  ON tutelo_agents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own agents"
  ON tutelo_agents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own agents"
  ON tutelo_agents FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 6. AGENT STEPS
-- ============================================
CREATE TABLE IF NOT EXISTS tutelo_agent_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES tutelo_agents(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  text TEXT NOT NULL,
  tag TEXT NOT NULL,
  tag_type TEXT NOT NULL CHECK (tag_type IN ('fetch', 'filter', 'action', 'notify')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_tutelo_agent_steps_agent_id ON tutelo_agent_steps(agent_id);

ALTER TABLE tutelo_agent_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view steps of own agents"
  ON tutelo_agent_steps FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tutelo_agents
      WHERE tutelo_agents.id = tutelo_agent_steps.agent_id
      AND tutelo_agents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert steps for own agents"
  ON tutelo_agent_steps FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tutelo_agents
      WHERE tutelo_agents.id = tutelo_agent_steps.agent_id
      AND tutelo_agents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete steps of own agents"
  ON tutelo_agent_steps FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM tutelo_agents
      WHERE tutelo_agents.id = tutelo_agent_steps.agent_id
      AND tutelo_agents.user_id = auth.uid()
    )
  );

-- ============================================
-- 7. AGENT LOGS
-- ============================================
CREATE TABLE IF NOT EXISTS tutelo_agent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES tutelo_agents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_name TEXT NOT NULL,
  icon TEXT DEFAULT '🤖',
  icon_bg TEXT DEFAULT '#EBF2FF',
  detail TEXT NOT NULL,
  result TEXT NOT NULL CHECK (result IN ('ok', 'warn', 'error')),
  result_label TEXT NOT NULL,
  executed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_tutelo_agent_logs_agent_id ON tutelo_agent_logs(agent_id);
CREATE INDEX idx_tutelo_agent_logs_user_id ON tutelo_agent_logs(user_id);
CREATE INDEX idx_tutelo_agent_logs_executed_at ON tutelo_agent_logs(executed_at);

ALTER TABLE tutelo_agent_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own agent logs"
  ON tutelo_agent_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own agent logs"
  ON tutelo_agent_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 8. TRIGGERS & FUNCTIONS
-- ============================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION tutelo_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tutelo_profiles_updated_at
  BEFORE UPDATE ON tutelo_profiles
  FOR EACH ROW EXECUTE FUNCTION tutelo_update_updated_at();

CREATE TRIGGER tutelo_messages_updated_at
  BEFORE UPDATE ON tutelo_messages
  FOR EACH ROW EXECUTE FUNCTION tutelo_update_updated_at();

CREATE TRIGGER tutelo_ai_actions_updated_at
  BEFORE UPDATE ON tutelo_ai_actions
  FOR EACH ROW EXECUTE FUNCTION tutelo_update_updated_at();

CREATE TRIGGER tutelo_agents_updated_at
  BEFORE UPDATE ON tutelo_agents
  FOR EACH ROW EXECUTE FUNCTION tutelo_update_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION tutelo_handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO tutelo_profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tutelo_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION tutelo_handle_new_user();
