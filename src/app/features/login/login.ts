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
  private payload: UserLogin | undefined;

  // 2. Inject Router in constructor
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  onSubmit() {
    if (this.email && this.password) {
      this.payload = { email: this.email, password: this.password };
      console.log('Authenticating:', this.email);

      this.authService.login(this.payload).subscribe({
        next: (session) => {
          console.log('Login successful:', session);

          // Save session first
          localStorage.setItem('stock_session', JSON.stringify(session));

          // 3. Use Angular Router navigate instead of window.location.href
          this.router.navigate(['/app']);
        },
        error: (err) => {
          console.error('Login failed:', err);
        },
      });
    }
  }
}
