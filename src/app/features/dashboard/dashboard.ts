import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { InventoryDashboardSummary, InventoryItem } from '../../models/domain.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  private api = inject(ApiService);
  readonly auth = inject(AuthService);

  summary = signal<InventoryDashboardSummary | null>(null);
  lowStockItems = signal<InventoryItem[]>([]);
  summaryLoading = signal(true);
  lowStockLoading = signal(true);
  summaryError = signal<string | null>(null);
  lowStockError = signal<string | null>(null);

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard() {
    this.summaryLoading.set(true);
    this.summaryError.set(null);
    this.api.getInventoryDashboard().subscribe({
      next: (summary) => this.summary.set(summary),
      error: (error) => {
        console.error('Failed to load the inventory dashboard summary:', error);
        this.summaryError.set('Could not load the inventory summary. Try again.');
        this.summaryLoading.set(false);
      },
      complete: () => this.summaryLoading.set(false),
    });

    this.lowStockLoading.set(true);
    this.lowStockError.set(null);
    this.api.getLowStockItems().subscribe({
      next: (items) => this.lowStockItems.set(items),
      error: (error) => {
        console.error('Failed to load low-stock items:', error);
        this.lowStockError.set('Could not load low-stock items. Try again.');
        this.lowStockLoading.set(false);
      },
      complete: () => this.lowStockLoading.set(false),
    });
  }
}
