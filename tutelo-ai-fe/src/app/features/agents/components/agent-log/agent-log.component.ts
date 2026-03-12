import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HugeiconsIconComponent } from '@hugeicons/angular';
import { Pulse01Icon } from '@hugeicons/core-free-icons';
import { AgentsService } from '../../../../core/services/agents.service';

@Component({
  selector: 'app-agent-log',
  standalone: true,
  imports: [DatePipe, HugeiconsIconComponent],
  templateUrl: './agent-log.component.html',
  styleUrl: './agent-log.component.scss'
})
export class AgentLogComponent {
  private readonly agentsService = inject(AgentsService);
  readonly logEntries = this.agentsService.logEntries;
  readonly Pulse01Icon = Pulse01Icon;
}
