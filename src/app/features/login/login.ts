import { Component, signal } from '@angular/core';
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
  private readonly fb = new FormBuilder();
  private readonly router = new Router();

  constructor(private readonly auth:AuthService) {}

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

    // Simulated network delay so the loading state is visible in the demo
    setTimeout(() => {
      const user = this.auth.login(matricule, password);
      this.isLoading.set(false);

      if (user) {
        const path = this.auth.redirectPathFor(user.role);
        this.router.navigateByUrl(path);
      } else {
        this.errorMessage.set('Matricule ou mot de passe incorrect. Veuillez réessayer.');
      }
    }, 500);
  }
}