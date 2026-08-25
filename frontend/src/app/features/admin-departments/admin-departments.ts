import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MockApiService } from '../../services/mock-api';
import { Department } from '../../models/department';

@Component({
  selector: 'app-admin-departments',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './admin-departments.html',
  styleUrl: './admin-departments.css',
})
export class AdminDepartments {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(MockApiService);

  readonly isLoading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly departments = signal<Department[]>([]);
  readonly isModalOpen = signal(false);
  readonly isSubmitting = signal(false);

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
  });

  constructor() {
    this.loadDepartments();
  }

  private loadDepartments(): void {
    this.isLoading.set(true);
    this.loadError.set(null);

    this.api.getDepartments().subscribe({
      next: (departments) => {
        this.departments.set(departments);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.loadError.set('Impossible de charger les départements. Vérifiez votre connexion.');
      },
    });
  }

  openModal(): void {
    this.form.reset();
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  submitCreate(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const { name } = this.form.getRawValue();

    this.api.createDepartment({ name, filiereCount: 0 }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.closeModal();
        this.loadDepartments();
      },
      error: () => {
        this.isSubmitting.set(false);
      },
    });
  }

  deleteDepartment(id: string): void {
    this.api.deleteDepartment(id).subscribe(() => this.loadDepartments());
  }
}