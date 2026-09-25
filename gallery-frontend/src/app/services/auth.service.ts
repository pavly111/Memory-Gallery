// services/auth.service.ts
// Wraps POST /api/auth/register and /login, stores the JWT, and exposes
// the current user as a signal so any component can react to login/logout
// without manually subscribing.

import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AuthResponse } from '../models/auth-response.model';
import { User } from '../models/user.model';

const TOKEN_KEY = 'memory_gallery_token';
const USER_KEY = 'memory_gallery_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = '/api/auth';

  // Signal so templates/components can reactively show/hide UI based on
  // login state without subscribing manually — e.g. *ngIf="authService.currentUser()"
  currentUser = signal<User | null>(this.loadStoredUser());

  constructor(private http: HttpClient) {}

  register(name: string, email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/register`, { name, email, password })
      .pipe(tap((res) => this.storeSession(res)));
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/login`, { email, password })
      .pipe(tap((res) => this.storeSession(res)));
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUser.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private storeSession(res: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    this.currentUser.set(res.user);
  }

  private loadStoredUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }
}