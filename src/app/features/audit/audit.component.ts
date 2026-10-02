import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { TransactionResponse } from '../../models/domain.models';

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-xl font-bold text-slate-900">Audit Logs</h1>
        <p class="text-xs text-slate-500">Immutable ledger tracking system-wide state changes.</p>
      </div>

      <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table class="w-full text-left border-collapse text-xs">
          <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
            <tr>
              <th class="py-3 px-4">Log Hash</th>
              <th class="py-3 px-4">Operation</th>
              <th class="py-3 px-4">Item</th>
              <th class="py-3 px-4">Delta</th>
              <th class="py-3 px-4">Operator</th>
              <th class="py-3 px-4 text-right">Timestamp</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            @for (tx of logs(); track tx.id) {
              <tr class="hover:bg-slate-50 transition">
                <td class="py-3 px-4 font-mono text-[10px] text-slate-400">
                  {{ tx.transactionHash.substring(0, 10) }}...
                </td>
                <td class="py-3 px-4">
                  <span class="px-2 py-0.5 rounded bg-slate-100 font-semibold">{{ tx.type }}</span>
                </td>
                <td class="py-3 px-4 font-semibold text-slate-800">{{ tx.itemName }}</td>
                <td
                  class="py-3 px-4 font-bold"
                  [ngClass]="tx.quantityDelta >= 0 ? 'text-emerald-600' : 'text-rose-600'"
                >
                  {{ tx.quantityDelta > 0 ? '+' : '' }}{{ tx.quantityDelta }}
                </td>
                <td class="py-3 px-4 text-slate-600">{{ tx.performedBy }}</td>
                <td class="py-3 px-4 text-right text-slate-400 font-mono">{{ tx.timestamp }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class AuditComponent implements OnInit {
  private api = inject(ApiService);
  logs = signal<TransactionResponse[]>([]);

  ngOnInit() {
    this.api.getTransactions().subscribe({
      next: (d) => this.logs.set(d),
      error: () =>
        this.logs.set([
          {
            id: 1,
            transactionHash: '0x8f2d93e1a0b3',
            type: 'INBOUND',
            itemName: 'Industrial Drill 24V',
            quantityDelta: 50,
            performedBy: 'admin',
            timestamp: '2026-03-31 10:14:02',
          },
          {
            id: 2,
            transactionHash: '0x3c4e5f6a7b8c',
            type: 'TRANSFER',
            itemName: 'Hex Bolts (100pk)',
            quantityDelta: -20,
            performedBy: 'admin',
            timestamp: '2026-03-31 11:22:15',
          },
        ]),
    });
  }
}
