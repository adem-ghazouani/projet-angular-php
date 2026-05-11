import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Demande, DemandeStatus } from '../stage-workflow.model';

@Injectable({ providedIn: 'root' })
export class DemandeService {
  private apiUrl = 'http://localhost/projet_php/';

  constructor(private http: HttpClient) {}

  createDemande(
    payload: Pick<Demande, 'user_id' | 'titre_stage' | 'entreprise' | 'specialite'> & Partial<Demande>
  ): Observable<any> {
    return this.http.post(`${this.apiUrl}create_demande.php`, payload);
  }

  getDemandes(params?: { user_id?: number; status?: DemandeStatus }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.user_id) httpParams = httpParams.set('user_id', String(params.user_id));
    if (params?.status) httpParams = httpParams.set('status', params.status);
    return this.http.get(`${this.apiUrl}get_demandes.php`, { params: httpParams });
  }

  updateDemandeStatus(id: number, status: DemandeStatus, enseignant_id?: number): Observable<any> {
    return this.http.post(`${this.apiUrl}update_demande_status.php`, { id, status, enseignant_id });
  }
}

