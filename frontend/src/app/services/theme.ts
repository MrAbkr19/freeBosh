import { Injectable, signal, computed, effect } from '@angular/core';

export type ThemeMode = 'dark' | 'light' | 'system';

const THEME_STORAGE_KEY = 'freebosh-theme';
const DARK_THEME_COLOR = '#0c0c0e';
const LIGHT_THEME_COLOR = '#f8fafc';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly _mode = signal<ThemeMode>(this.getInitialMode());
  private readonly _systemIsDark = signal<boolean>(this.checkSystemDark());

  /** Selected mode: 'dark' | 'light' | 'system' */
  readonly mode = this._mode.asReadonly();

  /** Effective theme applied to the application ('dark' or 'light') */
  readonly effectiveTheme = computed<'dark' | 'light'>(() => {
    const m = this._mode();
    if (m === 'system') {
      return this._systemIsDark() ? 'dark' : 'light';
    }
    return m;
  });

  /** Backward-compatible helper */
  readonly isDark = computed(() => this.effectiveTheme() === 'dark');
  readonly theme = this.effectiveTheme;

  constructor() {
    this.listenToSystemChanges();

    // Initial immediate application
    this.applyTheme(this.effectiveTheme());

    // Reactive effect whenever effective theme changes
    effect(() => {
      this.applyTheme(this.effectiveTheme());
    });
  }

  /**
   * Directly sets the desired mode ('light', 'dark', or 'system')
   */
  setMode(mode: ThemeMode): void {
    this._mode.set(mode);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {
      // ignore
    }

    // Apply immediately to DOM for instantaneous user feedback
    this.applyTheme(this.effectiveTheme());
  }

  /**
   * Toggles between dark and light
   */
  toggleTheme(): void {
    const next: ThemeMode = this.isDark() ? 'light' : 'dark';
    this.setMode(next);
  }

  /** Alias for backward compatibility */
  setTheme(theme: ThemeMode): void {
    this.setMode(theme);
  }

  private getInitialMode(): ThemeMode {
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth <= 768 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      if (isMobile) {
        return 'system'; // Sur mobile : toujours en mode système
      }
    }

    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'dark' || saved === 'light' || saved === 'system') {
        return saved;
      }
    } catch {
      // fallback
    }

    return 'system';
  }

  private checkSystemDark(): boolean {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  }

  private listenToSystemChanges(): void {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (event: MediaQueryListEvent) => {
      this._systemIsDark.set(event.matches);
      if (this._mode() === 'system') {
        this.applyTheme(event.matches ? 'dark' : 'light');
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
    } else {
      mediaQuery.addListener(handler);
    }
  }

  private applyTheme(theme: 'dark' | 'light'): void {
    if (typeof document === 'undefined') return;

    // 1. Applique l'attribut data-theme à la racine <html>
    document.documentElement.setAttribute('data-theme', theme);

    // 2. Met à jour la couleur de la barre d'adresse mobile
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        theme === 'dark' ? DARK_THEME_COLOR : LIGHT_THEME_COLOR
      );
    }
  }
}
