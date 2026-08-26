import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface FileFormatOption {
  code: string;
  label: string;
  checked: boolean;
}

export interface AdminSystemSettings {
  maxFileSize: number;
  acceptedFormats: FileFormatOption[];
  sessionTimeout: number;
}

export interface AdminSchoolSettings {
  schoolName: string;
  academicYear: string;
  semesters: string[];
}

export interface AdminOfflineSettings {
  storageQuotaMb: number;
  cacheExpirationDays: number;
  autoSyncOnReconnect: boolean;
}

const STORAGE_KEY = 'freebosh_admin_settings';

const DEFAULT_SYSTEM_SETTINGS: AdminSystemSettings = {
  maxFileSize: 50,
  acceptedFormats: [
    { code: 'PDF', label: 'PDF', checked: true },
    { code: 'JPG', label: 'JPG', checked: true },
    { code: 'PNG', label: 'PNG', checked: true },
    { code: 'DOCX', label: 'DOCX', checked: false },
    { code: 'ZIP', label: 'ZIP', checked: false },
  ],
  sessionTimeout: 120,
};

const DEFAULT_SCHOOL_SETTINGS: AdminSchoolSettings = {
  schoolName: 'Université de FreeBosh',
  academicYear: '2025-2026',
  semesters: ['Semestre 1', 'Semestre 2'],
};

const DEFAULT_OFFLINE_SETTINGS: AdminOfflineSettings = {
  storageQuotaMb: 150,
  cacheExpirationDays: 90,
  autoSyncOnReconnect: true,
};

@Component({
  selector: 'app-admin-settings',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-settings.html',
  styleUrl: './admin-settings.css',
})
export class AdminSettings implements OnInit {
  // System settings signals
  readonly maxFileSize = signal<number>(DEFAULT_SYSTEM_SETTINGS.maxFileSize);
  readonly acceptedFormats = signal<FileFormatOption[]>([...DEFAULT_SYSTEM_SETTINGS.acceptedFormats]);
  readonly sessionTimeout = signal<number>(DEFAULT_SYSTEM_SETTINGS.sessionTimeout);

  // School settings signals
  readonly schoolName = signal<string>(DEFAULT_SCHOOL_SETTINGS.schoolName);
  readonly academicYear = signal<string>(DEFAULT_SCHOOL_SETTINGS.academicYear);
  readonly semesters = signal<string[]>([...DEFAULT_SCHOOL_SETTINGS.semesters]);
  readonly newSemesterInput = signal<string>('');

  // Offline PWA settings signals
  readonly storageQuotaMb = signal<number>(DEFAULT_OFFLINE_SETTINGS.storageQuotaMb);
  readonly cacheExpirationDays = signal<number>(DEFAULT_OFFLINE_SETTINGS.cacheExpirationDays);
  readonly autoSyncOnReconnect = signal<boolean>(DEFAULT_OFFLINE_SETTINGS.autoSyncOnReconnect);

  // Toast / feedback states
  readonly sysToastVisible = signal<boolean>(false);
  readonly schoolToastVisible = signal<boolean>(false);
  readonly offlineToastVisible = signal<boolean>(false);
  readonly isSavingSys = signal<boolean>(false);
  readonly isSavingSchool = signal<boolean>(false);
  readonly isSavingOffline = signal<boolean>(false);

  readonly availableAcademicYears = ['2023-2024', '2024-2025', '2025-2026', '2026-2027'];

  ngOnInit(): void {
    this.loadPersistedSettings();
  }

  private loadPersistedSettings(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);

      if (data.system) {
        if (typeof data.system.maxFileSize === 'number') this.maxFileSize.set(data.system.maxFileSize);
        if (Array.isArray(data.system.acceptedFormats)) this.acceptedFormats.set(data.system.acceptedFormats);
        if (typeof data.system.sessionTimeout === 'number') this.sessionTimeout.set(data.system.sessionTimeout);
      }

      if (data.school) {
        if (data.school.schoolName) this.schoolName.set(data.school.schoolName);
        if (data.school.academicYear) this.academicYear.set(data.school.academicYear);
        if (Array.isArray(data.school.semesters)) this.semesters.set(data.school.semesters);
      }

      if (data.offline) {
        if (typeof data.offline.storageQuotaMb === 'number') this.storageQuotaMb.set(data.offline.storageQuotaMb);
        if (typeof data.offline.cacheExpirationDays === 'number') this.cacheExpirationDays.set(data.offline.cacheExpirationDays);
        if (typeof data.offline.autoSyncOnReconnect === 'boolean') this.autoSyncOnReconnect.set(data.offline.autoSyncOnReconnect);
      }
    } catch (e) {
      console.warn('Impossible de charger les paramètres locaux :', e);
    }
  }

  private persistCurrentSettings(): void {
    try {
      const payload = {
        system: {
          maxFileSize: this.maxFileSize(),
          acceptedFormats: this.acceptedFormats(),
          sessionTimeout: this.sessionTimeout(),
        },
        school: {
          schoolName: this.schoolName(),
          academicYear: this.academicYear(),
          semesters: this.semesters(),
        },
        offline: {
          storageQuotaMb: this.storageQuotaMb(),
          cacheExpirationDays: this.cacheExpirationDays(),
          autoSyncOnReconnect: this.autoSyncOnReconnect(),
        },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.error('Erreur de sauvegarde des paramètres :', e);
    }
  }

  toggleFormat(code: string): void {
    this.acceptedFormats.update((formats) =>
      formats.map((f) => (f.code === code ? { ...f, checked: !f.checked } : f))
    );
  }

  saveSystemSettings(): void {
    this.isSavingSys.set(true);
    setTimeout(() => {
      this.persistCurrentSettings();
      this.isSavingSys.set(false);
      this.sysToastVisible.set(true);
      setTimeout(() => this.sysToastVisible.set(false), 3000);
    }, 300);
  }

  saveSchoolSettings(): void {
    this.isSavingSchool.set(true);
    setTimeout(() => {
      this.persistCurrentSettings();
      this.isSavingSchool.set(false);
      this.schoolToastVisible.set(true);
      setTimeout(() => this.schoolToastVisible.set(false), 3000);
    }, 300);
  }

  saveOfflineSettings(): void {
    this.isSavingOffline.set(true);
    setTimeout(() => {
      this.persistCurrentSettings();
      this.isSavingOffline.set(false);
      this.offlineToastVisible.set(true);
      setTimeout(() => this.offlineToastVisible.set(false), 3000);
    }, 300);
  }

  updateSemester(index: number, event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = target?.value ?? '';
    this.semesters.update((list) => {
      const copy = [...list];
      copy[index] = value;
      return copy;
    });
  }

  addSemester(): void {
    const nextNum = this.semesters().length + 1;
    const name = `Semestre ${nextNum}`;
    this.semesters.update((list) => [...list, name]);
  }

  removeSemester(index: number): void {
    if (this.semesters().length <= 1) {
      alert('Il faut au moins une période académique.');
      return;
    }
    this.semesters.update((list) => list.filter((_, i) => i !== index));
  }

  resetDefaults(): void {
    if (confirm('Voulez-vous réinitialiser tous les paramètres aux valeurs par défaut ?')) {
      this.maxFileSize.set(DEFAULT_SYSTEM_SETTINGS.maxFileSize);
      this.acceptedFormats.set([...DEFAULT_SYSTEM_SETTINGS.acceptedFormats]);
      this.sessionTimeout.set(DEFAULT_SYSTEM_SETTINGS.sessionTimeout);

      this.schoolName.set(DEFAULT_SCHOOL_SETTINGS.schoolName);
      this.academicYear.set(DEFAULT_SCHOOL_SETTINGS.academicYear);
      this.semesters.set([...DEFAULT_SCHOOL_SETTINGS.semesters]);

      this.storageQuotaMb.set(DEFAULT_OFFLINE_SETTINGS.storageQuotaMb);
      this.cacheExpirationDays.set(DEFAULT_OFFLINE_SETTINGS.cacheExpirationDays);
      this.autoSyncOnReconnect.set(DEFAULT_OFFLINE_SETTINGS.autoSyncOnReconnect);

      this.persistCurrentSettings();
      this.sysToastVisible.set(true);
      this.schoolToastVisible.set(true);
      setTimeout(() => {
        this.sysToastVisible.set(false);
        this.schoolToastVisible.set(false);
      }, 2500);
    }
  }
}
