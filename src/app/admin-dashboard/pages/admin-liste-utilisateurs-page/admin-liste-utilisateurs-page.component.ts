import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../service/user.service';
import { User } from '../../../user.model';

@Component({
  selector: 'app-admin-liste-utilisateurs-page',
  templateUrl: './admin-liste-utilisateurs-page.component.html',
  styleUrls: ['./admin-liste-utilisateurs-page.component.scss']
})
export class AdminListeUtilisateursPageComponent implements OnInit {
  users: User[] = [];
  loading = false;
  searchText = '';

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  get filteredUsers(): User[] {
    const q = this.searchText.trim().toLowerCase();
    return this.users.filter((u) => (`${u.prenom} ${u.nom} ${u.email}`).toLowerCase().includes(q));
  }

  remove(user: User): void {
    if (!user.id) return;
    if (!confirm(`Supprimer ${user.prenom} ${user.nom} ?`)) return;
    this.userService.deleteUser(user.id).subscribe({ next: () => this.loadUsers() });
  }

  private loadUsers(): void {
    this.loading = true;
    this.userService.getAllUsers().subscribe({
      next: (res: any) => {
        this.users = this.extractArray(res);
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  private extractArray(res: any): User[] {
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.users)) return res.users;
    if (Array.isArray(res?.data)) return res.data;
    const found = Object.values(res ?? {}).find((v) => Array.isArray(v));
    return Array.isArray(found) ? (found as User[]) : [];
  }
}
