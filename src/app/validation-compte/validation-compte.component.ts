import { Component, OnInit } from '@angular/core';
import { AuthService, User } from '../service/auth.service';

@Component({
  selector: 'app-validation-compte',
  templateUrl: './validation-compte.component.html',
  styleUrls: ['./validation-compte.component.scss']
})
export class UserValidationComponent implements OnInit {

  pendingUsers: User[] = [];
  message: string = '';
  errorMessage: string = '';
  loading: boolean = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadPendingUsers();
  }

  loadPendingUsers(): void {
    this.loading = true;
    this.message = '';
    this.errorMessage = '';

    this.authService.getPendingUsers().subscribe({
      next: (res: any) => {
        this.pendingUsers = this.extractArray(res);
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Erreur lors du chargement des utilisateurs en attente.';
        this.loading = false;
      }
    });
  }

  private extractArray(res: any): User[] {
    if (Array.isArray(res))        return res;
    if (Array.isArray(res?.users)) return res.users;
    if (Array.isArray(res?.data))  return res.data;
    const found = Object.values(res ?? {}).find(v => Array.isArray(v));
    return Array.isArray(found) ? found as User[] : [];
  }

  accepter(user: User): void {
    if (!user.id) return;
    this.loading = true;
    this.authService.approveUser(user.id).subscribe({
      next: () => {
        this.message = `Compte de ${user.prenom} ${user.nom} validé avec succès.`;
        this.errorMessage = '';
        this.loadPendingUsers();
      },
      error: () => {
        this.errorMessage = "Erreur lors de l'approbation.";
        this.loading = false;
      }
    });
  }

  refuser(user: User): void {
    if (!user.id) return;
    this.loading = true;
    this.authService.rejectUser(user.id).subscribe({
      next: () => {
        this.message = `Compte de ${user.prenom} ${user.nom} refusé.`;
        this.errorMessage = '';
        this.loadPendingUsers();
      },
      error: () => {
        this.errorMessage = "Erreur lors du refus.";
        this.loading = false;
      }
    });
  }

  getInitials(u: User): string {
    return ((u.prenom?.[0] ?? '') + (u.nom?.[0] ?? '')).toUpperCase();
  }
}