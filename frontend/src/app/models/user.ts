export type userRole = 'student' | 'teacher' | 'admin';
export type StudentStatus = 'inscrit' | 'en_attente';

export interface User {
  id: string;
  fullName: string;
  matricule: string;
  password: string;
  role: userRole;
  filiere?: string;
  niveau?: string;
  email?: string;
  status?: StudentStatus;
  schoolName?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  country?: string;
}