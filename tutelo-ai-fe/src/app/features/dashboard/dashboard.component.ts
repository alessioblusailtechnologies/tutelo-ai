import { Component } from '@angular/core';
import { TopbarComponent } from '../../layout/topbar/topbar.component';
import { AiActionsStripComponent } from './components/ai-actions-strip/ai-actions-strip.component';
import { InboxComponent } from './components/inbox/inbox.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [TopbarComponent, AiActionsStripComponent, InboxComponent],
  template: `
    <app-topbar
      title="Inbox"
      subtitle="Email · WhatsApp · classificazione automatica AI"
      ctaLabel="+ Nuova Pratica"
    />
    <div class="content">
      <app-ai-actions-strip />
      <app-inbox />
    </div>
  `,
  styles: [`
    .content {
      padding: 20px 28px;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
  `]
})
export class DashboardComponent {
}
