import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../service/auth.service';
import { Evaluation, Rapport } from '../../../stage-workflow.model';
import { EvaluationService } from '../../../service/evaluation.service';
import { RapportService } from '../../../service/rapport.service';

@Component({
  selector: 'app-enseignant-evaluations-page',
  templateUrl: './enseignant-evaluations-page.component.html',
  styleUrls: ['./enseignant-evaluations-page.component.scss']
})
export class EnseignantEvaluationsPageComponent implements OnInit {
  rapports: Rapport[] = [];
  evaluations: Evaluation[] = [];
  loading = false;
  message = '';
  errorMessage = '';

  noteDraft: Record<number, number | null> = {};
  remarqueDraft: Record<number, string> = {};

  private enseignantId: number | null = null;

  constructor(
    private auth: AuthService,
    private rapportsService: RapportService,
    private evaluationsService: EvaluationService
  ) {}

  ngOnInit(): void {
    this.enseignantId = this.auth.getUser()?.id ?? null;
    this.load();
  }

  load(): void {
    this.loading = true;
    this.message = '';
    this.errorMessage = '';

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
        this.errorMessage = 'Impossible de charger les rapports.';
        this.loading = false;
      }
    });

    this.evaluationsService.getEvaluations().subscribe({
      next: (res: any) => {
        this.evaluations = Array.isArray(res) ? res : (res?.data ?? res?.evaluations ?? []);
      },
      error: () => {}
    });
  }

  getEtudiantFullName(r: Rapport): string {
    const prenom = (r?.etudiant_prenom ?? '').trim();
    const nom = (r?.etudiant_nom ?? '').trim();
    const full = `${prenom} ${nom}`.trim();
    return full || 'Nom indisponible';
  }

  getEvaluationForRapport(rapportId: number): Evaluation | null {
    return this.evaluations.find((e) => e.rapport_id === rapportId) ?? null;
  }

  save(rapport: Rapport): void {
    if (!rapport?.id) return;
    if (!this.enseignantId) {
      this.errorMessage = 'Enseignant non connecté.';
      return;
    }

    const note = this.noteDraft[rapport.id] ?? null;
    const remarque = this.remarqueDraft[rapport.id] ?? '';

    this.loading = true;
    this.message = '';
    this.errorMessage = '';
    this.evaluationsService.createEvaluation({
      rapport_id: rapport.id,
      enseignant_id: this.enseignantId,
      note,
      remarque,
      status: 'done'
    }).subscribe({
      next: () => {
        this.message = 'Évaluation enregistrée.';
        this.loading = false;
        this.load();
      },
      error: () => {
        this.errorMessage = "L'enregistrement a échoué.";
        this.loading = false;
      }
    });
  }
}

