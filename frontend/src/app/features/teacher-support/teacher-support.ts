import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

export interface TeacherTicket {
  id: string;
  date: string;
  category: string;
  subject: string;
  status: 'pending' | 'in_progress' | 'closed';
}

const STORAGE_KEY = 'freebosh_teacher_support_tickets';

const INITIAL_TEACHER_TICKETS: TeacherTicket[] = [
  {
    id: '#TRK-9042',
    date: '12 Nov 2023',
    category: 'Bug technique',
    subject: 'Erreur lors de la publication du module 3',
    status: 'closed',
  },
  {
    id: '#TRK-8815',
    date: '05 Nov 2023',
    category: "Demande d'évolution",
    subject: "Ajout d'outils de quiz interactifs",
    status: 'in_progress',
  },
];

@Component({
  selector: 'app-teacher-support',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './teacher-support.html',
  styleUrl: './teacher-support.css',
})
export class TeacherSupport {
  readonly isLoading = signal(true);
  readonly loadError = signal<string | null>(null);

  // Form signals
  readonly subject = signal<string>('');
  readonly category = signal<string>('');
  readonly description = signal<string>('');
  readonly isSubmitting = signal<boolean>(false);
  readonly formError = signal<string | null>(null);

  // Data signals
  readonly tickets = signal<TeacherTicket[]>([]);
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
            this.tickets.set(parsed);
            this.isLoading.set(false);
            return;
          }
        }
        this.tickets.set(INITIAL_TEACHER_TICKETS);
        this.isLoading.set(false);
      } catch {
        this.tickets.set(INITIAL_TEACHER_TICKETS);
        this.isLoading.set(false);
      }
    }, 250);
  }

  private saveTickets(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.tickets()));
    } catch (e) {
      console.error('Erreur sauvegarde tickets enseignant :', e);
    }
  }

  getCategoryLabel(val: string): string {
    switch (val) {
      case 'bug':
        return 'Bug technique';
      case 'functional':
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
      this.formError.set('Veuillez décrire votre problème en détail.');
      return;
    }

    this.isSubmitting.set(true);

    setTimeout(() => {
      const newTicket: TeacherTicket = {
        id: `#TRK-${Math.floor(1000 + Math.random() * 9000)}`,
        date: new Date().toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        category: this.getCategoryLabel(cat),
        subject: subj,
        status: 'pending',
      };

      this.tickets.update((prev) => [newTicket, ...prev]);
      this.saveTickets();

      // Reset form
      this.subject.set('');
      this.category.set('');
      this.description.set('');
      this.isSubmitting.set(false);

      this.showToast('Demande envoyée avec succès ! Notre équipe pédagogique vous répondra rapidement.');
    }, 350);
  }

  private showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => this.toastMessage.set(null), 3500);
  }
}
