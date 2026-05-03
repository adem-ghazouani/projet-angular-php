import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Demande, DemandeStatus, Rapport, RapportStatus } from '../models/stage.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class StageService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Demandes
  getAllDemandes(): Observable<Demande[]> {
    return this.http.get<Demande[]>(`${this.apiUrl}/demandes`);
  }

  getDemandeByEtudiant(etudiantId: number): Observable<Demande> {
    return this.http.get<Demande>(`${this.apiUrl}/demandes/etudiant/${etudiantId}`);
  }

  createDemande(demande: Partial<Demande>): Observable<Demande> {
    return this.http.post<Demande>(`${this.apiUrl}/demandes`, demande);
  }

  updateDemandeStatus(id: number, status: DemandeStatus): Observable<Demande> {
    return this.http.patch<Demande>(`${this.apiUrl}/demandes/${id}/status`, { status });
  }

  deleteDemande(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/demandes/${id}`);
  }

  // Rapports
  getAllRapports(): Observable<Rapport[]> {
    return this.http.get<Rapport[]>(`${this.apiUrl}/rapports`);
  }

  getRapportByEtudiant(etudiantId: number): Observable<Rapport> {
    return this.http.get<Rapport>(`${this.apiUrl}/rapports/etudiant/${etudiantId}`);
  }

  uploadRapport(formData: FormData): Observable<Rapport> {
    return this.http.post<Rapport>(`${this.apiUrl}/rapports`, formData);
  }

  updateRapportStatus(id: number, status: RapportStatus, commentaire?: string): Observable<Rapport> {
    return this.http.patch<Rapport>(`${this.apiUrl}/rapports/${id}/status`, { status, commentaire });
  }

  deleteRapport(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/rapports/${id}`);
  }
}
