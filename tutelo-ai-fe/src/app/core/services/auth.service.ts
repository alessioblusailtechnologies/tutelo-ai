import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { LoginRequest, RegisterRequest, UserProfile, AuthSession, ApiResponse } from '../models/auth.model';

const TOKEN_KEY = 'tutelo_access_token';
const REFRESH_KEY = 'tutelo_refresh_token';
const USER_KEY = 'tutelo_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly _profile = signal<UserProfile | null>(null);
  private readonly _loading = signal(false);

  readonly profile = this._profile.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly isAuthenticated = computed(() => !!this.getToken());
  readonly userInitials = computed(() => {
    const name = this._profile()?.full_name;
    if (!name) return '??';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  });

  get token(): string | null {
    return this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  async login(dto: LoginRequest): Promise<void> {
    this._loading.set(true);
    try {
      const res = await firstValueFrom(
        this.http.post<ApiResponse<{ session: AuthSession }>>(`${environment.apiUrl}/auth/login`, dto)
      );
      const session = res.data.session;
      localStorage.setItem(TOKEN_KEY, session.access_token);
      localStorage.setItem(REFRESH_KEY, session.refresh_token);
      localStorage.setItem(USER_KEY, JSON.stringify(session.user));
      await this.loadProfile();
      this.router.navigate(['/dashboard']);
    } finally {
      this._loading.set(false);
    }
  }

  async register(dto: RegisterRequest): Promise<void> {
    this._loading.set(true);
    try {
      await firstValueFrom(
        this.http.post<ApiResponse<unknown>>(`${environment.apiUrl}/auth/register`, dto)
      );
    } finally {
      this._loading.set(false);
    }
  }

  async loadProfile(): Promise<void> {
    if (!this.getToken()) return;
    try {
      const res = await firstValueFrom(
        this.http.get<ApiResponse<UserProfile>>(`${environment.apiUrl}/auth/me`)
      );
      this._profile.set(res.data);
    } catch {
      this.logout();
    }
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    this._profile.set(null);
    this.router.navigate(['/login']);
  }
}
