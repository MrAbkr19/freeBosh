import { Component, OnInit, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { MockApiService } from '../../services/mock-api';
import { AuthService } from '../../services/auth';
import { ConnectivityService } from '../../services/connectivity';
import { CourseDocument } from '../../models/document';
import { Announcement } from '../../models/announcement';
import { CourseModule } from '../../models/course-module';
import { User } from '../../models/user';
import { DocumentCard } from '../../models/document-card';
import { AnnouncementCard } from '../../models/announcement-card';

@Component({
  selector: 'app-student-home',
  standalone: true,
  imports: [],
  templateUrl: './student-home.html',
  styleUrl: './student-home.css',
})
  // ...rest of the class body stays exactly the same as before —
  // only the two `interface DocumentCard {...}` and
  // `interface AnnouncementCard {...}` blocks at the bottom are deleted,
  // since they now live in the model files above.

  export class StudentHome implements OnInit {
  private readonly api = inject(MockApiService);
  private readonly authService = inject(AuthService);
  readonly connectivity = inject(ConnectivityService);

  readonly currentUser = this.authService.currentUser;
  readonly isLoading = signal(true);
  readonly loadError = signal<string | null>(null);

  readonly documents = signal<DocumentCard[]>([]);
  readonly announcements = signal<AnnouncementCard[]>([]);
  readonly offlineAvailability = signal<Record<string, boolean>>({});

  ngOnInit(): void {
    this.loadDashboard();
  }

  private loadDashboard(): void {
    this.isLoading.set(true);
    this.loadError.set(null);

    forkJoin({
      modules: this.api.getModules(),
      documents: this.api.getDocuments(),
      announcements: this.api.getAnnouncements(),
      users: this.api.getUsers(),
    }).subscribe({
      next: ({ modules, documents, announcements, users }) => {
        const moduleMap = new Map(modules.map((m) => [m.id, m]));
        const userMap = new Map(users.map((u) => [u.id, u]));

        const documentCards = documents
          .slice()
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5)
          .map((doc) => this.toDocumentCard(doc, moduleMap, userMap));

        const announcementCards = announcements
          .slice()
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 3)
          .map((a) => this.toAnnouncementCard(a, moduleMap, userMap));

        this.documents.set(documentCards);
        this.announcements.set(announcementCards);
        this.isLoading.set(false);

        this.checkOfflineAvailability(documentCards);
      },
      error: () => {
        this.isLoading.set(false);
        this.loadError.set('Impossible de charger le contenu. Vérifiez votre connexion.');
      },
    });
  }

  private toDocumentCard(
    doc: CourseDocument,
    moduleMap: Map<string, CourseModule>,
    userMap: Map<string, User>
  ): DocumentCard {
    const teacher = userMap.get(doc.teacherId);
    const courseModule = moduleMap.get(doc.courseModuleId);

    return {
      id: doc.id,
      title: doc.title,
      description: doc.description,
      fileUrl: doc.fileUrl,
      moduleName: courseModule?.name ?? 'Module',
      typeLabel: this.typeLabelFor(doc.fileUrl),
      teacherName: teacher?.fullName ?? 'Enseignant',
      teacherInitials: this.initialsFor(teacher?.fullName),
      dateLabel: this.formatRelativeDate(doc.createdAt),
    };
  }

  private toAnnouncementCard(
    announcement: Announcement,
    moduleMap: Map<string, CourseModule>,
    userMap: Map<string, User>
  ): AnnouncementCard {
    const teacher = userMap.get(announcement.teacherId);
    const courseModule = moduleMap.get(announcement.courseModuleId);

    return {
      id: announcement.id,
      content: announcement.content,
      moduleName: courseModule?.name ?? 'Module',
      teacherName: teacher?.fullName ?? 'Enseignant',
      dateLabel: this.formatRelativeDate(announcement.createdAt),
    };
  }

  private typeLabelFor(fileUrl: string): string {
    const ext = fileUrl.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return 'PDF';
      case 'ppt':
      case 'pptx':
        return 'Diapositives';
      case 'epub':
        return 'eBook';
      default:
        return 'Document';
    }
  }

  private initialsFor(fullName?: string): string {
    if (!fullName) return '??';
    return fullName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  }

  private formatRelativeDate(isoDate: string): string {
    const date = new Date(isoDate);
    const now = new Date();
    const diffDays = Math.floor(
      (new Date(now.toDateString()).getTime() - new Date(date.toDateString()).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) return "Ajouté aujourd'hui";
    if (diffDays === 1) return 'Hier';

    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  }

  /**
   * Best-effort check of whether a document is already sitting in the
   * browser's Cache Storage (from the service worker's automatic caching,
   * or a future manual "save offline" action on the Vue Document screen).
   * Not 100% reliable across every browser, but good enough to drive
   * the icon shown on each card.
   */
  private checkOfflineAvailability(cards: DocumentCard[]): void {
    cards.forEach((card) => {
      fetch(card.fileUrl, { cache: 'only-if-cached', mode: 'same-origin' })
        .then((res) => {
          this.offlineAvailability.update((map) => ({ ...map, [card.id]: res.ok }));
        })
        .catch(() => {
          this.offlineAvailability.update((map) => ({ ...map, [card.id]: false }));
        });
    });
  }

  isAvailableOffline(id: string): boolean {
    return this.offlineAvailability()[id] ?? false;
  }
}