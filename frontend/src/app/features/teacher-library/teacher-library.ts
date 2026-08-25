import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { MockApiService } from '../../services/mock-api';
import { AuthService } from '../../services/auth';
import { OfflineAvailabilityService } from '../../services/offline-availability';
import { CourseModule } from '../../models/course-module';
import { TeacherLibraryDocument } from '../../models/teacher-library-document';
import { typeIconFor } from '../../utils/document-formatting';

@Component({
  selector: 'app-teacher-library',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './teacher-library.html',
  styleUrl: './teacher-library.css',
})
export class TeacherLibrary {
  private readonly api = inject(MockApiService);
  private readonly authService = inject(AuthService);
  private readonly offlineService = inject(OfflineAvailabilityService);

  readonly isLoading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly myModules = signal<CourseModule[]>([]);
  readonly allDocuments = signal<TeacherLibraryDocument[]>([]);

  readonly searchText = signal('');
  readonly selectedModuleId = signal<string | null>(null);

  readonly filteredDocuments = computed(() => {
    const query = this.searchText().trim().toLowerCase();
    const moduleId = this.selectedModuleId();

    return this.allDocuments().filter((doc) => {
      const matchesModule = !moduleId || doc.moduleId === moduleId;
      const matchesSearch = !query || doc.title.toLowerCase().includes(query);
      return matchesModule && matchesSearch;
    });
  });

  constructor() {
    this.loadLibrary();
  }

  private loadLibrary(): void {
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
        const moduleMap = new Map(myModules.map((m) => [m.id, m]));

        const studentCountByModule = new Map(
          myModules.map((m) => [
            m.id,
            users.filter((u) => u.role === 'student' && u.filiere === m.faculty && u.niveau === m.level).length,
          ])
        );

        const myDocuments: TeacherLibraryDocument[] = documents
          .filter((d) => d.teacherId === teacher.id && moduleMap.has(d.courseModuleId))
          .map((d) => ({
            id: d.id,
            title: d.title,
            fileUrl: d.fileUrl,
            typeIcon: typeIconFor(d.fileUrl),
            moduleId: d.courseModuleId,
            moduleName: moduleMap.get(d.courseModuleId)?.name ?? 'Module',
            studentCount: studentCountByModule.get(d.courseModuleId) ?? 0,
          }))
          .sort((a, b) => a.title.localeCompare(b.title));

        this.myModules.set(myModules);
        this.allDocuments.set(myDocuments);
        this.isLoading.set(false);

        myDocuments.forEach((doc) => this.offlineService.check(doc.fileUrl));
      },
      error: () => {
        this.isLoading.set(false);
        this.loadError.set('Impossible de charger votre bibliothèque. Vérifiez votre connexion.');
      },
    });
  }

  selectModule(moduleId: string | null): void {
    this.selectedModuleId.set(moduleId);
  }

  isAvailableOffline(fileUrl: string): boolean {
    return this.offlineService.isAvailable(fileUrl);
  }
}