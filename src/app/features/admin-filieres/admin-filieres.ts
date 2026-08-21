import { Component, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MockApiService } from '../../services/mock-api';
import { Department } from '../../models/department';
import { DegreeLevel } from '../../models/filiere';
import { FiliereRow } from '../../models/filiere-row';

@Component({
  selector: 'app-admin-filieres',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './admin-filieres.html',
  styleUrl: './admin-filieres.css',
})
export class AdminFilieres {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(MockApiService);

  readonly isLoading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly rows = signal<FiliereRow[]>([]);
  readonly departments = signal<Department[]>([]);

  readonly isModalOpen = signal(false);
  readonly isSubmitting = signal(false);
  readonly editingId = signal<string | null>(null);

  readonly degreeLevels: DegreeLevel[] = ['Licence', 'Master', 'Doctorat'];

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    departmentId: ['', Validators.required],
    degreeLevel: ['Licence' as DegreeLevel, Validators.required],
    description: [''],
  });

  constructor() {
    this.loadData();
  }

  private loadData(): void {
    this.isLoading.set(true);
    this.loadError.set(null);

    forkJoin({
      filieres: this.api.getFilieres(),
      departments: this.api.getDepartments(),
      users: this.api.getUsers(),
    }).subscribe({
      next: ({ filieres, departments, users }) => {
        const deptMap = new Map(departments.map((d) => [d.id, d.name]));

        this.rows.set(
          filieres.map((f) => ({
            id: f.id,
            name: f.name,
            departmentId: f.departmentId,
            departmentName: deptMap.get(f.departmentId) ?? '—',
            degreeLevel: f.degreeLevel,
            description: f.description ?? '',
            studentCount: users.filter((u) => u.role === 'student' && u.filiere === f.name).length,
          }))
        );

        this.departments.set(departments);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.loadError.set('Impossible de charger les filières. Vérifiez votre connexion.');
      },
    });
  }

  openCreateModal(): void {
    this.editingId.set(null);
    this.form.reset({ name: '', departmentId: '', degreeLevel: 'Licence', description: '' });
    this.isModalOpen.set(true);
  }

  openEditModal(row: FiliereRow): void {
    this.editingId.set(row.id);
    this.form.reset({
      name: row.name,
      departmentId: row.departmentId,
      degreeLevel: row.degreeLevel,
      description: row.description,
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
      this.api.updateFiliere(editingId, value).subscribe({ next: onSuccess, error: onError });
    } else {
      this.api.createFiliere(value).subscribe({ next: onSuccess, error: onError });
    }
  }
  }