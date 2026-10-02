import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { StockTransferResponse } from '../../models/domain.models';

@Component({
  selector: 'app-stock-transfers',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-xl font-bold text-slate-900">Branch Transfers</h1>
          <p class="text-xs text-slate-500">Stock relocation and manifest validation.</p>
        </div>
      </div>

      <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table class="w-full text-left border-collapse text-xs">
          <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
            <tr>
              <th class="py-3 px-4">Ref Number</th>
              <th class="py-3 px-4">Origin</th>
              <th class="py-3 px-4">Destination</th>
              <th class="py-3 px-4">Quantity</th>
              <th class="py-3 px-4">Status</th>
              <th class="py-3 px-4 text-right">Manifest</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            @for (t of transfers(); track t.id) {
              <tr class="hover:bg-slate-50 transition">
                <td class="py-3 px-4 font-mono font-medium">{{ t.transferNumber }}</td>
                <td class="py-3 px-4">{{ t.sourceBranchName }}</td>
                <td class="py-3 px-4">{{ t.destinationBranchName }}</td>
                <td class="py-3 px-4">{{ t.itemsCount }} items</td>
                <td class="py-3 px-4">
                  <span
                    class="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                    [ngClass]="{
                      'bg-amber-100 text-amber-700': t.status === 'PENDING',
                      'bg-indigo-100 text-indigo-700': t.status === 'DISPATCHED',
                      'bg-emerald-100 text-emerald-700': t.status === 'RECEIVED',
                    }"
                  >
                    {{ t.status }}
                  </span>
                </td>
                <td class="py-3 px-4 text-right">
                  <button
                    (click)="downloadManifest(t.id)"
                    class="text-indigo-600 hover:text-indigo-900 font-semibold"
                  >
                    PDF
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class StockTransfersComponent implements OnInit {
  private api = inject(ApiService);
  transfers = signal<StockTransferResponse[]>([]);

  ngOnInit() {
    this.api.getTransfers().subscribe({
      next: (d) => this.transfers.set(d),
      error: () =>
        this.transfers.set([
          {
            id: 1,
            transferNumber: 'TRX-101',
            sourceBranchName: 'Central Depot',
            destinationBranchName: 'North Warehouse',
            status: 'DISPATCHED',
            itemsCount: 40,
            createdAt: '2026-03-31',
          },
          {
            id: 2,
            transferNumber: 'TRX-102',
            sourceBranchName: 'Central Depot',
            destinationBranchName: 'South Hub',
            status: 'PENDING',
            itemsCount: 15,
            createdAt: '2026-03-31',
          },
        ]),
    });
  }

  downloadManifest(id: number) {
    this.api.downloadManifest(id).subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `manifest-${id}.pdf`;
      a.click();
    });
  }
}
