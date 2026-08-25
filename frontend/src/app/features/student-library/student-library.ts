import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { MockApiService } from '../../services/mock-api';
import { AuthService } from '../../services/auth';
import { OfflineAvailabilityService } from '../../services/offline-availability';
import { CourseModule } from '../../models/course-module';
import { StudentLibraryDocument } from '../../models/student-library-document';
import { typeIconFor, formatRelativeDate } from '../../utils/document-formatting';

@Component({
  selector: 'app-student-library',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './student-library.html',
  styleUrl: './student-library.css',
})
export class StudentLibrary {
  private readonly api = inject(MockApiService);
  private readonly authService = inject(AuthService);
  private readonly offlineService = inject(OfflineAvailabilityService);

  readonly isLoading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly myModules = signal<CourseModule[]>([]);
  readonly allDocuments = signal<StudentLibraryDocument[]>([]);

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
    const student = this.authService.currentUser();

    if (!student?.filiere || !student?.niveau) {
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
        const myModules = modules.filter(
          (m) => m.faculty === student.filiere && m.level === student.niveau
        );
        const moduleMap = new Map(myModules.map((m) => [m.id, m]));

        const myDocuments: StudentLibraryDocument[] = documents
          .filter((d) => moduleMap.has(d.courseModuleId))
          .map((d) => ({
            id: d.id,
            title: d.title,
            fileUrl: d.fileUrl,
            typeIcon: typeIconFor(d.fileUrl),
            moduleId: d.courseModuleId,
            moduleName: moduleMap.get(d.courseModuleId)?.name ?? 'Module',
            dateLabel: formatRelativeDate(d.createdAt),
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

  toggleOffline(fileUrl: string): void {
    this.offlineService.toggle(fileUrl);
  }
}