import { Component, inject, signal, computed } from '@angular/core';
import { HugeiconsIconComponent } from '@hugeicons/angular';
import {
  Attachment01Icon,
  Globe02Icon,
  ArrowUp02Icon,
  Shield01Icon,
  Calculator01Icon,
  FileSearchIcon,
  Car01Icon
} from '@hugeicons/core-free-icons';
import { AuthService } from '../../core/services/auth.service';

interface QuickAction {
  label: string;
  icon: any;
}

interface SuggestionCard {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-assistant',
  standalone: true,
  imports: [HugeiconsIconComponent],
  templateUrl: './assistant.component.html',
  styleUrl: './assistant.component.scss'
})
export class AssistantComponent {
  private readonly authService = inject(AuthService);

  readonly Attachment01Icon = Attachment01Icon;
  readonly Globe02Icon = Globe02Icon;
  readonly ArrowUp02Icon = ArrowUp02Icon;

  readonly message = signal('');

  readonly userName = computed(() => {
    const name = this.authService.profile()?.full_name;
    if (name) return name.split(' ')[0];
    return 'Marco';
  });

  readonly greeting = computed(() => {
    const hour = new Date().getHours();
    if (hour < 13) return 'Buongiorno';
    return 'Buonasera';
  });

  readonly quickActions: QuickAction[] = [
    { label: 'Polizze', icon: Shield01Icon },
    { label: 'Preventivi', icon: Calculator01Icon },
    { label: 'Sinistri', icon: Car01Icon },
    { label: 'Analisi Pratiche', icon: FileSearchIcon },
  ];

  readonly suggestions: SuggestionCard[] = [
    {
      icon: 'document',
      title: 'Analizza Polizza',
      description: 'Carica un documento di polizza per ottenere un riepilogo delle coperture, massimali e scadenze.',
    },
    {
      icon: 'note',
      title: 'Gestisci Sinistro',
      description: 'Avvia la gestione di un nuovo sinistro con raccolta automatica dei dati e suggerimenti operativi.',
    },
  ];

  onInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.message.set(target.value);
    target.style.height = 'auto';
    target.style.height = target.scrollHeight + 'px';
  }

  onSend(): void {
    if (!this.message().trim()) return;
    // Mock: just clear the input
    this.message.set('');
  }

  onAttach(): void {
    // Mock: no-op
  }

  onWebSearch(): void {
    // Mock: no-op
  }

  onQuickAction(action: QuickAction): void {
    this.message.set(action.label + ': ');
  }

  onSuggestion(suggestion: SuggestionCard): void {
    this.message.set(suggestion.title);
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSend();
    }
  }
}
