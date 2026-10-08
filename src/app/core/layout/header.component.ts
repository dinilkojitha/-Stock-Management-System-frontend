import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { InventoryItem, StockBatch } from '../../models/domain.models';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between">
      <div class="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <span class="inline-block h-2 w-2 rounded-full bg-emerald-500"></span>
        <span>Spring Boot 3 API: <strong>Connected</strong></span>
      </div>
      <div class="flex items-center gap-4">
        <div class="relative">
          <button
            type="button"
            (click)="toggleNotifications()"
            [attr.aria-expanded]="notificationsOpen()"
            aria-label="Stock notifications"
            class="relative rounded-lg p-2 text-slate-600 transition hover:bg-slate-100"
          >
            <span aria-hidden="true">🔔</span>
            @if (notificationCount > 0) {
              <span
                class="absolute -right-1 -top-1 min-w-5 rounded-full bg-rose-600 px-1 text-center text-[10px] font-bold leading-5 text-white"
              >
                {{ notificationCount }}
              </span>
            }
          </button>

          @if (notificationsOpen()) {
            <section
              class="absolute right-0 top-12 z-50 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white p-4 shadow-xl"
              aria-label="Stock notifications"
            >
              <div class="mb-3 flex items-center justify-between">
                <h2 class="font-semibold text-slate-900">Stock alerts</h2>
                <button
                  type="button"
                  class="text-xs font-medium text-indigo-600 hover:underline"
                  (click)="loadNotifications()"
                >
                  Refresh
                </button>
              </div>
              @if (loading()) {
                <p role="status" class="text-sm text-slate-500">Checking stock levels...</p>
              } @else if (error()) {
                <p role="alert" class="text-sm text-rose-700">{{ error() }}</p>
              } @else if (notificationCount === 0) {
                <p class="text-sm text-slate-500">No low-stock or expiry alerts.</p>
              } @else {
                <ul class="max-h-80 space-y-3 overflow-y-auto text-sm">
                  @for (item of lowStockItems(); track item.id) {
                    <li class="border-l-2 border-amber-500 pl-3">
                      <p class="font-medium text-slate-800">Low stock: {{ item.itemName }}</p>
                      <p class="text-xs text-slate-500">
                        {{ item.totalQuantity }} {{ item.unitType.name }} available; reorder at
                        {{ item.reorderThreshold }}
                      </p>
                    </li>
                  }
                  @for (batch of expiredBatches(); track batch.stockId) {
                    <li class="border-l-2 border-rose-600 pl-3">
                      <p class="font-medium text-rose-800">Expired batch #{{ batch.stockId }}</p>
                      <p class="text-xs text-slate-500">
                        Expiry date: {{ batch.expiryDate }} · Branch #{{ batch.branchId }}
                      </p>
                    </li>
                  }
                  @for (batch of expiringBatches(); track batch.stockId) {
                    <li class="border-l-2 border-orange-500 pl-3">
                      <p class="font-medium text-slate-800">Expiring batch #{{ batch.stockId }}</p>
                      <p class="text-xs text-slate-500">
                        Expiry date: {{ batch.expiryDate }} · Branch #{{ batch.branchId }}
                      </p>
                    </li>
                  }
                </ul>
              }
              <a
                routerLink="/app/batches"
                (click)="notificationsOpen.set(false)"
                class="mt-4 block text-sm font-semibold text-indigo-600 hover:underline"
                >View batches</a
              >
            </section>
          }
        </div>
        <a routerLink="/app/profile" class="text-right rounded-lg px-2 py-1 transition hover:bg-slate-100">
          <p class="text-xs font-bold text-slate-800">{{ auth.session()?.fullName || 'User' }}</p>
          <p class="text-[10px] text-slate-400">{{ auth.session()?.role?.name || 'No role' }}</p>
        </a>
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
export class HeaderComponent implements OnInit {
  auth = inject(AuthService);
  private api = inject(ApiService);

  lowStockItems = signal<InventoryItem[]>([]);
  expiredBatches = signal<StockBatch[]>([]);
  expiringBatches = signal<StockBatch[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  notificationsOpen = signal(false);

  get notificationCount(): number {
    return (
      this.lowStockItems().length + this.expiredBatches().length + this.expiringBatches().length
    );
  }

  ngOnInit() {
    this.loadNotifications();
  }

  toggleNotifications() {
    this.notificationsOpen.update((open) => !open);
  }

  loadNotifications() {
    this.loading.set(true);
    this.error.set(null);
    forkJoin({
      lowStock: this.api.getLowStockItems(),
      expired: this.api.getExpiredStockBatches(),
      expiring: this.api.getExpiringStockBatches(30),
    }).subscribe({
      next: ({ lowStock, expired, expiring }) => {
        const expiredIds = new Set(expired.map((batch) => batch.stockId));
        this.lowStockItems.set(lowStock);
        this.expiredBatches.set(expired);
        this.expiringBatches.set(expiring.filter((batch) => !expiredIds.has(batch.stockId)));
        this.loading.set(false);
      },
      error: (error: unknown) => {
        console.error('Failed to load stock notifications:', error);
        this.error.set('Could not load stock alerts. Try refreshing.');
        this.loading.set(false);
      },
    });
  }
}
