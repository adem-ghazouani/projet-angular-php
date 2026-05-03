import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../service/auth.service';
import { Evaluation, Rapport } from '../../../stage-workflow.model';
import { EvaluationService } from '../../../service/evaluation.service';
import { RapportService } from '../../../service/rapport.service';

@Component({
  selector: 'app-etudiant-resultats-page',
  templateUrl: './etudiant-resultats-page.component.html',
  styleUrls: ['./etudiant-resultats-page.component.scss']
})
export class EtudiantResultatsPageComponent implements OnInit {
  currentUserId: number | null = null;
  rapport: Rapport | null = null;
  evaluation: Evaluation | null = null;
  loading = false;
  errorMessage = '';

  constructor(
    private auth: AuthService,
    private rapports: RapportService,
    private evaluations: EvaluationService
  ) {}

  ngOnInit(): void {
    const user = this.auth.getUser();
    this.currentUserId = user?.id ?? null;
    if (!this.currentUserId) {
      this.errorMessage = 'Utilisateur non connecté.';
      return;
    }
    this.load();
  }

  load(): void {
    if (!this.currentUserId) return;
    const uid = this.currentUserId;
    this.loading = true;
    this.errorMessage = '';

    this.rapports.getRapports({ user_id: uid }).subscribe({
      next: (res: any) => {
        const rawList: Rapport[] = Array.isArray(res) ? res : (res?.data ?? res?.rapports ?? []);
        const list = this.keepOnlyCurrentUserRapports(rawList);
        this.rapport = list?.[0] ?? null;

        if (!this.rapport?.id) {
          this.evaluation = null;
          this.loading = false;
          return;
        }

        this.evaluations.getEvaluations({ user_id: uid, rapport_id: this.rapport.id }).subscribe({
          next: (evRes: any) => {
            const rawEvList: Evaluation[] = Array.isArray(evRes) ? evRes : (evRes?.data ?? evRes?.evaluations ?? []);
            const evList = this.keepOnlyCurrentUserEvaluations(rawEvList, this.rapport?.id ?? null);
            this.evaluation = evList?.[0] ?? null;
            this.loading = false;
          },
          error: (err) => {
            this.evaluation = null;
            const msg =
              err?.error?.message ||
              err?.error?.error ||
              err?.message ||
              (typeof err?.error === 'string' ? err.error : '');
            this.errorMessage = msg || "Impossible de charger l'évaluation.";
            this.loading = false;
          }
        });
      },
      error: () => {
        this.rapport = null;
        this.evaluation = null;
        this.loading = false;
      }
    });
  }

  private keepOnlyCurrentUserRapports(list: Rapport[]): Rapport[] {
    if (!this.currentUserId) return [];
    return (Array.isArray(list) ? list : []).filter((r) => Number(r?.user_id) === Number(this.currentUserId));
  }

  private keepOnlyCurrentUserEvaluations(list: Evaluation[], rapportId: number | null): Evaluation[] {
    const safeList = Array.isArray(list) ? list : [];
    if (!rapportId) return [];
    return safeList.filter((ev) => Number((ev as any)?.rapport_id) === Number(rapportId));
  }
}

