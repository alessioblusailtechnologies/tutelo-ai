import { Request, Response, NextFunction } from 'express';
import { config } from '../config/index.js';
import { channelRepository } from '../repositories/channel.repository.js';
import { sendSuccess } from '../utils/api-response.js';
import { BadRequestError } from '../utils/api-error.js';
import type { GoogleEmailConfig, MicrosoftEmailConfig } from '../types/channel.types.js';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

const MS_AUTH_BASE = 'https://login.microsoftonline.com';
const MS_GRAPH_URL = 'https://graph.microsoft.com/v1.0/me';

export const channelOAuthController = {
  // ─── Google ──────────────────────────────────────────
  async googleAuthUrl(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, from_name } = req.query as { name?: string; from_name?: string };
      const state = Buffer.from(JSON.stringify({
        userId: req.user!.id,
        token: req.headers.authorization?.replace('Bearer ', ''),
        name: name || 'Gmail',
        from_name: from_name || '',
      })).toString('base64');

      const redirectUri = `${config.oauth.redirectBaseUrl}/api/v1/channels/oauth/google/callback`;
      const params = new URLSearchParams({
        client_id: config.oauth.google.clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'https://mail.google.com/ https://www.googleapis.com/auth/userinfo.email',
        access_type: 'offline',
        prompt: 'consent',
        state,
      });

      sendSuccess(res, { url: `${GOOGLE_AUTH_URL}?${params.toString()}` });
    } catch (err) {
      next(err);
    }
  },

  async googleCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const { code, state } = req.query as { code?: string; state?: string };
      if (!code || !state) throw new BadRequestError('Missing code or state');

      const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
      const { userId, name, from_name } = stateData;

      const redirectUri = `${config.oauth.redirectBaseUrl}/api/v1/channels/oauth/google/callback`;
      const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: config.oauth.google.clientId,
          client_secret: config.oauth.google.clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      });
      const tokens = await tokenRes.json() as any;
      if (tokens.error) throw new BadRequestError(tokens.error_description || tokens.error);

      const userRes = await fetch(GOOGLE_USERINFO_URL, {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      const userInfo = await userRes.json() as any;

      const channelConfig: GoogleEmailConfig = {
        provider: 'google',
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        email: userInfo.email,
        from_name: from_name || userInfo.name || '',
      };

      await channelRepository.create(userId, {
        type: 'email',
        name: name || `Gmail - ${userInfo.email}`,
        config: channelConfig,
      });

      res.redirect(`${config.cors.origin}/canali?connected=google`);
    } catch (err) {
      next(err);
    }
  },

  // ─── Microsoft ───────────────────────────────────────
  async microsoftAuthUrl(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, from_name } = req.query as { name?: string; from_name?: string };
      const tenantId = config.oauth.microsoft.tenantId;
      const state = Buffer.from(JSON.stringify({
        userId: req.user!.id,
        token: req.headers.authorization?.replace('Bearer ', ''),
        name: name || 'Outlook',
        from_name: from_name || '',
      })).toString('base64');

      const redirectUri = `${config.oauth.redirectBaseUrl}/api/v1/channels/oauth/microsoft/callback`;
      const params = new URLSearchParams({
        client_id: config.oauth.microsoft.clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'https://graph.microsoft.com/Mail.Read https://graph.microsoft.com/Mail.Send https://graph.microsoft.com/User.Read offline_access',
        response_mode: 'query',
        state,
      });

      sendSuccess(res, { url: `${MS_AUTH_BASE}/${tenantId}/oauth2/v2.0/authorize?${params.toString()}` });
    } catch (err) {
      next(err);
    }
  },

  async microsoftCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const { code, state } = req.query as { code?: string; state?: string };
      if (!code || !state) throw new BadRequestError('Missing code or state');

      const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
      const { userId, name, from_name } = stateData;
      const tenantId = config.oauth.microsoft.tenantId;

      const redirectUri = `${config.oauth.redirectBaseUrl}/api/v1/channels/oauth/microsoft/callback`;
      const tokenRes = await fetch(`${MS_AUTH_BASE}/${tenantId}/oauth2/v2.0/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: config.oauth.microsoft.clientId,
          client_secret: config.oauth.microsoft.clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      });
      const tokens = await tokenRes.json() as any;
      if (tokens.error) throw new BadRequestError(tokens.error_description || tokens.error);

      const userRes = await fetch(MS_GRAPH_URL, {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      const userInfo = await userRes.json() as any;

      const channelConfig: MicrosoftEmailConfig = {
        provider: 'microsoft',
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        email: userInfo.mail || userInfo.userPrincipalName,
        from_name: from_name || userInfo.displayName || '',
      };

      await channelRepository.create(userId, {
        type: 'email',
        name: name || `Outlook - ${channelConfig.email}`,
        config: channelConfig,
      });

      res.redirect(`${config.cors.origin}/canali?connected=microsoft`);
    } catch (err) {
      next(err);
    }
  },
};
