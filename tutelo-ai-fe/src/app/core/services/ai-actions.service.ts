import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { AiAction } from '../models/ai-action.model';
import type { ApiResponse } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AiActionsService {
  private readonly http = inject(HttpClient);

  readonly actions = signal<AiAction[]>([]);
  readonly loading = signal(false);

  async loadActions(): Promise<void> {
    this.loading.set(true);
    try {
      const res = await firstValueFrom(
        this.http.get<ApiResponse<AiAction[]>>(`${environment.apiUrl}/ai-actions`)
      );
      this.actions.set(res.data);
    } finally {
      this.loading.set(false);
    }
  }

  async dismiss(id: string): Promise<void> {
    await firstValueFrom(
      this.http.post(`${environment.apiUrl}/ai-actions/${id}/dismiss`, {})
    );
    this.actions.update(actions => actions.filter(a => a.id !== id));
  }

  async complete(id: string): Promise<void> {
    await firstValueFrom(
      this.http.post(`${environment.apiUrl}/ai-actions/${id}/complete`, {})
    );
    this.actions.update(actions => actions.filter(a => a.id !== id));
  }
}
