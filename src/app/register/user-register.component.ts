import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService, User } from '../service/auth.service';

@Component({
  selector: 'app-user-register',
  templateUrl: './user-register.component.html',
  styleUrls: ['./user-register.component.scss']
})
export class UserRegisterComponent {
  step = 1;
  showPw = false;
  loading = false;
  error = '';
  success = '';

  form = this.fb.group({
    nom: ['', [Validators.required, Validators.minLength(2)]],
    prenom: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    mot_de_passe: ['', [Validators.required, Validators.minLength(4)]],
    role: ['etudiant' as User['role'], [Validators.required]]
  });

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  nextStep() {
    const nomCtrl = this.form.get('nom');
    const prenomCtrl = this.form.get('prenom');
    const emailCtrl = this.form.get('email');

    nomCtrl?.markAsTouched();
    prenomCtrl?.markAsTouched();
    emailCtrl?.markAsTouched();

    if (nomCtrl?.invalid || prenomCtrl?.invalid || emailCtrl?.invalid) {
      this.error = 'Veuillez completer correctement les informations personnelles.';
      return;
    }
    this.error = '';
    this.step = 2;
  }

  prevStep() {
    this.step = 1;
  }

  selectRole(role: User['role']) {
    this.form.patchValue({ role });
    this.form.get('role')?.markAsTouched();
  }

  onSubmit() {
    this.error = '';
    this.success = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error = 'Tous les champs sont obligatoires.';
      return;
    }

    const payload: User = {
      nom: (this.form.value.nom ?? '').trim(),
      prenom: (this.form.value.prenom ?? '').trim(),
      email: (this.form.value.email ?? '').trim(),
      mot_de_passe: this.form.value.mot_de_passe ?? '',
      role: this.form.value.role as User['role']
    };

    this.loading = true;
    this.authService.register(payload).subscribe({
      next: (res: any) => {
        this.loading = false;
        const message = this.readMessage(res);
        const isSuccess =
          res?.success === true ||
          res?.status === 'success' ||
          (!!message && /(inscription|compte).*(reussi|cree|enregistre)|success/i.test(message));

        if (isSuccess) {
          this.success = message || "Inscription reussie. Votre compte doit etre valide par l'admin.";
          this.error = '';
          setTimeout(() => this.router.navigate(['/login']), 800);
        } else {
          this.error = message || "Erreur lors de l'inscription";
          this.success = '';
        }
      },
      error: (err: any) => {
        this.loading = false;
        this.error = this.readMessage(err?.error) || this.readMessage(err) || 'Erreur serveur';
        this.success = '';
      }
    });
  }

  private readMessage(source: any): string {
    if (!source) return '';
    if (typeof source === 'string') return source;
    if (typeof source.message === 'string') return source.message;
    if (typeof source.msg === 'string') return source.msg;
    if (typeof source.error === 'string') return source.error;
    return '';
  }
}
