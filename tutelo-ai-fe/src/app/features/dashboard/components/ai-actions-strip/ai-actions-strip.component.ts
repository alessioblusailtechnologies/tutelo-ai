import { Component, inject } from '@angular/core';
import { AiActionsService } from '../../../../core/services/ai-actions.service';

@Component({
  selector: 'app-ai-actions-strip',
  standalone: true,
  templateUrl: './ai-actions-strip.component.html',
  styleUrl: './ai-actions-strip.component.scss'
})
export class AiActionsStripComponent {
  private readonly aiActionsService = inject(AiActionsService);
  readonly actions = this.aiActionsService.actions;
}
