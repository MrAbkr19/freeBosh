import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

export type FontSizeOption = 'small' | 'normal' | 'large';

const STORAGE_KEY = 'freebosh_student_settings';

@Component({
  selector: 'app-student-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './student-settings.html',
  styleUrl: './student-settings.css',
})
export class StudentSettings {
  readonly isLoading = signal(true);
  readonly loadError = signal<string | null>(null);

  // Preference signals
  readonly fontSize = signal<FontSizeOption>('normal');
  readonly sereneMode = signal<boolean>(false);
  readonly storageUsedMb = signal<number>(124);
  readonly maxStorageMb = signal<number>(350);

  // Modal & feedback signals
  readonly isConfirmModalOpen = signal<boolean>(false);
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
      console.error('Erreur sauvegarde paramètres :', e);
    }
  }

  setFontSize(size: FontSizeOption): void {
    this.fontSize.set(size);
    this.saveSettings();
  }

  toggleSereneMode(): void {
    this.sereneMode.update((v) => !v);
    this.saveSettings();
  }

  openConfirmModal(): void {
    this.isConfirmModalOpen.set(true);
  }

  closeConfirmModal(): void {
    this.isConfirmModalOpen.set(false);
  }

  confirmClearCache(): void {
    this.storageUsedMb.set(0);
    this.isCacheCleared.set(true);
    this.saveSettings();
    this.closeConfirmModal();

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
