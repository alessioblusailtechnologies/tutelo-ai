-- ============================================
-- tutelo-nextjs: Bucket per PDF generati
-- ============================================
-- Esegui questo nel SQL Editor di Supabase
-- (richiede permessi di admin)
-- ============================================

-- Crea il bucket "tutelonxtjs-pdfs" (se non esiste)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'tutelonxtjs-pdfs',
  'tutelonxtjs-pdfs',
  true,                        -- bucket pubblico (signed URL non necessari)
  10485760,                    -- 10MB max per file
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Policy: chiunque può leggere (bucket pubblico)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'tutelonxtjs_pdfs_read'
  ) THEN
    CREATE POLICY "tutelonxtjs_pdfs_read"
      ON storage.objects FOR SELECT
      TO public
      USING (bucket_id = 'tutelonxtjs-pdfs');
  END IF;
END $$;

-- Policy: il service_role può scrivere/eliminare
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'tutelonxtjs_pdfs_write'
  ) THEN
    CREATE POLICY "tutelonxtjs_pdfs_write"
      ON storage.objects FOR ALL
      TO service_role
      USING (bucket_id = 'tutelonxtjs-pdfs')
      WITH CHECK (bucket_id = 'tutelonxtjs-pdfs');
  END IF;
END $$;
