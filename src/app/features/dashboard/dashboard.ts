import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import {
  BranchResponse,
  InventoryDashboardSummary,
  InventoryItem,
  StockBatch,
} from '../../models/domain.models';

interface LowStockAlert {
  itemId: number;
  itemName: string;
  categoryName: string;
  unitName: string;
  branchId: number;
  branchName: string;
  availableQuantity: number;
  reorderThreshold: number;
}

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
  lowStockItems = signal<LowStockAlert[]>([]);
  branches = signal<BranchResponse[]>([]);
  selectedBranchId = signal<number | null>(null);
  summaryLoading = signal(true);
  lowStockLoading = signal(true);
  summaryError = signal<string | null>(null);
  lowStockError = signal<string | null>(null);

  ngOnInit() {
    this.loadDashboard();
  }

  get filteredLowStockItems(): LowStockAlert[] {
    const branchId = this.selectedBranchId();
    return branchId === null
      ? this.lowStockItems()
      : this.lowStockItems().filter((alert) => alert.branchId === branchId);
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
    forkJoin({
      items: this.api.getInventory(),
      branches: this.api.getAllBranches(),
      batches: this.api.getStockBatches(),
    }).subscribe({
      next: ({ items, branches, batches }) => {
        this.branches.set(branches);
        this.lowStockItems.set(this.buildLowStockAlerts(items, branches, batches));
      },
      error: (error) => {
        console.error('Failed to load low-stock items:', error);
        this.lowStockError.set('Could not load low-stock items. Try again.');
        this.lowStockLoading.set(false);
      },
      complete: () => this.lowStockLoading.set(false),
    });
  }

  selectBranch(value: string) {
    this.selectedBranchId.set(value === 'all' ? null : Number(value));
  }

  onBranchSelectionChange(event: Event) {
    const select = event.target;
    if (select instanceof HTMLSelectElement) this.selectBranch(select.value);
  }

  private buildLowStockAlerts(
    items: InventoryItem[],
    branches: BranchResponse[],
    batches: StockBatch[],
  ): LowStockAlert[] {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const branchQuantities = new Map<string, number>();

    for (const batch of batches) {
      if (batch.expiryDate && batch.expiryDate < today) continue;
      if (!Number.isFinite(batch.quantity) || batch.quantity <= 0) continue;

      for (const itemId of batch.itemIds || []) {
        const key = `${batch.branchId}:${itemId}`;
        branchQuantities.set(key, (branchQuantities.get(key) || 0) + batch.quantity);
      }
    }

    return branches.flatMap((branch) =>
      items.flatMap((item) => {
        const threshold = item.reorderThreshold;
        if (item.id === undefined || !Number.isFinite(threshold) || threshold < 0) return [];

        const availableQuantity = branchQuantities.get(`${branch.id}:${item.id}`) || 0;
        if (availableQuantity > threshold) return [];

        return [{
          itemId: item.id,
          itemName: item.itemName,
          categoryName: item.category?.name || 'Uncategorized',
          unitName: item.unitType?.name || '',
          branchId: branch.id,
          branchName: branch.branchName || branch.name || `Branch #${branch.id}`,
          availableQuantity,
          reorderThreshold: threshold,
        }];
      }),
    );
  }
}
