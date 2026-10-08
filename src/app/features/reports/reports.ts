import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { AuditTransaction, InventoryItem } from '../../models/domain.models';

type ReportType = 'inventory' | 'transactions';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.html',
})
export class Reports implements OnInit {
  private api = inject(ApiService);

  activeReport = signal<ReportType>('inventory');
  inventory = signal<InventoryItem[]>([]);
  transactions = signal<AuditTransaction[]>([]);
  search = signal('');
  startDate = signal('');
  endDate = signal('');
  loading = signal(true);
  error = signal<string | null>(null);

  filteredInventory = computed(() => {
    const query = this.search().trim().toLocaleLowerCase();
    if (!query) return this.inventory();

    return this.inventory().filter((item) =>
      [item.itemName, item.category?.name, item.unitType?.name]
        .filter((value): value is string => typeof value === 'string')
        .some((value) => value.toLocaleLowerCase().includes(query)),
    );
  });

  filteredTransactions = computed(() => {
    const query = this.search().trim().toLocaleLowerCase();
    const start = this.startDate() ? new Date(`${this.startDate()}T00:00:00`) : null;
    const end = this.endDate() ? new Date(`${this.endDate()}T23:59:59.999`) : null;

    return this.transactions().filter((transaction) => {
      const date = new Date(transaction.transactedAt);
      if (start && date < start) return false;
      if (end && date > end) return false;
      if (!query) return true;

      return [
        transaction.transactionType,
        transaction.item?.itemName,
        transaction.remarks,
        String(transaction.userUserid?.id ?? ''),
      ]
        .filter((value): value is string => typeof value === 'string')
        .some((value) => value.toLocaleLowerCase().includes(query));
    });
  });

  ngOnInit() {
    this.loadReports();
  }

  setReport(report: ReportType) {
    this.activeReport.set(report);
    this.search.set('');
    this.startDate.set('');
    this.endDate.set('');
  }

  loadReports() {
    this.loading.set(true);
    this.error.set(null);
    forkJoin({
      inventory: this.api.getInventory(),
      transactions: this.api.getTransactions(),
    }).subscribe({
      next: ({ inventory, transactions }) => {
        this.inventory.set(inventory);
        this.transactions.set(
          [...transactions].sort(
            (left, right) =>
              new Date(right.transactedAt).getTime() - new Date(left.transactedAt).getTime(),
          ),
        );
        this.loading.set(false);
      },
      error: (error: unknown) => {
        console.error('Failed to load report data:', error);
        this.error.set('Could not load report data. Check the backend connection and try again.');
        this.loading.set(false);
      },
    });
  }

  exportReport() {
    const rows =
      this.activeReport() === 'inventory' ? this.inventoryCsvRows() : this.transactionCsvRows();
    if (rows.length < 2) return;

    const csv = rows.map((row) => row.map((value) => this.escapeCsv(value)).join(',')).join('\r\n');
    const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nexus-inventory-${this.activeReport()}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  private inventoryCsvRows(): string[][] {
    return [
      ['Item', 'Category', 'Quantity', 'Unit', 'Reorder threshold', 'Unit price', 'Stock value'],
      ...this.filteredInventory().map((item) => [
        item.itemName,
        item.category?.name ?? '',
        String(item.totalQuantity),
        item.unitType?.name ?? '',
        String(item.reorderThreshold),
        String(item.unitPrice),
        String(item.totalQuantity * item.unitPrice),
      ]),
    ];
  }

  private transactionCsvRows(): string[][] {
    return [
      ['Transaction ID', 'Type', 'Item', 'Quantity change', 'User ID', 'Date', 'Remarks'],
      ...this.filteredTransactions().map((transaction) => [
        String(transaction.id),
        transaction.transactionType,
        transaction.item?.itemName ?? `Item #${transaction.item?.id ?? ''}`,
        String(transaction.quantityDelta),
        String(transaction.userUserid?.id ?? ''),
        transaction.transactedAt,
        transaction.remarks ?? '',
      ]),
    ];
  }

  private escapeCsv(value: string): string {
    return `"${value.replaceAll('"', '""')}"`;
  }
}
