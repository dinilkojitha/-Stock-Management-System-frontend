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

export interface SessionBranch {
  id: number;
  name: string;
  location: string;
}

export interface AuthSession {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  role: Role;
  branch?: SessionBranch | null;
  department: Department | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  session = signal<AuthSession | null>(this.loadSession());

  private readonly accessLevels: Record<string, readonly string[]> = {
    ADMIN: [
      'dashboard',
      'inventory',
      'auth',
      'stock',
      'distribution',
      'procurement',
      'organization',
      'forecasting',
      'audit',
      'reports',
    ],
    SYSTEM_ADMIN: [
      'dashboard',
      'inventory',
      'auth',
      'stock',
      'distribution',
      'procurement',
      'organization',
      'forecasting',
      'audit',
      'reports',
    ],
    SYSTEM_ADMINISTRATOR: [
      'dashboard',
      'inventory',
      'auth',
      'stock',
      'distribution',
      'procurement',
      'organization',
      'forecasting',
      'audit',
      'reports',
    ],
    BRANCH_MANAGER: [
      'dashboard',
      'inventory',
      'stock',
      'distribution',
      'procurement',
      'forecasting',
      'reports',
    ],
    MANAGER: [
      'dashboard',
      'inventory',
      'stock',
      'distribution',
      'procurement',
      'forecasting',
      'reports',
    ],
    WAREHOUSE_OFFICER: [
      'dashboard',
      'inventory',
      'stock',
      'distribution',
      'procurement',
      'audit',
      'reports',
    ],
    DEPARTMENT_STAFF: ['dashboard', 'inventory', 'distribution'],
    INVENTORY_CLERK: ['dashboard', 'inventory', 'stock', 'distribution'],
    STAFF: ['dashboard', 'inventory', 'stock', 'distribution'],
  };

  login(credentials: { email: string; password: string }) {
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
    if (!raw) return null;

    try {
      const session: unknown = JSON.parse(raw);
      if (this.isAuthSession(session)) return session;

      console.error('Stored login session has an invalid shape; removing it.');
    } catch (error) {
      console.error('Could not restore the stored login session; removing it.', error);
    }

    localStorage.removeItem('stock_session');
    return null;
  }

  private isAuthSession(value: unknown): value is AuthSession {
    if (typeof value !== 'object' || value === null) return false;

    const session = value as Record<string, unknown>;
    const role = session['role'];
    const department = session['department'];

    return (
      typeof session['id'] === 'number' &&
      typeof session['fullName'] === 'string' &&
      typeof session['email'] === 'string' &&
      (typeof session['phoneNumber'] === 'string' || session['phoneNumber'] === null) &&
      typeof role === 'object' &&
      role !== null &&
      typeof (role as Record<string, unknown>)['name'] === 'string' &&
      (department === null || (typeof department === 'object' && department !== null))
    );
  }

  /**
   * Get the current user's role dynamically from the session
   */
  /**
   * Get the current user's role NAME dynamically from the session object
   */
  getCurrentRole(): string | null {
    const currentSession = this.session();

    if (currentSession && currentSession.role && currentSession.role.name) {
      return this.normalizeRoleName(currentSession.role.name);
    }

    return null;
  }

  private normalizeRoleName(roleName: string): string {
    return roleName
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
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
