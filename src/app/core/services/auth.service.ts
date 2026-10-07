import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';

// auth-session.model.ts

export interface Role {
  id: number;
  name: string;       // This holds "Admin", "Manager", etc.
  accessLevel: number;
}

export interface Department {
  id: number;
  name: string;
  location: string;
  branch: any;
}

export interface AuthSession {
  fullName: string;
  email: string;
  phoneNumber: string;
  role: Role;             // Changed from string to Role object
  department: Department; // Matches your department object
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  session = signal<AuthSession | null>(null);

  private accessLevels: { [role: string]: string[] } = {
    ADMIN: [
      'inventory',
      'auth',
      'stock',
      'distribution',
      'procurement',
      'organization',
      'forecasting',
      'audit',
    ],
    MANAGER: ['inventory', 'stock', 'distribution', 'procurement', 'forecasting'],
    STAFF: ['inventory', 'stock', 'distribution'],

  };

  // login(credentials: { username: string; password: string }) {
  //   return this.http.post<AuthSession>('/api/auth/login', credentials).pipe(
  //     tap((res) => {
  //       localStorage.setItem('stock_session', JSON.stringify(res));
  //       this.session.set(res);
  //     }),
  //   );
  // }

  login(credentials: any) {
    return this.http.post<AuthSession>('http://localhost:8080/api/users/login', credentials).pipe(
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


  /**
   * Get the current user's role dynamically from the session
   */
  /**
   * Get the current user's role NAME dynamically from the session object
   */
  getCurrentRole(): string | null {
    const currentSession = this.session();

    // Safely check if session exists, then role, then name
    if (currentSession && currentSession.role && currentSession.role.name) {
      // Converts "Admin" to "ADMIN" to match your accessLevels keys perfectly
      return currentSession.role.name.toUpperCase();
    }

    return null;
  }

  isLoggedIn(): boolean {
    return this.session() !== null;
  }

  hasAccess(feature: string): boolean {
    const role = this.getCurrentRole();
    if (!role) return false;

    const allowedFeatures = this.accessLevels[role];
    if (!allowedFeatures) return false;

    return allowedFeatures.includes(feature);
  }
}
