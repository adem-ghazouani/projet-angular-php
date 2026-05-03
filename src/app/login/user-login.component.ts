import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService, User } from '../service/auth.service';

@Component({
  selector: 'app-user-login',
  templateUrl: './user-login.component.html',
  styleUrls: ['./user-login.component.scss']
})
export class UserLoginComponent {
  showPassword = false;
  loading = false;
  error = '';

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    mot_de_passe: ['', [Validators.required, Validators.minLength(4)]]
  });

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    this.error = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error = 'Veuillez renseigner des informations valides.';
      return;
    }

    const email = (this.form.value.email ?? '').trim();
    const mot_de_passe = this.form.value.mot_de_passe ?? '';
    this.loading = true;

    this.authService.login({
      email,
      mot_de_passe
    }).subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res && res.success && res.user) {
          if (res.user.status && res.user.status !== 'approved') {
            if (res.user.status === 'pending') {
              this.error = "Votre compte n'est pas encore valide par l'administrateur.";
            } else if (res.user.status === 'rejected') {
              this.error = "Votre compte a ete refuse par l'administrateur.";
            } else {
              this.error = "Statut du compte inconnu. Veuillez contacter l'administrateur.";
            }
            return;
          }
          this.authService.saveUser(res.user as User);

          localStorage.setItem('loginSuccessMessage', 'Connexion réussie');
          this.authService.redirectByRole();
        } else {
          this.error = res && res.message
            ? res.message
            : "Email ou mot de passe incorrect.";
        }
      },
      error: (err) => {
        this.loading = false;
        if (err && err.error && err.error.message) {
          this.error = err.error.message;
        } else if (err && err.message) {
          this.error = err.message;
        } else {
          this.error = 'Erreur serveur';
        }
      }
    });
  }
}
