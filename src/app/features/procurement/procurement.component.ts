import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { OrderResponse } from '../../models/domain.models';

@Component({
  selector: 'app-procurement',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-xl font-bold text-slate-900">Procurement Orders</h1>
        <p class="text-xs text-slate-500">Supplier purchasing and order fulfillment.</p>
      </div>

      <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table class="w-full text-left border-collapse text-xs">
          <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
            <tr>
              <th class="py-3 px-4">PO Code</th>
              <th class="py-3 px-4">Supplier</th>
              <th class="py-3 px-4">Order Date</th>
              <th class="py-3 px-4">Status</th>
              <th class="py-3 px-4 text-right">Total</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            @for (o of orders(); track o.id) {
              <tr class="hover:bg-slate-50 transition">
                <td class="py-3 px-4 font-mono font-medium">{{ o.orderNumber }}</td>
                <td class="py-3 px-4 font-semibold text-slate-800">{{ o.supplierName }}</td>
                <td class="py-3 px-4 text-slate-500">{{ o.orderDate }}</td>
                <td class="py-3 px-4">
                  <span class="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-medium">{{
                    o.status
                  }}</span>
                </td>
                <td class="py-3 px-4 text-right font-medium">\${{ o.totalAmount.toFixed(2) }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class ProcurementComponent implements OnInit {
  private api = inject(ApiService);
  orders = signal<OrderResponse[]>([]);

  ngOnInit() {
    this.api.getOrders().subscribe({
      next: (d) => this.orders.set(d),
      error: () =>
        this.orders.set([
          {
            id: 1,
            orderNumber: 'PO-2026-01',
            supplierName: 'Precision Tools Co.',
            totalAmount: 4300,
            status: 'CONFIRMED',
            orderDate: '2026-03-28',
          },
          {
            id: 2,
            orderNumber: 'PO-2026-02',
            supplierName: 'Global Fasteners Ltd.',
            totalAmount: 890,
            status: 'ORDERED',
            orderDate: '2026-03-31',
          },
        ]),
    });
  }
}
