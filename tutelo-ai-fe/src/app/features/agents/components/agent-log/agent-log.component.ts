import { Component, inject } from '@angular/core';
import { AgentsService } from '../../../../core/services/agents.service';

@Component({
  selector: 'app-agent-log',
  standalone: true,
  templateUrl: './agent-log.component.html',
  styleUrl: './agent-log.component.scss'
})
export class AgentLogComponent {
  private readonly agentsService = inject(AgentsService);
  readonly logEntries = this.agentsService.logEntries;
}
