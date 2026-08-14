import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, delay, map, of, switchMap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../models/user';
import { CourseModule } from '../models/course-module';
import { CourseDocument } from '../models/document';
import { Announcement } from '../models/announcement';

interface MockDb {
  users: User[];
  modules: CourseModule[];
  documents: CourseDocument[];
  announcements: Announcement[];
}

const SIMULATED_DELAY_MS = 400;

@Injectable({ providedIn: 'root' })
export class MockApiService {
  private readonly http = inject(HttpClient);
  private db$?: Observable<MockDb>;

  /** Loads db.json once and caches it for the lifetime of the app. */
  private loadDb(): Observable<MockDb> {
    if (!this.db$) {
      this.db$ = this.http.get<MockDb>(environment.mockDataUrl);
    }
    return this.db$;
  }

  // ---- /auth/login ----
  login(matricule: string, password: string): Observable<User> {
    if (!environment.useMockApi) {
      return this.http.post<User>(`${environment.apiUrl}/auth/login`, { matricule, password });
    }

    return this.loadDb().pipe(
      delay(SIMULATED_DELAY_MS),
      switchMap((db) => {
        const match = db.users.find(
          (u) => u.matricule === matricule.trim() && u.password === password
        );
        return match ? of(match) : throwError(() => new Error('Identifiants invalides'));
      })
    );
  }

  // ---- /modules ----
  getModules(): Observable<CourseModule[]> {
    if (!environment.useMockApi) {
      return this.http.get<CourseModule[]>(`${environment.apiUrl}/modules`);
    }

    return this.loadDb().pipe(
      delay(SIMULATED_DELAY_MS),
      map((db) => db.modules)
    );
  }

  // ---- /documents ----
  getDocuments(courseModuleId?: string): Observable<CourseDocument[]> {
    if (!environment.useMockApi) {
      const query = courseModuleId ? `?courseModuleId=${courseModuleId}` : '';
      return this.http.get<CourseDocument[]>(`${environment.apiUrl}/documents${query}`);
    }

    return this.loadDb().pipe(
      delay(SIMULATED_DELAY_MS),
      map((db) =>
        courseModuleId
          ? db.documents.filter((d) => d.courseModuleId === courseModuleId)
          : db.documents
      )
    );
  }

  // ---- /announcements ----
  getAnnouncements(courseModuleId?: string): Observable<Announcement[]> {
    if (!environment.useMockApi) {
      const query = courseModuleId ? `?courseModuleId=${courseModuleId}` : '';
      return this.http.get<Announcement[]>(`${environment.apiUrl}/announcements${query}`);
    }

    return this.loadDb().pipe(
      delay(SIMULATED_DELAY_MS),
      map((db) =>
        courseModuleId
          ? db.announcements.filter((a) => a.courseModuleId === courseModuleId)
          : db.announcements
      )
    );
  }
}