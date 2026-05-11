import { Component, OnInit } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AuthService } from '../../../service/auth.service';
import { Demande, Evaluation, Rapport } from '../../../stage-workflow.model';
import { DemandeService } from '../../../service/demande.service';
import { EvaluationService } from '../../../service/evaluation.service';
import { RapportService } from '../../../service/rapport.service';

@Component({
  selector: 'app-etudiant-accueil-page',
  templateUrl: './etudiant-accueil-page.component.html',
  styleUrls: ['./etudiant-accueil-page.component.scss']
})
export class EtudiantAccueilPageComponent implements OnInit {
  currentUserId: number | null = null;
  demandes: Demande[] = [];
  rapports: Rapport[] = [];
  /** Évaluations liées aux rapports de l'étudiant (pour stats alignées sur « Mes résultats »). */
  evaluations: Evaluation[] = [];
  loading = false;
  errorMessage = '';

  get pendingDemandes(): Demande[] {
    return this.demandes.filter((d) => d.status === 'pending');
  }

  get acceptedDemandes(): Demande[] {
    return this.demandes.filter((d) => d.status === 'accepted');
  }

  get rapportEnCours(): Rapport[] {
    return this.rapports.filter((r) => {
      if (this.isRapportTermineEnseignant(r)) return false;
      const st = this.normalizeRapportStatus(r);
      return st === 'submitted' || st === 'reviewing';
    });
  }

  /** Même logique que la page Résultats : rapport validé OU évaluation terminée (note / validation finale). */
  get rapportsValides(): Rapport[] {
    return this.rapports.filter((r) => this.isRapportTermineEnseignant(r));
  }

  constructor(
    private auth: AuthService,
    private demandesService: DemandeService,
    private rapportsService: RapportService,
    private evaluationService: EvaluationService
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

    forkJoin({
      demandes: this.demandesService.getDemandes({ user_id: uid }).pipe(
        map((res: any) => {
          const raw: Demande[] = Array.isArray(res) ? res : (res?.data ?? res?.demandes ?? []);
          return this.filterDemandes(raw);
        }),
        catchError(() => of([] as Demande[]))
      ),
      rapports: this.rapportsService.getRapports({ user_id: uid }).pipe(
        map((res: any) => {
          const raw: Rapport[] = Array.isArray(res) ? res : (res?.data ?? res?.rapports ?? []);
          return this.filterRapports(raw);
        }),
        catchError(() => of([] as Rapport[]))
      )
    })
      .pipe(
        switchMap(({ demandes, rapports }) =>
          this.fetchEvaluationsForRapports(uid, rapports).pipe(
            map((evaluations) => ({ demandes, rapports, evaluations }))
          )
        )
      )
      .subscribe({
      next: ({ demandes, rapports, evaluations }) => {
        this.demandes = demandes;
        this.rapports = rapports;
        this.evaluations = evaluations;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Impossible de charger les données.';
      }
    });
  }

  /** Même appel que la page « Mes résultats » : une requête par rapport de l'étudiant. */
  private fetchEvaluationsForRapports(uid: number, rapports: Rapport[]): Observable<Evaluation[]> {
    if (!rapports.length) return of([]);
    return forkJoin(
      rapports.map((r) =>
        this.evaluationService.getEvaluations({ user_id: uid, rapport_id: r.id }).pipe(
          map((res: any) => {
            const raw: Evaluation[] = Array.isArray(res) ? res : (res?.data ?? res?.evaluations ?? []);
            return Array.isArray(raw) ? raw : [];
          }),
          catchError(() => of([] as Evaluation[]))
        )
      )
    ).pipe(map((chunks) => chunks.flat()));
  }

  private filterDemandes(list: Demande[]): Demande[] {
    if (!this.currentUserId) return [];
    return (Array.isArray(list) ? list : []).filter(
      (d) => Number(d?.user_id) === Number(this.currentUserId)
    );
  }

  private filterRapports(list: Rapport[]): Rapport[] {
    if (!this.currentUserId) return [];
    return (Array.isArray(list) ? list : []).filter(
      (r) => Number(r?.user_id) === Number(this.currentUserId)
    );
  }

  private normalizeRapportStatus(r: Rapport): string {
    return String(r?.status ?? '')
      .toLowerCase()
      .trim();
  }

  private isRapportTermineEnseignant(r: Rapport): boolean {
    if (this.normalizeRapportStatus(r) === 'validated') return true;
    return this.evaluations.some(
      (e) => Number(e.rapport_id) === Number(r.id) && String(e.status ?? '').toLowerCase().trim() === 'done'
    );
  }
}
