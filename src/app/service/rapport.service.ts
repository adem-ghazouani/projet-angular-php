import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Rapport, RapportStatus } from '../stage-workflow.model';

@Injectable({ providedIn: 'root' })
export class RapportService {
  private apiUrl = 'http://localhost/projet_php/';

  constructor(private http: HttpClient) {}

  createRapport(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}create_rapport.php`, formData);
  }

  getRapports(params?: { user_id?: number; demande_id?: number; status?: RapportStatus }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.user_id) httpParams = httpParams.set('user_id', String(params.user_id));
    if (params?.demande_id) httpParams = httpParams.set('demande_id', String(params.demande_id));
    if (params?.status) httpParams = httpParams.set('status', params.status);
    return this.http.get(`${this.apiUrl}get_rapports.php`, { params: httpParams });
  }

  updateRapportStatus(id: number, status: RapportStatus, commentaire?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}update_rapport_status.php`, { id, status, commentaire });
  }
}

