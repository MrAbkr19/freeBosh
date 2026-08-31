import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MockApiService } from '../../services/mock-api';
import { AuthService } from '../../services/auth';
import { TeacherProfileModule } from '../../models/teacher-profile-module';
import { initialsFor } from '../../utils/document-formatting';

const MODULE_ICONS = ['data_object', 'database', 'science', 'calculate', 'menu_book', 'public'];

function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const newPassword = control.get('newPassword')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return newPassword === confirmPassword ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-teacher-profile',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './teacher-profile.html',
  styleUrl: './teacher-profile.css',
})
export class TeacherProfile {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(MockApiService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly currentUser = this.authService.currentUser;
  readonly isLoading = signal(true);
  readonly modules = signal<TeacherProfileModule[]>([]);

  readonly isModalOpen = signal(false);
  readonly passwordError = signal<string | null>(null);
  readonly passwordSuccess = signal(false);

  readonly passwordForm = this.fb.nonNullable.group(
    {
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordsMatchValidator }
  );

  constructor() {
    this.loadModules();
  }

  get initials(): string {
    return initialsFor(this.currentUser()?.fullName);
  }

  private loadModules(): void {
    const teacher = this.currentUser();

    if (!teacher) {
      this.isLoading.set(false);
      return;
    }

    this.api.getModules().subscribe({
      next: (modules) => {
        const myModules = modules.filter((m) => m.teacherIds.includes(teacher.id));

        this.modules.set(
          myModules.map((m, index) => ({
            id: m.id,
            name: m.name,
            badgeLabel: `${m.level} ${m.faculty}`,
            icon: MODULE_ICONS[index % MODULE_ICONS.length],
          }))
        );

        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  openModal(): void {
    this.passwordForm.reset();
    this.passwordError.set(null);
    this.passwordSuccess.set(false);
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  submitPasswordChange(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const { currentPassword, newPassword } = this.passwordForm.getRawValue();
    const teacher = this.currentUser();

    if (teacher?.password !== currentPassword) {
      this.passwordError.set('Mot de passe actuel incorrect.');
      return;
    }

    this.passwordError.set(null);
    this.authService.updateCurrentUserPassword(newPassword);
    this.passwordSuccess.set(true);

    setTimeout(() => this.closeModal(), 1200);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/');
  }
}