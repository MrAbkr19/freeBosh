import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type TicketStatus = 'pending' | 'in_progress' | 'resolved';
export type TicketCategory = 'bug' | 'question' | 'evolution' | 'other';

export interface SupportTicket {
  id: string;
  date: string;
  subject: string;
  category: TicketCategory;
  description: string;
  status: TicketStatus;
  response?: string;
  responseDate?: string;
}

const STORAGE_KEY = 'freebosh_admin_support_tickets';

const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: '#REQ-4029',
    date: '12 Oct 2024',
    subject: "Erreur d'export des notes terminales",
    category: 'bug',
    description: "Une erreur 500 survient lors de l'export CSV des notes du semestre 2 pour la promotion Informatique L3.",
    status: 'pending',
  },
  {
    id: '#REQ-3982',
    date: '05 Oct 2024',
    subject: 'Création nouveau module de mathématiques',
    category: 'evolution',
    description: "Demande d'ajout de l'unité d'enseignement MAT302 - Algèbre linéaire avancée au cursus Math-Info.",
    status: 'resolved',
    response: 'Le module MAT302 a été créé avec succès et assigné au département Mathématiques.',
    responseDate: '06 Oct 2024',
  },
  {
    id: '#REQ-3810',
    date: '28 Sep 2024',
    subject: "Problème d'affichage planning salles",
    category: 'bug',
    description: "Les salles de TP 104 et 105 s'affichent en conflit horaire le jeudi matin dans l'arborescence.",
    status: 'resolved',
    response: "Le conflit a été résolu après synchronisation de l'index des créneaux.",
    responseDate: '29 Sep 2024',
  },
  {
    id: '#REQ-3755',
    date: '15 Sep 2024',
    subject: 'Augmentation du quota de fichiers polycopiés',
    category: 'evolution',
    description: 'Les cours de génie logiciel contiennent de volumineux diagrammes UML nécessitant plus de 50 Mo.',
    status: 'resolved',
    response: 'La taille maximale autorisée a été rehaussée dans les paramètres globaux.',
    responseDate: '16 Sep 2024',
  },
  {
    id: '#REQ-3640',
    date: '01 Sep 2024',
    subject: 'Authentification compte nouvel enseignant',
    category: 'question',
    description: 'Quelle est la procédure pour régénérer le mot de passe initial d’un enseignant vacataire ?',
    status: 'in_progress',
    response: "Le compte a été vérifié, un mail de réinitialisation d'accès a été transmis.",
    responseDate: '02 Sep 2024',
  },
];

@Component({
  selector: 'app-admin-support',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-support.html',
  styleUrl: './admin-support.css',
})
export class AdminSupport {
  readonly isLoading = signal(true);
  readonly loadError = signal<string | null>(null);

  // Form signals
  readonly subject = signal<string>('');
  readonly category = signal<TicketCategory | ''>('');
  readonly description = signal<string>('');
  readonly formError = signal<string | null>(null);
  readonly isSubmitting = signal<boolean>(false);

  // Tickets list signal
  readonly tickets = signal<SupportTicket[]>([]);

  // Filter & Pagination signals
  readonly statusFilter = signal<'all' | TicketStatus>('all');
  readonly currentPage = signal<number>(1);
  readonly itemsPerPage = 4;

  // Modals & Feedback
  readonly selectedTicket = signal<SupportTicket | null>(null);
  readonly isFaqModalOpen = signal<boolean>(false);
  readonly toastMessage = signal<string | null>(null);

  // Computed filtered tickets
  readonly filteredTickets = computed(() => {
    const list = this.tickets();
    const filter = this.statusFilter();
    if (filter === 'all') return list;
    return list.filter((t) => t.status === filter);
  });

  readonly totalItems = computed(() => this.filteredTickets().length);

  readonly totalPages = computed(() => {
    const total = this.totalItems();
    return total === 0 ? 1 : Math.ceil(total / this.itemsPerPage);
  });

  readonly paginatedTickets = computed(() => {
    const list = this.filteredTickets();
    const page = this.currentPage();
    const startIndex = (page - 1) * this.itemsPerPage;
    return list.slice(startIndex, startIndex + this.itemsPerPage);
  });

  readonly displayRangeText = computed(() => {
    const total = this.totalItems();
    if (total === 0) return 'Aucune requête trouvée';
    const page = this.currentPage();
    const start = (page - 1) * this.itemsPerPage + 1;
    const end = Math.min(page * this.itemsPerPage, total);
    return `Affichage de ${start} à ${end} sur ${total} requête${total > 1 ? 's' : ''}`;
  });

  constructor() {
    this.loadTickets();
  }

  private loadTickets(): void {
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
        this.tickets.set(INITIAL_TICKETS);
        this.isLoading.set(false);
      } catch {
        this.isLoading.set(false);
        this.loadError.set('Impossible de charger les tickets. Veuillez vérifier votre connexion.');
      }
    }, 350);
  }

  private saveTickets(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.tickets()));
    } catch (e) {
      console.error('Erreur de sauvegarde des tickets :', e);
    }
  }

  submitTicket(event?: Event): void {
    if (event) event.preventDefault();

    this.formError.set(null);
    const subj = this.subject().trim();
    const cat = this.category();
    const desc = this.description().trim();

    if (!subj) {
      this.formError.set('Veuillez saisir un sujet pour votre demande.');
      return;
    }
    if (!cat) {
      this.formError.set('Veuillez sélectionner une catégorie.');
      return;
    }
    if (!desc) {
      this.formError.set('Veuillez détailler votre demande.');
      return;
    }

    this.isSubmitting.set(true);

    setTimeout(() => {
      const newIdNum = Math.floor(1000 + Math.random() * 9000);
      const newTicket: SupportTicket = {
        id: `#REQ-${newIdNum}`,
        date: new Date().toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        subject: subj,
        category: cat as TicketCategory,
        description: desc,
        status: 'pending',
      };

      this.tickets.update((prev) => [newTicket, ...prev]);
      this.saveTickets();

      // Reset form
      this.subject.set('');
      this.category.set('');
      this.description.set('');
      this.isSubmitting.set(false);
      this.currentPage.set(1);

      this.showToast('Demande envoyée avec succès ! Notre équipe la traitera sous 4h.');
    }, 400);
  }

  openTicketDetails(ticket: SupportTicket): void {
    this.selectedTicket.set(ticket);
  }

  closeTicketDetails(): void {
    this.selectedTicket.set(null);
  }

  openFaqModal(): void {
    this.isFaqModalOpen.set(true);
  }

  closeFaqModal(): void {
    this.isFaqModalOpen.set(false);
  }

  setStatusFilter(filter: 'all' | TicketStatus): void {
    this.statusFilter.set(filter);
    this.currentPage.set(1);
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update((p) => p + 1);
    }
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update((p) => p - 1);
    }
  }

  getCategoryLabel(category: TicketCategory | string): string {
    switch (category) {
      case 'bug':
        return 'Bug technique';
      case 'question':
        return 'Question fonctionnelle';
      case 'evolution':
        return "Demande d'évolution";
      default:
        return 'Autre';
    }
  }

  getStatusLabel(status: TicketStatus): string {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'in_progress':
        return 'En cours';
      case 'resolved':
        return 'Traité';
    }
  }

  showToast(message: string): void {
    this.toastMessage.set(message);
    setTimeout(() => {
      this.toastMessage.set(null);
    }, 4000);
  }
}
