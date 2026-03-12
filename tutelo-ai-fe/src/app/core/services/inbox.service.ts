import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { Message, AiAnalysis } from '../models/message.model';
import type { ApiResponse } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class InboxService {
  private readonly http = inject(HttpClient);
  private readonly _messages = signal<Message[]>([]);
  private readonly _selectedMessageId = signal<string | null>(null);
  private readonly _selectedAnalysis = signal<AiAnalysis | null>(null);
  private readonly _loading = signal(false);

  readonly messages = this._messages.asReadonly();
  readonly loading = this._loading.asReadonly();

  readonly selectedMessage = computed(() => {
    const id = this._selectedMessageId();
    if (!id) return null;
    return this._messages().find(m => m.id === id) ?? null;
  });

  readonly selectedAnalysis = this._selectedAnalysis.asReadonly();

  readonly filterTabs = signal([
    { label: 'Tutti', value: 'all', active: true },
    { label: 'Non letti', value: 'unread', active: false },
    { label: 'Sinistri', value: 'sinistri', active: false },
    { label: 'Rinnovi', value: 'rinnovi', active: false }
  ]);

  readonly filteredMessages = computed(() => {
    const activeTab = this.filterTabs().find(t => t.active)?.value ?? 'all';
    const msgs = this._messages();
    switch (activeTab) {
      case 'unread': return msgs.filter(m => !m.is_read);
      case 'sinistri': return msgs.filter(m => m.tag === 'sinistro');
      case 'rinnovi': return msgs.filter(m => m.tag === 'rinnovo');
      default: return msgs;
    }
  });

  async loadMessages(): Promise<void> {
    this._loading.set(true);
    try {
      const res = await firstValueFrom(
        this.http.get<ApiResponse<Message[]>>(`${environment.apiUrl}/messages`)
      );
      this._messages.set(res.data);
      this.updateFilterCounts();
    } finally {
      this._loading.set(false);
    }
  }

  async selectMessage(id: string): Promise<void> {
    this._selectedMessageId.set(id);
    this._selectedAnalysis.set(null);
    try {
      const res = await firstValueFrom(
        this.http.get<ApiResponse<AiAnalysis | null>>(`${environment.apiUrl}/messages/${id}/analysis`)
      );
      this._selectedAnalysis.set(res.data);
    } catch {
      // no analysis available
    }
  }

  setActiveFilter(value: string): void {
    this.filterTabs.update(tabs =>
      tabs.map(t => ({ ...t, active: t.value === value }))
    );
  }

  private updateFilterCounts(): void {
    const msgs = this._messages();
    const unread = msgs.filter(m => !m.is_read).length;
    this.filterTabs.update(tabs =>
      tabs.map(t => {
        switch (t.value) {
          case 'all': return { ...t, label: `Tutti (${msgs.length})` };
          case 'unread': return { ...t, label: `Non letti (${unread})` };
          default: return t;
        }
      })
    );
  }
}
