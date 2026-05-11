import { Component, OnInit } from '@angular/core';
import { AuthService, User } from '../../../service/auth.service';

@Component({
  selector: 'app-admin-validation-page',
  templateUrl: './admin-validation-page.component.html',
  styleUrls: ['./admin-validation-page.component.scss']
})
export class AdminValidationPageComponent implements OnInit {
  pendingUsers: User[] = [];
  loading = false;
  errorMessage = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadPendingUsers();
  }

  loadPendingUsers(): void {
    this.loading = true;
    this.errorMessage = '';
    this.authService.getPendingUsers().subscribe({
      next: (res: any) => {
        this.pendingUsers = this.extractArray(res);
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Erreur lors du chargement des comptes en attente.';
        this.loading = false;
      }
    });
  }

  approve(user: User): void {
    if (!user.id) return;
    this.authService.approveUser(user.id).subscribe({ next: () => this.loadPendingUsers() });
  }

  reject(user: User): void {
    if (!user.id) return;
    this.authService.rejectUser(user.id).subscribe({ next: () => this.loadPendingUsers() });
  }

  getInitials(u: User): string {
    return ((u.prenom?.[0] ?? '') + (u.nom?.[0] ?? '')).toUpperCase();
  }

  private extractArray(res: any): User[] {
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.users)) return res.users;
    if (Array.isArray(res?.data)) return res.data;
    const found = Object.values(res ?? {}).find((v) => Array.isArray(v));
    return Array.isArray(found) ? (found as User[]) : [];
  }
}
