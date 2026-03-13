-- Add action_type and from_name columns to ai_actions for pratica creation
ALTER TABLE tutelo_ai_actions ADD COLUMN IF NOT EXISTS action_type TEXT;
ALTER TABLE tutelo_ai_actions ADD COLUMN IF NOT EXISTS from_name TEXT;
ALTER TABLE tutelo_ai_actions ADD COLUMN IF NOT EXISTS from_email TEXT;
ALTER TABLE tutelo_ai_actions ADD COLUMN IF NOT EXISTS from_phone TEXT;
