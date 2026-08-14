import { Injectable, signal, computed } from '@angular/core';
import { User, userRole } from '../models/user';
import { MOCK_USERS } from '../data/mock-users';
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _currentUser = signal<User | null>(null);

  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);

  /**
   * Mock login — validates against MOCK_USERS.
   * Returns the matched User on success, or null on failure.
   */
  login(matricule: string, password: string): User | null {
    const match = MOCK_USERS.find(
      (u) => u.matricule === matricule.trim() && u.password === password
    );

    if (match) {
      this._currentUser.set(match);
      return match;
    }

    return null;
  }

  logout(): void {
    this._currentUser.set(null);
  }

  /** Determines the landing route based on the authenticated user's role. */
  redirectPathFor(role: userRole): string {
    switch (role) {
      case 'student':
        return '/etudiant/accueil';
      case 'teacher':
        return '/enseignant/publication';
      case 'admin':
        return '/admin/dashboard';
    }
  }
}