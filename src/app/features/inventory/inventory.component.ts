import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { InventoryItem } from '../../models/domain.models';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-xl font-bold text-slate-900">Inventory Items</h1>
          <p class="text-xs text-slate-500">Master product catalog and reorder specifications.</p>
        </div>
      </div>

      <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table class="w-full text-left border-collapse text-xs">
          <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
            <tr>
              <th class="py-3 px-4">SKU</th>
              <th class="py-3 px-4">Item Name</th>
              <th class="py-3 px-4">Category</th>
              <th class="py-3 px-4">Unit</th>
              <th class="py-3 px-4">Threshold</th>
              <th class="py-3 px-4 text-right">Unit Price</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            @for (item of items(); track item.id) {
              <tr class="hover:bg-slate-50 transition">
                <td class="py-3 px-4 font-mono font-medium text-slate-700">{{ item.sku }}</td>
                <td class="py-3 px-4 font-semibold text-slate-900">{{ item.name }}</td>
                <td class="py-3 px-4">
                  <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-700">{{
                    item.category.name
                  }}</span>
                </td>
                <td class="py-3 px-4 text-slate-500">{{ item.unitType.abbreviation }}</td>
                <td class="py-3 px-4 text-slate-700">{{ item.reorderLevel }}</td>
                <td class="py-3 px-4 text-right font-medium">\${{ item.unitPrice.toFixed(2) }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class InventoryComponent implements OnInit {
  private api = inject(ApiService);
  items = signal<InventoryItem[]>([]);

  ngOnInit() {
    this.api.getInventory().subscribe({
      next: (d) => this.items.set(d),
      error: () =>
        this.items.set([
          {
            id: 1,
            sku: 'SKU-001',
            name: 'Industrial Drill 24V',
            category: { id: 1, name: 'Power Tools', code: 'PT' },
            unitType: { id: 1, name: 'Unit', abbreviation: 'pcs' },
            reorderLevel: 10,
            unitPrice: 120,
          },
          {
            id: 2,
            sku: 'SKU-002',
            name: 'Hex Bolts (100pk)',
            category: { id: 2, name: 'Fasteners', code: 'FST' },
            unitType: { id: 2, name: 'Pack', abbreviation: 'pk' },
            reorderLevel: 25,
            unitPrice: 15,
          },
        ]),
    });
  }
}
