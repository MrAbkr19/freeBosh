import { Component, computed, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MockApiService } from '../../services/mock-api';
import { CourseModule } from '../../models/course-module';
import { User } from '../../models/user';
import { AdminTeacherRow } from '../../models/admin-teacher-row';
import { ModuleChecklistItem } from '../../models/module-checklist-item';

@Component({
  selector: 'app-admin-teachers',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './admin-teachers.html',
  styleUrl: './admin-teachers.css',
})
export class AdminTeachers {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(MockApiService);

  private allModules: CourseModule[] = [];

  readonly isLoading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly rows = signal<AdminTeacherRow[]>([]);
  readonly searchText = signal('');

  readonly filteredRows = computed(() => {
    const query = this.searchText().trim().toLowerCase();
    if (!query) return this.rows();

    return this.rows().filter(
      (r) => r.fullName.toLowerCase().includes(query) || r.matricule.toLowerCase().includes(query)
    );
  });

  readonly isCreateModalOpen = signal(false);
  readonly isCreating = signal(false);

  readonly createForm = this.fb.nonNullable.group({
    fullName: ['', Validators.required],
    matricule: ['', Validators.required],
  });

  readonly assignTarget = signal<AdminTeacherRow | null>(null);
  readonly checklist = signal<ModuleChecklistItem[]>([]);
  readonly isSavingAssignments = signal(false);

  constructor() {
    this.loadData();
  }

  private loadData(): void {
    this.isLoading.set(true);
    this.loadError.set(null);

    forkJoin({
      users: this.api.getUsers(),
      modules: this.api.getModules(),
    }).subscribe({
      next: ({ users, modules }) => {
        this.allModules = modules;
        const teachers = users.filter((u) => u.role === 'teacher');

        this.rows.set(
          teachers.map((t) => {
            const assignedModules = modules.filter((m) => m.teacherIds.includes(t.id));
            return {
              id: t.id,
              fullName: t.fullName,
              matricule: t.matricule,
              moduleNames: assignedModules.map((m) => m.name),
              isActive: assignedModules.length > 0,
            };
          })
        );

        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.loadError.set('Impossible de charger les enseignants. Vérifiez votre connexion.');
      },
    });
  }

  openCreateModal(): void {
    this.createForm.reset({ fullName: '', matricule: '' });
    this.isCreateModalOpen.set(true);
  }

  closeCreateModal(): void {
    this.isCreateModalOpen.set(false);
  }

  submitCreate(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    this.isCreating.set(true);
    const value = this.createForm.getRawValue();

    this.api.createTeacher(value).subscribe({
      next: () => {
        this.isCreating.set(false);
        this.closeCreateModal();
        this.loadData();
      },
      error: () => {
        this.isCreating.set(false);
      },
    });
  }

  openAssignModal(row: AdminTeacherRow): void {
    this.assignTarget.set(row);
    this.checklist.set(
      this.allModules.map((m) => ({
        id: m.id,
        code: m.code,
        name: m.name,
        checked: m.teacherIds.includes(row.id),
      }))
    );
  }

  closeAssignModal(): void {
    this.assignTarget.set(null);
  }

  toggleModule(moduleId: string, checked: boolean): void {
    this.checklist.update((items) =>
      items.map((item) => (item.id === moduleId ? { ...item, checked } : item))
    );
  }

  saveAssignments(): void {
    const target = this.assignTarget();
    if (!target) return;

    this.isSavingAssignments.set(true);

    const updates = this.checklist().map((item) => {
      const original = this.allModules.find((m) => m.id === item.id);
      if (!original) return null;

      const alreadyHas = original.teacherIds.includes(target.id);
      if (alreadyHas === item.checked) return null; // no change needed

      const newTeacherIds = item.checked
        ? [...original.teacherIds, target.id]
        : original.teacherIds.filter((id) => id !== target.id);

      return this.api.updateModule(item.id, { teacherIds: newTeacherIds });
    });

    const pending = updates.filter((u): u is NonNullable<typeof u> => u !== null);

    if (pending.length === 0) {
      this.isSavingAssignments.set(false);
      this.closeAssignModal();
      return;
    }

    let completed = 0;
    pending.forEach((update$) => {
      update$.subscribe(() => {
        completed++;
        if (completed === pending.length) {
          this.isSavingAssignments.set(false);
          this.closeAssignModal();
          this.loadData();
        }
      });
    });
  }
}