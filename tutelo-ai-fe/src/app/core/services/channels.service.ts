import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { Channel, CreateChannelDto, UpdateChannelDto } from '../models/channel.model';
import type { ApiResponse } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class ChannelsService {
  private readonly http = inject(HttpClient);

  readonly channels = signal<Channel[]>([]);
  readonly loading = signal(false);

  async loadChannels(): Promise<void> {
    this.loading.set(true);
    try {
      const res = await firstValueFrom(
        this.http.get<ApiResponse<Channel[]>>(`${environment.apiUrl}/channels`)
      );
      this.channels.set(res.data);
    } finally {
      this.loading.set(false);
    }
  }

  async create(dto: CreateChannelDto): Promise<void> {
    await firstValueFrom(
      this.http.post<ApiResponse<Channel>>(`${environment.apiUrl}/channels`, dto)
    );
    await this.loadChannels();
  }

  async update(id: string, dto: UpdateChannelDto): Promise<void> {
    await firstValueFrom(
      this.http.patch<ApiResponse<Channel>>(`${environment.apiUrl}/channels/${id}`, dto)
    );
    await this.loadChannels();
  }

  async remove(id: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${environment.apiUrl}/channels/${id}`)
    );
    await this.loadChannels();
  }

  async toggleActive(id: string, isActive: boolean): Promise<void> {
    await this.update(id, { is_active: isActive });
  }

  async getOAuthUrl(provider: 'google' | 'microsoft', name: string, fromName: string): Promise<string> {
    const params = new URLSearchParams({ name, from_name: fromName });
    const res = await firstValueFrom(
      this.http.get<ApiResponse<{ url: string }>>(`${environment.apiUrl}/channels/oauth/${provider}/url?${params}`)
    );
    return res.data.url;
  }
}
