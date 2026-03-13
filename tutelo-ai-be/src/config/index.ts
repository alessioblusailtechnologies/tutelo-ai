export interface Config {
  port: number;
  nodeEnv: 'development' | 'production' | 'test';
  supabase: {
    url: string;
    anonKey: string;
    serviceRoleKey: string;
  };
  ai: {
    anthropicApiKey: string;
    openaiApiKey: string;
  };
  cors: {
    origin: string;
  };
  oauth: {
    google: {
      clientId: string;
      clientSecret: string;
    };
    microsoft: {
      clientId: string;
      clientSecret: string;
      tenantId: string;
    };
    redirectBaseUrl: string;
  };
  polling: {
    emailIntervalMs: number;
  };
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optionalEnv(name: string, fallback: string): string {
  return process.env[name] || fallback;
}

export const config: Config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: (process.env.NODE_ENV as Config['nodeEnv']) || 'development',
  supabase: {
    url: requireEnv('SUPABASE_URL'),
    anonKey: requireEnv('SUPABASE_ANON_KEY'),
    serviceRoleKey: requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
  },
  ai: {
    anthropicApiKey: requireEnv('ANTHROPIC_API_KEY'),
    openaiApiKey: requireEnv('OPENAI_API_KEY'),
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
  },
  oauth: {
    google: {
      clientId: optionalEnv('GOOGLE_CLIENT_ID', ''),
      clientSecret: optionalEnv('GOOGLE_CLIENT_SECRET', ''),
    },
    microsoft: {
      clientId: optionalEnv('MICROSOFT_CLIENT_ID', ''),
      clientSecret: optionalEnv('MICROSOFT_CLIENT_SECRET', ''),
      tenantId: optionalEnv('MICROSOFT_TENANT_ID', 'common'),
    },
    redirectBaseUrl: optionalEnv('OAUTH_REDIRECT_BASE_URL', 'http://localhost:3000'),
  },
  polling: {
    emailIntervalMs: parseInt(optionalEnv('EMAIL_POLL_INTERVAL_MS', '15000'), 10), // 15s default
  },
};
