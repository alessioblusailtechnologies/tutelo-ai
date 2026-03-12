import { Component, input, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HugeiconsIconComponent } from '@hugeicons/angular';
import { PauseIcon, PlayIcon } from '@hugeicons/core-free-icons';
import { Agent, AgentStep } from '../../../../core/models/agent.model';
import { AgentsService } from '../../../../core/services/agents.service';

@Component({
  selector: 'app-agent-card',
  standalone: true,
  imports: [DatePipe, HugeiconsIconComponent],
  templateUrl: './agent-card.component.html',
  styleUrl: './agent-card.component.scss'
})
export class AgentCardComponent implements OnInit {
  private readonly agentsService = inject(AgentsService);
  readonly PauseIcon = PauseIcon;
  readonly PlayIcon = PlayIcon;
  agent = input.required<Agent>();
  steps = signal<AgentStep[]>([]);

  ngOnInit(): void {
    this.agentsService.getSteps(this.agent().id).then(s => this.steps.set(s));
  }
}
