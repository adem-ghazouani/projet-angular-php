import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../service/auth.service';
import { Demande, DemandeStatus } from '../../../stage-workflow.model';
import { DemandeService } from '../../../service/demande.service';

@Component({
  selector: 'app-enseignant-demandes-page',
  templateUrl: './enseignant-demandes-page.component.html',
  styleUrls: ['./enseignant-demandes-page.component.scss']
})
export class EnseignantDemandesPageComponent implements OnInit {
  demandes: Demande[] = [];
  filtered: Demande[] = [];
  loading = false;
  message = '';
  errorMessage = '';

  searchText = '';
  selectedStatus: '' | DemandeStatus = '';

  private enseignantId: number | null = null;

  constructor(
    private auth: AuthService,
    private demandeService: DemandeService
  ) {}

  ngOnInit(): void {
    this.enseignantId = this.auth.getUser()?.id ?? null;
    this.load();
  }

  load(): void {
    this.loading = true;
    this.message = '';
    this.errorMessage = '';
    this.demandeService.getDemandes().subscribe({
      next: (res: any) => {
        const raw: Demande[] = Array.isArray(res) ? res : (res?.data ?? res?.demandes ?? []);
        this.demandes = (raw ?? []).map((d: any) => ({
          ...d,
          etudiant_prenom: d?.etudiant_prenom ?? d?.prenom ?? d?.student_prenom ?? '',
          etudiant_nom: d?.etudiant_nom ?? d?.nom ?? d?.student_nom ?? ''
        }));
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les demandes.';
        this.loading = false;
      }
    });
  }

  getEtudiantFullName(d: Demande): string {
    const prenom = (d?.etudiant_prenom ?? '').trim();
    const nom = (d?.etudiant_nom ?? '').trim();
    const full = `${prenom} ${nom}`.trim();
    return full || 'Nom indisponible';
  }

  applyFilters(): void {
    const q = this.searchText.trim().toLowerCase();
    this.filtered = (this.demandes ?? []).filter((d) => {
      const full = `${d.titre_stage ?? ''} ${d.entreprise ?? ''} ${d.etudiant_prenom ?? ''} ${d.etudiant_nom ?? ''}`.toLowerCase();
      const okText = !q || full.includes(q);
      const okStatus = !this.selectedStatus || d.status === this.selectedStatus;
      return okText && okStatus;
    });
  }

  setStatus(d: Demande, status: DemandeStatus): void {
    if (!d?.id) return;
    this.loading = true;
    this.message = '';
    this.errorMessage = '';
    this.demandeService.updateDemandeStatus(d.id, status, this.enseignantId ?? undefined).subscribe({
      next: () => {
        d.status = status;
        this.applyFilters();
        this.loading = false;
        this.message = 'Statut mis à jour.';
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'La mise à jour a échoué.';
      }
    });
  }
}

