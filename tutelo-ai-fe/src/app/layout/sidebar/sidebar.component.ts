import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { HugeiconsIconComponent } from '@hugeicons/angular';
import { DashboardBrowsingIcon, Folder01Icon, AiBrain01Icon, Link01Icon, Logout01Icon } from '@hugeicons/core-free-icons';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, HugeiconsIconComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  private readonly authService = inject(AuthService);
  readonly profile = this.authService.profile;
  readonly initials = this.authService.userInitials;

  readonly DashboardBrowsingIcon = DashboardBrowsingIcon;
  readonly Folder01Icon = Folder01Icon;
  readonly AiBrain01Icon = AiBrain01Icon;
  readonly Link01Icon = Link01Icon;
  readonly Logout01Icon = Logout01Icon;

  logout(): void {
    this.authService.logout();
  }
}
