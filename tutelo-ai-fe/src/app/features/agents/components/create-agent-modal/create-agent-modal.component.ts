import { Component, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HugeiconsIconComponent } from '@hugeicons/angular';
import { AiBrain01Icon, InformationCircleIcon, Cancel01Icon, Tick01Icon } from '@hugeicons/core-free-icons';
import { AgentsService } from '../../../../core/services/agents.service';

@Component({
  selector: 'app-create-agent-modal',
  standalone: true,
  imports: [FormsModule, HugeiconsIconComponent],
  templateUrl: './create-agent-modal.component.html',
  styleUrl: './create-agent-modal.component.scss'
})
export class CreateAgentModalComponent {
  private readonly agentsService = inject(AgentsService);
  readonly AiBrain01Icon = AiBrain01Icon;
  readonly InformationCircleIcon = InformationCircleIcon;
  readonly Cancel01Icon = Cancel01Icon;
  readonly Tick01Icon = Tick01Icon;
  readonly close = output<void>();
  readonly saving = signal(false);

  agentName = '';
  instructions = '';
  selectedTrigger = signal<'scheduled' | 'message' | 'manual'>('scheduled');

  readonly triggers = [
    { value: 'scheduled' as const, icon: '⏰', label: 'Schedulato', sub: 'Ogni giorno / settimana' },
    { value: 'message' as const, icon: '📨', label: 'Nuovo messaggio', sub: 'Ad ogni email o WA' },
    { value: 'manual' as const, icon: '▶', label: 'Manuale', sub: 'Solo su tua richiesta' }
  ];

  readonly channels = signal([
    { label: '📧 Email', selected: true },
    { label: '💬 WhatsApp', selected: false },
    { label: '📋 Crea Pratica', selected: true },
    { label: '🔔 Notifica interna', selected: false }
  ]);

  selectTrigger(value: 'scheduled' | 'message' | 'manual'): void {
    this.selectedTrigger.set(value);
  }

  toggleChannel(index: number): void {
    this.channels.update(channels =>
      channels.map((c, i) => i === index ? { ...c, selected: !c.selected } : c)
    );
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.close.emit();
    }
  }

  async createAgent(): Promise<void> {
    if (!this.agentName.trim()) return;
    this.saving.set(true);
    try {
      const triggerLabels: Record<string, string> = {
        scheduled: '⏰ Schedulato',
        message: '⚡ Ad ogni messaggio',
        manual: '▶ Manuale'
      };
      await this.agentsService.createAgent({
        name: this.agentName,
        description: this.instructions.slice(0, 200),
        trigger_type: this.selectedTrigger(),
        trigger_label: triggerLabels[this.selectedTrigger()],
        instructions: this.instructions,
        output_channels: this.channels().filter(c => c.selected).map(c => c.label)
      });
      this.close.emit();
    } finally {
      this.saving.set(false);
    }
  }
}
