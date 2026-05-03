import { Component, OnInit } from '@angular/core';
import { AuthService } from '../service/auth.service';

@Component({
  selector: 'app-enseignant-dashboard',
  templateUrl: './enseignant-dashboard.component.html',
  styleUrls: ['./enseignant-dashboard.component.scss']
})
export class EnseignantDashboardComponent implements OnInit {
  loading = false;
  today = new Date().toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long', year:'numeric' });

  constructor(private auth: AuthService) {}

  ngOnInit(): void {}

  logout(): void { this.auth.logout(); }
}
