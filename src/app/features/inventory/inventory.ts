import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Category, InventoryItem, UnitType } from '../../models/domain.models';

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
  categories = signal<Category[]>([]);
  unitTypes = signal<UnitType[]>([]);

  searchQuery = signal<string>('');
  isDrawerOpen = signal<boolean>(false);
  isEditing = signal<boolean>(false);

  // Form State
  currentItem = signal<InventoryItem>(this.getEmptyItem());
  selectedCategoryId = signal<number | null>(null);
  selectedUnitTypeId = signal<number | null>(null);

  // Filtered computed list
  filteredItems = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.items();
    return this.items().filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        item.category.categoryName.toLowerCase().includes(q),
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
      next: (data) => this.categories.set(data),
      error: () => console.error('Failed to load categories'),
    });

    this.api.getUnitTypes().subscribe({
      next: (data) => this.unitTypes.set(data),
      error: () => console.error('Failed to load unit types'),
    });
  }

  openCreateModal() {
    this.isEditing.set(false);
    this.currentItem.set(this.getEmptyItem());
    this.selectedCategoryId.set(this.categories()[0]?.id ?? null);
    this.selectedUnitTypeId.set(this.unitTypes()[0]?.id ?? null);
    this.isDrawerOpen.set(true);
  }

  openEditModal(item: InventoryItem) {
    this.isEditing.set(true);
    this.currentItem.set({ ...item });
    this.selectedCategoryId.set(item.category.id ?? null);
    this.selectedUnitTypeId.set(item.unitType.id ?? null);
    this.isDrawerOpen.set(true);
  }

  closeModal() {
    this.isDrawerOpen.set(false);
  }

  saveItem() {
    const cat = this.categories().find((c) => c.id === Number(this.selectedCategoryId()));
    const unit = this.unitTypes().find((u) => u.id === Number(this.selectedUnitTypeId()));

    if (!cat || !unit) {
      alert('Please select both a category and a unit type.');
      return;
    }

    const payload: InventoryItem = {
      ...this.currentItem(),
      category: cat,
      unitType: unit,
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

  deleteItem(id?: number) {
    if (!id || !confirm('Are you sure you want to delete this inventory item?')) return;

    this.api.deleteInventoryItem(id).subscribe({
      next: () => this.items.update((prev) => prev.filter((i) => i.id !== id)),
      error: (err) => alert(err?.error?.message || 'Failed to delete item'),
    });
  }

  private getEmptyItem(): InventoryItem {
    return {
      sku: '',
      name: '',
      reorderLevel: 0,
      unitPrice: 0,
      category: { categoryName: '' },
      unitType: { unit: '' },
    };
  }
}
