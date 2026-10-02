import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { BranchResponse } from '../../models/domain.models';

@Component({
  selector: 'app-organization',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-xl font-bold text-slate-900">Branch Entities</h1>
        <p class="text-xs text-slate-500">Corporate branch hierarchy and network nodes.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        @for (b of branches(); track b.id) {
          <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-2">
            <div class="flex justify-between items-start">
              <span
                class="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded"
                >{{ b.code }}</span
              >
              <span
                class="h-2 w-2 rounded-full"
                [ngClass]="b.active ? 'bg-emerald-500' : 'bg-slate-300'"
              ></span>
            </div>
            <h3 class="font-bold text-sm text-slate-900">{{ b.name }}</h3>
            <p class="text-xs text-slate-500">{{ b.city }} Facility</p>
          </div>
        }
      </div>
    </div>
  `,
})
export class OrganizationComponent implements OnInit {
  private api = inject(ApiService);
  branches = signal<BranchResponse[]>([]);

  ngOnInit() {
    this.api.getBranches().subscribe({
      next: (d) => this.branches.set(d),
      error: () =>
        this.branches.set([
          {
            id: 1,
            name: 'Central Distribution Hub',
            code: 'CDH-01',
            city: 'Colombo',
            active: true,
          },
          { id: 2, name: 'North Branch Depot', code: 'NBD-02', city: 'Kandy', active: true },
          { id: 3, name: 'Southern Fulfillment Yard', code: 'SFY-03', city: 'Galle', active: true },
        ]),
    });
  }
}
