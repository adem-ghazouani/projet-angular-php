import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../service/auth.service';
import { Demande, Rapport } from '../../../stage-workflow.model';
import { DemandeService } from '../../../service/demande.service';
import { RapportService } from '../../../service/rapport.service';

@Component({
  selector: 'app-etudiant-rapport-page',
  templateUrl: './etudiant-rapport-page.component.html',
  styleUrls: ['./etudiant-rapport-page.component.scss']
})
export class EtudiantRapportPageComponent implements OnInit {
  currentUserId: number | null = null;
  demande: Demande | null = null;
  rapport: Rapport | null = null;
  demandesList: Demande[] = [];
  rapportsList: Rapport[] = [];

  loading = false;
  
  submitting = false;
  message = '';
  errorMessage = '';
  debugHint = '';

  file: File | null = null;
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private demandes: DemandeService,
    private rapports: RapportService
  ) {
    this.form = this.fb.group({
      titre: ['', Validators.required],
      commentaire: ['']
    });
  }

  ngOnInit(): void {
    const user = this.auth.getUser();
    this.currentUserId = user?.id ?? null;
    if (!this.currentUserId) {
      this.errorMessage = 'Utilisateur non connecté.';
      return;
    }
    this.loadAll();
  }

  get canSubmitRapport(): boolean {
    return !!this.demande && this.demande.status === 'accepted' && !this.rapport;
  }

  get rapportStateMessage(): string {
    if (this.loading) return '';
    if (this.rapport) {
      return `Rapport déjà soumis (statut: ${this.rapport.status}).`;
    }
    if (!this.demande) {
      return "Aucun rapport soumis. Vous devez d'abord soumettre une demande de stage.";
    }
    if (this.demande.status !== 'accepted') {
      return `Aucun rapport soumis. Votre demande est ${this.demande.status}.`;
    }
    return 'Aucun rapport soumis. Vous pouvez soumettre votre rapport maintenant.';
  }

  loadAll(): void {
    if (!this.currentUserId) return;
    this.loading = true;
    this.message = '';
    this.errorMessage = '';

    this.demandes.getDemandes({ user_id: this.currentUserId }).subscribe({
      next: (res: any) => {
        if (Array.isArray(res)) {
          this.demandesList = this.keepOnlyCurrentUserDemandes(res);
        } else if (res && typeof res === 'object' && typeof res.id !== 'undefined') {
          this.demandesList = this.keepOnlyCurrentUserDemandes([res as Demande]);
        } else {
          const list: Demande[] = (res?.data ?? res?.demandes ?? []);
          this.demandesList = this.keepOnlyCurrentUserDemandes(list);
        }
        this.computeSelectedDemandeAndRapport();
        this.setDebugHint();
      },
      error: () => {
        this.demandesList = [];
        this.demande = null;
        this.computeSelectedDemandeAndRapport();
        this.setDebugHint();
      }
    });

    this.rapports.getRapports({ user_id: this.currentUserId }).subscribe({
      next: (res: any) => {
        if (Array.isArray(res)) {
          this.rapportsList = this.keepOnlyCurrentUserRapports(res);
        } else if (res && typeof res === 'object' && typeof res.id !== 'undefined') {
          this.rapportsList = this.keepOnlyCurrentUserRapports([res as Rapport]);
        } else {
          const list: Rapport[] = (res?.data ?? res?.rapports ?? []);
          this.rapportsList = this.keepOnlyCurrentUserRapports(list);
        }
        this.computeSelectedDemandeAndRapport();
        this.setDebugHint();
        this.loading = false;
      },
      error: () => {
        this.rapportsList = [];
        this.rapport = null;
        this.computeSelectedDemandeAndRapport();
        this.setDebugHint();
        this.loading = false;
      }
    });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const f = input.files?.[0] ?? null;
    if (!f) {
      this.file = null;
      return;
    }
    if (!f.name.toLowerCase().endsWith('.pdf')) {
      this.errorMessage = 'Veuillez choisir un fichier PDF.';
      input.value = '';
      this.file = null;
      return;
    }
    this.file = f;
  }

  submit(): void {
    if (!this.currentUserId) return;
    if (!this.demande?.id || this.demande.status !== 'accepted') {
      this.errorMessage = "Vous devez d'abord avoir une demande acceptée.";
      return;
    }
    if (this.form.invalid) {
      this.errorMessage = 'Veuillez saisir le titre du rapport.';
      return;
    }
    if (!this.file) {
      this.errorMessage = 'Veuillez choisir un fichier PDF.';
      return;
    }

    this.submitting = true;
    this.message = '';
    this.errorMessage = '';

    const fd = new FormData();
    fd.append('user_id', String(this.currentUserId));
    fd.append('demande_id', String(this.demande.id));
    fd.append('titre', this.form.value.titre);
    fd.append('commentaire', this.form.value.commentaire ?? '');
    fd.append('fichier', this.file);

    this.rapports.createRapport(fd).subscribe({
      next: () => {
        this.message = 'Rapport soumis.';
        this.submitting = false;
        this.form.reset({ titre: '', commentaire: '' });
        this.file = null;
        this.loadAll();
      },
      error: (err) => {
        const msg =
          err?.error?.message ||
          err?.error?.error ||
          err?.message ||
          (typeof err?.error === 'string' ? err.error : '');
        this.errorMessage = msg || "L'envoi du rapport a échoué.";
        this.submitting = false;
      }
    });
  }

  private setDebugHint(): void {
    const demandeStatus = this.demande?.status ?? 'Aucune demande';
    const rapportStatus = this.rapport?.status ?? 'Aucun rapport';
    const can = this.canSubmitRapport ? 'OUI' : 'NON';
    this.debugHint = `Demande: ${demandeStatus} · Rapport: ${rapportStatus} · Peut soumettre: ${can}`;
  }

  private computeSelectedDemandeAndRapport(): void {
    const acceptedDemandes = this.demandesList.filter((d) => d?.status === 'accepted');
    this.demande = acceptedDemandes[0] ?? this.demandesList[0] ?? null;

    if (!this.demande?.id) {
      this.rapport = this.rapportsList[0] ?? null;
      return;
    }

    const linkedRapport = this.rapportsList.find((r) => Number(r.demande_id) === Number(this.demande?.id));
    this.rapport = linkedRapport ?? null;
  }

  private keepOnlyCurrentUserDemandes(list: Demande[]): Demande[] {
    if (!this.currentUserId) return [];
    return (Array.isArray(list) ? list : []).filter((d) => Number(d?.user_id) === Number(this.currentUserId));
  }

  private keepOnlyCurrentUserRapports(list: Rapport[]): Rapport[] {
    if (!this.currentUserId) return [];
    return (Array.isArray(list) ? list : []).filter((r) => Number(r?.user_id) === Number(this.currentUserId));
  }
}

