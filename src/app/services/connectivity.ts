import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ConnectivityService {
  private readonly _isOnline = signal(navigator.onLine);
  readonly isOnline = this._isOnline.asReadonly();

  constructor() {
    // Not a DI constructor (no inject() calls) — just wiring browser event
    // listeners once when the singleton service is created. That's fine.
    window.addEventListener('online', () => this._isOnline.set(true));
    window.addEventListener('offline', () => this._isOnline.set(false));
  }
}