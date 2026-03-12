import { Component, input, output } from '@angular/core';
import { HugeiconsIconComponent } from '@hugeicons/angular';
import { Search01Icon, FilterIcon } from '@hugeicons/core-free-icons';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [HugeiconsIconComponent],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss'
})
export class TopbarComponent {
  title = input.required<string>();
  subtitle = input.required<string>();
  ctaLabel = input.required<string>();
  ctaClick = output<void>();

  readonly Search01Icon = Search01Icon;
  readonly FilterIcon = FilterIcon;
}
