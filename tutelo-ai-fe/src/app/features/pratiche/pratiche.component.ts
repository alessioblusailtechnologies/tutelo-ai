import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HugeiconsIconComponent } from '@hugeicons/angular';
import { Folder01Icon, Search01Icon } from '@hugeicons/core-free-icons';
import { TopbarComponent } from '../../layout/topbar/topbar.component';
import { PraticheService } from '../../core/services/pratiche.service';
import {
  PRATICA_TYPE_LABELS, PRATICA_STATUS_LABELS, PRATICA_TYPE_ICONS,
  type PraticaType, type PraticaStatus,
} from '../../core/models/pratica.model';

@Component({
  selector: 'app-pratiche',
  standalone: true,
  imports: [TopbarComponent, HugeiconsIconComponent],
  templateUrl: './pratiche.component.html',
  styleUrl: './pratiche.component.scss'
})
export class PraticheComponent implements OnInit {
  private readonly praticheService = inject(PraticheService);
  private readonly router = inject(Router);

  readonly Folder01Icon = Folder01Icon;
  readonly Search01Icon = Search01Icon;

  readonly pratiche = this.praticheService.pratiche;
  readonly loading = this.praticheService.loading;
  readonly activeFilter = signal<'all' | PraticaType>('all');
  readonly activeStatus = signal<'all' | PraticaStatus>('all');
  readonly searchQuery = signal('');

  readonly filteredPratiche = computed(() => {
    let list = this.pratiche();
    const typeF = this.activeFilter();
    const statusF = this.activeStatus();
    const q = this.searchQuery().toLowerCase().trim();
    if (typeF !== 'all') list = list.filter(p => p.type === typeF);
    if (statusF !== 'all') list = list.filter(p => p.status === statusF);
    if (q) list = list.filter(p => p.title.toLowerCase().includes(q) || p.client_name.toLowerCase().includes(q));
    return list;
  });

  readonly counts = computed(() => {
    const all = this.pratiche();
    return {
      all: all.length,
      aperte: all.filter(p => p.status === 'aperta' || p.status === 'in_lavorazione').length,
      preventivi: all.filter(p => p.type === 'preventivo').length,
      sinistri: all.filter(p => p.type === 'sinistro').length,
      rinnovi: all.filter(p => p.type === 'rinnovo').length,
    };
  });

  typeLabel = PRATICA_TYPE_LABELS;
  statusLabel = PRATICA_STATUS_LABELS;
  typeIcon = PRATICA_TYPE_ICONS;

  ngOnInit(): void {
    this.praticheService.loadPratiche();
  }

  setFilter(f: 'all' | PraticaType): void { this.activeFilter.set(f); }
  setStatus(s: 'all' | PraticaStatus): void { this.activeStatus.set(s); }
  setSearch(q: string): void { this.searchQuery.set(q); }

  openPratica(id: string): void {
    this.router.navigate(['/pratiche', id]);
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  statusClass(status: PraticaStatus): string {
    switch (status) {
      case 'aperta': return 'status-aperta';
      case 'in_lavorazione': return 'status-lavorazione';
      case 'in_attesa': return 'status-attesa';
      case 'completata': return 'status-completata';
      case 'annullata': return 'status-annullata';
    }
  }

  priorityClass(p: string): string {
    return p === 'high' ? 'priority-high' : p === 'med' ? 'priority-med' : 'priority-low';
  }
}
