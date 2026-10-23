import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { User, userRole } from '../models/user';
import { MockApiService } from './mock-api';

const TOKEN_STORAGE_KEY = 'freebosh_token';
const USER_STORAGE_KEY = 'freebosh_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(MockApiService);
  private readonly _currentUser = signal<User | null>(this.readStoredUser());
  private readonly _token = signal<string | null>(this.readStoredToken());

  readonly currentUser = this._currentUser.asReadonly();
  readonly token = this._token.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);

  login(matricule: string, password: string): Observable<{ user: User; token: string }> {
    return this.api.login(matricule, password).pipe(
      tap(({ user, token }) => {
        this.setUser(user);
        this.setToken(token);
      })
    );
  }

  registerAdmin(input: {
    schoolName: string;
    fullName: string;
    email: string;
    password: string;
  }): Observable<{ user: User; token: string }> {
    return this.api.registerAdmin(input).pipe(
      tap(({ user, token }) => {
        this.setUser(user);
        this.setToken(token);
      })
    );
  }

  logout(): void {
    this.setUser(null);
    this.setToken(null);
  }

  private setUser(user: User | null): void {
    this._currentUser.set(user);
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }

  private readStoredUser(): User | null {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }

  private setToken(token: string | null): void {
    this._token.set(token);
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  }

  private readStoredToken(): string | null {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  }

  updateCurrentUserPassword(newPassword: string): void {
    const user = this._currentUser();
    if (user) {
      this.setUser({ ...user, password: newPassword });
    }
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