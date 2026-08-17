import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MockApiService } from '../../services/mock-api';
import { OfflineAvailabilityService } from '../../services/offline-availability';
import { CourseModule } from '../../models/course-module';
import { ModuleDocumentCard } from '../../models/module-document-card';
import { typeLabelFor, typeIconFor, formatFileSize } from '../../utils/document-formatting';

@Component({
  selector: 'app-module-detail',
  standalone: true,
  imports: [],
  templateUrl: './module-detail.html',
  styleUrl: './module-detail.css',
})
export class ModuleDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(MockApiService);
  private readonly offlineService = inject(OfflineAvailabilityService);

  readonly isLoading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly courseModule = signal<CourseModule | null>(null);
  readonly documents = signal<ModuleDocumentCard[]>([]);

  ngOnInit(): void {
    const moduleId = this.route.snapshot.paramMap.get('id');

    if (!moduleId) {
      this.loadError.set('Module introuvable.');
      this.isLoading.set(false);
      return;
    }

    this.loadModule(moduleId);
  }

  private loadModule(moduleId: string): void {
    this.isLoading.set(true);
    this.loadError.set(null);

    forkJoin({
      modules: this.api.getModules(),
      documents: this.api.getDocuments(moduleId),
    }).subscribe({
      next: ({ modules, documents }) => {
        const found = modules.find((m) => m.id === moduleId) ?? null;

        if (!found) {
          this.loadError.set('Module introuvable.');
          this.isLoading.set(false);
          return;
        }

        this.courseModule.set(found);

        const cards: ModuleDocumentCard[] = documents.map((doc) => ({
          id: doc.id,
          title: doc.title,
          description: doc.description,
          fileUrl: doc.fileUrl,
          typeLabel: typeLabelFor(doc.fileUrl),
          typeIcon: typeIconFor(doc.fileUrl),
          fileSizeLabel: formatFileSize(doc.fileSize),
        }));

        this.documents.set(cards);
        this.isLoading.set(false);

        cards.forEach((c) => this.offlineService.check(c.fileUrl));
      },
      error: () => {
        this.isLoading.set(false);
        this.loadError.set('Impossible de charger ce module. Vérifiez votre connexion.');
      },
    });
  }

  isAvailableOffline(fileUrl: string): boolean {
    return this.offlineService.isAvailable(fileUrl);
  }

  goToModules(): void {
    this.router.navigateByUrl('/etudiant/modules');
  }
}