import { StudentStatus } from './user';

export interface AdminStudentRow {
  id: string;
  fullName: string;
  matricule: string;
  email: string;
  filiere: string;
  niveau: string;
  status: StudentStatus;
}