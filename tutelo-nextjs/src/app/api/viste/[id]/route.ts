import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { executeView } from '@/lib/viste/executor';

// GET /api/viste/[id] → get saved view with executed data
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const { data: vista, error } = await supabaseAdmin
    .from('tutelonxtjs_viste')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !vista) {
    return NextResponse.json({ error: 'Vista not found' }, { status: 404 });
  }

  try {
    const result = await executeView(vista.definition);
    return NextResponse.json({ vista, result });
  } catch (err: any) {
    return NextResponse.json(
      { vista, error: `Errore esecuzione: ${err?.message || err}` },
      { status: 500 },
    );
  }
}

// DELETE /api/viste/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const { error } = await supabaseAdmin
    .from('tutelonxtjs_viste')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
