import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, delay, map, of, switchMap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../models/user';
import { CourseModule } from '../models/course-module';
import { CourseDocument } from '../models/document';
import { Announcement } from '../models/announcement';
import { Department } from '../models/department';
import { Filiere } from '../models/filiere';

interface MockDb {
  users: User[];
  modules: CourseModule[];
  documents: CourseDocument[];
  announcements: Announcement[];
  departments: Department[];
  filieres: Filiere[];
}

const SIMULATED_DELAY_MS = 400;

@Injectable({ providedIn: 'root' })
export class MockApiService {
  private readonly http = inject(HttpClient);
  private db$?: Observable<MockDb>;
  private readonly publishedDocuments: CourseDocument[] = [];
  private readonly newDepartments: Department[] = [];
  private readonly deletedDepartmentIds = new Set<string>();
  private readonly newAnnouncements: Announcement[] = [];
  private readonly newFilieres: Filiere[] = [];
  private readonly editedFilieres = new Map<string, Partial<Filiere>>();
  private readonly newModules: CourseModule[] = [];
  private readonly editedModules = new Map<string, Partial<CourseModule>>();
  private readonly deletedModuleIds = new Set<string>();
  private readonly newUsers: User[] = [];
  private readonly editedUsers = new Map<string, Partial<User>>();

  /** Loads db.json once and caches it for the lifetime of the app. */
  private loadDb(): Observable<MockDb> {
    if (!this.db$) {
      this.db$ = this.http.get<MockDb>(environment.mockDataUrl);
    }
    return this.db$;
  }

  // ---- /auth/login ----
  login(matricule: string, password: string): Observable<{ user: User; token: string }> {
    if (!environment.useMockApi) {
      return this.http.post<{ user: User; token: string }>(`${environment.apiUrl}/auth/login`, {
        matricule,
        password,
      });
    }

    return this.loadDb().pipe(
      delay(SIMULATED_DELAY_MS),
      switchMap((db) => {
        const match = db.users.find(
          (u) => u.matricule === matricule.trim() && u.password === password
        );
        return match
          ? of({ user: match, token: 'mock-token' })
          : throwError(() => new Error('Identifiants invalides'));
      })
    );
  }

  // ---- /modules ----
  getModules(): Observable<CourseModule[]> {
    if (!environment.useMockApi) {
      return this.http
        .get<{ modules: CourseModule[] }>(`${environment.apiUrl}/modules`)
        .pipe(map((res) => res.modules));
    }

    return this.loadDb().pipe(
      delay(SIMULATED_DELAY_MS),
      map((db) =>
        [...db.modules, ...this.newModules]
          .filter((m) => !this.deletedModuleIds.has(m.id))
          .map((m) => ({ ...m, ...this.editedModules.get(m.id) }))
      )
    );
  }

  createModule(input: Omit<CourseModule, 'id'>): Observable<CourseModule> {
    const newModule: CourseModule = { id: `local-${Date.now()}`, ...input };
    this.newModules.push(newModule);
    return of(newModule).pipe(delay(SIMULATED_DELAY_MS));
  }

  updateModule(id: string, changes: Partial<CourseModule>): Observable<void> {
    this.editedModules.set(id, { ...this.editedModules.get(id), ...changes });
    return of(undefined).pipe(delay(SIMULATED_DELAY_MS));
  }

  deleteModule(id: string): Observable<void> {
    this.deletedModuleIds.add(id);
    return of(undefined).pipe(delay(SIMULATED_DELAY_MS));
  }

  // ---- /documents ----
  getDocuments(courseModuleId?: string): Observable<CourseDocument[]> {
    if (!environment.useMockApi) {
      const query = courseModuleId ? `?courseModuleId=${courseModuleId}` : '';
      return this.http
        .get<{ documents: CourseDocument[] }>(`${environment.apiUrl}/documents${query}`)
        .pipe(map((res) => res.documents));
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
      return this.http
        .get<{ announcements: Announcement[] }>(`${environment.apiUrl}/announcements${query}`)
        .pipe(map((res) => res.announcements));
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
      return this.http
        .get<{ users: User[] }>(`${environment.apiUrl}/users/basic`)
        .pipe(map((res) => res.users));
    }

    return this.loadDb().pipe(
      delay(SIMULATED_DELAY_MS),
      map((db) => db.users)
    );
  }

  createTeacher(input: { fullName: string; matricule: string }): Observable<User> {
    const newTeacher: User = {
      id: `local-${Date.now()}`,
      fullName: input.fullName,
      matricule: input.matricule,
      password: 'password',
      role: 'teacher',
    };

    this.newUsers.push(newTeacher);

    return of(newTeacher).pipe(delay(SIMULATED_DELAY_MS));
  }

  createStudent(input: {
    fullName: string;
    matricule: string;
    filiere: string;
    niveau: string;
    email: string;
  }): Observable<User> {
    const newStudent: User = {
      id: `local-${Date.now()}`,
      fullName: input.fullName,
      matricule: input.matricule,
      password: 'password',
      role: 'student',
      filiere: input.filiere,
      niveau: input.niveau,
      email: input.email,
      status: 'inscrit',
    };

    this.newUsers.push(newStudent);

    return of(newStudent).pipe(delay(SIMULATED_DELAY_MS));
  }

  updateUser(id: string, changes: Partial<User>): Observable<void> {
    this.editedUsers.set(id, { ...this.editedUsers.get(id), ...changes });
    return of(undefined).pipe(delay(SIMULATED_DELAY_MS));
  }

  // ---- publish document ----
  publishDocument(input: {
    title: string;
    description: string;
    courseModuleId: string;
    teacherId: string;
    fileName: string;
    fileSize: number;
  }): Observable<CourseDocument> {
    if (!environment.useMockApi) {
      return this.http
        .post<{ document: CourseDocument }>(`${environment.apiUrl}/documents`, {
          title: input.title,
          description: input.description,
          courseModuleId: input.courseModuleId,
          fileName: input.fileName,
          fileSize: input.fileSize,
        })
        .pipe(map((res) => res.document));
    }

    const newDoc: CourseDocument = {
      id: `local-${Date.now()}`,
      title: input.title,
      description: input.description,
      fileUrl: input.fileName,
      fileSize: input.fileSize,
      courseModuleId: input.courseModuleId,
      teacherId: input.teacherId,
      createdAt: new Date().toISOString(),
    };

    this.publishedDocuments.push(newDoc);

    return of(newDoc).pipe(delay(SIMULATED_DELAY_MS));
  }

  // ---- publish announcement ----
  publishAnnouncement(input: {
    content: string;
    courseModuleId: string;
    teacherId: string;
  }): Observable<Announcement> {
    if (!environment.useMockApi) {
      return this.http
        .post<{ announcement: Announcement }>(`${environment.apiUrl}/announcements`, {
          content: input.content,
          courseModuleId: input.courseModuleId,
        })
        .pipe(map((res) => res.announcement));
    }

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

  // ---- /departments ----
  getDepartments(): Observable<Department[]> {
    if (!environment.useMockApi) {
      return this.http
        .get<{ departments: Department[] }>(`${environment.apiUrl}/departments`)
        .pipe(map((res) => res.departments));
    }

    return this.loadDb().pipe(
      delay(SIMULATED_DELAY_MS),
      map((db) =>
        [...db.departments, ...this.newDepartments].filter(
          (d) => !this.deletedDepartmentIds.has(d.id)
        )
      )
    );
  }

  createDepartment(input: { name: string; filiereCount: number }): Observable<Department> {
    if (!environment.useMockApi) {
      return this.http
        .post<{ department: Department }>(`${environment.apiUrl}/departments`, { name: input.name })
        .pipe(map((res) => res.department));
    }

    const newDept: Department = {
      id: `local-${Date.now()}`,
      name: input.name,
      filiereCount: input.filiereCount,
      icon: 'domain',
    };

    this.newDepartments.push(newDept);

    return of(newDept).pipe(delay(SIMULATED_DELAY_MS));
  }

  deleteDepartment(id: string): Observable<void> {
    if (!environment.useMockApi) {
      return this.http.delete<void>(`${environment.apiUrl}/departments/${id}`);
    }

    this.deletedDepartmentIds.add(id);
    return of(undefined).pipe(delay(SIMULATED_DELAY_MS));
  }

  // ---- /filieres ----
  getFilieres(): Observable<Filiere[]> {
    if (!environment.useMockApi) {
      return this.http.get<Filiere[]>(`${environment.apiUrl}/filieres`);
    }

    return this.loadDb().pipe(
      delay(SIMULATED_DELAY_MS),
      map((db) =>
        [...db.filieres, ...this.newFilieres].map((f) => ({
          ...f,
          ...this.editedFilieres.get(f.id),
        }))
      )
    );
  }

  createFiliere(input: Omit<Filiere, 'id'>): Observable<Filiere> {
    const newFiliere: Filiere = { id: `local-${Date.now()}`, ...input };
    this.newFilieres.push(newFiliere);
    return of(newFiliere).pipe(delay(SIMULATED_DELAY_MS));
  }

  updateFiliere(id: string, changes: Partial<Filiere>): Observable<void> {
    this.editedFilieres.set(id, { ...this.editedFilieres.get(id), ...changes });
    return of(undefined).pipe(delay(SIMULATED_DELAY_MS));
  }
}