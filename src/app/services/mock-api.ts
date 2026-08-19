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
  private readonly publishedDocuments: CourseDocument[] = [];
  private readonly newAnnouncements: Announcement[] = [];

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
      map((db) => {
        const combined = [...db.documents, ...this.publishedDocuments];
        return courseModuleId
          ? combined.filter((d) => d.courseModuleId === courseModuleId)
          : combined;
      })
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
      map((db) => {
        const combined = [...db.announcements, ...this.newAnnouncements];
        return courseModuleId
          ? combined.filter((a) => a.courseModuleId === courseModuleId)
          : combined;
      })
    );
  }

  // ---- /users ----
  getUsers(): Observable<User[]> {
    if (!environment.useMockApi) {
      return this.http.get<User[]>(`${environment.apiUrl}/users`);
    }

    return this.loadDb().pipe(
      delay(SIMULATED_DELAY_MS),
      map((db) => db.users)
    );
  }

    // ---- publish (mock only — no real backend to persist to) ----
  publishDocument(input: {
    title: string;
    description: string;
    courseModuleId: string;
    teacherId: string;
    fileName: string;
    fileSize: number;
  }): Observable<CourseDocument> {
    const newDoc: CourseDocument = {
      id: `local-${Date.now()}`,
      title: input.title,
      description: input.description,
      fileUrl: input.fileName, // placeholder only — not a resolvable file path
      fileSize: input.fileSize,
      courseModuleId: input.courseModuleId,
      teacherId: input.teacherId,
      createdAt: new Date().toISOString(),
    };

    this.publishedDocuments.push(newDoc);

    return of(newDoc).pipe(delay(SIMULATED_DELAY_MS));
  }
    // ---- publish announcement (mock only) ----
  publishAnnouncement(input: {
    content: string;
    courseModuleId: string;
    teacherId: string;
  }): Observable<Announcement> {
    const newAnnouncement: Announcement = {
      id: `local-${Date.now()}`,
      teacherId: input.teacherId,
      courseModuleId: input.courseModuleId,
      content: input.content,
      createdAt: new Date().toISOString(),
    };

    this.newAnnouncements.push(newAnnouncement);

    return of(newAnnouncement).pipe(delay(SIMULATED_DELAY_MS));
  }
}