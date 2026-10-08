import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { BranchResponse, Category, InventoryItem, StockBatch, UnitType } from '../../models/domain.models';

interface BranchItemQuantity {
  branchId: number;
  branchName: string;
  quantity: number;
  batchCount: number;
}

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory.html',
  styleUrl: './inventory.css',
})
export class Inventory implements OnInit {
  private api = inject(ApiService);

  items = signal<InventoryItem[]>([]);
  archivedItems = signal<InventoryItem[]>([]);
  archivedItemsLoaded = signal(false);
  categories = signal<Category[]>([]);
  unitTypes = signal<UnitType[]>([]);
  branches = signal<BranchResponse[]>([]);
  selectedItem = signal<InventoryItem | null>(null);
  selectedItemBatches = signal<StockBatch[]>([]);
  itemStockLoading = signal(false);
  itemStockError = signal<string | null>(null);

  branchItemQuantities = computed<BranchItemQuantity[]>(() => {
    const quantities = new Map<number, { quantity: number; batchCount: number }>();
    for (const batch of this.selectedItemBatches()) {
      const current = quantities.get(batch.branchId) ?? { quantity: 0, batchCount: 0 };
      current.quantity += batch.quantity;
      current.batchCount += 1;
      quantities.set(batch.branchId, current);
    }

    return this.branches().map((branch) => {
      const stock = quantities.get(branch.id);
      return {
        branchId: branch.id,
        branchName: branch.branchName || branch.name || `Branch #${branch.id}`,
        quantity: stock?.quantity ?? 0,
        batchCount: stock?.batchCount ?? 0,
      };
    });
  });

  searchQuery = signal<string>('');
  showArchived = signal(false);
  isDrawerOpen = signal<boolean>(false);
  isEditing = signal<boolean>(false);

  // Form State
  currentItem = signal<InventoryItem>(this.getEmptyItem());
  selectedCategoryId = signal<number | null>(null);
  selectedUnitTypeId = signal<number | null>(null);

  // Filtered computed list
  filteredItems = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const source = this.showArchived() ? this.archivedItems() : this.items();
    if (!q) return source;
    return source.filter(
      (item) =>
        item.itemName.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.name.toLowerCase().includes(q),
    );
  });

  ngOnInit() {
    this.loadAllData();
  }

  loadAllData() {
    this.api.getInventory().subscribe({
      next: (data) => this.items.set(data),
      error: () => console.error('Failed to load inventory items'),
    });

    this.api.getCategories().subscribe({
      next: (data) => {this.categories.set(data)
      console.log(data)},
      error: () => console.error('Failed to load categories'),
    });

    this.api.getUnitTypes().subscribe({
      next: (data) => {this.unitTypes.set(data)
      console.log(data)},
      error: () => console.error('Failed to load unit types'),
    });
  }

  setShowArchived(showArchived: boolean) {
    this.showArchived.set(showArchived);
    this.searchQuery.set('');
    if (showArchived && !this.archivedItemsLoaded()) {
      this.api.getArchivedInventory().subscribe({
        next: (items) => {
          this.archivedItems.set(items);
          this.archivedItemsLoaded.set(true);
        },
        error: (error) => {
          console.error('Failed to load archived inventory items:', error);
          alert(error?.error?.detail || 'Failed to load archived inventory items.');
        },
      });
    }
  }

  openCreateModal() {
    this.isEditing.set(false);
    this.currentItem.set(this.getEmptyItem());
    this.selectedCategoryId.set(this.categories()[0]?.categoryId ?? null);
    this.selectedUnitTypeId.set(this.unitTypes()[0]?.unitTypeId ?? null);
    this.isDrawerOpen.set(true);
  }

  openEditModal(item: InventoryItem) {
    this.isEditing.set(true);
    this.currentItem.set({ ...item });
    this.selectedCategoryId.set(item.category.categoryId ?? null);
    this.selectedUnitTypeId.set(item.unitType.unitTypeId ?? null);
    this.isDrawerOpen.set(true);
  }

  openItemStock(item: InventoryItem) {
    if (!item.id) return;

    this.selectedItem.set(item);
    this.selectedItemBatches.set([]);
    this.itemStockError.set(null);
    this.itemStockLoading.set(true);

    forkJoin({
      batches: this.api.getStockBatchesByItem(item.id),
      branches: this.api.getAllBranches(),
    }).subscribe({
      next: ({ batches, branches }) => {
        this.selectedItemBatches.set(batches);
        this.branches.set(branches);
      },
      error: (error) => {
        console.error(`Failed to load branch quantities for inventory item ${item.id}:`, error);
        this.itemStockError.set(
          error?.error?.detail || error?.error?.message || error?.message ||
            'Could not load this item’s branch quantities.',
        );
        this.itemStockLoading.set(false);
      },
      complete: () => this.itemStockLoading.set(false),
    });
  }

  closeItemStock() {
    this.selectedItem.set(null);
    this.selectedItemBatches.set([]);
    this.itemStockError.set(null);
  }

  closeModal() {
    this.isDrawerOpen.set(false);
  }

  saveItem() {
    const cat = this.categories().find((c) => c.categoryId === Number(this.selectedCategoryId()));
    const unit = this.unitTypes().find((u) => u.unitTypeId === Number(this.selectedUnitTypeId()));

    console.log('Selected Category:', cat);
    console.log('Selected Unit Type:', unit);
    if (!cat || !unit) {
      alert('Please select both a category and a unit type.');
      return;
    }

    const payload: InventoryItem = {
      ...this.currentItem(),
      category: cat,
      unitType: unit,
      itemName: this.currentItem().itemName, // Assuming itemName is derived from name
    };

    if (this.isEditing() && payload.id) {
      this.api.updateInventoryItem(payload.id, payload).subscribe({
        next: (updated) => {
          this.items.update((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
          this.closeModal();
        },
        error: (err) => alert(err?.error?.message || 'Error updating product'),
      });
    } else {
      this.api.createInventoryItem(payload).subscribe({
        next: (created) => {
          this.items.update((prev) => [...prev, created]);
          this.closeModal();
        },
        error: (err) => alert(err?.error?.message || 'Error creating product'),
      });
    }
  }

  archiveItem(id?: number) {
    if (!id || !confirm('Archive this inventory item? It will be hidden from active lists, and its history will be preserved.')) return;

    this.api.archiveInventoryItem(id).subscribe({
      next: (message) => {
        const item = this.items().find((current) => current.id === id);
        this.items.update((current) => current.filter((currentItem) => currentItem.id !== id));
        if (item && this.archivedItemsLoaded()) {
          this.archivedItems.update((current) => [{ ...item, archived: true }, ...current]);
        }
        alert(message || 'Inventory item archived successfully.');
      },
      error: (err) => {
        console.error(`Failed to archive inventory item ${id}:`, err);
        alert(
          err?.error?.detail ||
            err?.error?.message ||
            err?.message ||
            'Failed to archive item.',
        );
      },
    });
  }

  restoreItem(id?: number) {
    if (!id || !confirm('Restore this inventory item to active inventory?')) return;

    this.api.restoreInventoryItem(id).subscribe({
      next: (message) => {
        const item = this.archivedItems().find((current) => current.id === id);
        this.archivedItems.update((current) => current.filter((currentItem) => currentItem.id !== id));
        if (item) {
          this.archivedItemsLoaded.set(true);
          this.items.update((current) => [...current, { ...item, archived: false }]);
        }
        alert(message || 'Inventory item restored successfully.');
      },
      error: (error) => {
        console.error(`Failed to restore inventory item ${id}:`, error);
        alert(error?.error?.detail || error?.message || 'Failed to restore item.');
      },
    });
  }

  private getEmptyItem(): InventoryItem {
    return {
      totalQuantity: 0,
      itemName: '',
      description: '',
      reorderThreshold: 0,
      unitPrice: 0,
      category: { name: '' },
      unitType: { name: '' },
    };
  }
}
