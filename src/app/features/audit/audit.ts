import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
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

  logs = signal<AuditTransaction[]>([]);
  inventoryItems = signal<InventoryItem[]>([]);

  isModalOpen = signal(false);

  // Form Model matching Spring Boot constraints
  newTx: CreateTransactionRequest = {
    transactionType: 'ADJUSTMENT',
    userUserid: { id: 1 }, // Default user ID (MUST exist in your DB)
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
      userUserid: { id: 1 },
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

    this.api.createTransaction(this.newTx).subscribe({
      next: () => {
        this.isModalOpen.set(false);
        this.loadData();
      },
      error: (err) => {
        console.error(err);
        alert(
          'Failed to log transaction. Ensure User ID ' +
            this.newTx.userUserid.id +
            ' exists in the database.',
        );
      },
    });
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
