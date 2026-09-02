import { Component, computed, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { ConnectivityService } from '../../services/connectivity';

@Component({
  selector: 'app-teacher-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './teacher-shell.html',
  styleUrl: './teacher-shell.css',
})
export class TeacherShell {
  readonly connectivity = inject(ConnectivityService);
  private readonly router = inject(Router);

  readonly currentUrl = signal<string>(this.router.url);

  readonly subPageConfig = computed(() => {
    const url = this.currentUrl();
    if (url.includes('/enseignant/profil/settings')) {
      return { isSubPage: true, backRoute: '/enseignant/profil', title: 'Paramètres' };
    }
    if (url.includes('/enseignant/profil/support')) {
      return { isSubPage: true, backRoute: '/enseignant/profil', title: 'Support & Assistance' };
    }
    return { isSubPage: false, backRoute: '', title: '' };
  });

  constructor() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.currentUrl.set(event.urlAfterRedirects || event.url);
      });
  }
}