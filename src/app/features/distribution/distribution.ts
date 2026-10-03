import { Component, inject, OnInit, signal } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { ConsumptionResponseDTO } from '../../models/domain.models';

@Component({
  imports: [],
  selector: 'app-distribution',
  styleUrl: './distribution.css',
  templateUrl: './distribution.html',
})
export class Distribution implements OnInit {
  private api = inject(ApiService);
  consumptions = signal<ConsumptionResponseDTO[]>([]);

  ngOnInit() {
    this.api.getConsumptions().subscribe({
      next: (d) => this.consumptions.set(d),
      error: () =>
        this.consumptions.set([
          {
            id: 1,
            requestNumber: 'REQ-501',
            departmentName: 'Maintenance',
            totalCost: 450,
            status: 'CONSUMED',
            date: '2026-03-30',
          },
          {
            id: 2,
            requestNumber: 'REQ-502',
            departmentName: 'Assembly',
            totalCost: 1200,
            status: 'ALLOCATED',
            date: '2026-03-31',
          },
        ]),
    });
  }
}
