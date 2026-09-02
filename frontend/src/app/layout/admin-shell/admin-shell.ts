import { Component, computed, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../services/auth';
import { initialsFor } from '../../utils/document-formatting';

const ROUTE_TITLES: Record<string, string> = {
  '/admin/dashboard': 'Tableau de bord',
  '/admin/departements': 'Gestion des Départements',
  '/admin/filieres': 'Gestion des Filières',
  '/admin/modules': 'Gestion des Salles & Modules',
  '/admin/enseignants': 'Gestion des Enseignants',
  '/admin/etudiants': 'Gestion des Étudiants',
  '/admin/import': 'Importation en masse',
  '/admin/settings': 'Paramètres de la plateforme',
  '/admin/support': 'Support & Assistance',
};

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-shell.html',
  styleUrl: './admin-shell.css',
})
export class AdminShell {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly currentUrl = signal<string>(this.router.url);
  readonly currentUser = this.authService.currentUser;

  readonly activeTitle = computed(() => {
    const url = this.currentUrl();
    for (const [route, title] of Object.entries(ROUTE_TITLES)) {
      if (url.startsWith(route)) {
        return title;
      }
    }
    return "Vue d'ensemble";
  });

  constructor() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.currentUrl.set(event.urlAfterRedirects || event.url);
      });
  }

  get initials(): string {
    return initialsFor(this.currentUser()?.fullName);
  }
}