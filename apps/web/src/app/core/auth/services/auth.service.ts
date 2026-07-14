import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginResponse, RefreshResponse, AuthUser } from '@analitic-saas/shared';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = '/api';

  login(credentials: { email: string; passwordHash?: string; password?: string; tenantSlug: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials);
  }

  refresh(refreshToken: string): Observable<RefreshResponse> {
    return this.http.post<RefreshResponse>(`${this.apiUrl}/auth/refresh`, { refreshToken });
  }

  getMe(): Observable<AuthUser> {
    return this.http.get<AuthUser>(`${this.apiUrl}/auth/me`);
  }
}
