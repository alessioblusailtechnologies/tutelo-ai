# SQL Scripts

Esegui questi script nell'ordine indicato nel **SQL Editor** di Supabase Dashboard.

| Script | Descrizione |
|--------|-------------|
| `001_create_tables.sql` | Crea le tabelle `tutelonxtjs_conversations` e `tutelonxtjs_messages` con indici |
| `002_enable_rls.sql` | Abilita Row Level Security e crea policy per accesso anon |
| `003_update_conversation_trigger.sql` | Trigger che aggiorna `updated_at` sulla conversazione quando arriva un nuovo messaggio |

## Note

- Tutte le tabelle usano il prefisso `tutelonxtjs_` per evitare conflitti con le tabelle del backend Node.js
- Le API routes Next.js usano il `service_role_key` che bypassa le RLS
- In produzione, rimuovere le policy anon e usare auth JWT di Supabase
