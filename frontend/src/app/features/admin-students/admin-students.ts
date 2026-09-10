import { Component, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MockApiService } from '../../services/mock-api';
import { Filiere } from '../../models/filiere';
import { AdminStudentRow } from '../../models/admin-student-row';

@Component({
  selector: 'app-admin-students',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './admin-students.html',
  styleUrl: './admin-students.css',
})
export class AdminStudents {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(MockApiService);

  readonly isLoading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly rows = signal<AdminStudentRow[]>([]);
  readonly filieres = signal<Filiere[]>([]);

  readonly searchText = signal('');
  readonly selectedFiliere = signal('');
  readonly selectedNiveau = signal('');

  readonly availableNiveaux = computed(() =>
    Array.from(new Set(this.rows().map((r) => r.niveau))).filter(Boolean).sort()
  );

  readonly filteredRows = computed(() => {
    const query = this.searchText().trim().toLowerCase();
    const filiere = this.selectedFiliere();
    const niveau = this.selectedNiveau();

    return this.rows().filter((r) => {
      const matchesSearch = !query || r.fullName.toLowerCase().includes(query);
      const matchesFiliere = !filiere || r.filiere === filiere;
      const matchesNiveau = !niveau || r.niveau === niveau;
      return matchesSearch && matchesFiliere && matchesNiveau;
    });
  });

  readonly isModalOpen = signal(false);
  readonly isSubmitting = signal(false);
  readonly editingId = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    fullName: ['', Validators.required],
    matricule: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    filiere: ['', Validators.required],
    niveau: ['', Validators.required],
  });

  constructor() {
    this.loadData();
  }

  private loadData(): void {
    this.isLoading.set(true);
    this.loadError.set(null);

        this.api.getUsersFull().subscribe({
      next: (users) => {
        const students = users.filter((u) => u.role === 'student');

        this.rows.set(
          students.map((s) => ({
            id: s.id,
            fullName: s.fullName,
            matricule: s.matricule,
            email: s.email ?? '—',
            filiere: s.filiere ?? '—',
            niveau: s.niveau ?? '—',
            status: s.status ?? 'inscrit',
          }))
        );

        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.loadError.set('Impossible de charger les étudiants. Vérifiez votre connexion.');
      },
    });

    this.api.getFilieres().subscribe((filieres) => this.filieres.set(filieres));
  }

  openCreateModal(): void {
    this.editingId.set(null);
    this.form.reset({ fullName: '', matricule: '', email: '', filiere: '', niveau: '' });
    this.isModalOpen.set(true);
  }

  openEditModal(row: AdminStudentRow): void {
    this.editingId.set(row.id);
    this.form.reset({
      fullName: row.fullName,
      matricule: row.matricule,
      email: row.email === '—' ? '' : row.email,
      filiere: row.filiere === '—' ? '' : row.filiere,
      niveau: row.niveau === '—' ? '' : row.niveau,
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
      this.api.updateUser(editingId, value).subscribe({ next: onSuccess, error: onError });
    } else {
      this.api.createStudent(value).subscribe({ next: onSuccess, error: onError });
    }
  }
}