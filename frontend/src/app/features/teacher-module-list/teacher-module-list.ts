import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MockApiService } from '../../services/mock-api';
import { AuthService } from '../../services/auth';
import { TeacherModuleCard } from '../../models/teacher-module-card';

@Component({
  selector: 'app-teacher-module-list',
  standalone: true,
  imports: [],
  templateUrl: './teacher-module-list.html',
  styleUrl: './teacher-module-list.css',
})
export class TeacherModuleList {
  private readonly api = inject(MockApiService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly isLoading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly modules = signal<TeacherModuleCard[]>([]);

  constructor() {
    this.loadModules();
  }

  private loadModules(): void {
    const teacher = this.authService.currentUser();

    if (!teacher) {
      this.isLoading.set(false);
      this.loadError.set('Profil enseignant introuvable.');
      return;
    }

    this.isLoading.set(true);
    this.loadError.set(null);

    forkJoin({
      modules: this.api.getModules(),
      documents: this.api.getDocuments(),
      users: this.api.getUsers(),
    }).subscribe({
      next: ({ modules, documents, users }) => {
        const myModules = modules.filter((m) => m.teacherIds.includes(teacher.id));

        const cards: TeacherModuleCard[] = myModules.map((m) => ({
          id: m.id,
          code: m.code,
          name: m.name,
          badgeLabel: `${m.level} • ${m.faculty}`,
          documentCount: documents.filter((d) => d.courseModuleId === m.id).length,
          studentCount: users.filter(
            (u) => u.role === 'student' && u.filiere === m.faculty && u.niveau === m.level
          ).length,
        }));

        this.modules.set(cards);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.loadError.set('Impossible de charger vos modules. Vérifiez votre connexion.');
      },
    });
  }

  openModule(moduleId: string): void {
    this.router.navigate(['/enseignant/modules', moduleId]);
  }
}