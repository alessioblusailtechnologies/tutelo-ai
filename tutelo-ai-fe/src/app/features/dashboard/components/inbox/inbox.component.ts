import { Component, inject, OnInit } from '@angular/core';
import { InboxService } from '../../../../core/services/inbox.service';

@Component({
  selector: 'app-inbox',
  standalone: true,
  templateUrl: './inbox.component.html',
  styleUrl: './inbox.component.scss'
})
export class InboxComponent implements OnInit {
  private readonly inboxService = inject(InboxService);
  readonly messages = this.inboxService.filteredMessages;
  readonly selectedMessage = this.inboxService.selectedMessage;
  readonly selectedAnalysis = this.inboxService.selectedAnalysis;
  readonly filterTabs = this.inboxService.filterTabs;
  readonly loading = this.inboxService.loading;

  ngOnInit(): void {
    this.inboxService.loadMessages();
  }

  selectMessage(id: string): void {
    this.inboxService.selectMessage(id);
  }

  setActiveFilter(value: string): void {
    this.inboxService.setActiveFilter(value);
  }

  formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Ieri';
    } else {
      return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
    }
  }
}
