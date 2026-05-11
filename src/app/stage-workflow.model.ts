export type DemandeStatus = 'pending' | 'accepted' | 'rejected';
export type RapportStatus = 'submitted' | 'reviewing' | 'validated' | 'refused';
export type EvaluationStatus = 'pending' | 'done';

export interface Demande {
  id: number;
  user_id: number;
  titre_stage: string;
  entreprise: string;
  specialite: string;
  duree?: string | null;
  description?: string | null;
  status: DemandeStatus;
  enseignant_id?: number | null;
  created_at?: string;
  etudiant_nom?: string;
  etudiant_prenom?: string;
  etudiant_email?: string;
}

export interface Rapport {
  id: number;
  user_id: number;
  demande_id: number;
  titre: string;
  fichier?: string | null;
  commentaire?: string | null;
  status: RapportStatus;
  created_at?: string;
  etudiant_nom?: string;
  etudiant_prenom?: string;
  etudiant_email?: string;
}

export interface Evaluation {
  id: number;
  rapport_id: number;
  enseignant_id: number;
  note?: number | null;
  remarque?: string | null;
  status: EvaluationStatus;
  created_at?: string;
  etudiant_nom?: string;
  etudiant_prenom?: string;
  rapport_titre?: string;
}

