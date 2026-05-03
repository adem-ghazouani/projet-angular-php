import { Component, OnInit } from '@angular/core';
import { Rapport, RapportStatus } from '../../../stage-workflow.model';
import { RapportService } from '../../../service/rapport.service';

@Component({
  selector: 'app-enseignant-rapports-page',
  templateUrl: './enseignant-rapports-page.component.html',
  styleUrls: ['./enseignant-rapports-page.component.scss']
})
export class EnseignantRapportsPageComponent implements OnInit {
  rapports: Rapport[] = [];
  filtered: Rapport[] = [];
  loading = false;
  message = '';
  errorMessage = '';

  searchText = '';
  selectedStatus: '' | RapportStatus = '';

  commentDraft: Record<number, string> = {};

  constructor(private rapportService: RapportService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.message = '';
    this.errorMessage = '';
    this.rapportService.getRapports().subscribe({
      next: (res: any) => {
        const raw: Rapport[] = Array.isArray(res) ? res : (res?.data ?? res?.rapports ?? []);
        this.rapports = (raw ?? []).map((r: any) => ({
          ...r,
          etudiant_prenom: r?.etudiant_prenom ?? r?.prenom ?? r?.student_prenom ?? '',
          etudiant_nom: r?.etudiant_nom ?? r?.nom ?? r?.student_nom ?? ''
        }));
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les rapports.';
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    const q = this.searchText.trim().toLowerCase();
    this.filtered = (this.rapports ?? []).filter((r) => {
      const full = `${r.titre ?? ''} ${r.etudiant_prenom ?? ''} ${r.etudiant_nom ?? ''}`.toLowerCase();
      const okText = !q || full.includes(q);
      const okStatus = !this.selectedStatus || r.status === this.selectedStatus;
      return okText && okStatus;
    });
  }

  setStatus(r: Rapport, status: RapportStatus): void {
    if (!r?.id) return;
    const commentaire = this.commentDraft[r.id] ?? undefined;
    this.loading = true;
    this.message = '';
    this.errorMessage = '';
    this.rapportService.updateRapportStatus(r.id, status, commentaire).subscribe({
      next: () => {
        r.status = status;
        if (commentaire !== undefined) r.commentaire = commentaire;
        this.applyFilters();
        this.loading = false;
        this.message = 'Rapport mis à jour.';
      },
      error: (err) => {
        this.loading = false;
        const msg =
          err?.error?.message ||
          err?.error?.error ||
          err?.message ||
          (typeof err?.error === 'string' ? err.error : '');
        this.errorMessage = msg || 'La mise à jour a échoué.';
      }
    });
  }

  getEtudiantFullName(r: Rapport): string {
    const prenom = (r?.etudiant_prenom ?? '').trim();
    const nom = (r?.etudiant_nom ?? '').trim();
    const full = `${prenom} ${nom}`.trim();
    return full || 'Nom indisponible';
  }
}

