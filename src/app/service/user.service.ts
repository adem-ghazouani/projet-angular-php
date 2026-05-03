import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, UserStatus } from '../user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = 'http://localhost/projet_php/';

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/Utilisateur/readacc.php`);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/${id}`);
  }

  updateUserStatus(id: number, status: UserStatus): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/users/${id}/status`, { status });
  }

  updateUser(id: number, data: Partial<User>): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/Utilisateur/modifieracc.php`, { id, ...data });
  }

  deleteUser(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/Utilisateur/supprimeracc.php`, { id });
  }

  createUser(user: Partial<User>): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/Utilisateur/createacc.php`, user);
  }

  getPendingUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/compteattente.php`);
  }

  getUsersByRole(role: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users?role=${role}`);
  }
}
