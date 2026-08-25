import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { initialsFor } from '../../utils/document-formatting';

function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const newPassword = control.get('newPassword')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return newPassword === confirmPassword ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-student-profile',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './student-profile.html',
  styleUrl: './student-profile.css',
})
export class StudentProfile {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly currentUser = this.authService.currentUser;

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

  get initials(): string {
    return initialsFor(this.currentUser()?.fullName);
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
    const student = this.currentUser();

    if (student?.password !== currentPassword) {
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