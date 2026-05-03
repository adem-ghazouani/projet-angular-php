export type DemandeStatus = 'pending' | 'accepted' | 'rejected';
export type RapportStatus = 'submitted' | 'reviewing' | 'validated' | 'rejected';

export interface Demande {
  id: number;
  etudiant_id: number;
  etudiant_nom?: string;
  etudiant_prenom?: string;
  titre: string;
  entreprise: string;
  duree: string;
  description: string;
  status: DemandeStatus;
  created_at: string;
}

export interface Rapport {
  id: number;
  etudiant_id: number;
  etudiant_nom?: string;
  etudiant_prenom?: string;
  titre: string;
  fichier_url: string;
  status: RapportStatus;
  commentaire?: string;
  created_at: string;
}
