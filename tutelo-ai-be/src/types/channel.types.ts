export type ChannelType = 'email' | 'whatsapp';
export type EmailProvider = 'google' | 'microsoft' | 'smtp';

export interface GoogleEmailConfig {
  provider: 'google';
  access_token: string;
  refresh_token: string;
  email: string;
  from_name: string;
}

export interface MicrosoftEmailConfig {
  provider: 'microsoft';
  access_token: string;
  refresh_token: string;
  email: string;
  from_name: string;
}

export interface SmtpEmailConfig {
  provider: 'smtp';
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_pass: string;
  from_email: string;
  from_name: string;
  use_tls: boolean;
}

export type EmailConfig = GoogleEmailConfig | MicrosoftEmailConfig | SmtpEmailConfig;

export interface WhatsAppConfig {
  provider: 'twilio' | 'meta';
  api_key: string;
  phone_number: string;
  account_sid?: string;
}

export type ChannelConfig = EmailConfig | WhatsAppConfig;

export interface Channel {
  id: string;
  user_id: string;
  type: ChannelType;
  name: string;
  is_active: boolean;
  config: ChannelConfig;
  created_at: string;
  updated_at: string;
}

export interface CreateChannelDto {
  type: ChannelType;
  name: string;
  is_active?: boolean;
  config: ChannelConfig;
}

export interface UpdateChannelDto {
  name?: string;
  is_active?: boolean;
  config?: Partial<ChannelConfig>;
}
