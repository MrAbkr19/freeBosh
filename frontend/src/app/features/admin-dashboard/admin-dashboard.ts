import { Component, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { MockApiService } from '../../services/mock-api';
import { AdminStat } from '../../models/admin-stat';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard {
  private readonly api = inject(MockApiService);

  readonly isLoading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly stats = signal<AdminStat[]>([]);

  constructor() {
    this.loadStats();
  }

  private loadStats(): void {
    this.isLoading.set(true);
    this.loadError.set(null);

    forkJoin({
      modules: this.api.getModules(),
      users: this.api.getUsers(),
    }).subscribe({
      next: ({ modules, users }) => {
        const filiereCount = new Set(modules.map((m) => m.faculty)).size;
        const teacherCount = users.filter((u) => u.role === 'teacher').length;
        const studentCount = users.filter((u) => u.role === 'student').length;

        this.stats.set([
          { label: 'Départements', value: '—', icon: 'domain', note: 'Bientôt disponible' },
          { label: 'Filières', value: String(filiereCount), icon: 'school' },
          { label: 'Salles / Modules', value: String(modules.length), icon: 'meeting_room' },
          { label: 'Enseignants', value: String(teacherCount), icon: 'person_4' },
          {
            label: 'Étudiants Inscrits',
            value: String(studentCount),
            icon: 'group',
            highlight: true,
          },
        ]);

        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.loadError.set('Impossible de charger les statistiques. Vérifiez votre connexion.');
      },
    });
  }
}