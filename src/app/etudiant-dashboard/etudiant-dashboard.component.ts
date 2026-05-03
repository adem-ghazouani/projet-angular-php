import { Component, OnInit } from '@angular/core';
import { AuthService, User } from '../service/auth.service';

@Component({
  selector: 'app-etudiant-dashboard',
  templateUrl: './etudiant-dashboard.component.html',
  styleUrls: ['./etudiant-dashboard.component.scss']
})
export class EtudiantDashboardComponent implements OnInit {
  currentUser: User | null = null;
  loading = true;
  today = new Date().toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long', year:'numeric' });

  get initials() {
    if (!this.currentUser) return '??';
    return (this.currentUser.prenom[0] + this.currentUser.nom[0]).toUpperCase();
  }

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.auth.getUser();
    this.loading = false;
  }

  logout(): void { this.auth.logout(); }
}
