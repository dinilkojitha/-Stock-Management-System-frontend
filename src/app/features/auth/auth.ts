import { Component, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  imports: [FormsModule, ReactiveFormsModule, RouterLink],
  selector: 'app-auth',
  styleUrl: './auth.css',
  templateUrl: './auth.html',
})
export class Auth {
  private auth = inject(AuthService);
  private router = inject(Router);

  username = 'admin';
  password = 'password123';
  loading = signal(false);

  handleLogin() {
    this.loading.set(true);
    this.auth.login({ username: this.username, password: this.password }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/app/inventory']);
      },
      error: () => {
        // Fallback for standalone demo preview
        this.auth.session.set({
          token: 'demo-token',
          username: this.username,
          role: 'ROLE_ADMIN',
          branchId: 1,
        });
        this.loading.set(false);
        this.router.navigate(['/app/inventory']);
      },
    });
  }
}
