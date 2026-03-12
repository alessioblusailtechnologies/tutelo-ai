import { Component, inject, OnInit } from '@angular/core';
import { HugeiconsIconComponent } from '@hugeicons/angular';
import { SparklesIcon } from '@hugeicons/core-free-icons';
import { AiActionsService } from '../../../../core/services/ai-actions.service';

@Component({
  selector: 'app-ai-actions-strip',
  standalone: true,
  imports: [HugeiconsIconComponent],
  templateUrl: './ai-actions-strip.component.html',
  styleUrl: './ai-actions-strip.component.scss'
})
export class AiActionsStripComponent implements OnInit {
  private readonly aiActionsService = inject(AiActionsService);
  readonly SparklesIcon = SparklesIcon;
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
