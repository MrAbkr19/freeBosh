import { Component, computed, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MockApiService } from '../../services/mock-api';
import { CourseModule } from '../../models/course-module';
import { Filiere } from '../../models/filiere';
import { User } from '../../models/user';
import { AdminModuleRow } from '../../models/admin-module-row';

@Component({
  selector: 'app-admin-modules',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './admin-module.html',
  styleUrl: './admin-module.css',
})
export class AdminModules {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(MockApiService);

  readonly isLoading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly rows = signal<AdminModuleRow[]>([]);
  readonly filieres = signal<Filiere[]>([]);
  readonly teachers = signal<User[]>([]);

  readonly selectedFaculty = signal<string>('');
  readonly selectedLevel = signal<string>('');

  readonly availableLevels = computed(() =>
    Array.from(new Set(this.rows().map((r) => r.level))).sort()
  );

  readonly filteredRows = computed(() => {
    const faculty = this.selectedFaculty();
    const level = this.selectedLevel();

    return this.rows().filter((r) => {
      const matchesFaculty = !faculty || r.faculty === faculty;
      const matchesLevel = !level || r.level === level;
      return matchesFaculty && matchesLevel;
    });
  });

  readonly isModalOpen = signal(false);
  readonly isSubmitting = signal(false);
  readonly editingId = signal<string | null>(null);

  readonly deleteTarget = signal<AdminModuleRow | null>(null);
  readonly isDeleting = signal(false);

  readonly form = this.fb.nonNullable.group({
    code: ['', Validators.required],
    name: ['', Validators.required],
    faculty: ['', Validators.required],
    level: ['', Validators.required],
    teacherIds: this.fb.nonNullable.control<string[]>([]),
  });

  constructor() {
    this.loadData();
  }

  private loadData(): void {
    this.isLoading.set(true);
    this.loadError.set(null);

    forkJoin({
      modules: this.api.getModules(),
      filieres: this.api.getFilieres(),
      users: this.api.getUsers(),
    }).subscribe({
      next: ({ modules, filieres, users }) => {
        const teacherMap = new Map(users.filter((u) => u.role === 'teacher').map((u) => [u.id, u]));

        this.rows.set(
          modules.map((m) => ({
            id: m.id,
            code: m.code,
            name: m.name,
            faculty: m.faculty,
            level: m.level,
            teacherNames: m.teacherIds
              .map((id) => teacherMap.get(id)?.fullName)
              .filter((name): name is string => !!name),
          }))
        );

        this.filieres.set(filieres);
        this.teachers.set(users.filter((u) => u.role === 'teacher'));
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.loadError.set('Impossible de charger les modules. Vérifiez votre connexion.');
      },
    });
  }

  isTeacherSelected(teacherId: string): boolean {
    return this.form.controls.teacherIds.value.includes(teacherId);
  }

  toggleTeacher(teacherId: string, checked: boolean): void {
    const current = this.form.controls.teacherIds.value;
    this.form.controls.teacherIds.setValue(
      checked ? [...current, teacherId] : current.filter((id) => id !== teacherId)
    );
  }

  openCreateModal(): void {
    this.editingId.set(null);
    this.form.reset({ code: '', name: '', faculty: '', level: '', teacherIds: [] });
    this.isModalOpen.set(true);
  }

  openEditModal(row: AdminModuleRow): void {
    this.editingId.set(row.id);

    const currentModule = this.rows().find((r) => r.id === row.id);
    const teacherIds = this.teachers()
      .filter((t) => currentModule?.teacherNames.includes(t.fullName))
      .map((t) => t.id);

    this.form.reset({
      code: row.code,
      name: row.name,
      faculty: row.faculty,
      level: row.level,
      teacherIds,
    });
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const value = this.form.getRawValue();
    const editingId = this.editingId();

    const onSuccess = () => {
      this.isSubmitting.set(false);
      this.closeModal();
      this.loadData();
    };

    const onError = () => {
      this.isSubmitting.set(false);
    };

    if (editingId) {
      this.api.updateModule(editingId, value).subscribe({ next: onSuccess, error: onError });
    } else {
      this.api.createModule(value).subscribe({ next: onSuccess, error: onError });
    }
  }

  confirmDelete(row: AdminModuleRow): void {
    this.deleteTarget.set(row);
  }

  cancelDelete(): void {
    this.deleteTarget.set(null);
  }

  executeDelete(): void {
    const target = this.deleteTarget();
    if (!target) return;

    this.isDeleting.set(true);
    this.api.deleteModule(target.id).subscribe(() => {
      this.isDeleting.set(false);
      this.deleteTarget.set(null);
      this.loadData();
    });
  }
}