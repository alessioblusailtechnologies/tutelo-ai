import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { Agent, AgentStep, AgentLogEntry, CreateAgentDto } from '../models/agent.model';
import type { ApiResponse } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AgentsService {
  private readonly http = inject(HttpClient);

  readonly agents = signal<Agent[]>([]);
  readonly logEntries = signal<AgentLogEntry[]>([]);
  readonly loading = signal(false);

  async loadAgents(): Promise<void> {
    this.loading.set(true);
    try {
      const res = await firstValueFrom(
        this.http.get<ApiResponse<Agent[]>>(`${environment.apiUrl}/agents`)
      );
      this.agents.set(res.data);
    } finally {
      this.loading.set(false);
    }
  }

  async loadLogs(): Promise<void> {
    try {
      const res = await firstValueFrom(
        this.http.get<ApiResponse<AgentLogEntry[]>>(`${environment.apiUrl}/agents/logs`)
      );
      this.logEntries.set(res.data);
    } catch {
      // no logs available
    }
  }

  async getSteps(agentId: string): Promise<AgentStep[]> {
    const res = await firstValueFrom(
      this.http.get<ApiResponse<AgentStep[]>>(`${environment.apiUrl}/agents/${agentId}/steps`)
    );
    return res.data;
  }

  async createAgent(dto: CreateAgentDto): Promise<void> {
    await firstValueFrom(
      this.http.post<ApiResponse<Agent>>(`${environment.apiUrl}/agents`, dto)
    );
    await this.loadAgents();
  }

  async deleteAgent(id: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${environment.apiUrl}/agents/${id}`)
    );
    await this.loadAgents();
  }
}
