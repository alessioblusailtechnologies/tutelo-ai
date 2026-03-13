import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HugeiconsIconComponent } from '@hugeicons/angular';
import { SparklesIcon } from '@hugeicons/core-free-icons';
import { AiActionsService } from '../../../../core/services/ai-actions.service';
import { PraticheService } from '../../../../core/services/pratiche.service';
import type { AiAction } from '../../../../core/models/ai-action.model';
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
  selector: 'app-ai-actions-strip',
  standalone: true,
  imports: [HugeiconsIconComponent],
  templateUrl: './ai-actions-strip.component.html',
  styleUrl: './ai-actions-strip.component.scss'
})
export class AiActionsStripComponent implements OnInit {
  private readonly aiActionsService = inject(AiActionsService);
  private readonly praticheService = inject(PraticheService);
  private readonly router = inject(Router);
  readonly SparklesIcon = SparklesIcon;
  readonly actions = this.aiActionsService.actions;
  readonly loading = this.aiActionsService.loading;

  ngOnInit(): void {
    this.aiActionsService.loadActions();
  }

  onDismiss(id: string): void {
    this.aiActionsService.dismiss(id);
  }

  async onComplete(action: AiAction): Promise<void> {
    const praticaType = ACTION_TYPE_MAP[action.action_type || ''] || 'richiesta_documenti';

    const pratica = await this.praticheService.create({
      type: praticaType,
      title: `${action.title} — ${action.from_name || 'Cliente'}`,
      description: action.description,
      client_name: action.from_name || 'Cliente',
      client_email: action.from_email || undefined,
      client_phone: action.from_phone || undefined,
      message_id: action.message_id || undefined,
      generate_artifact: true,
    });

    await this.aiActionsService.complete(action.id);
    this.router.navigate(['/pratiche', pratica.id]);
  }
}
