import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class OfflineAvailabilityService {
  private readonly _availability = signal<Record<string, boolean>>({});
  readonly availability = this._availability.asReadonly();

  /** Fires an async cache check for a URL; result lands in the signal once resolved. */
  check(fileUrl: string): void {
    fetch(fileUrl, { cache: 'only-if-cached', mode: 'same-origin' })
      .then((res) => {
        this._availability.update((map) => ({ ...map, [fileUrl]: res.ok }));
      })
      .catch(() => {
        this._availability.update((map) => ({ ...map, [fileUrl]: false }));
      });
  }

  isAvailable(fileUrl: string): boolean {
    return this._availability()[fileUrl] ?? false;
  }
}