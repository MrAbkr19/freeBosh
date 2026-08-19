import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MockApiService } from '../../services/mock-api';
import { AuthService } from '../../services/auth';
import { CourseModule } from '../../models/course-module';

@Component({
  selector: 'app-make-announcement',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './make-announcement.html',
  styleUrl: './make-announcement.css',
})
export class MakeAnnouncement {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(MockApiService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly myModules = signal<CourseModule[]>([]);
  readonly loadingModules = signal(true);
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    moduleId: ['', Validators.required],
    content: ['', Validators.required],
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

  onSubmit(): void {
    const teacher = this.authService.currentUser();

    if (this.form.invalid || !teacher) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);
    this.isSubmitting.set(true);

    const { moduleId, content } = this.form.getRawValue();

    this.api
      .publishAnnouncement({
        content,
        courseModuleId: moduleId,
        teacherId: teacher.id,
      })
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.router.navigateByUrl('/enseignant/accueil');
        },
        error: () => {
          this.isSubmitting.set(false);
          this.errorMessage.set("Impossible d'envoyer l'annonce. Réessayez.");
        },
      });
  }

  cancel(): void {
    this.router.navigateByUrl('/enseignant/accueil');
  }
}