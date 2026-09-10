import { Injectable, signal, computed } from '@angular/core';

export type ThemeMode = 'dark' | 'light';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly _theme = signal<ThemeMode>(this.getInitialTheme());
  readonly theme = this._theme.asReadonly();
  readonly isDark = computed(() => this._theme() === 'dark');

  constructor() {
    this.applyTheme(this._theme());
  }

  toggleTheme(): void {
    const nextTheme: ThemeMode = this._theme() === 'dark' ? 'light' : 'dark';
    this._theme.set(nextTheme);
    this.applyTheme(nextTheme);
    try {
      localStorage.setItem('freebosh-theme', nextTheme);
    } catch {
      // ignore localStorage errors in restricted environments
    }
  }

  setTheme(theme: ThemeMode): void {
    if (this._theme() === theme) return;
    this._theme.set(theme);
    this.applyTheme(theme);
    try {
      localStorage.setItem('freebosh-theme', theme);
    } catch {
      // ignore localStorage errors in restricted environments
    }
  }

  private getInitialTheme(): ThemeMode {
    try {
      const saved = localStorage.getItem('freebosh-theme');
      if (saved === 'dark' || saved === 'light') {
        return saved;
      }
    } catch {
      // fallback
    }
    return 'dark'; // Dark mode by default
  }

  private applyTheme(theme: ThemeMode): void {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }
}
