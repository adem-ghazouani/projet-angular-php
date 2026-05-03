import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EvaluationService {
  private apiUrl = 'http://localhost/projet_php/';

  constructor(private http: HttpClient) {}

  createEvaluation(payload: {
    rapport_id: number;
    enseignant_id: number;
    note?: number | null;
    remarque?: string | null;
    status?: 'pending' | 'done';
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}create_evaluation.php`, payload);
  }

  getEvaluations(params?: { user_id?: number; rapport_id?: number }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.user_id) httpParams = httpParams.set('user_id', String(params.user_id));
    if (params?.rapport_id) httpParams = httpParams.set('rapport_id', String(params.rapport_id));
    return this.http.get(`${this.apiUrl}get_evaluations.php`, { params: httpParams });
  }
}

