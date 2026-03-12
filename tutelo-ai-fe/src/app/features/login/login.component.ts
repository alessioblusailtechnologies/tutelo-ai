import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private readonly authService = inject(AuthService);

  email = '';
  password = '';
  fullName = '';
  isRegister = signal(false);
  error = signal<string | null>(null);
  readonly loading = this.authService.loading;

  toggleMode(): void {
    this.isRegister.update(v => !v);
    this.error.set(null);
  }

  async onSubmit(): Promise<void> {
    this.error.set(null);
    try {
      if (this.isRegister()) {
        await this.authService.register({
          email: this.email,
          password: this.password,
          full_name: this.fullName || undefined
        });
        this.isRegister.set(false);
        this.error.set(null);
        this.password = '';
      } else {
        await this.authService.login({
          email: this.email,
          password: this.password
        });
      }
    } catch (err: any) {
      const msg = err?.error?.error || err?.message || 'Errore durante l\'autenticazione';
      this.error.set(msg);
    }
  }
}
