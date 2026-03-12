import { Component, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AgentsService } from '../../../../core/services/agents.service';

@Component({
  selector: 'app-create-agent-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './create-agent-modal.component.html',
  styleUrl: './create-agent-modal.component.scss'
})
export class CreateAgentModalComponent {
  private readonly agentsService = inject(AgentsService);
  readonly close = output<void>();
  readonly modalSteps = this.agentsService.modalSteps;

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

  createAgent(): void {
    this.agentsService.createAgent({
      name: this.agentName,
      instructions: this.instructions,
      trigger: this.selectedTrigger(),
      channels: this.channels().filter(c => c.selected).map(c => c.label)
    });
    this.close.emit();
  }
}
