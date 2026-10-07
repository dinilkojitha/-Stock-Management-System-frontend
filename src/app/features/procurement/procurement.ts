import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import {
  OrderResponse,
  SupplierResponse,
  QuotationResponse,
  OrderRequest,
  SupplierRequest,
  QuotationRequest,
  DeliveryUpdateRequest,
  InventoryItem,
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

  // UI State
  activeTab = signal<'orders' | 'suppliers' | 'quotations'>('orders');
  activeModal = signal<'none' | 'order' | 'supplier' | 'quotation' | 'delivery'>('none');

  // Data Signals
  orders = signal<OrderResponse[]>([]);
  suppliers = signal<SupplierResponse[]>([]);
  quotations = signal<QuotationResponse[]>([]);
  items = signal<InventoryItem[]>([]); // Assuming items are fetched from the backend, adjust type as needed

  // Form Models
  newSupplier: SupplierRequest = {
    companyName: '',
    contactPerson: '',
    email: '',
    phoneNumber: '',
    address: '',
  };
  newQuotation: QuotationRequest = {
    supplierId: 0,
    items: [],
    quotedUnitCost: 0,
    availableQuantity: 0,
    validUntil: '',
    status: 'RECEIVED',
  };


  newQuotationItem = { itemId: 0, quantity: 1, unitCost: 0 }; // Temporary item to push into newOrder

  // For Order Form
  newOrder: OrderRequest = {
    supplierId: 0,
    createdByUserId: 2,
    expectedDeliveryDate: '',
    items: [],
  };
  newOrderItem = { itemId: 0, quantity: 1, unitCost: 0 }; // Temporary item to push into newOrder

  // For Delivery Update
  selectedOrderId: number = 0;
  deliveryUpdate: DeliveryUpdateRequest = { status: 'DELIVERED', actualDeliveryDate: '' };

  ngOnInit() {
    this.loadData();
  }

  setTab(tab: 'orders' | 'suppliers' | 'quotations') {
    this.activeTab.set(tab);
    this.loadData();
  }

  loadData() {
    this.api.getSuppliers().subscribe((res) => {
      this.suppliers.set(res);
    });

    this.api.getSuppliers().subscribe({
      next: (res) => {
        this.suppliers.set(res);
        console.log('Suppliers loaded successfully:', res);
      },
      error: (err) => {
        console.error('Failed to load suppliers:', err);
        alert('Failed to load suppliers. Check the backend console for the 500 error details.');
      },
    });
    this.api.getOrders().subscribe((res) => this.orders.set(res));
    this.api.getQuotations().subscribe((res) => this.quotations.set(res));

    console.log('Suppliers:', this.suppliers());

    this.api.getInventory().subscribe({
      next: (res) => {
        this.items.set(res);
        console.log('Inventory loaded successfully:', res);
      },
      error: (err) => {
        console.error('Failed to load inventory:', err);
        alert('Failed to load inventory. Check the backend console for the 500 error details.');
      },
    });
  }

  // --- Orders ---
  addOrderItem() {
    if (this.newOrderItem.itemId && this.newOrderItem.quantity > 0) {
      this.newOrder.items.push({ ...this.newOrderItem });
      this.newOrderItem = { itemId: 1, quantity: 1, unitCost: 1 };
    }
  }
  addQuotationItem() {
    if (this.newQuotationItem.itemId && this.newQuotationItem.quantity > 0) {
      this.newQuotation.items.push({ ...this.newQuotationItem });
    }
  }

  submitOrder() {
    console.log('Submitting Order:', this.newOrder);
    this.api.createOrder(this.newOrder).subscribe({
      next: () => {
        this.activeModal.set('none');
        this.newOrder = { supplierId: 0, createdByUserId: 2, expectedDeliveryDate: '', items: [] };
        this.loadData();
      },
      error: (err) => {
        console.error('Order creation failed:', err);
        alert('Failed to create Order. Check the backend console for the 500 error details.');
      },
    });
  }

  itemloader() {}

  openDeliveryModal(orderId: number) {
    this.selectedOrderId = orderId;
    this.deliveryUpdate = {
      status: 'DELIVERED',
      actualDeliveryDate: new Date().toISOString().split('T')[0],
    };
    this.activeModal.set('delivery');
  }

  submitDeliveryUpdate() {
    this.api.updateDelivery(this.selectedOrderId, this.deliveryUpdate).subscribe({
      next: () => {
        this.activeModal.set('none');
        this.loadData();
      },
      error: (err) => {
        console.error('Delivery update failed:', err);
        alert('Failed to update delivery. Check the backend console.');
      },
    });
  }

  // --- Suppliers ---
  submitSupplier() {
    // Basic frontend validation to prevent empty submissions
    if (!this.newSupplier.companyName || !this.newSupplier.email) {
      alert('Company Name and Email are required!');
      return;
    }

    this.api.createSupplier(this.newSupplier).subscribe({
      next: () => {
        this.activeModal.set('none');
        this.newSupplier = {
          companyName: '',
          contactPerson: '',
          email: '',
          phoneNumber: '',
          address: '',
        };
        this.loadData();
      },
      error: (err) => {
        console.error('Supplier creation failed:', err);
        alert(
          'Failed to save Supplier. Server returned a 500 error. Please check your Spring Boot terminal for the exact Java exception.',
        );
      },
    });
  }

  deleteSupplier(id: number) {
    if (confirm('Are you sure you want to delete this supplier?')) {
      this.api.deleteSupplier(id).subscribe({
        next: () => this.loadData(),
        error: (err) => alert('Cannot delete supplier. It might be linked to existing orders.'),
      });
    }
  }

  // --- Quotations ---
  submitQuotation() {
    this.api.createQuotation(this.newQuotation).subscribe({
      next: () => {
        this.activeModal.set('none');
        this.newQuotation = {
          supplierId: 0,
          items: [],
          quotedUnitCost: 0,
          availableQuantity: 0,
          validUntil: '',
          status: 'RECEIVED',
        };
        this.loadData();
      },
      error: (err) => {
        console.error('Quotation creation failed:', err);
        alert('Failed to save Quotation. Server returned a 500 error.');
      },
    });
  }
}
