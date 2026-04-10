import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

const BUCKET = 'tutelonxtjs-pdfs';

interface FolioFile {
  name: string;
  path: string;
  url: string;
  size: number;
  created_at: string;
  updated_at: string;
}

export async function GET() {
  // List files in the bucket (recursively per year folder)
  const { data: years, error: yearsErr } = await supabaseAdmin.storage
    .from(BUCKET)
    .list('', { limit: 100, sortBy: { column: 'name', order: 'desc' } });

  if (yearsErr) {
    return NextResponse.json({ error: yearsErr.message }, { status: 500 });
  }

  const files: FolioFile[] = [];

  for (const year of years || []) {
    if (!year.name || year.id) continue; // skip files at root, only iterate folders
    const { data: yearFiles } = await supabaseAdmin.storage
      .from(BUCKET)
      .list(year.name, {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    for (const file of yearFiles || []) {
      if (!file.name || !file.id) continue;
      const path = `${year.name}/${file.name}`;
      const { data: urlData } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);

      files.push({
        name: file.name,
        path,
        url: urlData.publicUrl,
        size: (file.metadata as { size?: number } | null)?.size || 0,
        created_at: file.created_at || '',
        updated_at: file.updated_at || '',
      });
    }
  }

  // Sort by created_at desc
  files.sort((a, b) => (b.created_at > a.created_at ? 1 : -1));

  return NextResponse.json({ files });
}
