import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { HugeiconsIconComponent } from '@hugeicons/angular';
import { SparklesIcon, Mail01Icon, Chatting01Icon, MailOpen01Icon, InboxIcon } from '@hugeicons/core-free-icons';
import { InboxService } from '../../../../core/services/inbox.service';
import { PraticheService } from '../../../../core/services/pratiche.service';
import { MarkdownPipe } from '../../../../core/pipes/markdown.pipe';
import type { Message, AiProposedAction } from '../../../../core/models/message.model';
import type { PraticaType } from '../../../../core/models/pratica.model';

const ACTION_TYPE_MAP: Record<string, PraticaType> = {
  preventivo: 'preventivo',
  sinistro: 'sinistro',
  rinnovo: 'rinnovo',
  richiesta_documenti: 'richiesta_documenti',
  documenti: 'richiesta_documenti',
  appuntamento: 'appuntamento',
  aggiornamento: 'aggiornamento_polizza',
  aggiornamento_polizza: 'aggiornamento_polizza',
};

@Component({
  selector: 'app-inbox',
  standalone: true,
  imports: [MarkdownPipe, HugeiconsIconComponent],
  templateUrl: './inbox.component.html',
  styleUrl: './inbox.component.scss'
})
export class InboxComponent implements OnInit, OnDestroy {
  private readonly inboxService = inject(InboxService);
  private readonly praticheService = inject(PraticheService);
  private readonly router = inject(Router);
  private refreshTimer: ReturnType<typeof setInterval> | null = null;

  readonly SparklesIcon = SparklesIcon;
  readonly Mail01Icon = Mail01Icon;
  readonly Chatting01Icon = Chatting01Icon;
  readonly MailOpen01Icon = MailOpen01Icon;
  readonly InboxIcon = InboxIcon;

  readonly messages = this.inboxService.filteredMessages;
  readonly selectedMessage = this.inboxService.selectedMessage;
  readonly selectedAnalysis = this.inboxService.selectedAnalysis;
  readonly filterTabs = this.inboxService.filterTabs;
  readonly loading = this.inboxService.loading;

  ngOnInit(): void {
    this.inboxService.loadMessages();
    this.refreshTimer = setInterval(() => this.inboxService.loadMessages(), 30_000);
  }

  ngOnDestroy(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  selectMessage(id: string): void {
    this.inboxService.selectMessage(id);
  }

  setActiveFilter(value: string): void {
    this.inboxService.setActiveFilter(value);
  }

  async executeAction(action: AiProposedAction): Promise<void> {
    const msg = this.selectedMessage();
    if (!msg) return;

    const praticaType = ACTION_TYPE_MAP[action.action_type] || 'richiesta_documenti';

    const pratica = await this.praticheService.create({
      type: praticaType,
      title: `${action.title} — ${msg.from_name}`,
      description: action.description,
      client_name: msg.from_name,
      client_email: msg.from_email || undefined,
      client_phone: msg.from_phone || undefined,
      message_id: msg.id,
      generate_artifact: true,
    });

    this.router.navigate(['/pratiche', pratica.id]);
  }

  formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Ieri';
    } else {
      return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
    }
  }
}
