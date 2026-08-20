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

];