import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiService } from '../../core/services/api.service';
import {
  BranchResponse,
  InventoryItem,
  StockBatch,
  StockBatchRequest,
} from '../../models/domain.models';

type ExpiryFilter = 'all' | 'expiring' | 'expired';

interface StockBatchForm {
  stockId: number | null;
  quantity: number;
  manufactureDate: string;
  expiryDate: string;
  branchId: number;
  itemIds: number[];
}

@Component({
  selector: 'app-stock-batches',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stock-batches.html',
})
export class StockBatches implements OnInit {
  private api = inject(ApiService);

  batches = signal<StockBatch[]>([]);
  branches = signal<BranchResponse[]>([]);
  inventoryItems = signal<InventoryItem[]>([]);
  branchFilter = signal<number | null>(null);
  itemFilter = signal<number | null>(null);
  expiryFilter = signal<ExpiryFilter>('all');
  loading = signal(true);
  saving = signal(false);
  modalOpen = signal(false);
  isEditing = signal(false);
  errorMessage = signal<string | null>(null);
  formError = signal<string | null>(null);
  form: StockBatchForm = this.emptyForm();

  filteredBatches = computed(() => {
    const branchId = this.branchFilter();
    const itemId = this.itemFilter();
    const expiry = this.expiryFilter();

    return this.batches().filter((batch) => {
      if (branchId !== null && batch.branchId !== branchId) return false;
      if (itemId !== null && !batch.itemIds.includes(itemId)) return false;
      const status = this.getExpiryStatus(batch.expiryDate);
      if (expiry === 'expiring' && status !== 'Expiring soon') return false;
      if (expiry === 'expired' && status !== 'Expired') return false;
      return true;
    });
  });

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    this.loadBatches();
    this.loadReferences();
  }

  loadBatches() {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.api.getStockBatches().subscribe({
      next: (batches) => this.batches.set(batches),
      error: (error) => {
        console.error('Failed to load stock batches:', error);
        this.errorMessage.set(this.getErrorMessage(error, 'Could not load stock batches.'));
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }

  private loadReferences() {
    this.api.getAllBranches().subscribe({
      next: (branches) => this.branches.set(branches),
      error: (error) => {
        console.error('Failed to load branches for stock batches:', error);
        this.errorMessage.set(this.getErrorMessage(error, 'Could not load branches.'));
      },
    });
    this.api.getInventory().subscribe({
      next: (items) => this.inventoryItems.set(items),
      error: (error) => {
        console.error('Failed to load inventory items for stock batches:', error);
        this.errorMessage.set(this.getErrorMessage(error, 'Could not load inventory items.'));
      },
    });
  }

  openCreateModal() {
    this.isEditing.set(false);
    this.formError.set(null);
    this.form = this.emptyForm();
    this.modalOpen.set(true);
  }

  openEditModal(batch: StockBatch) {
    this.isEditing.set(true);
    this.formError.set(null);
    this.form = {
      stockId: batch.stockId,
      quantity: batch.quantity,
      manufactureDate: batch.manufactureDate ?? '',
      expiryDate: batch.expiryDate ?? '',
      branchId: batch.branchId,
      itemIds: [...batch.itemIds],
    };
    this.modalOpen.set(true);
  }

  closeModal() {
    if (this.saving()) return;
    this.modalOpen.set(false);
  }

  saveBatch() {
    const stockId = Number(this.form.stockId);
    const quantity = Number(this.form.quantity);
    const branchId = Number(this.form.branchId);
    const itemIds = [...new Set(this.form.itemIds.map(Number))];

    if (!Number.isInteger(stockId) || stockId <= 0) {
      this.formError.set('Enter a positive, unused batch ID.');
      return;
    }
    if (!Number.isFinite(quantity) || quantity < 0) {
      this.formError.set('Quantity must be a non-negative number.');
      return;
    }
    if (!Number.isInteger(branchId) || branchId <= 0) {
      this.formError.set('Select a branch.');
      return;
    }
    if (!itemIds.length || itemIds.some((id) => !Number.isInteger(id) || id <= 0)) {
      this.formError.set('Select at least one inventory item.');
      return;
    }
    if (
      this.form.manufactureDate &&
      this.form.expiryDate &&
      this.form.expiryDate < this.form.manufactureDate
    ) {
      this.formError.set('Expiry date cannot be earlier than the manufacture date.');
      return;
    }

    const request: StockBatchRequest = {
      stockId,
      quantity,
      manufactureDate: this.form.manufactureDate || null,
      expiryDate: this.form.expiryDate || null,
      branchId,
      itemIds,
    };
    this.saving.set(true);
    this.formError.set(null);

    const operation = this.isEditing()
      ? this.api.updateStockBatch(stockId, request)
      : this.api.createStockBatch(request);

    operation.subscribe({
      next: (savedBatch) => {
        this.batches.update((current) => {
          const remaining = current.filter((batch) => batch.stockId !== savedBatch.stockId);
          return [savedBatch, ...remaining];
        });
        this.modalOpen.set(false);
        this.saving.set(false);
      },
      error: (error) => {
        console.error('Failed to save stock batch:', error);
        this.formError.set(this.getErrorMessage(error, 'Could not save this stock batch.'));
        this.saving.set(false);
      },
    });
  }

  deleteBatch(batch: StockBatch) {
    if (!confirm(`Delete stock batch #${batch.stockId}? Its quantity will be removed from item totals.`)) {
      return;
    }

    this.api.deleteStockBatch(batch.stockId).subscribe({
      next: () => this.batches.update((current) => current.filter((row) => row.stockId !== batch.stockId)),
      error: (error) => {
        console.error(`Failed to delete stock batch ${batch.stockId}:`, error);
        this.errorMessage.set(this.getErrorMessage(error, 'Could not delete this stock batch.'));
      },
    });
  }

  getBranchName(id: number): string {
    const branch = this.branches().find((row) => row.id === id);
    return branch?.name || branch?.branchName || `Branch #${id}`;
  }

  toNullableId(value: number | string | null): number | null {
    return value === null || value === '' ? null : Number(value);
  }

  setExpiryFilter(value: string) {
    if (value === 'expiring' || value === 'expired') {
      this.expiryFilter.set(value);
      return;
    }
    this.expiryFilter.set('all');
  }

  getItemNames(ids: number[]): string {
    return ids
      .map((id) => this.inventoryItems().find((item) => item.id === id)?.itemName || `Item #${id}`)
      .join(', ');
  }

  getExpiryStatus(expiryDate: string | null): string {
    if (!expiryDate) return 'No expiry date';

    const expiry = new Date(`${expiryDate}T00:00:00`);
    if (Number.isNaN(expiry.getTime())) return 'Unknown';

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (expiry < today) return 'Expired';

    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / 86_400_000);
    return daysUntilExpiry <= 30 ? 'Expiring soon' : 'In date';
  }

  private emptyForm(): StockBatchForm {
    return {
      stockId: null,
      quantity: 0,
      manufactureDate: '',
      expiryDate: '',
      branchId: 0,
      itemIds: [],
    };
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (!(error instanceof HttpErrorResponse)) return fallback;
    const body = error.error;
    if (typeof body !== 'object' || body === null) return fallback;
    if ('detail' in body && typeof body.detail === 'string') return body.detail;
    if ('message' in body && typeof body.message === 'string') return body.message;
    return fallback;
  }
}
