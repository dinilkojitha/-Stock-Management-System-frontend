import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StockTransferResponse, StockTransferCreateRequest } from '../../models/domain.models';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stock.html',
  styleUrl: './stock.css',
})
export class Stock implements OnInit {
  private api = inject(ApiService);

  transfers = signal<StockTransferResponse[]>([]);
  searchBranchId = signal<string>('');
  selectedTransfer = signal<StockTransferResponse | null>(null);
  showCreateModal = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  // New transfer modal form state
  newTransfer: StockTransferCreateRequest = {
    fromBranchId: 1,
    toBranchId: 2,
    requestedById: 1,
    statusId: 1,
    items: [{ inventoryItemId: 1, quantity: 10 }],
  };

  ngOnInit() {
    this.loadTransfers();
  }

  loadTransfers() {
    this.api.getTransfers().subscribe({
      next: (data) => {
        this.transfers.set(data);
        this.errorMessage.set(null);
      },
      error: (err) => {
        this.errorMessage.set('Could not connect to backend. Loaded demo fallback data.');
      },
    });
  }

  filterByBranch() {
    const id = Number(this.searchBranchId());
    if (!id) {
      this.loadTransfers();
      return;
    }
    this.api.getTransfersByBranch(id).subscribe({
      next: (data) => this.transfers.set(data),
      error: (err) => this.errorMessage.set(`Failed to fetch transfers for Branch #${id}`),
    });
  }

  approve(id: number) {
    this.api.approveTransfer(id).subscribe({
      next: (updated) => {
        this.transfers.update((list) => list.map((t) => (t.id === id ? updated : t)));
        if (this.selectedTransfer()?.id === id) this.selectedTransfer.set(updated);
      },
      error: (err) => alert(err?.error?.message || 'Could not approve transfer'),
    });
  }

  reject(id: number) {
    this.api.rejectTransfer(id).subscribe({
      next: (updated) => {
        this.transfers.update((list) => list.map((t) => (t.id === id ? updated : t)));
        if (this.selectedTransfer()?.id === id) this.selectedTransfer.set(updated);
      },
      error: (err) => alert(err?.error?.message || 'Could not reject transfer'),
    });
  }

  addItemRow() {
    this.newTransfer.items.push({ inventoryItemId: 1, quantity: 1 });
  }

  removeItemRow(index: number) {
    if (this.newTransfer.items.length > 1) {
      this.newTransfer.items.splice(index, 1);
    }
  }

  submitTransfer() {
    this.api.createTransfer(this.newTransfer).subscribe({
      next: (created) => {
        this.transfers.update((list) => [created, ...list]);
        this.showCreateModal.set(false);
      },
      error: (err) => alert(err?.error?.message || 'Error creating transfer'),
    });
  }

  downloadManifest(id: number) {
    this.api.downloadTransferPdf(id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Nexus-Inventory-Transfer-${id}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => alert('Failed to download PDF manifest'),
    });
  }

  getTotalItemsCount(t: StockTransferResponse): number {
    return t.items ? t.items.reduce((acc, curr) => acc + curr.quantity, 0) : 0;
  }
}
