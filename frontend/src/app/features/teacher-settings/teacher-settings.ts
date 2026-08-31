import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

export type TeacherFontSize = 'small' | 'medium' | 'large';

const STORAGE_KEY = 'freebosh_teacher_settings';

@Component({
  selector: 'app-teacher-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './teacher-settings.html',
  styleUrl: './teacher-settings.css',
})
export class TeacherSettings {
  readonly isLoading = signal(true);
  readonly loadError = signal<string | null>(null);

  // Preference signals
  readonly storageUsedMb = signal<number>(45);
  readonly maxStorageMb = signal<number>(300);
  readonly fontSize = signal<TeacherFontSize>('medium');
  readonly sereneMode = signal<boolean>(false);

  // Actions & Feedback
  readonly isCacheCleared = signal<boolean>(false);
  readonly toastMessage = signal<string | null>(null);

  readonly storagePercentage = computed(() => {
    const used = this.storageUsedMb();
    if (used <= 0) return 0;
    return Math.min(100, Math.round((used / this.maxStorageMb()) * 100));
  });

  constructor() {
    this.loadSettings();
  }

  private loadSettings(): void {
    this.isLoading.set(true);
    this.loadError.set(null);

    setTimeout(() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const data = JSON.parse(raw);
          if (data.fontSize) this.fontSize.set(data.fontSize);
          if (typeof data.sereneMode === 'boolean') this.sereneMode.set(data.sereneMode);
          if (typeof data.storageUsedMb === 'number') this.storageUsedMb.set(data.storageUsedMb);
        }
        this.isLoading.set(false);
      } catch {
        this.isLoading.set(false);
      }
    }, 250);
  }

  private saveSettings(): void {
    try {
      const payload = {
        fontSize: this.fontSize(),
        sereneMode: this.sereneMode(),
        storageUsedMb: this.storageUsedMb(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.error('Erreur sauvegarde paramètres enseignant :', e);
    }
  }

  onFontSizeChange(size: TeacherFontSize): void {
    this.fontSize.set(size);
    this.saveSettings();
  }

  toggleSereneMode(): void {
    this.sereneMode.update((v) => !v);
    this.saveSettings();
  }

  clearOfflineCache(): void {
    this.storageUsedMb.set(0);
    this.isCacheCleared.set(true);
    this.saveSettings();
    this.showToast('Cache hors-ligne vidé avec succès');

    setTimeout(() => {
      this.isCacheCleared.set(false);
    }, 2500);
  }

  private showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => this.toastMessage.set(null), 3000);
  }
}
