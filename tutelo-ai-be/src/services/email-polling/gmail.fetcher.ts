import { config } from '../../config/index.js';
import type { GoogleEmailConfig } from '../../types/channel.types.js';
import type { FetchedEmail, EmailFetchResult } from './types.js';

const GMAIL_API = 'https://gmail.googleapis.com/gmail/v1/users/me';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';

async function refreshAccessToken(refreshToken: string): Promise<{ access_token: string }> {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: config.oauth.google.clientId,
      client_secret: config.oauth.google.clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });
  const data = await res.json() as any;
  if (data.error) throw new Error(`Google token refresh failed: ${data.error_description || data.error}`);
  return data;
}

function getHeader(headers: any[], name: string): string {
  const h = headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase());
  return h?.value || '';
}

function parseFrom(raw: string): { name: string; email: string } {
  const match = raw.match(/^(.+?)\s*<(.+?)>$/);
  if (match) return { name: match[1].replace(/"/g, '').trim(), email: match[2] };
  return { name: raw, email: raw };
}

function extractTextBody(payload: any): string {
  // Direct body (simple message)
  if (payload.mimeType === 'text/plain' && payload.body?.data) {
    return Buffer.from(payload.body.data, 'base64url').toString('utf-8');
  }

  // Multipart — look for text/plain first
  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        return Buffer.from(part.body.data, 'base64url').toString('utf-8');
      }
    }
    // Recurse into nested parts
    for (const part of payload.parts) {
      const body = extractTextBody(part);
      if (body) return body;
    }
  }

  // Fallback: try text/html and strip tags
  if (payload.mimeType === 'text/html' && payload.body?.data) {
    const html = Buffer.from(payload.body.data, 'base64url').toString('utf-8');
    return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/html' && part.body?.data) {
        const html = Buffer.from(part.body.data, 'base64url').toString('utf-8');
        return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      }
    }
  }

  return '';
}

export async function fetchGmailMessages(
  cfg: GoogleEmailConfig,
  afterEpochSec?: number,
): Promise<EmailFetchResult> {
  // Refresh token
  const refreshed = await refreshAccessToken(cfg.refresh_token);
  const token = refreshed.access_token;

  // Build query: inbox messages, optionally after a date
  let q = 'in:inbox';
  if (afterEpochSec) {
    q += ` after:${afterEpochSec}`;
  }

  // List message IDs
  const listRes = await fetch(`${GMAIL_API}/messages?q=${encodeURIComponent(q)}&maxResults=20`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const listData = await listRes.json() as any;

  if (listData.error) {
    throw new Error(`Gmail list error: ${listData.error.message}`);
  }

  if (!listData.messages || listData.messages.length === 0) {
    return { emails: [], newAccessToken: token };
  }

  // Fetch full messages
  const emails: FetchedEmail[] = [];

  for (const msg of listData.messages) {
    const msgRes = await fetch(`${GMAIL_API}/messages/${msg.id}?format=full`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const msgData = await msgRes.json() as any;
    if (msgData.error) continue;

    const headers = msgData.payload?.headers || [];
    const fromRaw = getHeader(headers, 'From');
    const subject = getHeader(headers, 'Subject');
    const dateRaw = getHeader(headers, 'Date');
    const { name, email } = parseFrom(fromRaw);
    const body = extractTextBody(msgData.payload) || msgData.snippet || '';

    emails.push({
      externalId: `gmail_${msg.id}`,
      from: name,
      fromEmail: email,
      subject: subject || '(nessun oggetto)',
      body: body.substring(0, 10000), // cap body length
      receivedAt: dateRaw ? new Date(dateRaw).toISOString() : new Date().toISOString(),
    });
  }

  return { emails, newAccessToken: token };
}
