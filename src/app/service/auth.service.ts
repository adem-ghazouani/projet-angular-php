import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, map } from 'rxjs';

export interface User {
  id?: number;                                 // id INT AUTO_INCREMENT PRIMARY KEY
  nom: string;                                 // nom VARCHAR(100)
  prenom: string;                              // prenom VARCHAR(100)
  email: string;                               // email VARCHAR(150) UNIQUE
  mot_de_passe?: string;                       // mot_de_passe VARCHAR(255)
  role: 'etudiant' | 'enseignant' | 'admin';   // role ENUM('etudiant', 'enseignant', 'admin') NOT NULL
  created_at?: string;                         // created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  status?: 'pending' | 'approved' | 'rejected'; // status ENUM('pending','approved','rejected') DEFAULT 'pending'
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost/projet_php/'; // Added trailing slash for clarity

  constructor(private http: HttpClient, private router: Router) {}

  // Register
  register(user: User): Observable<any> {
    return this.http.post(this.apiUrl + 'register.php', user);
  }

  // Login
  login(data: { email: string; mot_de_passe: string }): Observable<any> {
    return this.http.post(this.apiUrl + 'login.php', data);
  }

  // Save user (localStorage)
  saveUser(user: User) {
    localStorage.setItem('current_user', JSON.stringify(user));
  }

  // Get user
  getUser(): User | null {
    const userStr = localStorage.getItem('current_user');
    return userStr ? JSON.parse(userStr) as User : null;
  }

  // Logout
  logout() {
    localStorage.removeItem('current_user');
    localStorage.removeItem('auth_token');
    this.router.navigate(['/login']);
  }

  // Check if logged in
  isLoggedIn(): boolean {
    return !!localStorage.getItem('current_user');
  }

  // Get role
  getRole(): 'etudiant' | 'enseignant' | 'admin' | '' {
    const user = this.getUser();
    return user?.role ?? '';
  }

  get userRole(): 'etudiant' | 'enseignant' | 'admin' | '' {
    return this.getRole();
  }

  redirectByRole(): void {
    const role = this.getRole();
    if (role === 'admin') {
      this.router.navigate(['/admin-dashboard']);
    } else if (role === 'enseignant') {
      this.router.navigate(['/enseignant-dashboard']);
    } else if (role === 'etudiant') {
      this.router.navigate(['/etudiant-dashboard']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  // Approve user
  approveUser(id: number) {
    return this.http.post(this.apiUrl + 'acceptercompte.php', { id });
  }

  // Reject user
  rejectUser(id: number) {
    return this.http.post(this.apiUrl + 'refusercompte.php', { id });
  }

  getPendingUsers(): Observable<any> {
    return this.http.get<any>(this.apiUrl + 'compteattente.php');
  }
}