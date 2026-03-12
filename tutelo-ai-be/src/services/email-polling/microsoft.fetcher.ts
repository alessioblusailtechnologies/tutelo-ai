import { config } from '../../config/index.js';
import type { MicrosoftEmailConfig } from '../../types/channel.types.js';
import type { FetchedEmail, EmailFetchResult } from './types.js';

const MS_AUTH_BASE = 'https://login.microsoftonline.com';
const MS_GRAPH = 'https://graph.microsoft.com/v1.0';

async function refreshAccessToken(refreshToken: string): Promise<{ access_token: string }> {
  const tenantId = config.oauth.microsoft.tenantId;
  const res = await fetch(`${MS_AUTH_BASE}/${tenantId}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: config.oauth.microsoft.clientId,
      client_secret: config.oauth.microsoft.clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
      scope: 'https://graph.microsoft.com/Mail.Read https://graph.microsoft.com/Mail.Send offline_access',
    }),
  });
  const data = await res.json() as any;
  if (data.error) throw new Error(`Microsoft token refresh failed: ${data.error_description || data.error}`);
  return data;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export async function fetchMicrosoftMessages(
  cfg: MicrosoftEmailConfig,
  afterIso?: string,
): Promise<EmailFetchResult> {
  // Refresh token
  const refreshed = await refreshAccessToken(cfg.refresh_token);
  const token = refreshed.access_token;

  // Build filter
  let filter = '';
  if (afterIso) {
    filter = `&$filter=receivedDateTime ge ${afterIso}`;
  }

  const url = `${MS_GRAPH}/me/mailFolders/inbox/messages?$top=20&$orderby=receivedDateTime desc${filter}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Prefer: 'outlook.body-content-type="text"',
    },
  });
  const data = await res.json() as any;

  if (data.error) {
    throw new Error(`Microsoft Graph error: ${data.error.message}`);
  }

  const emails: FetchedEmail[] = (data.value || []).map((msg: any) => {
    const from = msg.from?.emailAddress || {};
    let body = msg.body?.content || msg.bodyPreview || '';
    if (msg.body?.contentType === 'html') {
      body = stripHtml(body);
    }

    return {
      externalId: `ms_${msg.id}`,
      from: from.name || from.address || '',
      fromEmail: from.address || '',
      subject: msg.subject || '(nessun oggetto)',
      body: body.substring(0, 10000),
      receivedAt: msg.receivedDateTime || new Date().toISOString(),
    } satisfies FetchedEmail;
  });

  return { emails, newAccessToken: token };
}
