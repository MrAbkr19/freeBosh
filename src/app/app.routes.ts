import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login';
import { StudentHome } from './features/student-home/student-home';

export const routes: Routes = [
    {path: '', component: LoginComponent},
    {path: 'etudiant/accueil', component:StudentHome}
];
