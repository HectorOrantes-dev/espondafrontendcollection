import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { LoginRequest, TokenResponse } from '../models/auth.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private readonly baseUrl = environment.apiUrl;

  private _token = signal<string | null>(localStorage.getItem('access_token'));

  readonly isAuthenticated = computed(() => !!this._token());
  readonly token = this._token.asReadonly();

  login(credentials: LoginRequest) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http
      .post<TokenResponse>(`${this.baseUrl}/auth/login`, credentials, { headers })
      .pipe(
        tap((res) => {
          localStorage.setItem('access_token', res.access_token);
          localStorage.setItem('refresh_token', res.refresh_token);
          this._token.set(res.access_token);
        }),
      );
  }

  logout() {
    const accessToken = localStorage.getItem('access_token');

    // Primero envía la petición con el token todavía en localStorage
    // para que el interceptor lo incluya en el header Authorization
    if (accessToken) {
      this.http
        .post(`${this.baseUrl}/auth/logout`, null)
        .subscribe({ error: () => {} });
    }

    // Después de lanzar la petición, limpia el estado local
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this._token.set(null);
    this.router.navigate(['/login']);
  }
}
