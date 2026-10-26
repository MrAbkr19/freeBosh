import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
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
  private readonly router = inject(Router);
  readonly themeService = inject(ThemeService);

  readonly isSubmitting = signal(false);
  readonly isSubmitted = signal(false);
  readonly submittedSchool = signal('');
  readonly submittedEmail = signal('');

  // Lien direct Google Forms alternatif
  readonly googleFormsUrl = signal('https://forms.google.com');

  readonly schoolForm = this.fb.group({
    schoolName: ['', [Validators.required, Validators.minLength(3)]],
    schoolType: ['Université publique', [Validators.required]],
    cityCountry: ['', [Validators.required, Validators.minLength(2)]],
    contactName: ['', [Validators.required, Validators.minLength(3)]],
    contactRole: ['Directeur / Doyen / Responsable', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.minLength(6)]],
    studentCount: ['500 à 2 000 étudiants', [Validators.required]],
    notes: [''],
  });

  isFieldInvalid(fieldName: string): boolean {
    const control = this.schoolForm.get(fieldName);
    return !!(control && control.invalid && (control.touched || control.dirty));
  }

  onSubmit(): void {
    if (this.schoolForm.invalid) {
      this.schoolForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const formData = this.schoolForm.getRawValue();

    // Enregistrement résilient en local storage pour l'historique administratif
    try {
      const existing = JSON.parse(localStorage.getItem('freebosh_school_requests') || '[]');
      existing.push({
        ...formData,
        id: `req_${Date.now()}`,
        submittedAt: new Date().toISOString(),
      });
      localStorage.setItem('freebosh_school_requests', JSON.stringify(existing));
    } catch {
      // Pas de blocage si le storage est restreint
    }

    setTimeout(() => {
      this.isSubmitting.set(false);
      this.submittedSchool.set(formData.schoolName || 'Votre établissement');
      this.submittedEmail.set(formData.email || '');
      this.isSubmitted.set(true);
    }, 600);
  }

  resetForm(): void {
    this.schoolForm.reset({
      schoolType: 'Université publique',
      contactRole: 'Directeur / Doyen / Responsable',
      studentCount: '500 à 2 000 étudiants',
    });
    this.isSubmitted.set(false);
  }
}

