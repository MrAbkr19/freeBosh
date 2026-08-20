import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { User, userRole } from '../models/user';
import { MockApiService } from './mock-api';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(MockApiService);
  private readonly _currentUser = signal<User | null>(null);

  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);
  /** Session-only password change — not persisted past reload (no real backend yet). */
  updateCurrentUserPassword(newPassword: string): void {
    const user = this._currentUser();
    if (user) {
      this._currentUser.set({ ...user, password: newPassword });
    }
  }
  login(matricule: string, password: string): Observable<User> {
    return this.api.login(matricule, password).pipe(
      tap((user) => this._currentUser.set(user))
    );
  }

  logout(): void {
    this._currentUser.set(null);
  }

  redirectPathFor(role: userRole): string {
    switch (role) {
      case 'student':
        return '/etudiant/accueil';
      case 'teacher':
        return '/enseignant/accueil';
      case 'admin':
        return '/admin/dashboard';
    }
  }
}