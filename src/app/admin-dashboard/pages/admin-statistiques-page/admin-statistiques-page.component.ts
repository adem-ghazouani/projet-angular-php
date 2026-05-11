import { Component, OnInit } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UserService } from '../../../service/user.service';
import { DemandeService } from '../../../service/demande.service';
import { RapportService } from '../../../service/rapport.service';
import { User } from '../../../user.model';
import { Demande, Rapport } from '../../../stage-workflow.model';

@Component({
  selector: 'app-admin-statistiques-page',
  templateUrl: './admin-statistiques-page.component.html',
  styleUrls: ['./admin-statistiques-page.component.scss']
})
export class AdminStatistiquesPageComponent implements OnInit {
  loading = true;
  users: User[] = [];
  demandes: Demande[] = [];
  rapports: Rapport[] = [];

  constructor(
    private userService: UserService,
    private demandeService: DemandeService,
    private rapportService: RapportService
  ) {}

  ngOnInit(): void {
    forkJoin({
      users: this.userService.getAllUsers().pipe(catchError(() => of([]))),
      demandes: this.demandeService.getDemandes().pipe(catchError(() => of([]))),
      rapports: this.rapportService.getRapports().pipe(catchError(() => of([])))
    }).subscribe(({ users, demandes, rapports }) => {
      this.users = this.extractArray<User>(users);
      this.demandes = this.extractArray<Demande>(demandes);
      this.rapports = this.extractArray<Rapport>(rapports);
      this.loading = false;
    });
  }

  get totalUsers(): number { return this.users.length; }
  get totalEtudiants(): number { return this.users.filter((u) => u.role === 'etudiant').length; }
  get totalEnseignants(): number { return this.users.filter((u) => u.role === 'enseignant').length; }
  get totalDemandes(): number { return this.demandes.length; }
  get totalRapports(): number { return this.rapports.length; }
  get validatedRapports(): number { return this.rapports.filter((r) => r.status === 'validated').length; }

  private extractArray<T>(res: any): T[] {
    if (Array.isArray(res)) return res as T[];
    if (Array.isArray(res?.data)) return res.data as T[];
    const found = Object.values(res ?? {}).find((v) => Array.isArray(v));
    return Array.isArray(found) ? (found as T[]) : [];
  }
}
