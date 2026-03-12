import { Component, inject, OnInit } from '@angular/core';
import { AiActionsService } from '../../../../core/services/ai-actions.service';

@Component({
  selector: 'app-ai-actions-strip',
  standalone: true,
  templateUrl: './ai-actions-strip.component.html',
  styleUrl: './ai-actions-strip.component.scss'
})
export class AiActionsStripComponent implements OnInit {
  private readonly aiActionsService = inject(AiActionsService);
  readonly actions = this.aiActionsService.actions;
  readonly loading = this.aiActionsService.loading;

  ngOnInit(): void {
    this.aiActionsService.loadActions();
  }

  onDismiss(id: string): void {
    this.aiActionsService.dismiss(id);
  }

  onComplete(id: string): void {
    this.aiActionsService.complete(id);
  }
}
