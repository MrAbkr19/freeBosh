import { DegreeLevel } from './filiere';

export interface FiliereRow {
  id: string;
  name: string;
  departmentId: string;
  departmentName: string;
  degreeLevel: DegreeLevel;
  description: string;
  studentCount: number;
}