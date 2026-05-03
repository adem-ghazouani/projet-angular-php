export type UserRole = 'admin' | 'enseignant' | 'etudiant';
export type UserStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  mot_de_passe?: string;
  role: UserRole;
  created_at: string;
  deleted_at: string | null;
  status: UserStatus;
}

export interface LoginRequest {
  email: string;
  mot_de_passe: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
