import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login';
import { StudentShell } from './layout/student-shell/student-shell';
import { StudentHome } from './features/student-home/student-home';
import { ModuleList } from './features/module-list/module-list';
import { ModuleDetail } from './features/module-detail/module-detail';
import { TeacherShell } from './layout/teacher-shell/teacher-shell';
import { TeacherHome } from './features/teacher-home/teacher-home';
import { PublishDocument } from './features/publish-document/publish-document';
import { MakeAnnouncement } from './features/make-announcement/make-announcement';
import { TeacherModuleList } from './features/teacher-module-list/teacher-module-list';
import { TeacherModuleDetail } from './features/teacher-module-detail/teacher-module-detail';
import { TeacherLibrary } from './features/teacher-library/teacher-library';
import { TeacherProfile } from './features/teacher-profile/teacher-profile';
import { StudentLibrary } from './features/student-library/student-library';
import { StudentProfile } from './features/student-profile/student-profile';
import { AdminShell } from './layout/admin-shell/admin-shell';
import { AdminDashboard } from './features/admin-dashboard/admin-dashboard';
import { AdminDepartments } from './features/admin-departments/admin-departments';
import { AdminFilieres } from './features/admin-filieres/admin-filieres';
import { AdminModules } from './features/admin-module/admin-module';
import { AdminTeachers } from './features/admin-teachers/admin-teachers';
import { AdminStudents } from './features/admin-students/admin-students';
import { AdminBulkImport } from './features/admin-bulk-import/admin-bulk-import';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  {
    path: 'etudiant',
    component: StudentShell,
    children: [
      { path: 'accueil', component: StudentHome },
      { path: 'modules', component: ModuleList },
      { path: 'modules/:id', component: ModuleDetail },
      { path: 'bibliotheque', component: StudentLibrary },
      { path: 'profil', component: StudentProfile },
    ],
  },
  {
  path: 'enseignant',
  component: TeacherShell,
  children: [
    { path: 'accueil', component: TeacherHome },
    { path: 'publier', component: PublishDocument },
    { path: 'annoncer', component: MakeAnnouncement },
    { path: 'modules', component: TeacherModuleList},
    { path: 'modules/:id', component: TeacherModuleDetail },
    { path: 'bibliotheque', component: TeacherLibrary },
    { path: 'profil', component: TeacherProfile },

  ],
},
{
  path: 'admin',
  component: AdminShell,
  children: [{ path: 'dashboard', component: AdminDashboard },
    { path: 'departements', component: AdminDepartments },
    { path: 'filieres', component: AdminFilieres },
    { path: 'modules', component: AdminModules },
    { path: 'enseignants', component: AdminTeachers },
    { path: 'etudiants', component: AdminStudents },
    { path: 'import', component: AdminBulkImport },
  ],
},

];