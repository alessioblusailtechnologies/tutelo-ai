import { supabaseAdmin } from '../../config/supabase.js';
import { config } from '../../config/index.js';
import { messageRepository } from '../../repositories/message.repository.js';
import { messageService } from '../message.service.js';
import { fetchGmailMessages } from './gmail.fetcher.js';
import { fetchMicrosoftMessages } from './microsoft.fetcher.js';
import type { Channel, GoogleEmailConfig, MicrosoftEmailConfig } from '../../types/channel.types.js';
import type { FetchedEmail } from './types.js';

let polling = false;
let timer: ReturnType<typeof setInterval> | null = null;

// ─── Helpers ───────────────────────────────────────────

async function getActiveEmailChannels(): Promise<Channel[]> {
  const { data, error } = await supabaseAdmin
    .from('tutelo_channels')
    .select('*')
    .eq('type', 'email')
    .eq('is_active', true);

  if (error) throw error;
  return (data || []) as Channel[];
}

async function messageExists(userId: string, externalId: string): Promise<boolean> {
  const { count, error } = await supabaseAdmin
    .from('tutelo_messages')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('external_id', externalId);

  if (error) return false;
  return (count ?? 0) > 0;
}

async function updateChannelAccessToken(channelId: string, userId: string, newToken: string): Promise<void> {
  // Read current config, update access_token
  const { data } = await supabaseAdmin
    .from('tutelo_channels')
    .select('config')
    .eq('id', channelId)
    .single();

  if (data) {
    const cfg = data.config as any;
    cfg.access_token = newToken;
    await supabaseAdmin
      .from('tutelo_channels')
      .update({ config: cfg })
      .eq('id', channelId)
      .eq('user_id', userId);
  }
}

async function updateLastPolledAt(channelId: string, userId: string): Promise<void> {
  const { data } = await supabaseAdmin
    .from('tutelo_channels')
    .select('config')
    .eq('id', channelId)
    .single();

  if (data) {
    const cfg = data.config as any;
    cfg.last_polled_at = new Date().toISOString();
    await supabaseAdmin
      .from('tutelo_channels')
      .update({ config: cfg })
      .eq('id', channelId)
      .eq('user_id', userId);
  }
}

// ─── Process a single channel ──────────────────────────

async function pollChannel(channel: Channel): Promise<number> {
  const cfg = channel.config as any;
  const label = cfg.email || cfg.provider || channel.id;
  let emails: FetchedEmail[] = [];
  let newAccessToken: string | undefined;

  // Calculate "after" window — use last_polled_at or default to 24h ago
  const lastPolled = cfg.last_polled_at
    ? new Date(cfg.last_polled_at)
    : new Date(Date.now() - 24 * 60 * 60 * 1000);

  console.log(`[email-polling] 📨 Polling channel "${label}" (${cfg.provider}) — since ${lastPolled.toISOString()}`);

  try {
    if (cfg.provider === 'google') {
      const afterEpoch = Math.floor(lastPolled.getTime() / 1000);
      const result = await fetchGmailMessages(cfg as GoogleEmailConfig, afterEpoch);
      emails = result.emails;
      newAccessToken = result.newAccessToken;
    } else if (cfg.provider === 'microsoft') {
      const result = await fetchMicrosoftMessages(cfg as MicrosoftEmailConfig, lastPolled.toISOString());
      emails = result.emails;
      newAccessToken = result.newAccessToken;
    } else {
      console.log(`[email-polling]   ⏭ Skipping channel "${label}" — provider "${cfg.provider}" not supported for polling`);
      return 0;
    }
  } catch (err: any) {
    console.error(`[email-polling]   ❌ Error fetching from channel "${label}" (${cfg.provider}):`, err.message);
    return 0;
  }

  console.log(`[email-polling]   📥 Fetched ${emails.length} email(s) from "${label}"`);

  // Persist refreshed access token
  if (newAccessToken) {
    console.log(`[email-polling]   🔄 Access token refreshed for "${label}"`);
    await updateChannelAccessToken(channel.id, channel.user_id, newAccessToken).catch(() => {});
  }

  // Deduplicate and insert new messages
  let created = 0;
  let skipped = 0;
  for (const email of emails) {
    try {
      const exists = await messageExists(channel.user_id, email.externalId);
      if (exists) {
        skipped++;
        continue;
      }

      console.log(`[email-polling]   ✉ New: from="${email.from}" <${email.fromEmail}> subj="${email.subject}"`);

      const message = await messageRepository.create(channel.user_id, {
        from_name: email.from,
        from_email: email.fromEmail,
        subject: email.subject,
        body: email.body,
        source: 'email',
        external_id: email.externalId,
        channel_id: channel.id,
      });

      created++;

      // Fire-and-forget AI classification
      messageService.analyzeMessage(message.id, channel.user_id).catch((err) => {
        console.error(`[email-polling]   ❌ AI analysis failed for message ${message.id}:`, err.message);
      });
    } catch (err: any) {
      console.error(`[email-polling]   ❌ Failed to create message (${email.externalId}):`, err.message);
    }
  }

  console.log(`[email-polling]   ✅ Channel "${label}": ${created} new, ${skipped} duplicates skipped`);

  // Update last polled timestamp
  await updateLastPolledAt(channel.id, channel.user_id).catch(() => {});

  return created;
}

// ─── Main poll loop ────────────────────────────────────

async function pollAllChannels(): Promise<void> {
  if (polling) return; // prevent overlap
  polling = true;

  try {
    const channels = await getActiveEmailChannels();
    if (channels.length === 0) return;

    let totalCreated = 0;
    for (const channel of channels) {
      const count = await pollChannel(channel);
      totalCreated += count;
    }

    if (totalCreated > 0) {
      console.log(`[email-polling] Created ${totalCreated} new message(s) from ${channels.length} channel(s)`);
    }
  } catch (err: any) {
    console.error('[email-polling] Poll cycle error:', err.message);
  } finally {
    polling = false;
  }
}

// ─── Public API ────────────────────────────────────────

export function startEmailPolling(): void {
  const intervalMs = config.polling.emailIntervalMs;
  console.log(`[email-polling] Starting with interval ${intervalMs / 1000}s`);

  // Run immediately, then on interval
  pollAllChannels();
  timer = setInterval(pollAllChannels, intervalMs);
}

export function stopEmailPolling(): void {
  if (timer) {
    clearInterval(timer);
    timer = null;
    console.log('[email-polling] Stopped');
  }
}
