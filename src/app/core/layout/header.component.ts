import { Component, inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  template: `
    <header class="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between">
      <div class="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <span class="inline-block h-2 w-2 rounded-full bg-emerald-500"></span>
        <span>Spring Boot 3 API: <strong>Connected</strong></span>
      </div>
      <div class="flex items-center gap-4">
        <div class="text-right">
          <p class="text-xs font-bold text-slate-800">{{ auth.session()?.fullName || 'User' }}</p>
          <p class="text-[10px] text-slate-400">{{ auth.session()?.role?.name || 'No role' }}</p>
        </div>
        <button
          (click)="auth.logout()"
          class="px-3 py-1.5 rounded-lg text-xs bg-slate-100 hover:bg-rose-50 hover:text-rose-600 transition font-medium"
        >
          Sign Out
        </button>
      </div>
    </header>
  `,
})
export class HeaderComponent {
  auth = inject(AuthService);
}
