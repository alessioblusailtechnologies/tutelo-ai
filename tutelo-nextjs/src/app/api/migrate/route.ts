import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST() {
  const { error } = await supabaseAdmin.rpc('exec_sql', {
    query: `
      CREATE TABLE IF NOT EXISTS tutelonxtjs_messages (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        conversation_id uuid DEFAULT gen_random_uuid(),
        role text NOT NULL CHECK (role IN ('user', 'assistant')),
        content text NOT NULL,
        created_at timestamptz DEFAULT now()
      );

      CREATE INDEX IF NOT EXISTS idx_tutelonxtjs_messages_conversation
        ON tutelonxtjs_messages (conversation_id, created_at);

      CREATE TABLE IF NOT EXISTS tutelonxtjs_conversations (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        title text,
        user_id text,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      );
    `,
  });

  if (error) {
    // If rpc doesn't exist, try raw SQL via the REST endpoint
    // Fall back: create tables directly
    const res1 = await supabaseAdmin.from('tutelonxtjs_conversations').select('id').limit(1);
    if (res1.error?.code === '42P01') {
      // Tables don't exist — user needs to create them via Supabase dashboard
      return NextResponse.json(
        {
          success: false,
          message: 'Tables do not exist. Please run the SQL migration in the Supabase SQL Editor.',
          sql: MIGRATION_SQL,
        },
        { status: 400 },
      );
    }
    return NextResponse.json({ success: true, message: 'Tables already exist' });
  }

  return NextResponse.json({ success: true });
}

const MIGRATION_SQL = `
CREATE TABLE IF NOT EXISTS tutelonxtjs_conversations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text,
  user_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tutelonxtjs_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id uuid NOT NULL REFERENCES tutelonxtjs_conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tutelonxtjs_messages_conversation
  ON tutelonxtjs_messages (conversation_id, created_at);
`;
