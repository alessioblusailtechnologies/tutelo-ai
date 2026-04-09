-- ============================================
-- tutelo-nextjs: Auto-update updated_at su conversation
-- quando viene inserito un nuovo messaggio
-- ============================================

CREATE OR REPLACE FUNCTION tutelonxtjs_update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE tutelonxtjs_conversations
  SET updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_tutelonxtjs_update_conv_ts ON tutelonxtjs_messages;

CREATE TRIGGER trg_tutelonxtjs_update_conv_ts
  AFTER INSERT ON tutelonxtjs_messages
  FOR EACH ROW
  EXECUTE FUNCTION tutelonxtjs_update_conversation_timestamp();
