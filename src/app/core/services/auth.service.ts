import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';

export interface AuthSession {
  token: string;
  username: string;
  role: string;
  branchId: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  session = signal<AuthSession | null>(this.loadSession());

  login(credentials: { username: string; password: string }) {
    return this.http.post<AuthSession>('/api/auth/login', credentials).pipe(
      tap((res) => {
        localStorage.setItem('stock_session', JSON.stringify(res));
        this.session.set(res);
      }),
    );
  }

  logout() {
    localStorage.removeItem('stock_session');
    this.session.set(null);
    this.router.navigate(['/login']);
  }

  private loadSession(): AuthSession | null {
    const raw = localStorage.getItem('stock_session');
    return raw ? JSON.parse(raw) : null;
  }
}
