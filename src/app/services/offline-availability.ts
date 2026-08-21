import { Injectable, signal } from '@angular/core';

const MANUAL_CACHE_NAME = 'freebosh-manual-saves';

@Injectable({ providedIn: 'root' })
export class OfflineAvailabilityService {
  private readonly _availability = signal<Record<string, boolean>>({});
  readonly availability = this._availability.asReadonly();

  /** Checks Cache Storage (service worker + manual saves) for this URL. */
  check(fileUrl: string): void {
    if (!('caches' in window)) {
      this._availability.update((map) => ({ ...map, [fileUrl]: false }));
      return;
    }

    caches
      .match(fileUrl)
      .then((response) => {
        this._availability.update((map) => ({ ...map, [fileUrl]: !!response }));
      })
      .catch(() => {
        this._availability.update((map) => ({ ...map, [fileUrl]: false }));
      });
  }

  isAvailable(fileUrl: string): boolean {
    return this._availability()[fileUrl] ?? false;
  }

  /** Actually saves or removes the file from Cache Storage. */
  async toggle(fileUrl: string): Promise<void> {
    const cache = await caches.open(MANUAL_CACHE_NAME);
    const isSaved = this.isAvailable(fileUrl);

    if (isSaved) {
      await cache.delete(fileUrl);
      this._availability.update((map) => ({ ...map, [fileUrl]: false }));
      return;
    }

    try {
      const response = await fetch(fileUrl);
      if (response.ok) {
        await cache.put(fileUrl, response.clone());
        this._availability.update((map) => ({ ...map, [fileUrl]: true }));
      }
    } catch {
      // Placeholder/mock file URLs (e.g. from publish-document's fake fileName) won't resolve — silently ignore.
    }
  }
}