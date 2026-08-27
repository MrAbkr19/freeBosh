import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

export interface StudentSupportRequest {
  id: string;
  date: string;
  category: string;
  subject: string;
  status: 'pending' | 'resolved';
}

const STORAGE_KEY = 'freebosh_student_support_requests';

const INITIAL_REQUESTS: StudentSupportRequest[] = [
  {
    id: 'req-1',
    date: '12 Oct 2023',
    category: 'Bug technique',
    subject: 'Erreur lors du téléchargement du PDF',
    status: 'pending',
  },
  {
    id: 'req-2',
    date: '05 Oct 2023',
    category: 'Question fonctionnelle',
    subject: 'Comment accéder aux archives ?',
    status: 'resolved',
  },
];

@Component({
  selector: 'app-student-support',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './student-support.html',
  styleUrl: './student-support.css',
})
export class StudentSupport {
  readonly isLoading = signal(true);
  readonly loadError = signal<string | null>(null);

  // Form signals
  readonly subject = signal<string>('');
  readonly category = signal<string>('');
  readonly description = signal<string>('');
  readonly isSubmitting = signal<boolean>(false);
  readonly formError = signal<string | null>(null);

  // Requests history signal
  readonly requests = signal<StudentSupportRequest[]>([]);
  readonly toastMessage = signal<string | null>(null);

  constructor() {
    this.loadData();
  }

  private loadData(): void {
    this.isLoading.set(true);
    this.loadError.set(null);

    setTimeout(() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.requests.set(parsed);
            this.isLoading.set(false);
            return;
          }
        }
        this.requests.set(INITIAL_REQUESTS);
        this.isLoading.set(false);
      } catch {
        this.requests.set(INITIAL_REQUESTS);
        this.isLoading.set(false);
      }
    }, 250);
  }

  private saveRequests(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.requests()));
    } catch (e) {
      console.error('Erreur sauvegarde requêtes étudiant :', e);
    }
  }

  getCategoryLabel(val: string): string {
    switch (val) {
      case 'bug':
        return 'Bug technique';
      case 'question':
        return 'Question fonctionnelle';
      case 'feature':
        return "Demande d'évolution";
      default:
        return 'Autre';
    }
  }

  submitForm(event?: Event): void {
    if (event) event.preventDefault();
    this.formError.set(null);

    const subj = this.subject().trim();
    const cat = this.category();
    const desc = this.description().trim();

    if (!subj) {
      this.formError.set('Veuillez renseigner le sujet de votre demande.');
      return;
    }
    if (!cat) {
      this.formError.set('Veuillez sélectionner une catégorie.');
      return;
    }
    if (!desc) {
      this.formError.set('Veuillez fournir une description détaillée.');
      return;
    }

    this.isSubmitting.set(true);

    setTimeout(() => {
      const newRequest: StudentSupportRequest = {
        id: `req-${Date.now()}`,
        date: new Date().toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        category: this.getCategoryLabel(cat),
        subject: subj,
        status: 'pending',
      };

      this.requests.update((prev) => [newRequest, ...prev]);
      this.saveRequests();

      // Reset form
      this.subject.set('');
      this.category.set('');
      this.description.set('');
      this.isSubmitting.set(false);

      this.showToast('Demande envoyée avec succès ! Notre équipe vous répondra rapidement.');
    }, 350);
  }

  private showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => this.toastMessage.set(null), 3500);
  }
}
