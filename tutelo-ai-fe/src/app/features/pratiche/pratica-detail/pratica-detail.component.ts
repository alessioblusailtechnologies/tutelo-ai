import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HugeiconsIconComponent } from '@hugeicons/angular';
import { ArrowLeft01Icon, File01Icon, FolderOpenIcon } from '@hugeicons/core-free-icons';
import { PraticheService } from '../../../core/services/pratiche.service';
import { MarkdownPipe } from '../../../core/pipes/markdown.pipe';
import {
  PRATICA_TYPE_LABELS, PRATICA_STATUS_LABELS, PRATICA_TYPE_ICONS,
  type Pratica, type PraticaNote, type PraticaArtifact, type PraticaStatus,
} from '../../../core/models/pratica.model';

@Component({
  selector: 'app-pratica-detail',
  standalone: true,
  imports: [FormsModule, MarkdownPipe, HugeiconsIconComponent],
  templateUrl: './pratica-detail.component.html',
  styleUrl: './pratica-detail.component.scss'
})
export class PraticaDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly praticheService = inject(PraticheService);

  readonly ArrowLeft01Icon = ArrowLeft01Icon;
  readonly File01Icon = File01Icon;
  readonly FolderOpenIcon = FolderOpenIcon;

  readonly pratica = signal<Pratica | null>(null);
  readonly notes = signal<PraticaNote[]>([]);
  readonly artifacts = signal<PraticaArtifact[]>([]);
  readonly activeTab = signal<'overview' | 'notes' | 'artifacts'>('overview');
  readonly selectedArtifact = signal<PraticaArtifact | null>(null);
  readonly loading = signal(true);

  noteText = '';
  savingNote = signal(false);

  typeLabel = PRATICA_TYPE_LABELS;
  statusLabel = PRATICA_STATUS_LABELS;
  typeIcon = PRATICA_TYPE_ICONS;

  readonly statuses: PraticaStatus[] = ['aperta', 'in_lavorazione', 'in_attesa', 'completata', 'annullata'];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.loadAll(id);
  }

  async loadAll(id: string): Promise<void> {
    this.loading.set(true);
    try {
      const [pratica, notes, artifacts] = await Promise.all([
        this.praticheService.getById(id),
        this.praticheService.getNotes(id),
        this.praticheService.getArtifacts(id),
      ]);
      this.pratica.set(pratica);
      this.notes.set(notes);
      this.artifacts.set(artifacts);
      if (artifacts.length > 0) {
        this.selectedArtifact.set(artifacts[0]);
      }
    } finally {
      this.loading.set(false);
    }
  }

  goBack(): void {
    this.router.navigate(['/pratiche']);
  }

  setTab(tab: 'overview' | 'notes' | 'artifacts'): void {
    this.activeTab.set(tab);
  }

  async changeStatus(status: PraticaStatus): Promise<void> {
    const p = this.pratica();
    if (!p) return;
    await this.praticheService.updateStatus(p.id, status);
    this.pratica.set({ ...p, status });
  }

  async addNote(): Promise<void> {
    const p = this.pratica();
    if (!p || !this.noteText.trim()) return;
    this.savingNote.set(true);
    try {
      const note = await this.praticheService.addNote(p.id, this.noteText.trim());
      this.notes.update(list => [...list, note]);
      this.noteText = '';
    } finally {
      this.savingNote.set(false);
    }
  }

  selectArtifact(a: PraticaArtifact): void {
    this.selectedArtifact.set(a);
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  formatShortDate(d: string): string {
    return new Date(d).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
  }

  statusClass(status: PraticaStatus): string {
    const map: Record<PraticaStatus, string> = {
      aperta: 'status-aperta',
      in_lavorazione: 'status-lavorazione',
      in_attesa: 'status-attesa',
      completata: 'status-completata',
      annullata: 'status-annullata',
    };
    return map[status];
  }
}
