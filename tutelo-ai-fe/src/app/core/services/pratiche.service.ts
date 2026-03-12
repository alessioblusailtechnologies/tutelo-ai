import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { Pratica, PraticaNote, PraticaArtifact, CreatePraticaDto, PraticaStatus, PraticaPriority } from '../models/pratica.model';
import type { ApiResponse } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class PraticheService {
  private readonly http = inject(HttpClient);

  readonly pratiche = signal<Pratica[]>([]);
  readonly loading = signal(false);

  async loadPratiche(): Promise<void> {
    this.loading.set(true);
    try {
      const res = await firstValueFrom(
        this.http.get<ApiResponse<Pratica[]>>(`${environment.apiUrl}/pratiche`)
      );
      this.pratiche.set(res.data);
    } finally {
      this.loading.set(false);
    }
  }

  async getById(id: string): Promise<Pratica> {
    const res = await firstValueFrom(
      this.http.get<ApiResponse<Pratica>>(`${environment.apiUrl}/pratiche/${id}`)
    );
    return res.data;
  }

  async create(dto: CreatePraticaDto): Promise<Pratica> {
    const res = await firstValueFrom(
      this.http.post<ApiResponse<Pratica>>(`${environment.apiUrl}/pratiche`, dto)
    );
    await this.loadPratiche();
    return res.data;
  }

  async updateStatus(id: string, status: PraticaStatus): Promise<void> {
    await firstValueFrom(
      this.http.patch<ApiResponse<Pratica>>(`${environment.apiUrl}/pratiche/${id}`, { status })
    );
    await this.loadPratiche();
  }

  async updatePriority(id: string, priority: PraticaPriority): Promise<void> {
    await firstValueFrom(
      this.http.patch<ApiResponse<Pratica>>(`${environment.apiUrl}/pratiche/${id}`, { priority })
    );
    await this.loadPratiche();
  }

  async remove(id: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${environment.apiUrl}/pratiche/${id}`)
    );
    await this.loadPratiche();
  }

  // ─── Notes ─────────────────────────────────────────
  async getNotes(praticaId: string): Promise<PraticaNote[]> {
    const res = await firstValueFrom(
      this.http.get<ApiResponse<PraticaNote[]>>(`${environment.apiUrl}/pratiche/${praticaId}/notes`)
    );
    return res.data;
  }

  async addNote(praticaId: string, content: string): Promise<PraticaNote> {
    const res = await firstValueFrom(
      this.http.post<ApiResponse<PraticaNote>>(`${environment.apiUrl}/pratiche/${praticaId}/notes`, { content })
    );
    return res.data;
  }

  // ─── Artifacts ─────────────────────────────────────
  async getArtifacts(praticaId: string): Promise<PraticaArtifact[]> {
    const res = await firstValueFrom(
      this.http.get<ApiResponse<PraticaArtifact[]>>(`${environment.apiUrl}/pratiche/${praticaId}/artifacts`)
    );
    return res.data;
  }

  async updateArtifact(artifactId: string, content: string): Promise<void> {
    await firstValueFrom(
      this.http.patch(`${environment.apiUrl}/pratiche/artifacts/${artifactId}`, { content })
    );
  }
}
