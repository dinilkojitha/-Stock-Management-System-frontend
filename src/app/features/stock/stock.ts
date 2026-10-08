import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  StockTransferResponse,
  StockTransferCreateRequest,
  BranchResponse,
  InventoryItem,
} from '../../models/domain.models';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stock.html',
  styleUrl: './stock.css',
})
export class Stock implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);

  // Data signals
  inventoryItems = signal<InventoryItem[]>([]);
  branches = signal<BranchResponse[]>([]);
  transfers = signal<StockTransferResponse[]>([]);

  // UI state
  searchBranchId = signal<string>('');
  selectedTransfer = signal<StockTransferResponse | null>(null);
  showCreateModal = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  // New transfer modal form state
  newTransfer: StockTransferCreateRequest = {
    fromBranchId: 0,
    toBranchId: 0,
    requestedById: 0,
    statusId: 1, // Must exist in your DB Status table (e.g., 1 = Pending)
    items: [],
  };

  ngOnInit() {
    this.loadItems();
    this.loadTransfers();
    this.loadAllBranches();
  }

  loadAllBranches() {
    this.api.getAllBranches().subscribe({
      next: (data) => this.branches.set(data),
      error: () => this.errorMessage.set('Failed to load branches'),
    });
  }

  loadItems() {
    this.api.getInventory().subscribe({
      next: (data) => this.inventoryItems.set(data),
      error: () => this.errorMessage.set('Failed to load inventory items'),
    });
  }

  loadTransfers() {
    this.api.getTransfers().subscribe({
      next: (data) => {
        this.transfers.set(data);
        this.errorMessage.set(null);
      },
      error: () => {
        this.errorMessage.set('Could not connect to backend to fetch transfers.');
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
      error: () => this.errorMessage.set(`Failed to fetch transfers for Branch #${id}`),
    });
  }

  approve(id: number) {
    const approvedByUserId = this.currentUserId;
    if (!approvedByUserId) {
      alert('Your login session is missing a user ID. Sign in again and retry.');
      return;
    }

    this.api.approveTransfer(id, approvedByUserId).subscribe({
      next: (updated) => {
        this.transfers.update((list) => list.map((t) => (t.id === id ? updated : t)));
        if (this.selectedTransfer()?.id === id) this.selectedTransfer.set(updated);
      },
      error: (err) => {
        console.error(`Failed to approve transfer ${id}:`, err);
        alert(
          err?.error?.detail ||
            err?.error?.message ||
            err?.message ||
            'Could not approve transfer.',
        );
      },
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

  //
  // @NotNull
  // private Integer fromBranchId;
  // @NotNull
  // private Integer toBranchId;
  // @NotNull
  // private Integer requestedById;
  // @NotNull
  // private Integer statusId;
  // @NotEmpty
  // private List<TransferItemDto> items;
  get currentUserId(): number {
    return this.auth.session()?.id ?? 0;
  }

  get currentBranchId(): number {
    return this.auth.session()?.department?.branch?.id ?? 0;
  }

  openCreateModal() {
    this.newTransfer = {
      fromBranchId: this.currentBranchId,
      toBranchId: 0,
      requestedById: this.currentUserId, // Currently null in your JSON; check backend
      statusId: 1,
      items: [
        {
          inventoryItemId: 0,
          quantity: 1,
          inventoryItemName: '',
        },
      ],
    };
    this.showCreateModal.set(true);
  }

  addItemRow() {
    this.newTransfer.items.push({ inventoryItemId: 0, quantity: 0, inventoryItemName: '' });
  }

  removeItemRow(index: number) {
    this.newTransfer.items.splice(index, 1);
  }

  submitTransfer() {
    if (!this.newTransfer.fromBranchId || !this.newTransfer.toBranchId) {
      alert('Please select both source and destination branches.');
      return;
    }
    if (!this.newTransfer.requestedById) {
      alert('Your login session is missing a user ID. Sign in again and retry.');
      return;
    }
    if (this.newTransfer.fromBranchId === this.newTransfer.toBranchId) {
      alert('Source and destination branches cannot be the same.');
      return;
    }
    if (
      this.newTransfer.items.length === 0 ||
      this.newTransfer.items.some((i) => !i.inventoryItemId || i.quantity <= 0)
    ) {
      alert('Please select valid inventory items with quantities greater than 0.');
      return;
    }


    this.api.createTransfer(this.newTransfer).subscribe({
      next: (created) => {
        // Add new transfer to top of the list and close modal
        this.transfers.update((list) => [created, ...list]);
        this.showCreateModal.set(false);
      },
      error: (err) => {
        console.error(err);
        alert(err?.error?.message || 'Failed to create transfer.');
      },
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
      error: () => alert('Failed to download PDF manifest'),
    });
  }

  getTotalItemsCount(t: StockTransferResponse): number {
    return t.items ? t.items.reduce((acc, curr) => acc + curr.quantity, 0) : 0;
  }
}
