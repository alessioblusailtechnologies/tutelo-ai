import { Component, inject, signal, OnInit } from '@angular/core';
import { TopbarComponent } from '../../layout/topbar/topbar.component';
import { AgentCardComponent } from './components/agent-card/agent-card.component';
import { AgentLogComponent } from './components/agent-log/agent-log.component';
import { CreateAgentModalComponent } from './components/create-agent-modal/create-agent-modal.component';
import { AgentsService } from '../../core/services/agents.service';

@Component({
  selector: 'app-agents',
  standalone: true,
  imports: [TopbarComponent, AgentCardComponent, AgentLogComponent, CreateAgentModalComponent],
  templateUrl: './agents.component.html',
  styleUrl: './agents.component.scss'
})
export class AgentsComponent implements OnInit {
  private readonly agentsService = inject(AgentsService);
  readonly agents = this.agentsService.agents;
  readonly showModal = signal(false);

  ngOnInit(): void {
    this.agentsService.loadAgents();
    this.agentsService.loadLogs();
  }

  openModal(): void {
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }
}
