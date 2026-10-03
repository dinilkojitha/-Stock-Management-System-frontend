import { Component, inject, OnInit, signal } from '@angular/core';
import { OrderResponse } from '../../models/domain.models';
import { ApiService } from '../../core/services/api.service';

@Component({
  imports: [],
  selector: 'app-procurement',
  styleUrl: './procurement.css',
  templateUrl: './procurement.html',
})
export class Procurement implements OnInit {
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
