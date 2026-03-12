import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HugeiconsIconComponent } from '@hugeicons/angular';
import { Mail01Icon, Chatting01Icon, PlugSocketIcon, Cancel01Icon, PauseIcon, PlayIcon, Tick01Icon } from '@hugeicons/core-free-icons';
import { TopbarComponent } from '../../layout/topbar/topbar.component';
import { ChannelsService } from '../../core/services/channels.service';
import type {
  Channel, ChannelType, EmailProvider,
  CreateChannelDto, SmtpEmailConfig, WhatsAppConfig
} from '../../core/models/channel.model';

@Component({
  selector: 'app-channels',
  standalone: true,
  imports: [TopbarComponent, FormsModule, HugeiconsIconComponent],
  templateUrl: './channels.component.html',
  styleUrl: './channels.component.scss'
})
export class ChannelsComponent implements OnInit {
  private readonly channelsService = inject(ChannelsService);
  private readonly route = inject(ActivatedRoute);

  readonly Mail01Icon = Mail01Icon;
  readonly Chatting01Icon = Chatting01Icon;
  readonly PlugSocketIcon = PlugSocketIcon;
  readonly Cancel01Icon = Cancel01Icon;
  readonly PauseIcon = PauseIcon;
  readonly PlayIcon = PlayIcon;
  readonly Tick01Icon = Tick01Icon;

  readonly channels = this.channelsService.channels;
  readonly loading = this.channelsService.loading;
  readonly showModal = signal(false);
  readonly editingChannel = signal<Channel | null>(null);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly successMsg = signal<string | null>(null);
  readonly activeTab = signal<'all' | 'email' | 'whatsapp'>('all');

  // Modal mode: 'pick' (choose provider), 'smtp', 'whatsapp', 'oauth-name' (enter name before redirect)
  readonly modalMode = signal<'pick' | 'smtp' | 'whatsapp' | 'oauth-name'>('pick');
  oauthProvider: 'google' | 'microsoft' = 'google';

  readonly filteredChannels = computed(() => {
    const tab = this.activeTab();
    const all = this.channels();
    if (tab === 'all') return all;
    return all.filter(c => c.type === tab);
  });

  readonly emailCount = computed(() => this.channels().filter(c => c.type === 'email').length);
  readonly whatsappCount = computed(() => this.channels().filter(c => c.type === 'whatsapp').length);

  // Form
  channelName = '';
  fromName = '';

  // SMTP
  smtpHost = '';
  smtpPort = 587;
  smtpUser = '';
  smtpPass = '';
  fromEmail = '';
  useTls = true;

  // WhatsApp
  waProvider: 'twilio' | 'meta' = 'twilio';
  waApiKey = '';
  waPhoneNumber = '';
  waAccountSid = '';

  ngOnInit(): void {
    this.channelsService.loadChannels();

    // Check for OAuth return
    this.route.queryParams.subscribe(params => {
      if (params['connected']) {
        const provider = params['connected'] === 'microsoft' ? 'Microsoft' : 'Google';
        this.successMsg.set(`Canale ${provider} collegato con successo!`);
        this.channelsService.loadChannels();
        setTimeout(() => this.successMsg.set(null), 5000);
      }
    });
  }

  setTab(tab: 'all' | 'email' | 'whatsapp'): void {
    this.activeTab.set(tab);
  }

  openCreate(type: ChannelType): void {
    this.resetForm();
    this.editingChannel.set(null);
    if (type === 'whatsapp') {
      this.modalMode.set('whatsapp');
    } else {
      this.modalMode.set('pick');
    }
    this.showModal.set(true);
  }

  pickProvider(provider: EmailProvider): void {
    if (provider === 'smtp') {
      this.modalMode.set('smtp');
    } else {
      this.oauthProvider = provider;
      this.channelName = provider === 'google' ? 'Gmail' : 'Outlook';
      this.modalMode.set('oauth-name');
    }
  }

  openEdit(channel: Channel): void {
    this.editingChannel.set(channel);
    this.channelName = channel.name;
    const cfg = channel.config as any;

    if (channel.type === 'whatsapp') {
      this.modalMode.set('whatsapp');
      this.waProvider = cfg.provider;
      this.waApiKey = cfg.api_key;
      this.waPhoneNumber = cfg.phone_number;
      this.waAccountSid = cfg.account_sid || '';
    } else if (cfg.provider === 'smtp') {
      this.modalMode.set('smtp');
      this.smtpHost = cfg.smtp_host;
      this.smtpPort = cfg.smtp_port;
      this.smtpUser = cfg.smtp_user;
      this.smtpPass = cfg.smtp_pass;
      this.fromEmail = cfg.from_email;
      this.fromName = cfg.from_name;
      this.useTls = cfg.use_tls;
    } else {
      // Google/Microsoft — can only edit name
      this.modalMode.set('oauth-name');
      this.oauthProvider = cfg.provider;
      this.fromName = cfg.from_name;
    }

    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.error.set(null);
  }

  async toggleActive(channel: Channel): Promise<void> {
    await this.channelsService.toggleActive(channel.id, !channel.is_active);
  }

  async deleteChannel(channel: Channel): Promise<void> {
    await this.channelsService.remove(channel.id);
  }

  async connectOAuth(): Promise<void> {
    this.saving.set(true);
    try {
      const editing = this.editingChannel();
      if (editing) {
        // Just update name/from_name
        await this.channelsService.update(editing.id, {
          name: this.channelName,
          config: { provider: this.oauthProvider, from_name: this.fromName } as any,
        });
        this.closeModal();
      } else {
        const url = await this.channelsService.getOAuthUrl(this.oauthProvider, this.channelName, this.fromName);
        window.location.href = url;
      }
    } catch (err: any) {
      this.error.set(err?.error?.error || 'Errore durante la connessione');
      this.saving.set(false);
    }
  }

  async saveManual(): Promise<void> {
    this.error.set(null);
    this.saving.set(true);

    try {
      const editing = this.editingChannel();
      const mode = this.modalMode();

      if (mode === 'smtp') {
        const config: SmtpEmailConfig = {
          provider: 'smtp',
          smtp_host: this.smtpHost,
          smtp_port: this.smtpPort,
          smtp_user: this.smtpUser,
          smtp_pass: this.smtpPass,
          from_email: this.fromEmail,
          from_name: this.fromName,
          use_tls: this.useTls,
        };
        if (editing) {
          await this.channelsService.update(editing.id, { name: this.channelName, config });
        } else {
          await this.channelsService.create({ type: 'email', name: this.channelName, config });
        }
      } else {
        const config: WhatsAppConfig = {
          provider: this.waProvider,
          api_key: this.waApiKey,
          phone_number: this.waPhoneNumber,
          ...(this.waAccountSid ? { account_sid: this.waAccountSid } : {}),
        };
        if (editing) {
          await this.channelsService.update(editing.id, { name: this.channelName, config });
        } else {
          await this.channelsService.create({ type: 'whatsapp', name: this.channelName, config });
        }
      }

      this.closeModal();
    } catch (err: any) {
      this.error.set(err?.error?.error || 'Errore durante il salvataggio');
    } finally {
      this.saving.set(false);
    }
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.closeModal();
    }
  }

  getProviderLabel(channel: Channel): string {
    const cfg = channel.config as any;
    switch (cfg.provider) {
      case 'google': return 'Google';
      case 'microsoft': return 'Microsoft';
      case 'smtp': return 'SMTP';
      case 'twilio': return 'Twilio';
      case 'meta': return 'Meta';
      default: return '';
    }
  }

  getEmailDisplay(channel: Channel): string {
    const cfg = channel.config as any;
    return cfg.email || cfg.from_email || '';
  }

  private resetForm(): void {
    this.channelName = '';
    this.fromName = '';
    this.smtpHost = '';
    this.smtpPort = 587;
    this.smtpUser = '';
    this.smtpPass = '';
    this.fromEmail = '';
    this.useTls = true;
    this.waProvider = 'twilio';
    this.waApiKey = '';
    this.waPhoneNumber = '';
    this.waAccountSid = '';
  }
}
