import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { ThemeService } from '../../services/theme';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  readonly themeService = inject(ThemeService);

  readonly showPassword = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly isLoading = signal(false);

  readonly registerForm = this.fb.nonNullable.group({
    schoolName: ['', [Validators.required, Validators.minLength(2)]],
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.registerForm.get(fieldName);
    return !!(control && control.invalid && (control.touched || control.dirty));
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.errorMessage.set('Veuillez remplir correctement les 4 champs obligatoires.');
      return;
    }

    this.errorMessage.set(null);
    this.isLoading.set(true);

    const { schoolName, fullName, email, password } = this.registerForm.getRawValue();

    this.authService
      .registerAdmin({
        schoolName,
        fullName,
        email,
        password,
      })
      .subscribe({
        next: ({ user }) => {
          this.isLoading.set(false);
          // Redirection directe vers le tableau de bord administrateur
          this.router.navigateByUrl(this.authService.redirectPathFor(user.role));
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(
            err?.message || "Erreur lors de l'enregistrement de l'établissement. Veuillez réessayer."
          );
        },
      });
  }
}
