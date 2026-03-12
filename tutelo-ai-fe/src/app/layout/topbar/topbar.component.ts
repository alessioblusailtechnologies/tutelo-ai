import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-topbar',
  standalone: true,
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss'
})
export class TopbarComponent {
  title = input.required<string>();
  subtitle = input.required<string>();
  ctaLabel = input.required<string>();
  ctaClick = output<void>();
}
