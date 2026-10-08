import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; // 1. Import Angular Router
import { AuthService } from '../../core/services/auth.service';

interface UserLogin {
  email: string;
  password: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  email = '';
  password = '';
  errorMessage: string | null = null;
  isSubmitting = false;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  onSubmit() {
    if (this.isSubmitting || !this.email || !this.password) return;

    this.errorMessage = null;
    this.isSubmitting = true;
    const credentials: UserLogin = { email: this.email, password: this.password };

    this.authService.login(credentials).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/app']);
      },
      error: (error) => {
        console.error('Login failed:', error);
        this.errorMessage =
          error?.error?.message || 'Sign-in failed. Check your details and try again.';
        this.isSubmitting = false;
      },
    });
  }
}
