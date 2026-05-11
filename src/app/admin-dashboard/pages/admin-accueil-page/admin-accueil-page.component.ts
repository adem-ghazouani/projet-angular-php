import { Component, OnInit } from '@angular/core';
import { AuthService, User } from '../../../service/auth.service';
import { UserService } from '../../../service/user.service';

@Component({
  selector: 'app-admin-accueil-page',
  templateUrl: './admin-accueil-page.component.html',
  styleUrls: ['./admin-accueil-page.component.scss']
})
export class AdminAccueilPageComponent implements OnInit {
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
  get totalEtudiants()   { return this.users.filter(u => this.normRole(u.role) === 'etudiant').length; }
  get totalEnseignants() { return this.users.filter(u => this.normRole(u.role) === 'enseignant').length; }
  get totalApproved()    { return this.users.filter(u => this.normStatus(u.status) === 'approved').length; }
  get pendingUsers()     { return this.users.filter(u => this.normStatus(u.status) === 'pending'); }

  get pendingEtudiantsCount(): number {
    return this.users.filter(
      (u) => this.normRole(u.role) === 'etudiant' && this.normStatus(u.status) === 'pending'
    ).length;
  }

  get filteredUsers() {
    const q = this.searchText.toLowerCase();
    return this.users.filter(u =>
      (u.nom ?? '').toLowerCase().includes(q) ||
      (u.prenom ?? '').toLowerCase().includes(q) ||
      (u.email ?? '').toLowerCase().includes(q)
    );
  }

  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit(): void { this.loadUsers(); }

  loadUsers(): void {
    this.loading = true;

    this.userService.getAllUsers().subscribe({
      next: (res: any) => {
        const raw = this.extractArray(res);
        this.users = raw.map((row) => this.normalizeUser(row));
        this.loading = false;
      },
      error: () => {
        this.users = [];
        this.loading = false;
      }
    });
  }

  private extractArray(res: any): any[] {
    if (Array.isArray(res))             return res;
    if (Array.isArray(res?.users))      return res.users;
    if (Array.isArray(res?.data))       return res.data;
    const found = Object.values(res ?? {}).find(v => Array.isArray(v));
    return Array.isArray(found) ? found as any[] : [];
  }

  private normalizeUser(raw: any): User {
    return {
      ...raw,
      id: raw?.id != null ? Number(raw.id) : undefined,
      nom: raw?.nom ?? '',
      prenom: raw?.prenom ?? '',
      email: raw?.email ?? '',
      role: this.coerceRole(raw?.role),
      status: this.coerceStatus(raw?.status),
      created_at: raw?.created_at
    };
  }

  private coerceRole(value: unknown): User['role'] {
    const r = String(value ?? '').toLowerCase().trim();
    if (r === 'etudiant' || r === 'enseignant' || r === 'admin') return r;
    return 'etudiant';
  }

  private coerceStatus(value: unknown): User['status'] {
    const s = String(value ?? '').toLowerCase().trim();
    if (s === 'pending' || s === 'approved' || s === 'rejected') return s;
    if (s === '1' || s === 'true' || s === 'valide' || s === 'validé') return 'approved';
    if (s === '0' || s === 'false') return 'pending';
    return 'pending';
  }

  private normRole(role: User['role'] | undefined): string {
    return String(role ?? '').toLowerCase().trim();
  }

  private normStatus(status: User['status'] | undefined): string {
    return String(status ?? '').toLowerCase().trim();
  }

  approveUser(user: User, e: Event): void {
    e.stopPropagation();
    if (!user.id) return;
    this.authService.approveUser(user.id).subscribe({
      next: () => { this.loadUsers(); },
      error: () => {}
    });
  }

  rejectUser(user: User, e: Event): void {
    e.stopPropagation();
    if (!user.id) return;
    this.authService.rejectUser(user.id).subscribe({
      next: () => { this.loadUsers(); },
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
    return Math.round((this.users.filter(u => this.normRole(u.role) === role).length / this.users.length) * 100);
  }
}
