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

  // Gestion des 2 étapes
  readonly currentStep = signal<1 | 2>(1);
  readonly step1Fields = ['schoolName', 'schoolType', 'cityCountry', 'studentCount'] as const;

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

  nextStep(): void {
    let hasError = false;
    for (const field of this.step1Fields) {
      const control = this.schoolForm.get(field);
      if (control && control.invalid) {
        control.markAsTouched();
        hasError = true;
      }
    }
    if (!hasError) {
      this.currentStep.set(2);
    }
  }

  prevStep(): void {
    this.currentStep.set(1);
  }

  goToStep(step: 1 | 2): void {
    if (step === 1) {
      this.prevStep();
    } else if (step === 2) {
      this.nextStep();
    }
  }

  onSubmit(): void {
    // Si l'étape 1 comporte des erreurs non résolues, revenir à l'étape 1
    let step1Error = false;
    for (const field of this.step1Fields) {
      const control = this.schoolForm.get(field);
      if (control && control.invalid) {
        control.markAsTouched();
        step1Error = true;
      }
    }

    if (step1Error) {
      this.currentStep.set(1);
      return;
    }

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
    this.currentStep.set(1);
    this.isSubmitted.set(false);
  }
}

