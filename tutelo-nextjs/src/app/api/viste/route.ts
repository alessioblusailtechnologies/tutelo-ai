import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { validateDefinition } from '@/lib/viste/executor';

// GET /api/viste → list all saved views
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('tutelonxtjs_viste')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ viste: data || [] });
}

// POST /api/viste → save a new view
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, description, prompt, definition, user_id } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 });
  }

  try {
    validateDefinition(definition);
  } catch (err: any) {
    return NextResponse.json({ error: `Invalid definition: ${err.message}` }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('tutelonxtjs_viste')
    .insert({
      name: name.trim(),
      description: description?.trim() || null,
      prompt: prompt || null,
      definition,
      user_id: user_id || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ vista: data });
}
