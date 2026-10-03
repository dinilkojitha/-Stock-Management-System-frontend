import { Component, inject, OnInit, signal } from '@angular/core';
import { ForecastResponse } from '../../models/domain.models';
import { ApiService } from '../../core/services/api.service';

@Component({
  imports: [],
  selector: 'app-forecasting',
  styleUrl: './forecasting.css',
  templateUrl: './forecasting.html',
})
export class Forecasting implements OnInit {
  private api = inject(ApiService);
  forecasts = signal<ForecastResponse[]>([]);

  ngOnInit() {
    this.api.getForecasts().subscribe({
      next: (d) => this.forecasts.set(d),
      error: () =>
        this.forecasts.set([
          {
            itemId: 1,
            itemName: 'Hydraulic Seals 12mm',
            currentStock: 14,
            burnRatePerDay: 2.3,
            predictedDepletionDays: 6,
            suggestedReorderQuantity: 100,
            confidenceScore: 0.94,
          },
          {
            itemId: 2,
            itemName: 'Lithium Battery Pack',
            currentStock: 8,
            burnRatePerDay: 2.6,
            predictedDepletionDays: 3,
            suggestedReorderQuantity: 50,
            confidenceScore: 0.89,
          },
        ]),
    });
  }
}
