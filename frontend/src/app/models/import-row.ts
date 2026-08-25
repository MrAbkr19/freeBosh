export interface ImportRow {
  studentId: string;
  nom: string;
  prenom: string;
  email: string;
  departement: string;
  isValid: boolean;
  errorReason?: string;
}