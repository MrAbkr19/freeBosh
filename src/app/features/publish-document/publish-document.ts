import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MockApiService } from '../../services/mock-api';
import { AuthService } from '../../services/auth';
import { CourseModule } from '../../models/course-module';

@Component({
  selector: 'app-publish-document',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './publish-document.html',
  styleUrl: './publish-document.css',
})
export class PublishDocument {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(MockApiService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly myModules = signal<CourseModule[]>([]);
  readonly loadingModules = signal(true);
  readonly selectedFile = signal<File | null>(null);
  readonly isDragging = signal(false);
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    moduleId: ['', Validators.required],
    title: ['', Validators.required],
    description: [''],
  });

  constructor() {
    this.loadMyModules();
  }

  private loadMyModules(): void {
    const teacher = this.authService.currentUser();

    if (!teacher) {
      this.loadingModules.set(false);
      return;
    }

    this.api.getModules().subscribe({
      next: (modules) => {
        this.myModules.set(modules.filter((m) => m.teacherIds.includes(teacher.id)));
        this.loadingModules.set(false);
      },
      error: () => {
        this.loadingModules.set(false);
      },
    });
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave(): void {
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.selectedFile.set(file);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.selectedFile.set(file);
    }
  }

  removeFile(): void {
    this.selectedFile.set(null);
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024 * 1024) {
      return `${Math.round(bytes / 1024)} Ko`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  }

  onSubmit(): void {
    const file = this.selectedFile();
    const teacher = this.authService.currentUser();

    if (this.form.invalid || !file || !teacher) {
      this.form.markAllAsTouched();
      if (!file) {
        this.errorMessage.set('Veuillez sélectionner un fichier.');
      }
      return;
    }

    this.errorMessage.set(null);
    this.isSubmitting.set(true);

    const { moduleId, title, description } = this.form.getRawValue();

    this.api
      .publishDocument({
        title,
        description,
        courseModuleId: moduleId,
        teacherId: teacher.id,
        fileName: file.name,
        fileSize: file.size,
      })
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.router.navigateByUrl('/enseignant/accueil');
        },
        error: () => {
          this.isSubmitting.set(false);
          this.errorMessage.set('Impossible de publier le document. Réessayez.');
        },
      });
  }

  cancel(): void {
    this.router.navigateByUrl('/enseignant/accueil');
  }
}