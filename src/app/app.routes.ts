import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login';
import { StudentShell } from './layout/student-shell/student-shell';
import { StudentHome } from './features/student-home/student-home';
import { ModuleList } from './features/module-list/module-list';
import { ModuleDetail } from './features/module-detail/module-detail';
import { TeacherShell } from './layout/teacher-shell/teacher-shell';
import { TeacherHome } from './features/teacher-home/teacher-home';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  {
    path: 'etudiant',
    component: StudentShell,
    children: [
      { path: 'accueil', component: StudentHome },
      { path: 'modules', component: ModuleList },
      { path: 'modules/:id', component: ModuleDetail },
    ],
  },
  {
    path: 'enseignant',
    component: TeacherShell,
    children: [{ path: 'accueil', component: TeacherHome }],
  },

];