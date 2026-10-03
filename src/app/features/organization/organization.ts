import { Component, inject, OnInit, signal } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { BranchResponse } from '../../models/domain.models';
import { NgClass } from '@angular/common';

@Component({
  imports: [NgClass],
  selector: 'app-organization',
  styleUrl: './organization.css',
  templateUrl: './organization.html',
})
export class Organization implements OnInit {
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
