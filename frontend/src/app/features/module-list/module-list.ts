import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MockApiService } from '../../services/mock-api';
import { AuthService } from '../../services/auth';
import { ModuleListItem } from '../../models/module-list-item';
import { CourseModule } from '../../models/course-module';


@Component({
  selector: 'app-module-list',
  standalone: true,
  imports: [],
  templateUrl: './module-list.html',
  styleUrl: './module-list.css',
})
export class ModuleList {
  private readonly api = inject(MockApiService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly currentUser = this.authService.currentUser;
  readonly isLoading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly modules = signal<ModuleListItem[]>([]);

  constructor() {
    this.loadModules();
  }

  private loadModules(): void {
    const user = this.currentUser();

    if (!user?.filiere || !user?.niveau) {
      this.isLoading.set(false);
      this.loadError.set("Votre profil n'a pas encore de filière/niveau renseignés.");
      return;
    }

    this.isLoading.set(true);
    this.loadError.set(null);

    forkJoin({
      modules: this.api.getModules(),
      documents: this.api.getDocuments(),
    }).subscribe({
      next: ({ modules, documents }) => {
        const filtered = modules.filter(
          (m) => m.faculty === user.filiere && m.level === user.niveau
        );

        const items: ModuleListItem[] = filtered.map((m) => ({
          id: m.id,
          code: m.code,
          name: m.name,
          documentCount: documents.filter((d) => d.courseModuleId === m.id).length,
        }));

        this.modules.set(items);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.loadError.set('Impossible de charger vos modules. Vérifiez votre connexion.');
      },
    });
  }

  openModule(moduleId: string): void {
    this.router.navigate(['/etudiant/modules', moduleId]);
  }
}