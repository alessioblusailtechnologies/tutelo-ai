import { Component, inject } from '@angular/core';
import { InboxService } from '../../../../core/services/inbox.service';

@Component({
  selector: 'app-inbox',
  standalone: true,
  templateUrl: './inbox.component.html',
  styleUrl: './inbox.component.scss'
})
export class InboxComponent {
  private readonly inboxService = inject(InboxService);
  readonly messages = this.inboxService.allMessages;
  readonly selectedMessage = this.inboxService.selectedMessage;
  readonly filterTabs = this.inboxService.filterTabs;

  selectMessage(id: number): void {
    this.inboxService.selectMessage(id);
  }

  setActiveFilter(value: string): void {
    this.inboxService.setActiveFilter(value);
  }
}
