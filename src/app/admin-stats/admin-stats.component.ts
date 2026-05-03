import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: 'admin' | 'enseignant' | 'etudiant';
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface Demande {
  id: number;
  etudiant_id: number;
  titre: string;
  entreprise: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export interface Rapport {
  id: number;
  etudiant_id: number;
  titre: string;
  status: 'submitted' | 'reviewing' | 'validated' | 'rejected';
  created_at: string;
}

export interface StatCard {
  label: string;
  value: number;
  delta?: string;
  deltaUp?: boolean;
  color: string;
  bg: string;
  icon: string;
}

@Component({
  selector: 'app-admin-stats',
  templateUrl: './admin-stats.component.html',
  styleUrls: ['./admin-stats.component.scss']
})
export class AdminStatsComponent implements OnInit {

  users: User[] = [];
  demandes: Demande[] = [];
  rapports: Rapport[] = [];
  loading = true;

  // ── Getters utilisateurs ──────────────────────────
  get totalUsers(): number {
    return this.users.length;
  }
  get totalEtudiants(): number {
    return this.users.filter(u => u.role === 'etudiant').length;
  }
  get totalEnseignants(): number {
    return this.users.filter(u => u.role === 'enseignant').length;
  }
  get totalAdmins(): number {
    return this.users.filter(u => u.role === 'admin').length;
  }
  get pendingUsers(): number {
    return this.users.filter(u => u.status === 'pending').length;
  }
  get approvedUsers(): number {
    return this.users.filter(u => u.status === 'approved').length;
  }
  get rejectedUsers(): number {
    return this.users.filter(u => u.status === 'rejected').length;
  }

  // ── Getters demandes ──────────────────────────────
  get totalDemandes(): number {
    return this.demandes.length;
  }
  get pendingDemandes(): number {
    return this.demandes.filter(d => d.status === 'pending').length;
  }
  get acceptedDemandes(): number {
    return this.demandes.filter(d => d.status === 'accepted').length;
  }
  get rejectedDemandes(): number {
    return this.demandes.filter(d => d.status === 'rejected').length;
  }

  // ── Getters rapports ──────────────────────────────
  get totalRapports(): number {
    return this.rapports.length;
  }
  get submittedRapports(): number {
    return this.rapports.filter(r => r.status === 'submitted').length;
  }
  get validatedRapports(): number {
    return this.rapports.filter(r => r.status === 'validated').length;
  }
  get rejectedRapports(): number {
    return this.rapports.filter(r => r.status === 'rejected').length;
  }

  // ── Taux ─────────────────────────────────────────
  get tauxValidation(): number {
    if (this.totalUsers === 0) return 0;
    return Math.round((this.approvedUsers / this.totalUsers) * 100);
  }

  get tauxAcceptation(): number {
    if (this.totalDemandes === 0) return 0;
    return Math.round((this.acceptedDemandes / this.totalDemandes) * 100);
  }

  get tauxRapports(): number {
    if (this.totalRapports === 0) return 0;
    return Math.round((this.validatedRapports / this.totalRapports) * 100);
  }

  // ── Inscriptions par mois (6 derniers mois) ───────
  get inscriptionsParMois(): { mois: string; count: number }[] {
    const moisLabels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const now = new Date();
    const result: { mois: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mois = moisLabels[d.getMonth()];
      const count = this.users.filter(u => {
        const ud = new Date(u.created_at);
        return ud.getMonth() === d.getMonth() && ud.getFullYear() === d.getFullYear();
      }).length;
      result.push({ mois, count });
    }
    return result;
  }

  get maxInscriptions(): number {
    const counts = this.inscriptionsParMois.map(m => m.count);
    return counts.length ? Math.max(...counts, 1) : 1;
  }

  // ── Activité récente (derniers utilisateurs) ───────
  get recentUsers(): User[] {
    return [...this.users]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  }

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.loading = true;

    this.http.get<User[]>('http://localhost/gestion_stages/api/users').subscribe({
      next: d => {
        this.users = d;
      },
      error: () => {
        // Données de démo basées sur votre base MySQL
        this.users = [
          { id: 1, nom: 'adem', prenom: 'adem', email: 'ademgh@gmail.com', role: 'etudiant', status: 'pending', created_at: '2026-04-06' },
          { id: 2, nom: 'maram', prenom: 'maram', email: 'maram@gmail.com', role: 'etudiant', status: 'pending', created_at: '2026-04-06' },
          { id: 3, nom: 'admin', prenom: 'admin', email: 'admin@admin.com', role: 'admin', status: 'approved', created_at: '2026-04-06' },
          { id: 4, nom: 'ayoub', prenom: 'ayoub', email: 'ayoub@gmail.com', role: 'etudiant', status: 'pending', created_at: '2026-04-20' }
        ];
      }
    });

    this.http.get<Demande[]>('http://localhost/gestion_stages/api/demandes').subscribe({
      next: d => {
        this.demandes = d;
      },
      error: () => {
        this.demandes = [
          { id: 1, etudiant_id: 1, titre: 'Stage Dev Web', entreprise: 'TechCorp', status: 'pending', created_at: '2026-04-10' },
          { id: 2, etudiant_id: 2, titre: 'Stage Data Sci', entreprise: 'DataLab', status: 'accepted', created_at: '2026-04-12' },
          { id: 3, etudiant_id: 4, titre: 'Stage Réseaux', entreprise: 'NetSph', status: 'rejected', created_at: '2026-04-15' }
        ];
      }
    });

    this.http.get<Rapport[]>('http://localhost/gestion_stages/api/rapports').subscribe({
      next: d => {
        this.rapports = d;
        this.loading = false;
      },
      error: () => {
        this.rapports = [
          { id: 1, etudiant_id: 1, titre: 'Rapport Dev Web', status: 'submitted', created_at: '2026-04-20' },
          { id: 2, etudiant_id: 2, titre: 'Rapport Data Sci', status: 'validated', created_at: '2026-04-18' },
          { id: 3, etudiant_id: 4, titre: 'Rapport Réseaux', status: 'rejected', created_at: '2026-04-22' }
        ];
        this.loading = false;
      }
    });
  }

  getInitials(u: User): string {
    const prenomInitial = u.prenom && u.prenom.length > 0 ? u.prenom[0] : '';
    const nomInitial = u.nom && u.nom.length > 0 ? u.nom[0] : '';
    return (prenomInitial + nomInitial).toUpperCase();
  }

  formatDate(d: string): string {
    if (!d) return '';
    const date = new Date(d);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  barHeight(count: number): number {
    if (!this.maxInscriptions) return 0;
    return Math.round((count / this.maxInscriptions) * 100);
  }

  logout(): void {
    localStorage.clear();
    window.location.href = '/login';
  }
}