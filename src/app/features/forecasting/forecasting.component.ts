import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { ForecastResponse } from '../../models/domain.models';

@Component({
  selector: 'app-forecasting',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-xl font-bold text-slate-900">Stock Forecasting</h1>
        <p class="text-xs text-slate-500">Run-out predictions and smart replenish orders.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        @for (f of forecasts(); track f.itemId) {
          <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
            <div class="flex justify-between items-start">
              <h3 class="font-bold text-xs text-slate-900">{{ f.itemName }}</h3>
              <span
                class="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded"
              >
                {{ (f.confidenceScore * 100).toFixed(0) }}% score
              </span>
            </div>
            <div class="space-y-1 text-xs text-slate-600">
              <p>
                Current: <strong class="text-slate-800">{{ f.currentStock }} units</strong>
              </p>
              <p>
                Depletion In:
                <strong class="text-rose-600">{{ f.predictedDepletionDays }} days</strong>
              </p>
              <p>
                Suggested Order:
                <strong class="text-indigo-600">{{ f.suggestedReorderQuantity }} units</strong>
              </p>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class ForecastingComponent implements OnInit {
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
