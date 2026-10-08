import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import {
  ConsumptionResponseDTO,
  InternalRequest,
  CreateInternalRequestDTO,
  StockAllocationRequestDTO,
  ConsumptionDTO,
  InternalRequestItemRecord,
  DepartmentResponse,
  InventoryItem,
} from '../../models/domain.models';

type ConsumptionFormItem = ConsumptionDTO['items'][number] & { consumptionId?: number };

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
  requestItemsByRequest = signal<Record<number, InternalRequestItemRecord[]>>({});
  consumptions = signal<ConsumptionResponseDTO[]>([]);
  requestsError = signal('');

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

  allocationForm: StockAllocationRequestDTO = { allocatedByUserId: 0, items: [] };
  allocationItems = signal<
    { itemId: number; itemName: string; requestedQuantity: number; quantityToAllocate: number }[]
  >([]);
  consumptionForm: Omit<ConsumptionDTO, 'items'> & { items: ConsumptionFormItem[] } = {
    requestId: 0,
    departmentId: 0,
    items: [],
  };
  allocationLimits = signal<Record<number, number>>({});
  consumptionLimits = signal<Record<number, number>>({});

  selectedRequest: InternalRequest | null = null;
  modalLoading = signal(false);
  modalError = signal('');

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
      forkJoin({
        requests: this.api.getInternalRequests(),
        requestItems: this.api.getInternalRequestItems(),
        consumptions: this.api.getConsumptions(),
      }).subscribe({
        next: ({ requests, requestItems, consumptions }) => {
          this.requests.set(requests);
          this.consumptions.set(consumptions);
          this.requestItemsByRequest.set(
            requestItems.reduce(
              (grouped, item) => {
                (grouped[item.id.requestId] ??= []).push(item);
                return grouped;
              },
              {} as Record<number, InternalRequestItemRecord[]>,
            ),
          );
          this.requestsError.set('');
        },
        error: (err) => {
          this.requestsError.set(this.errorMessage(err, 'Could not load internal requests and their items.'));
        },
      });
    } else {
      this.api.getConsumptions().subscribe({
        next: (res) => this.consumptions.set(res),
        error: (err) => console.error('Could not load consumption logs', err),
      });
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
    this.allocationItems.set([]);
    this.modalError.set('');
    this.modalLoading.set(true);
    this.activeModal.set('allocate');
    this.api.getInternalRequestItems().subscribe({
      next: (requestItems) => {
        const requestedItems = this.requestItemsFor(req, requestItems)
          .map(({ item, quantity, allocatedQuantity }) => ({
            itemId: item.id,
            remainingQuantity: Math.max(0, quantity - allocatedQuantity),
          }));
        const availableItems = requestedItems.filter((item) => item.remainingQuantity > 0);
        if (availableItems.length !== requestedItems.length) {
          this.modalLoading.set(false);
          this.modalError.set('This request has already been partially allocated and cannot be allocated again.');
          return;
        }
        this.allocationLimits.set(
          Object.fromEntries(availableItems.map((item) => [item.itemId, item.remainingQuantity])),
        );
        this.allocationItems.set(
          this.requestItemsFor(req, requestItems)
            .filter(({ item }) => availableItems.some((available) => available.itemId === item.id))
            .map(({ item, quantity }) => ({
              itemId: item.id,
              itemName: item.itemName || this.getItemName(item.id),
              requestedQuantity: quantity,
              quantityToAllocate: quantity,
            })),
        );
        this.allocationForm.items = this.allocationItems().map((item) => ({
          itemId: item.itemId,
          quantity: item.quantityToAllocate,
        }));
        this.modalLoading.set(false);
        if (this.allocationItems().length === 0) {
          this.modalError.set('This request has no items with remaining quantities to allocate.');
        }
      },
      error: (err) => {
        this.modalLoading.set(false);
        this.modalError.set(this.errorMessage(err, 'Could not load the requested items.'));
      },
    });
  }

  submitAllocation() {
    if (!this.selectedRequest) return;
    const allocatedByUserId = this.auth.session()?.id;
    if (!allocatedByUserId) {
      this.modalError.set('Your login session is missing a user ID. Sign in again and retry.');
      return;
    }
    const items = this.allocationItems().map((item) => ({
      itemId: item.itemId,
      quantity: item.quantityToAllocate,
    }));
    if (
      items.length === 0 ||
      this.allocationItems().some(
        (item) =>
          !Number.isFinite(item.quantityToAllocate) ||
          item.quantityToAllocate <= 0 ||
          item.quantityToAllocate !== (this.allocationLimits()[item.itemId] ?? 0),
      )
    ) {
      this.modalError.set('Allocate the full remaining quantity for every item in this request.');
      return;
    }
    this.api.allocateStock(this.selectedRequest.id, { allocatedByUserId, items }).subscribe({
      next: () => {
        const requestId = this.selectedRequest!.id;
        this.api.updateInternalRequestStatus(requestId, 'ALLOCATED').subscribe({
          next: () => {
            this.activeModal.set('none');
            this.loadData();
            alert('Stock allocated. Request status changed to ALLOCATED.');
          },
          error: (err) => {
            this.activeModal.set('none');
            this.loadData();
            alert(`Stock was allocated, but the request status could not be updated: ${this.errorMessage(err, 'Unknown error')}`);
          },
        });
      },
      error: (err) => this.modalError.set(this.errorMessage(err, 'Stock allocation failed.')),
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
    this.modalError.set('');
    this.modalLoading.set(true);
    this.activeModal.set('consume');
    forkJoin({
      requestItems: this.api.getInternalRequestItems(),
      consumptions: this.api.getConsumptions(),
    }).subscribe({
      next: ({ requestItems, consumptions }) => {
        const requestConsumptions = consumptions.filter((consumption) => consumption.requestId === req.id);
        const availableItems = this.requestItemsFor(req, requestItems)
          .map(({ item, allocatedQuantity }) => {
            const existing = requestConsumptions.find((consumption) => consumption.itemId === item.id);
            return {
              itemId: item.id,
              consumptionId: existing?.consumptionId,
              allocatedQuantity,
              consumedQuantity: existing?.quantityConsumed || 0,
            };
          })
          .filter(({ allocatedQuantity, consumedQuantity }) => allocatedQuantity > consumedQuantity);
        this.consumptionLimits.set(
          Object.fromEntries(availableItems.map(({ itemId, allocatedQuantity, consumedQuantity }) => [
            itemId,
            allocatedQuantity - consumedQuantity,
          ])),
        );
        this.consumptionForm.items = availableItems.map(({ itemId, consumptionId }) => ({
          itemId,
          quantityConsumed: 0,
          consumptionId,
        }));
        this.modalLoading.set(false);
        if (this.consumptionForm.items.length === 0) {
          this.modalError.set('There is no remaining allocated quantity to consume for this request.');
        }
      },
      error: (err) => {
        this.modalLoading.set(false);
        this.modalError.set(this.errorMessage(err, 'Could not load allocated items.'));
      },
    });
  }

  submitConsumption() {
    const items = this.consumptionForm.items.filter((item) => item.quantityConsumed > 0);
    if (!this.consumptionForm.departmentId) {
      this.modalError.set('This request has no department assigned.');
      return;
    }
    if (
      items.length === 0 ||
      items.some(
        (item) =>
          !Number.isFinite(item.quantityConsumed) ||
          item.quantityConsumed <= 0 ||
          item.quantityConsumed > (this.consumptionLimits()[item.itemId] ?? 0),
      )
    ) {
      this.modalError.set('Enter a positive quantity no greater than the remaining allocated amount.');
      return;
    }
    const actions = items.map((item) => {
      if (item.consumptionId) {
        return this.api.addConsumption(item.consumptionId, item.quantityConsumed);
      }
      return this.api.createConsumption({
        ...this.consumptionForm,
        items: [{ itemId: item.itemId, quantityConsumed: item.quantityConsumed }],
      });
    });
    forkJoin(actions).subscribe({
      next: () => {
        this.activeModal.set('none');
        this.loadData();
        alert('Consumption recorded. You can record more until the allocated quantity is fully consumed.');
      },
      error: (err) => this.modalError.set(this.errorMessage(err, 'Consumption could not be logged.')),
    });
  }

  private requestItemsFor(request: InternalRequest, items: InternalRequestItemRecord[]) {
    return items
      .filter((item) => item.id.requestId === request.id)
      .map((item) => ({
        item: item.item,
        quantity: item.quantity || 0,
        allocatedQuantity: item.allocatedQuantity || 0,
      }));
  }

  private errorMessage(err: any, fallback: string): string {
    const details = typeof err?.error === 'string' ? err.error : err?.error?.message;
    return details || err?.message || fallback;
  }

  // Helper getters to match updated domain.models
  getItemName(id: number): string {
    return this.inventoryItems().find((i) => i.id == id)?.itemName || `Item #${id}`;
  }
  getDeptName(id: number): string {
    return this.departments().find((d) => d.id == id)?.departmentName || `Dept #${id}`;
  }

  getRequestItems(requestId: number): InternalRequestItemRecord[] {
    return this.requestItemsByRequest()[requestId] || [];
  }

  hasAllocation(requestId: number): boolean {
    return this.getRequestItems(requestId).some((item) => (item.allocatedQuantity || 0) > 0);
  }

  canConsume(requestId: number): boolean {
    return this.getRequestItems(requestId).some((item) => {
      const consumed = this.consumptions()
        .filter((entry) => entry.requestId === requestId && entry.itemId === item.id.itemId)
        .reduce((total, entry) => total + entry.quantityConsumed, 0);
      return (item.allocatedQuantity || 0) > consumed;
    });
  }

  getRequestStatus(request: InternalRequest): string {
    if (this.getRequestItems(request.id).length === 0) return request.status;
    if (!this.hasAllocation(request.id)) return request.status;
    return this.canConsume(request.id) ? 'ALLOCATED' : 'COMPLETED';
  }
}
