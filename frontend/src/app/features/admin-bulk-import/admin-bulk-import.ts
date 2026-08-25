import { Component, computed, inject, signal } from '@angular/core';
import { MockApiService } from '../../services/mock-api';
import { ImportRow } from '../../models/import-row';

@Component({
  selector: 'app-admin-bulk-import',
  standalone: true,
  imports: [],
  templateUrl: './admin-bulk-import.html',
  styleUrl: './admin-bulk-import.css',
})
export class AdminBulkImport {
  private readonly api = inject(MockApiService);

  readonly isDragging = signal(false);
  readonly fileName = signal<string | null>(null);
  readonly rows = signal<ImportRow[]>([]);
  readonly isImporting = signal(false);
  readonly importComplete = signal(false);

  readonly validRows = computed(() => this.rows().filter((r) => r.isValid));
  readonly errorRows = computed(() => this.rows().filter((r) => !r.isValid));
  readonly previewRows = computed(() => this.rows().slice(0, 5));

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave(): void {
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
    const file = event.dataTransfer?.files?.[0];
    if (file) this.readFile(file);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.readFile(file);
  }

  private readFile(file: File): void {
    this.fileName.set(file.name);
    this.importComplete.set(false);

    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      this.rows.set(this.parseCsv(text));
    };
    reader.readAsText(file);
  }

  /**
   * Minimal comma-split CSV parser — does NOT handle quoted fields
   * containing commas. Expected header order:
   * ID Étudiant, Nom, Prénom, Email, Département
   */
  private parseCsv(text: string): ImportRow[] {
    const lines = text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length <= 1) return [];

    const dataLines = lines.slice(1); // skip header

    return dataLines.map((line) => {
      const cells = line.split(',').map((c) => c.trim());
      const [studentId = '', nom = '', prenom = '', email = '', departement = ''] = cells;

      const missing: string[] = [];
      if (!studentId) missing.push('ID Étudiant');
      if (!nom) missing.push('Nom');
      if (!prenom) missing.push('Prénom');
      if (!email) missing.push('Email');

      return {
        studentId,
        nom,
        prenom,
        email,
        departement,
        isValid: missing.length === 0,
        errorReason: missing.length > 0 ? `Champ(s) manquant(s) : ${missing.join(', ')}` : undefined,
      };
    });
  }

  cancel(): void {
    this.fileName.set(null);
    this.rows.set([]);
    this.importComplete.set(false);
  }

  confirmImport(): void {
    const toImport = this.validRows();
    if (toImport.length === 0) return;

    this.isImporting.set(true);

    let completed = 0;
    toImport.forEach((row) => {
      this.api
        .createStudent({
          fullName: `${row.prenom} ${row.nom}`,
          matricule: row.studentId,
          email: row.email,
          filiere: '',
          niveau: '',
        })
        .subscribe(() => {
          completed++;
          if (completed === toImport.length) {
            this.isImporting.set(false);
            this.importComplete.set(true);
          }
        });
    });
  }

  downloadErrorReport(): void {
    const errors = this.errorRows();
    if (errors.length === 0) return;

    const header = 'ID Étudiant,Nom,Prénom,Email,Département,Erreur\n';
    const lines = errors
      .map(
        (r) =>
          `${r.studentId},${r.nom},${r.prenom},${r.email},${r.departement},"${r.errorReason ?? ''}"`
      )
      .join('\n');

    const blob = new Blob([header + lines], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'rapport-erreurs-import.csv';
    link.click();
    URL.revokeObjectURL(url);
  }
}