import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { MockApiService } from '../../services/mock-api';
import { CourseModule } from '../../models/course-module';
import { TeacherModuleDocument} from '../../models/teacher-module-documents'
import { TeacherModuleAnnouncement } from '../../models/teacher-module-announcement';
import { typeLabelFor, typeIconFor, formatFileSize, formatRelativeDate } from '../../utils/document-formatting';

@Component({
  selector: 'app-teacher-module-detail',
  standalone: true,
  imports: [],
  templateUrl: './teacher-module-detail.html',
  styleUrl: './teacher-module-detail.css',
})
export class TeacherModuleDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(MockApiService);

  readonly isLoading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly courseModule = signal<CourseModule | null>(null);
  readonly documents = signal<TeacherModuleDocument[]>([]);
  readonly announcements = signal<TeacherModuleAnnouncement[]>([]);

  private currentModuleId: string | null = null;

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const moduleId = params.get('id');

      if (!moduleId) {
        this.loadError.set('Module introuvable.');
        this.isLoading.set(false);
        return;
      }

      this.currentModuleId = moduleId;
      this.loadModule(moduleId);
    });
  }

  private loadModule(moduleId: string): void {
    this.isLoading.set(true);
    this.loadError.set(null);

    forkJoin({
      modules: this.api.getModules(),
      documents: this.api.getDocuments(moduleId),
      announcements: this.api.getAnnouncements(moduleId),
    }).subscribe({
      next: ({ modules, documents, announcements }) => {
        const found = modules.find((m) => m.id === moduleId) ?? null;

        if (!found) {
          this.loadError.set('Module introuvable.');
          this.isLoading.set(false);
          return;
        }

        this.courseModule.set(found);

        this.documents.set(
          documents
            .slice()
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((d) => ({
              id: d.id,
              title: d.title,
              description: d.description,
              typeLabel: typeLabelFor(d.fileUrl),
              typeIcon: typeIconFor(d.fileUrl),
              fileSizeLabel: formatFileSize(d.fileSize),
              dateLabel: formatRelativeDate(d.createdAt),
            }))
        );

        this.announcements.set(
          announcements
            .slice()
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((a) => ({
              id: a.id,
              content: a.content,
              dateLabel: formatRelativeDate(a.createdAt),
            }))
        );

        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.loadError.set('Impossible de charger ce module. Vérifiez votre connexion.');
      },
    });
  }

  goToModules(): void {
    this.router.navigateByUrl('/enseignant/modules');
  }

  publierDocument(): void {
    if (this.currentModuleId) {
      this.router.navigate(['/enseignant/publier'], { queryParams: { moduleId: this.currentModuleId } });
    }
  }

  faireAnnonce(): void {
    if (this.currentModuleId) {
      this.router.navigate(['/enseignant/annoncer'], { queryParams: { moduleId: this.currentModuleId } });
    }
  }
}