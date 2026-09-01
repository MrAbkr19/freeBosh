import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
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
  private readonly router = inject(Router);

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
      users: this.api.getUsersFull(),
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

  goToNewDepartment(): void {
    this.router.navigateByUrl('/admin/departements');
  }

  exportReport(): void {
    const rows = this.stats().map((s) => `${s.label},${s.value}`).join('\n');
    const csv = `Statistique,Valeur\n${rows}`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rapport-freebosh-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }
}