import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import {
  AuditTransaction,
  CreateTransactionRequest,
  InventoryItem,
} from '../../models/domain.models';

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrl: './audit.css',
  templateUrl: './audit.html',
})
export class Audit implements OnInit {
  private api = inject(ApiService);
  readonly auth = inject(AuthService);

  logs = signal<AuditTransaction[]>([]);
  inventoryItems = signal<InventoryItem[]>([]);

  isModalOpen = signal(false);

  // Form Model matching Spring Boot constraints
  newTx: CreateTransactionRequest = {
    transactionType: 'ADJUSTMENT',
    userUserid: { id: 0 },
    item: { id: 0 },
    quantityDelta: 0,
    remarks: '',
  };

  ngOnInit() {
    this.loadData();
    // Preload inventory items for the dropdown
    this.api.getInventory().subscribe((items) => this.inventoryItems.set(items));
  }

  loadData() {
    this.api.getTransactions().subscribe({
      next: (data) => {
        // Sort descending by ID so newest is on top
        const sorted = data.sort((a, b) => b.id - a.id);
        this.logs.set(sorted);
      },
      error: (err) => console.error('Failed to load transactions', err),
    });
  }

  openModal() {
    this.newTx = {
      transactionType: 'ADJUSTMENT',
      userUserid: { id: this.auth.session()?.id ?? 0 },
      item: { id: 0 },
      quantityDelta: 0,
      remarks: '',
    };
    this.isModalOpen.set(true);
  }

  submitTransaction() {
    // Basic Validation matching backend rules
    if (this.newTx.item.id === 0) {
      alert('Please select an item.');
      return;
    }
    if (this.newTx.quantityDelta === 0) {
      alert('Quantity Delta cannot be zero.');
      return;
    }
    if (!this.newTx.transactionType) {
      alert('Type is required.');
      return;
    }

    const userId = this.auth.session()?.id;
    if (!userId) {
      alert('Your login session is missing a user ID. Sign in again and retry.');
      return;
    }

    this.api.createTransaction({ ...this.newTx, userUserid: { id: userId } }).subscribe({
      next: () => {
        this.isModalOpen.set(false);
        this.loadData();
      },
      error: (err) => {
        console.error(err);
        alert(err?.error?.message || 'Failed to log transaction.');
      },
    });
  }

  get currentUserName(): string {
    return this.auth.session()?.fullName || 'Current user';
  }

  deleteTransaction(id: number) {
    if (
      confirm(
        `Are you sure you want to delete Transaction #${id}? Immutable ledger best practices advise against this!`,
      )
    ) {
      this.api.deleteTransaction(id).subscribe({
        next: () => this.loadData(),
        error: (err) => alert('Failed to delete transaction.'),
      });
    }
  }
}
