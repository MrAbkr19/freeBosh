import { Component, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { MockApiService } from '../../services/mock-api';
import { AuthService } from '../../services/auth';
import { OfflineAvailabilityService } from '../../services/offline-availability';
import { CourseDocument } from '../../models/document';
import { Announcement } from '../../models/announcement';
import { CourseModule } from '../../models/course-module';
import { User } from '../../models/user';
import { DocumentCard } from '../../models/document-card';
import { AnnouncementCard } from '../../models/announcement-card';
import { typeLabelFor, initialsFor, formatRelativeDate } from '../../utils/document-formatting';

@Component({
  selector: 'app-student-home',
  standalone: true,
  imports: [],
  templateUrl: './student-home.html',
  styleUrl: './student-home.css',
})
export class StudentHome {
  private readonly api = inject(MockApiService);
  private readonly authService = inject(AuthService);
  private readonly offlineService = inject(OfflineAvailabilityService);

  readonly currentUser = this.authService.currentUser;
  readonly isLoading = signal(true);
  readonly loadError = signal<string | null>(null);

  readonly documents = signal<DocumentCard[]>([]);
  readonly announcements = signal<AnnouncementCard[]>([]);

  constructor() {
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

        documentCards.forEach((doc) => this.offlineService.check(doc.fileUrl));
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
      typeLabel: typeLabelFor(doc.fileUrl),
      teacherName: teacher?.fullName ?? 'Enseignant',
      teacherInitials: initialsFor(teacher?.fullName),
      dateLabel: formatRelativeDate(doc.createdAt),
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
      dateLabel: formatRelativeDate(announcement.createdAt),
    };
  }

  isAvailableOffline(fileUrl: string): boolean {
    return this.offlineService.isAvailable(fileUrl);
  }
}