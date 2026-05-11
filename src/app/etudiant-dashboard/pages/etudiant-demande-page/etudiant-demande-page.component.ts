import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../service/auth.service';
import { Demande } from '../../../stage-workflow.model';
import { DemandeService } from '../../../service/demande.service';

@Component({
  selector: 'app-etudiant-demande-page',
  templateUrl: './etudiant-demande-page.component.html',
  styleUrls: ['./etudiant-demande-page.component.scss']
})
export class EtudiantDemandePageComponent implements OnInit {
  currentUserId: number | null = null;
  demandesList: Demande[] = [];
  latestDemande: Demande | null = null;

  loading = false;
  submitting = false;
  message = '';
  errorMessage = '';

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private demandes: DemandeService
  ) {
    this.form = this.fb.group({
      titre_stage: ['', Validators.required],
      entreprise: ['', Validators.required],
      specialite: ['', Validators.required],
      duree: [''],
      description: ['']
    });
  }

  ngOnInit(): void {
    const user = this.auth.getUser();
    this.currentUserId = user?.id ?? null;
    if (!this.currentUserId) {
      this.errorMessage = 'Utilisateur non connecté.';
      return;
    }
    this.loadMine();
  }

  loadMine(): void {
    if (!this.currentUserId) return;
    this.loading = true;
    this.message = '';
    this.errorMessage = '';
    this.demandes.getDemandes({ user_id: this.currentUserId }).subscribe({
      next: (res: any) => {
        const rawList: Demande[] = Array.isArray(res) ? res : (res?.data ?? res?.demandes ?? []);
        this.demandesList = this.keepOnlyCurrentUserDemandes(rawList);
        this.latestDemande = this.demandesList[0] ?? null;
        this.loading = false;
      },
      error: () => {
        this.demandesList = [];
        this.latestDemande = null;
        this.loading = false;
      }
    });
  }

  submit(): void {
    if (!this.currentUserId) return;
    if (this.form.invalid) {
      this.errorMessage = 'Veuillez remplir les champs obligatoires.';
      return;
    }
    this.submitting = true;
    this.message = '';
    this.errorMessage = '';

    const payload = {
      user_id: this.currentUserId,
      ...this.form.value
    };

    this.demandes.createDemande(payload as any).subscribe({
      next: () => {
        this.message = 'Demande envoyée.';
        this.submitting = false;
        this.form.reset({
          titre_stage: '',
          entreprise: '',
          specialite: '',
          duree: '',
          description: ''
        });
        this.loadMine();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || "L'envoi de la demande a échoué.";
        this.submitting = false;
      }
    });
  }

  private keepOnlyCurrentUserDemandes(list: Demande[]): Demande[] {
    if (!this.currentUserId) return [];
    return (Array.isArray(list) ? list : []).filter((d) => Number(d?.user_id) === Number(this.currentUserId));
  }
}

