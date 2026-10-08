import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import {
  InventoryItem,
  PlanningRecommendation,
  ParsedForecastDbRow,
} from '../../models/domain.models';

@Component({
  selector: 'app-forecasting',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrl: './forecasting.css',
  templateUrl: './forecasting.html',
})
export class Forecasting implements OnInit {
  private api = inject(ApiService);

  // UI State
  activeTab = signal<'planning' | 'wastage' | 'database'>('planning');
  inventoryItems = signal<InventoryItem[]>([]);

  // Tab 1: Smart Planning
  smartPlans = signal<PlanningRecommendation[]>([]);

  // Tab 2: Wastage
  wastageItemId = signal<number>(0);
  wastageReport = signal<string>('Select an item to view report.');
  totalWastageText = signal<string>('--');
  wastageCostText = signal<string>('--');
  wastageForm = { quantity: 1, reason: 'Expired', userId: 1 }; // Default user ID 1 (must exist in DB)

  // Tab 3: Forecast DB
  forecastDbRows = signal<ParsedForecastDbRow[]>([]);
  activeModal = signal<'none' | 'create'>('none');
  newForecast = { itemId: 0, period: 'Monthly' };

  ngOnInit() {
    this.api.getInventory().subscribe((items) => {
      this.inventoryItems.set(items);
      this.loadSmartPlans(items);
    });
  }

  setTab(tab: 'planning' | 'wastage' | 'database') {
    this.activeTab.set(tab);
    if (tab === 'database') this.loadDatabase();
  }

  // --- 1. Smart Planning ---
  loadSmartPlans(items: InventoryItem[]) {
    if (items.length === 0) return;

    // Fetch the text-based planning recommendation for each item simultaneously
    const requests = items.map((item) => this.api.getPlanningRecommendation(item.id!, 'Monthly'));

    forkJoin(requests).subscribe({
      next: (responses) => {
        const parsedPlans = responses.map((res, i) => this.parsePlanningString(items[i].id!, res));
        this.smartPlans.set(parsedPlans.filter((p) => p !== null) as PlanningRecommendation[]);
      },
      error: (err) => console.error('Could not load planning predictions', err),
    });
  }

  // Engine to convert backend String to UI Object
  parsePlanningString(itemId: number, raw: string): PlanningRecommendation | null {
    if (!raw || raw.includes('not found')) return null;
    const extract = (key: string) => {
      const match = raw.match(new RegExp(`${key}:\\s*([^,]+)`));
      return match ? match[1].trim() : '';
    };

    return {
      itemId: itemId,
      itemName: extract('Item'),
      currentStock: parseFloat(extract('Current Stock')) || 0,
      reorderThreshold: parseFloat(extract('Reorder Threshold')) || 0,
      forecastPeriod: extract('Forecast Period'),
      predictedDemand: parseFloat(extract('Predicted Demand')) || 0,
      recommendedPurchase: parseFloat(extract('Recommended Purchase')) || 0,
    };
  }

  // --- 2. Wastage Management ---
  onWastageItemChange() {
    const id = this.wastageItemId();
    if (!id || id == 0) return;

    this.api.getWastageHistory(id).subscribe((res) => this.wastageReport.set(res));
    this.api.getTotalWastage(id).subscribe((res) => this.totalWastageText.set(res));
    this.api.getWastageCost(id).subscribe((res) => this.wastageCostText.set(res));
  }

  submitWastage() {
    if (!this.wastageItemId()) {
      alert('Select an item first!');
      return;
    }

    this.api
      .recordWastage(
        this.wastageItemId(),
        this.wastageForm.userId,
        this.wastageForm.quantity,
        this.wastageForm.reason,
      )
      .subscribe({
        next: (res) => {
          alert(res); // Shows backend success message
          this.onWastageItemChange(); // refresh data
          this.wastageForm.quantity = 1;
          this.wastageForm.reason = '';
        },
        error: (err) =>
          alert(
            'Failed to record wastage. Ensure User ID exists and Stock is sufficient.\n\nBackend Error:\n' +
              err.message,
          ),
      });
  }

  // --- 3. Forecast DB ---
  loadDatabase() {
    this.api.getAllForecastsRaw().subscribe((res) => {
      if (res.includes('No forecasts found')) {
        this.forecastDbRows.set([]);
        return;
      }

      const rows = res
        .trim()
        .split('\n')
        .map((line) => {
          const extract = (key: string) => {
            const match = line.match(new RegExp(`${key}:\\s*([^,]+)`));
            return match ? match[1].trim() : '';
          };
          return {
            id: extract('Forecast ID'),
            itemName: extract('Item'),
            predictedDemand: extract('Predicted Demand'),
            date: extract('Forecast Date'),
            period: extract('Forecast Period'),
          };
        });
      this.forecastDbRows.set(rows);
    });
  }

  submitForecast() {
    const payload = {
      item: { id: this.newForecast.itemId },
      forecastPeriod: this.newForecast.period,
    };

    this.api.createForecast(payload).subscribe({
      next: (res) => {
        alert(res);
        this.activeModal.set('none');
        this.loadDatabase();
      },
      error: (err) => alert('Failed to generate forecast: ' + err.message),
    });
  }

  deleteForecast(id: string) {
    if (confirm('Delete this forecast record?')) {
      this.api.deleteForecast(parseInt(id)).subscribe(() => this.loadDatabase());
    }
  }
}
