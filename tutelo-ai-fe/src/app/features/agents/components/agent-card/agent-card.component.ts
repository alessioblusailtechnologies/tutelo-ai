import { Component, input, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Agent, AgentStep } from '../../../../core/models/agent.model';
import { AgentsService } from '../../../../core/services/agents.service';

@Component({
  selector: 'app-agent-card',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './agent-card.component.html',
  styleUrl: './agent-card.component.scss'
})
export class AgentCardComponent implements OnInit {
  private readonly agentsService = inject(AgentsService);
  agent = input.required<Agent>();
  steps = signal<AgentStep[]>([]);

  ngOnInit(): void {
    this.agentsService.getSteps(this.agent().id).then(s => this.steps.set(s));
  }
}
