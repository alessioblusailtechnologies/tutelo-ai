-- ============================================
-- tutelo-nextjs: Aggiunge attachments ai messaggi
-- ============================================

ALTER TABLE tutelonxtjs_messages
  ADD COLUMN IF NOT EXISTS attachments jsonb DEFAULT '[]'::jsonb;

-- Esempio di struttura attachments:
-- [{ "type": "pdf", "filename": "preventivo.pdf", "url": "https://...", "pdf_id": "2026/preventivo-123.pdf" }]
