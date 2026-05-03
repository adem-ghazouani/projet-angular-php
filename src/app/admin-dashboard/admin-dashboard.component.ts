import { Component, OnInit } from '@angular/core';
import { AuthService, User } from '../service/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  users: User[] = [];
  loading = true;
  searchText = '';
  today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  get totalUsers()       { return this.users.length; }
  get totalEtudiants()   { return this.users.filter(u => u.role === 'etudiant').length; }
  get totalEnseignants() { return this.users.filter(u => u.role === 'enseignant').length; }
  get totalApproved()    { return this.users.filter(u => u.status === 'approved').length; }
  get pendingUsers()     { return this.users.filter(u => u.status === 'pending'); }

  get filteredUsers() {
    const q = this.searchText.toLowerCase();
    return this.users.filter(u =>
      u.nom.toLowerCase().includes(q) ||
      u.prenom.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  }

  constructor(private authService: AuthService) {}

  ngOnInit(): void { this.loadUsers(); }

  loadUsers(): void {
    this.loading = true;

    // ✅ On essaie d'abord getAllUsers() pour avoir TOUS les utilisateurs
    // Si la méthode n'existe pas encore dans AuthService, on tombe sur getPendingUsers()
    const source$ = (this.authService as any).getAllUsers
      ? (this.authService as any).getAllUsers()
      : this.authService.getPendingUsers();

    source$.subscribe({
      next: (res: any) => {
        this.users = this.extractArray(res);
        this.loading = false;
      },
      error: () => {
        // Données de démo si l'API n'est pas connectée
        this.loading = false;
      }
    });
  }

  private extractArray(res: any): User[] {
    if (Array.isArray(res))             return res;
    if (Array.isArray(res?.users))      return res.users;
    if (Array.isArray(res?.data))       return res.data;
    const found = Object.values(res ?? {}).find(v => Array.isArray(v));
    return Array.isArray(found) ? found as User[] : [];
  }

  approveUser(user: User, e: Event): void {
    e.stopPropagation();
    if (!user.id) return;
    this.authService.approveUser(user.id).subscribe({
      next: () => { user.status = 'approved'; },
      error: () => {}
    });
  }

  rejectUser(user: User, e: Event): void {
    e.stopPropagation();
    if (!user.id) return;
    this.authService.rejectUser(user.id).subscribe({
      next: () => { user.status = 'rejected'; },
      error: () => {}
    });
  }

  deleteUser(user: User): void {
    if (!confirm(`Supprimer ${user.prenom} ${user.nom} ?`)) return;
    this.users = this.users.filter(u => u.id !== user.id);
  }

  getInitials(u: User): string {
    return ((u.prenom?.[0] ?? '') + (u.nom?.[0] ?? '')).toUpperCase();
  }

  getRolePct(role: string): number {
    if (!this.users.length) return 0;
    return Math.round((this.users.filter(u => u.role === role).length / this.users.length) * 100);
  }

  logout(): void {
    this.authService.logout();
  }
}