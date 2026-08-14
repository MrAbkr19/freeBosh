export type userRole = 'student' | 'teacher' | 'admin';

export interface User {
    id: string;
    fullName: string;
    matricule:string;
    password: string;
    role:userRole;
    filiere?: string;
    niveau?: string;

}