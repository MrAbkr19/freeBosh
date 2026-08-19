import { Component, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { MockApiService } from '../../services/mock-api';
import { AuthService } from '../../services/auth';
import { TeacherModuleCard } from '../../models/teacher-module-card';
import { TeacherActivityItem } from '../../models/teacher-activity-item';
import { formatRelativeDate } from '../../utils/document-formatting';

@Component({
  selector: 'app-teacher-home',
  standalone: true,
  imports: [],
  templateUrl: './teacher-home.html',
  styleUrl: './teacher-home.css',
})
export class TeacherHome {
  private readonly api = inject(MockApiService);
  private readonly authService = inject(AuthService);

  readonly currentUser = this.authService.currentUser;
  readonly isLoading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly modules = signal<TeacherModuleCard[]>([]);
  readonly activity = signal<TeacherActivityItem[]>([]);

  constructor() {
    this.loadDashboard();
  }

  private loadDashboard(): void {
    const teacher = this.currentUser();

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
      announcements: this.api.getAnnouncements(),
      users: this.api.getUsers(),
    }).subscribe({
      next: ({ modules, documents, announcements, users }) => {
        const myModules = modules.filter((m) => m.teacherIds.includes(teacher.id));

        const moduleCards: TeacherModuleCard[] = myModules.map((m) => ({
          id: m.id,
          code: m.code,
          name: m.name,
          badgeLabel: `${m.level} • ${m.faculty}`,
          documentCount: documents.filter((d) => d.courseModuleId === m.id).length,
          studentCount: users.filter(
            (u) => u.role === 'student' && u.filiere === m.faculty && u.niveau === m.level
          ).length,
        }));

        const myModuleIds = new Set(myModules.map((m) => m.id));
        const moduleNameById = new Map(myModules.map((m) => [m.id, m.name]));

        type ActivityWithSortDate = TeacherActivityItem & { sortDate: string };

        const documentActivity: ActivityWithSortDate[] = documents
          .filter((d) => d.teacherId === teacher.id && myModuleIds.has(d.courseModuleId))
          .map((d) => ({
            id: `doc-${d.id}`,
            icon: 'upload',
            description: `« ${d.title} » publié`,
            moduleName: moduleNameById.get(d.courseModuleId) ?? 'Module',
            dateLabel: formatRelativeDate(d.createdAt),
            sortDate: d.createdAt,
          }));

        const announcementActivity: ActivityWithSortDate[] = announcements
          .filter((a) => a.teacherId === teacher.id && myModuleIds.has(a.courseModuleId))
          .map((a) => ({
            id: `ann-${a.id}`,
            icon: 'campaign',
            description: 'Annonce publiée',
            moduleName: moduleNameById.get(a.courseModuleId) ?? 'Module',
            dateLabel: formatRelativeDate(a.createdAt),
            sortDate: a.createdAt,
          }));

        const combinedActivity: TeacherActivityItem[] = [...documentActivity, ...announcementActivity]
          .sort((a, b) => new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime())
          .slice(0, 5)
          .map(({ sortDate, ...rest }) => rest);

        this.modules.set(moduleCards);
        this.activity.set(combinedActivity);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.loadError.set('Impossible de charger votre tableau de bord. Vérifiez votre connexion.');
      },
    });
  }

  publierDocument(): void {
    // TODO: navigate to the "Publier un document" feature once it exists.
    console.log('Publier un document — pas encore implémenté');
  }

  faireAnnonce(): void {
    // TODO: navigate to the "Faire une annonce" feature once it exists.
    console.log('Faire une annonce — pas encore implémenté');
  }
}