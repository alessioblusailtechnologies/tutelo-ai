import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  template: `
    <app-sidebar />
    <div class="main">
      <router-outlet />
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      width: 100%;
    }
    .main {
      margin-left: 240px;
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
  `]
})
export class LayoutComponent {
}
