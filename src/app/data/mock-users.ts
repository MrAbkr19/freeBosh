import { User } from '../models/user';

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    fullName: 'Jean Mbarga',
    matricule: '2024-001',
    password: 'password',
    role: 'student',
    filiere: 'Génie Informatique',
    niveau: 'Niveau 3',
  },
  {
    id: 'u2',
    fullName: 'Dr. Ateba Rigobert',
    matricule: 'ens-014',
    password: 'password',
    role: 'teacher',
  },
  {
    id: 'u3',
    fullName: 'Admin FreeBosh',
    matricule: 'admin',
    password: 'password',
    role: 'admin',
  },
];