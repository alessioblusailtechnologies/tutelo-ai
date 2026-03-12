import { Component, input } from '@angular/core';
import { Agent } from '../../../../core/models/agent.model';

@Component({
  selector: 'app-agent-card',
  standalone: true,
  templateUrl: './agent-card.component.html',
  styleUrl: './agent-card.component.scss'
})
export class AgentCardComponent {
  agent = input.required<Agent>();
}
