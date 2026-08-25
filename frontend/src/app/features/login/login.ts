import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly showPassword = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly isLoading = signal(false);

  readonly loginForm = this.fb.nonNullable.group({
    matricule: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  togglePasswordVisibility(): void {
    this.showPassword.update((visible) => !visible);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);
    this.isLoading.set(true);

    const { matricule, password } = this.loginForm.getRawValue();

    this.authService.login(matricule, password).subscribe({
      next: (user) => {
        this.isLoading.set(false);
        this.router.navigateByUrl(this.authService.redirectPathFor(user.role));
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Matricule ou mot de passe incorrect. Veuillez réessayer.');
      },
    });
  }
}