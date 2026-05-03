import { Component, OnInit } from '@angular/core';
import { Demande, Rapport } from '../../../stage-workflow.model';
import { DemandeService } from '../../../service/demande.service';
import { RapportService } from '../../../service/rapport.service';

@Component({
  selector: 'app-enseignant-accueil-page',
  templateUrl: './enseignant-accueil-page.component.html',
  styleUrls: ['./enseignant-accueil-page.component.scss']
})
export class EnseignantAccueilPageComponent implements OnInit {
  demandes: Demande[] = [];
  rapports: Rapport[] = [];
  loading = false;
  errorMessage = '';

  get pendingDemandes() {
    return this.demandes.filter((d) => d.status === 'pending');
  }

  get pendingRapports() {
    return this.rapports.filter((r) => r.status === 'submitted' || r.status === 'reviewing');
  }

  constructor(
    private demandesService: DemandeService,
    private rapportsService: RapportService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.errorMessage = '';

    this.demandesService.getDemandes().subscribe({
      next: (res: any) => {
        const raw: Demande[] = Array.isArray(res) ? res : (res?.data ?? res?.demandes ?? []);
        this.demandes = (raw ?? []).map((d: any) => ({
          ...d,
          etudiant_prenom: d?.etudiant_prenom ?? d?.prenom ?? d?.student_prenom ?? '',
          etudiant_nom: d?.etudiant_nom ?? d?.nom ?? d?.student_nom ?? ''
        }));
      },
      error: () => {
        this.demandes = [];
      }
    });

    this.rapportsService.getRapports().subscribe({
      next: (res: any) => {
        const raw: Rapport[] = Array.isArray(res) ? res : (res?.data ?? res?.rapports ?? []);
        this.rapports = (raw ?? []).map((r: any) => ({
          ...r,
          etudiant_prenom: r?.etudiant_prenom ?? r?.prenom ?? r?.student_prenom ?? '',
          etudiant_nom: r?.etudiant_nom ?? r?.nom ?? r?.student_nom ?? ''
        }));
        this.loading = false;
      },
      error: () => {
        this.rapports = [];
        this.loading = false;
        this.errorMessage = 'Impossible de charger les statistiques.';
      }
    });
  }

  getEtudiantFullName(row: { etudiant_prenom?: string | null; etudiant_nom?: string | null }): string {
    const prenom = (row?.etudiant_prenom ?? '').trim();
    const nom = (row?.etudiant_nom ?? '').trim();
    const full = `${prenom} ${nom}`.trim();
    return full || 'Nom indisponible';
  }
}

