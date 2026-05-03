import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { User, UserRole, UserStatus } from '../user.model';
import { UserService } from '../service/user.service';

type UserForm = Partial<User> & { mot_de_passe?: string };

@Component({
  selector: 'app-liste-utilisateur',
  templateUrl: './liste-utilisateur.component.html',
  styleUrls: ['./liste-utilisateur.component.scss']
})
export class ListeUtilisateurComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  userForm: UserForm = this.createEmptyForm();
  editing = false;
  mode: 'list' | 'add' | 'edit' = 'list';
  loading = false;
  isAdmin = false;
  searchText = '';
  selectedStatus = '';
  selectedRole = '';
  message = '';
  errorMessage = '';

  readonly roles: UserRole[] = ['enseignant', 'etudiant'];
  readonly statuses: UserStatus[] = ['pending', 'approved', 'rejected'];

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.getRole() === 'admin';
    this.configurePage();
    this.route.queryParamMap.subscribe((params) => {
      const status = params.get('status');
      this.message =
        status === 'added'
          ? 'Utilisateur ajouté'
          : status === 'updated'
            ? 'Utilisateur modifié'
            : '';
    });
  }

  loadUsers(): void {
    this.loading = true;
    this.errorMessage = '';
    this.userService.getAllUsers().subscribe({
      next: (res) => {
        this.users = this.extractArray(res);
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger la liste des utilisateurs.';
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    const q = this.searchText.trim().toLowerCase();
    this.filteredUsers = this.users.filter((u) => {
      const fullText = `${u.prenom ?? ''} ${u.nom ?? ''} ${u.email ?? ''}`.toLowerCase();
      const matchesText = !q || fullText.includes(q);
      const matchesStatus = !this.selectedStatus || u.status === this.selectedStatus;
      const matchesRole = !this.selectedRole || u.role === this.selectedRole;
      return matchesText && matchesStatus && matchesRole;
    });
  }

  // Correction de l'ajout utilisateur (cf. user.service.ts ligne 32-35)
  save(): void {
    if (!this.isAdmin) {
      return;
    }
    if (!this.isFormValid()) {
      this.errorMessage = this.editing
        ? 'Veuillez remplir les champs obligatoires.'
        : 'Veuillez remplir tous les champs obligatoires, y compris le mot de passe.';
      return;
    }

    this.message = '';
    this.errorMessage = '';
    const payload: any = {
      ...this.userForm
    };

    // Pour la création : envoyer uniquement les champs attendus côté backend PHP
    if (!this.editing) {
      // Retirer les champs undefined ou null du payload
      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined || payload[key] === null) {
          delete payload[key];
        }
      });
      // Si id présent, le supprimer (ne PAS l'envoyer en création)
      if ('id' in payload) {
        delete payload.id;
      }
    }

    if (this.editing && this.userForm.id) {
      // En mode édition, on autorise id et on utilise updateUser
      this.userService.updateUser(this.userForm.id, payload).subscribe({
        next: () => {
          this.router.navigate(['/liste-utilisateur'], {
            queryParams: { status: 'updated' }
          });
        },
        error: (err) => {
          this.errorMessage = this.readMessage(err?.error) || this.readMessage(err) || "La modification de l'utilisateur a échoué.";
        }
      });
      return;
    }

    // Correction pour respecter la structure attendue par le backend PHP lors de la création
    this.userService.createUser(payload).subscribe({
      next: (result) => {
        // Vérifier que la réponse a bien créé l'utilisateur (optionnel)
        this.router.navigate(['/liste-utilisateur'], {
          queryParams: { status: 'added' }
        });
      },
      error: (err) => {
        this.errorMessage = this.readMessage(err?.error) || this.readMessage(err) || "La création de l'utilisateur a échoué.";
      }
    });
  }

  edit(u: User): void {
    if (!this.isAdmin) {
      return;
    }
    this.router.navigate(['/liste-utilisateur/modifier', u.id]);
  }

  remove(id?: number): void {
    if (!this.isAdmin || !id) {
      return;
    }
    if (!confirm('Confirmer la suppression de cet utilisateur ?')) {
      return;
    }
    this.userService.deleteUser(id).subscribe({
      next: () => {
        this.message = 'Utilisateur supprimé.';
        this.loadUsers();
      },
      error: () => {
        this.errorMessage = 'La suppression a échoué.';
      }
    });
  }

  resetForm(clearMessages = true): void {
    this.userForm = this.createEmptyForm();
    this.editing = false;
    if (clearMessages) {
      this.message = '';
      this.errorMessage = '';
    }
  }

  private configurePage(): void {
    const path = this.route.snapshot.routeConfig?.path ?? 'liste-utilisateur';
    if (path === 'liste-utilisateur/ajouter') {
      this.mode = 'add';
      this.editing = false;
      this.resetForm(false);
      return;
    }

    if (path === 'liste-utilisateur/modifier/:id') {
      this.mode = 'edit';
      this.editing = true;
      const id = Number(this.route.snapshot.paramMap.get('id'));
      if (!id) {
        this.errorMessage = 'Utilisateur introuvable.';
        return;
      }
      this.loadUserForEdit(id);
      return;
    }

    this.mode = 'list';
    this.editing = false;
    this.loadUsers();
  }

  private loadUserForEdit(id: number): void {
    this.loading = true;
    this.userService.getUserById(id).subscribe({
      next: (user) => {
        this.userForm = {
          id: user.id,
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
          role: user.role,
          status: user.status
        };
        this.loading = false;
      },
      error: () => {
        this.userService.getAllUsers().subscribe({
          next: (res) => {
            const users = this.extractArray(res);
            const user = users.find((u) => u.id === id);
            if (!user) {
              this.errorMessage = 'Impossible de charger les infos utilisateur.';
              this.loading = false;
              return;
            }
            this.userForm = {
              id: user.id,
              nom: user.nom,
              prenom: user.prenom,
              email: user.email,
              role: user.role,
              status: user.status
            };
            this.loading = false;
          },
          error: () => {
            this.loading = false;
            this.errorMessage = 'Impossible de charger les infos utilisateur.';
          }
        });
      }
    });
  }

  private createEmptyForm(): UserForm {
    return {
      nom: '',
      prenom: '',
      email: '',
      mot_de_passe: '',
      role: 'etudiant',
      status: 'pending'
    };
  }

  private isFormValid(): boolean {
    return !!this.userForm.nom?.trim() &&
      !!this.userForm.prenom?.trim() &&
      !!this.userForm.email?.trim() &&
      !!this.userForm.role &&
      (this.editing || !!this.userForm.mot_de_passe?.trim());
  }

  private readMessage(source: unknown): string {
    if (!source) {
      return '';
    }
    if (typeof source === 'string') {
      return source;
    }
    const obj = source as Record<string, unknown>;
    const message = obj['message'];
    const msg = obj['msg'];
    const error = obj['error'];
    if (typeof message === 'string') {
      return message;
    }
    if (typeof msg === 'string') {
      return msg;
    }
    if (typeof error === 'string') {
      return error;
    }
    return '';
  }

  private extractArray(res: unknown): User[] {
    if (Array.isArray(res)) {
      return res as User[];
    }
    const asObj = res as Record<string, unknown> | null;
    if (!asObj) {
      return [];
    }
    if (Array.isArray(asObj['users'])) {
      return asObj['users'] as User[];
    }
    if (Array.isArray(asObj['data'])) {
      return asObj['data'] as User[];
    }
    const firstArray = Object.values(asObj).find((value) => Array.isArray(value));
    return Array.isArray(firstArray) ? (firstArray as User[]) : [];
  }
}