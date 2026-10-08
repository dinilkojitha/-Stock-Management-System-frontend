import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

import {
  OrderResponse,
  OrderRequest,
  OrderItemRequest,
  OrderReceiptRequest,
  OrderReceiptItemRequest,
  SupplierResponse,
  SupplierRequest,
  SupplierRatingResponse,
  EvaluationRequest,
  QuotationResponse,
  QuotationRequest,
  DeliveryUpdateRequest,
  InventoryItem,
  BranchResponse,
} from '../../models/domain.models';

@Component({
  selector: 'app-procurement',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrl: './procurement.css',
  templateUrl: './procurement.html',
})
export class Procurement implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);

  // =========================================================
  // UI STATE
  // =========================================================

  activeTab = signal<'orders' | 'suppliers' | 'quotations'>('orders');

  activeModal = signal<
    | 'none'
    | 'order'
    | 'orderDetails'
    | 'receive'
    | 'supplier'
    | 'evaluation'
    | 'quotation'
    | 'delivery'
  >('none');

  // =========================================================
  // DATA
  // =========================================================

  orders = signal<OrderResponse[]>([]);
  suppliers = signal<SupplierResponse[]>([]);
  quotations = signal<QuotationResponse[]>([]);
  items = signal<InventoryItem[]>([]);
  branches = signal<BranchResponse[]>([]);
  branchesLoading = signal(false);
  branchLoadError = signal<string | null>(null);
  receiving = signal(false);

  selectedOrder = signal<OrderResponse | null>(null);
  selectedSupplier = signal<SupplierResponse | null>(null);
  selectedSupplierRating = signal<SupplierRatingResponse | null>(null);

  // =========================================================
  // ORDER FORM
  // =========================================================

  newOrder: OrderRequest = {
    supplierId: 0,
    branchId: 0,
    createdByUserId: 0,
    expectedDeliveryDate: '',
    items: [],
  };

  newOrderItem: OrderItemRequest = {
    itemId: 0,
    quantity: 0,
  };

  // =========================================================
  // DELIVERY
  // =========================================================

  selectedOrderId = 0;

  deliveryUpdate: DeliveryUpdateRequest = {
    status: 'SHIPPED',
    actualDeliveryDate: '',
  };

  // =========================================================
  // RECEIVING
  // =========================================================

  receiveForm: OrderReceiptRequest = {
    branchId: 0,
    receivedByUserId: 0,
    actualDeliveryDate: '',
    items: [],
  };

  newReceiptItem: OrderReceiptItemRequest = {
    itemId: 0,
    quantity: 0,
    manufactureDate: '',
    expiryDate: '',
  };

  // =========================================================
  // SUPPLIER
  // =========================================================

  newSupplier: SupplierRequest = {
    companyName: '',
    contactPerson: '',
    email: '',
    phoneNumber: '',
    address: '',
  };

  editingSupplierId: number | null = null;

  // =========================================================
  // SUPPLIER EVALUATION
  // =========================================================

  evaluation: EvaluationRequest = {
    evaluatedByUserId: 0,
    rating: 5,
    deliveryRating: 5,
    qualityRating: 5,
    comments: '',
  };

  // =========================================================
  // QUOTATION
  // =========================================================

  newQuotation: QuotationRequest = {
    supplierId: 0,
    itemId: 0,
    quotedUnitCost: 0,
    availableQuantity: 0,
    validUntil: '',
    status: 'RECEIVED',
    notes: '',
  };

  quotationItemFilter = 0;

  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {
    this.loadData();
    this.loadBranches();
  }

  private loadBranches(): void {
    this.branchesLoading.set(true);
    this.branchLoadError.set(null);
    this.api.getAllBranches().subscribe({
      next: (branches) => this.branches.set(branches),
      error: (err) => {
        console.error('Failed to load branches for purchase order receiving', err);
        this.branchLoadError.set(err?.error?.message ?? 'Could not load branches.');
        this.branchesLoading.set(false);
      },
      complete: () => this.branchesLoading.set(false),
    });
  }

  // =========================================================
  // DATA LOADING
  // =========================================================

  loadData(): void {
    this.api.getSuppliers().subscribe({
      next: (res) => this.suppliers.set(res),
      error: (err) => console.error('Failed to load suppliers', err),
    });

    this.api.getOrders().subscribe({
      next: (res) => this.orders.set(res),
      error: (err) => console.error('Failed to load orders', err),
    });

    this.loadQuotations();

    this.api.getInventory().subscribe({
      next: (res) => this.items.set(res),
      error: (err) => console.error('Failed to load inventory', err),
    });
  }

  loadQuotations(): void {
    const itemId = this.quotationItemFilter > 0 ? this.quotationItemFilter : undefined;

    this.api.getQuotations(itemId).subscribe({
      next: (res) => this.quotations.set(res),
      error: (err) => console.error('Failed to load quotations', err),
    });
  }

  setTab(tab: 'orders' | 'suppliers' | 'quotations'): void {
    this.activeTab.set(tab);

    if (tab === 'quotations') {
      this.loadQuotations();
    }
  }

  // =========================================================
  // ORDERS
  // =========================================================

  openCreateOrder(): void {
    const userId = this.auth.session()?.id ?? 0;

    this.newOrder = {
      supplierId: 0,
      branchId: 0,
      createdByUserId: userId,
      expectedDeliveryDate: '',
      items: [],
    };

    this.newOrderItem = {
      itemId: 0,
      quantity: 1,
    };

    this.activeModal.set('order');
  }

  addOrderItem(): void {
    if (
      !this.newOrderItem.itemId ||
      !Number.isFinite(this.newOrderItem.quantity) ||
      this.newOrderItem.quantity <= 0
    ) {
      alert('Select an item and enter a positive quantity.');
      return;
    }

    const exists = this.newOrder.items.some((item) => item.itemId === this.newOrderItem.itemId);

    if (exists) {
      alert('An item can only appear once in a purchase order.');
      return;
    }

    this.newOrder.items.push({
      ...this.newOrderItem,
    });

    this.newOrderItem = {
      itemId: 0,
      quantity: 1,
    };
  }

  getInventoryItemName(itemId: number): string {
    return this.items().find((item) => item.id === itemId)?.itemName ?? `Item #${itemId}`;
  }

  removeOrderItem(index: number): void {
    this.newOrder.items.splice(index, 1);
  }

  submitOrder(): void {
    const userId = this.auth.session()?.id;

    if (!userId) {
      alert('Your login session does not contain a user ID.');
      return;
    }

    if (!this.newOrder.supplierId) {
      alert('Please select a supplier.');
      return;
    }

    if (!Number.isInteger(this.newOrder.branchId) || this.newOrder.branchId <= 0) {
      alert('Please select the branch for this purchase order.');
      return;
    }

    if (!this.newOrder.expectedDeliveryDate) {
      alert('Please select the expected delivery date.');
      return;
    }

    if (this.newOrder.items.length === 0) {
      alert('Add at least one item.');
      return;
    }

    const request: OrderRequest = {
      ...this.newOrder,
      createdByUserId: userId,
      expectedDeliveryDate: this.newOrder.expectedDeliveryDate,
    };

    this.api.createOrder(request).subscribe({
      next: () => {
        alert('Purchase order created successfully.');

        this.activeModal.set('none');

        this.loadData();
      },

      error: (err) => {
        console.error('Order creation failed', err);

        alert(err?.error?.message ?? 'Failed to create purchase order.');
      },
    });
  }

  // =========================================================
  // ORDER DETAILS
  // =========================================================

  openOrderDetails(id: number): void {
    this.api.getOrderById(id).subscribe({
      next: (order) => {
        this.selectedOrder.set(order);
        this.activeModal.set('orderDetails');
      },

      error: (err) => {
        console.error(err);
        alert('Failed to load order details.');
      },
    });
  }

  // =========================================================
  // DELIVERY STATUS
  // =========================================================

  openDeliveryModal(id: number): void {
    this.selectedOrderId = id;

    this.deliveryUpdate = {
      status: 'SHIPPED',
    };

    this.activeModal.set('delivery');
  }

  submitDeliveryUpdate(): void {
    this.api.updateDelivery(this.selectedOrderId, this.deliveryUpdate).subscribe({
      next: () => {
        this.activeModal.set('none');
        this.loadData();
      },

      error: (err) => {
        console.error(err);

        alert(err?.error?.message ?? 'Failed to update delivery status.');
      },
    });
  }

  // =========================================================
  // RECEIVING
  // =========================================================

  openReceiveModal(order: OrderResponse): void {
    const userId = this.auth.session()?.id ?? 0;

    this.selectedOrder.set(order);
    this.selectedOrderId = order.id;
    this.receiving.set(false);

    this.receiveForm = {
      branchId: order.branchId ?? 0,
      receivedByUserId: userId,
      actualDeliveryDate: new Date().toISOString().split('T')[0],
      items: [],
    };

    this.newReceiptItem = {
      itemId: 0,
      quantity: 1,
      manufactureDate: '',
      expiryDate: '',
    };

    this.activeModal.set('receive');
  }

  receivableOrderItems(): OrderResponse['items'] {
    return (this.selectedOrder()?.items ?? []).filter(
      (item) => item.quantity - item.receivedQuantity > 0,
    );
  }

  remainingQuantity(itemId: number): number {
    const item = this.selectedOrder()?.items.find((orderItem) => orderItem.itemId === itemId);
    return item ? Math.max(0, item.quantity - item.receivedQuantity) : 0;
  }

  submitReceipt(): void {
    const userId = this.auth.session()?.id;

    if (!userId) {
      alert('Receiving user ID is missing.');
      return;
    }

    if (!Number.isInteger(this.receiveForm.branchId) || this.receiveForm.branchId <= 0) {
      alert('This order has no branch assigned. Select a branch to complete this receipt.');
      return;
    }

    if (!this.newReceiptItem.itemId) {
      alert('Select an order item to receive.');
      return;
    }

    const remaining = this.remainingQuantity(this.newReceiptItem.itemId);
    if (remaining <= 0) {
      alert('The selected item has already been fully received.');
      return;
    }

    if (
      this.newReceiptItem.manufactureDate &&
      this.newReceiptItem.expiryDate &&
      this.newReceiptItem.expiryDate < this.newReceiptItem.manufactureDate
    ) {
      alert('Expiry date cannot be earlier than the manufacture date.');
      return;
    }

    this.receiveForm.receivedByUserId = userId;
    this.receiveForm.items = [{
      ...this.newReceiptItem,
      quantity: remaining,
    }];
    this.receiving.set(true);

    this.api.receiveOrder(this.selectedOrderId, this.receiveForm).subscribe({
      next: (order) => {
        this.selectedOrder.set(order);

        alert(
          order.status === 'DELIVERED'
            ? 'Order fully received and delivered.'
            : 'Receipt recorded successfully. Order is partially received.',
        );

        this.activeModal.set('none');

        this.loadData();
      },

      error: (err) => {
        console.error('Receipt failed', err);

        alert(err?.error?.message ?? 'Failed to receive purchase order.');
        this.receiving.set(false);
      },
      complete: () => this.receiving.set(false),
    });
  }

  // =========================================================
  // SUPPLIERS
  // =========================================================

  openCreateSupplier(): void {
    this.editingSupplierId = null;

    this.newSupplier = {
      companyName: '',
      contactPerson: '',
      email: '',
      phoneNumber: '',
      address: '',
    };

    this.activeModal.set('supplier');
  }

  openEditSupplier(supplier: SupplierResponse): void {
    this.editingSupplierId = supplier.id;

    this.newSupplier = {
      companyName: supplier.companyName,
      contactPerson: supplier.contactPerson,
      email: supplier.email,
      phoneNumber: supplier.phoneNumber,
      address: supplier.address,
    };

    this.activeModal.set('supplier');
  }

  submitSupplier(): void {
    if (!this.newSupplier.companyName.trim()) {
      alert('Company name is required.');
      return;
    }

    const request = {
      ...this.newSupplier,
      companyName: this.newSupplier.companyName.trim(),
    };

    if (this.editingSupplierId) {
      this.api.updateSupplier(this.editingSupplierId, request).subscribe({
        next: () => {
          this.activeModal.set('none');
          this.loadData();
        },

        error: (err) => {
          console.error(err);
          alert(err?.error?.message ?? 'Failed to update supplier.');
        },
      });
    } else {
      this.api.createSupplier(request).subscribe({
        next: () => {
          this.activeModal.set('none');
          this.loadData();
        },

        error: (err) => {
          console.error(err);
          alert(err?.error?.message ?? 'Failed to create supplier.');
        },
      });
    }
  }

  deleteSupplier(id: number): void {
    if (!confirm('Are you sure you want to delete this supplier?')) {
      return;
    }

    this.api.deleteSupplier(id).subscribe({
      next: () => this.loadData(),

      error: (err) => {
        console.error(err);

        alert(err?.error?.message ?? 'Cannot delete this supplier.');
      },
    });
  }

  // =========================================================
  // SUPPLIER EVALUATION
  // =========================================================

  openEvaluation(supplier: SupplierResponse): void {
    const userId = this.auth.session()?.id ?? 0;

    this.selectedSupplier.set(supplier);

    this.evaluation = {
      evaluatedByUserId: userId,
      rating: 5,
      deliveryRating: 5,
      qualityRating: 5,
      comments: '',
    };

    this.loadSupplierRating(supplier.id);

    this.activeModal.set('evaluation');
  }

  loadSupplierRating(id: number): void {
    this.api.getSupplierRating(id).subscribe({
      next: (rating) => this.selectedSupplierRating.set(rating),

      error: (err) => {
        console.error('Failed to load supplier rating', err);

        this.selectedSupplierRating.set(null);
      },
    });
  }

  submitEvaluation(): void {
    const supplier = this.selectedSupplier();

    if (!supplier) {
      return;
    }

    const userId = this.auth.session()?.id;

    if (!userId) {
      alert('Your user ID is missing.');
      return;
    }

    if (this.evaluation.rating < 1 || this.evaluation.rating > 5) {
      alert('Rating must be between 1 and 5.');
      return;
    }

    this.evaluation.evaluatedByUserId = userId;

    this.api.evaluateSupplier(supplier.id, this.evaluation).subscribe({
      next: (rating) => {
        this.selectedSupplierRating.set(rating);

        alert('Supplier evaluation submitted successfully.');

        this.activeModal.set('none');

        this.loadData();
      },

      error: (err) => {
        console.error(err);

        alert(err?.error?.message ?? 'Failed to evaluate supplier.');
      },
    });
  }

  // =========================================================
  // QUOTATIONS
  // =========================================================

  openCreateQuotation(): void {
    this.newQuotation = {
      supplierId: 0,
      itemId: 0,
      quotedUnitCost: 0,
      availableQuantity: 0,
      validUntil: '',
      status: 'RECEIVED',
      notes: '',
    };

    this.activeModal.set('quotation');
  }

  submitQuotation(): void {
    if (!this.newQuotation.supplierId) {
      alert('Select a supplier.');
      return;
    }

    if (!this.newQuotation.itemId) {
      alert('Select an inventory item.');
      return;
    }

    if (this.newQuotation.quotedUnitCost <= 0) {
      alert('Quoted unit cost must be greater than zero.');
      return;
    }

    if (this.newQuotation.availableQuantity <= 0) {
      alert('Available quantity must be greater than zero.');
      return;
    }

    this.api.createQuotation(this.newQuotation).subscribe({
      next: () => {
        this.activeModal.set('none');

        this.loadQuotations();
      },

      error: (err) => {
        console.error('Quotation creation failed', err);

        alert(err?.error?.message ?? 'Failed to create quotation.');
      },
    });
  }
}
