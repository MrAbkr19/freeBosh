export type DegreeLevel = 'Licence' | 'Master' | 'Doctorat';

export interface Filiere {
  id: string;
  name: string;
  departmentId: string;
  degreeLevel: DegreeLevel;
  description?: string;
}