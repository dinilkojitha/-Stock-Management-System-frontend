import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import {
  ConsumptionResponseDTO,
  InternalRequest,
  CreateInternalRequestDTO,
  StockAllocationRequestDTO,
  ConsumptionDTO,
  DepartmentResponse,
  InventoryItem,
} from '../../models/domain.models';

@Component({
  selector: 'app-distribution',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrl: './distribution.css',
  templateUrl: './distribution.html',
})
export class Distribution implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);

  // UI State
  activeTab = signal<'requests' | 'consumptions'>('requests');
  activeModal = signal<'none' | 'request' | 'allocate' | 'consume'>('none');

  // Data Signals
  requests = signal<InternalRequest[]>([]);
  consumptions = signal<ConsumptionResponseDTO[]>([]);

  // Reference Data (for dropdowns)
  departments = signal<DepartmentResponse[]>([]);
  inventoryItems = signal<InventoryItem[]>([]);

  // Forms
  newRequest: CreateInternalRequestDTO = {
    departmentId: 0,
    requestedByUserId: 0,
    requestedAt: new Date().toISOString(),
    emergencyRequest: false,
    status: 'PENDING',
    items: [],
  };
  requestItem = { itemId: 0, quantity: 1 };

  allocationForm: StockAllocationRequestDTO = { items: [] };
  consumptionForm: ConsumptionDTO = { requestId: 0, departmentId: 0, items: [] };

  selectedRequest: InternalRequest | null = null;

  get currentUserName(): string {
    return this.auth.session()?.fullName || 'Current user';
  }

  ngOnInit() {
    this.loadData();
    this.loadReferenceData();
  }

  setTab(tab: 'requests' | 'consumptions') {
    this.activeTab.set(tab);
    this.loadData();
  }

  loadData() {
    if (this.activeTab() === 'requests') {
      this.api.getInternalRequests().subscribe((res) => this.requests.set(res));
    } else {
      this.api.getConsumptions().subscribe((res) => this.consumptions.set(res));
    }
  }

  loadReferenceData() {
    this.api.getAllDepartments().subscribe((res) => this.departments.set(res));
    this.api.getInventory().subscribe((res) => this.inventoryItems.set(res));
  }

  // --- Request Operations ---
  addRequestItem() {
    if (this.requestItem.itemId && this.requestItem.quantity > 0) {
      this.newRequest.items.push({ ...this.requestItem });
      this.requestItem = { itemId: 0, quantity: 1 }; // reset
    }
  }

  submitRequest() {
    // Basic Validation to prevent 500 Backend Errors
    if (!this.newRequest.departmentId || this.newRequest.departmentId == 0) {
      alert('Please select a Department!');
      return;
    }
    const requestedByUserId = this.auth.session()?.id;
    if (!requestedByUserId) {
      alert('Your login session is missing a user ID. Sign in again and retry.');
      return;
    }
    if (this.newRequest.items.length === 0) {
      alert('Please add at least one item!');
      return;
    }

    this.newRequest.requestedAt = new Date().toISOString();

    this.api
      .createInternalRequest({ ...this.newRequest, requestedByUserId })
      .subscribe({
      next: () => {
        this.activeModal.set('none');
        this.newRequest.items = []; // reset
        this.newRequest.departmentId = 0;
        this.loadData();
        alert('Request created successfully!');
      },
      error: (err) => {
        console.error('Request creation failed:', err);
        alert(err?.error?.message || 'Failed to create the request.');
      },
    });
  }

  deleteRequest(id: number) {
    if (confirm('Are you sure you want to delete this request?')) {
      this.api.deleteInternalRequest(id).subscribe(() => this.loadData());
    }
  }

  // --- Allocation Operations ---
  openAllocateModal(req: InternalRequest) {
    this.selectedRequest = req;
    this.allocationForm.items = [];
    this.activeModal.set('allocate');
  }

  addAllocationItem() {
    this.allocationForm.items.push({ itemId: 0, quantity: 1 });
  }

  submitAllocation() {
    if (!this.selectedRequest) return;
    this.api.allocateStock(this.selectedRequest.id, this.allocationForm).subscribe({
      next: () => {
        this.activeModal.set('none');
        alert('Stock successfully allocated!');
        this.loadData();
      },
      error: (err) => alert('Allocation failed: ' + err.message),
    });
  }

  // --- Consumption Operations ---
  openConsumeModal(req: InternalRequest) {
    this.selectedRequest = req;
    this.consumptionForm = {
      requestId: req.id,
      departmentId: req.department?.id || 0,
      items: [],
    };
    this.activeModal.set('consume');
  }

  addConsumptionItem() {
    this.consumptionForm.items.push({ itemId: 0, quantityConsumed: 1 });
  }

  submitConsumption() {
    this.api.createConsumption(this.consumptionForm).subscribe({
      next: () => {
        this.activeModal.set('none');
        alert('Consumption logged successfully!');
        this.setTab('consumptions');
      },
      error: (err) =>
        alert('Consumption failed. Ensure quantity does not exceed allocated amount.'),
    });
  }

  // Helper getters to match updated domain.models
  getItemName(id: number): string {
    return this.inventoryItems().find((i) => i.id == id)?.itemName || `Item #${id}`;
  }
  getDeptName(id: number): string {
    return this.departments().find((d) => d.id == id)?.departmentName || `Dept #${id}`;
  }
}
