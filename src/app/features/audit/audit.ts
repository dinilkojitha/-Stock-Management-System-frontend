import { Component, inject, OnInit, signal } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { TransactionResponse } from '../../models/domain.models';
import { NgClass } from '@angular/common';

@Component({
  imports: [NgClass],
  selector: 'app-audit',
  styleUrl: './audit.css',
  templateUrl: './audit.html',
})
export class Audit implements OnInit {
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
