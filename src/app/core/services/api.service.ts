import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  InventoryItem,
  Category,
  UnitType,
  StockTransferResponse,
  StockTransferCreateRequest,
  ConsumptionResponseDTO,
  OrderResponse,
  SupplierResponse,
  BranchResponse,
  DepartmentResponse,
  ForecastResponse,
  TransactionResponse,
} from '../../models/domain.models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private base = 'http://localhost:8080/api';

  // GET /api/stock-transfers
  getTransfers(): Observable<StockTransferResponse[]> {
    return this.http.get<StockTransferResponse[]>(`${this.base}/stock-transfers`);
  }

  // GET /api/stock-transfers/{id}
  getTransferById(id: number): Observable<StockTransferResponse> {
    return this.http.get<StockTransferResponse>(`${this.base}/stock-transfers/${id}`);
  }

  // GET /api/stock-transfers/by-branch/{branchId}
  getTransfersByBranch(branchId: number): Observable<StockTransferResponse[]> {
    return this.http.get<StockTransferResponse[]>(
      `${this.base}/stock-transfers/by-branch/${branchId}`,
    );
  }

  // POST /api/stock-transfers
  createTransfer(request: StockTransferCreateRequest): Observable<StockTransferResponse> {
    return this.http.post<StockTransferResponse>(`${this.base}/stock-transfers`, request);
  }

  // PUT /api/stock-transfers/{id}/approve
  approveTransfer(id: number): Observable<StockTransferResponse> {
    return this.http.put<StockTransferResponse>(`${this.base}/stock-transfers/${id}/approve`, {});
  }

  // PUT /api/stock-transfers/{id}/reject
  rejectTransfer(id: number): Observable<StockTransferResponse> {
    return this.http.put<StockTransferResponse>(`${this.base}/stock-transfers/${id}/reject`, {});
  }

  // GET /api/stock-transfers/{id}/pdf
  downloadTransferPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.base}/stock-transfers/${id}/pdf`, { responseType: 'blob' });
  }

  // --- Category Endpoints ---
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.base}/categories`);
  }

  createCategory(category: Category): Observable<Category> {
    return this.http.post<Category>(`${this.base}/categories`, category);
  }

  updateCategory(id: number, category: Category): Observable<Category> {
    return this.http.put<Category>(`${this.base}/categories/${id}`, category);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/categories/${id}`);
  }

  // --- UnitType Endpoints ---
  getUnitTypes(): Observable<UnitType[]> {
    return this.http.get<UnitType[]>(`${this.base}/unit-types`);
  }

  createUnitType(unitType: UnitType): Observable<UnitType> {
    return this.http.post<UnitType>(`${this.base}/unit-types`, unitType);
  }

  updateUnitType(id: number, unitType: UnitType): Observable<UnitType> {
    return this.http.put<UnitType>(`${this.base}/unit-types/${id}`, unitType);
  }

  deleteUnitType(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/unit-types/${id}`);
  }

  // --- Inventory Item Endpoints ---
  getInventory(): Observable<InventoryItem[]> {
    return this.http.get<InventoryItem[]>(`${this.base}/inventory-items`);
  }

  createInventoryItem(item: InventoryItem): Observable<InventoryItem> {
    return this.http.post<InventoryItem>(`${this.base}/inventory-items`, item);
  }

  updateInventoryItem(id: number, item: InventoryItem): Observable<InventoryItem> {
    return this.http.put<InventoryItem>(`${this.base}/inventory-items/${id}`, item);
  }

  deleteInventoryItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/inventory-items/${id}`);
  }

  downloadManifest(id: number): Observable<Blob> {
    return this.http.get(`${this.base}/stock-transfers/${id}/manifest`, { responseType: 'blob' });
  }

  // Distribution
  getConsumptions(): Observable<ConsumptionResponseDTO[]> {
    return this.http.get<ConsumptionResponseDTO[]>(`${this.base}/consumptions`);
  }

  // Procurement
  getOrders(): Observable<OrderResponse[]> {
    return this.http.get<OrderResponse[]>(`${this.base}/orders`);
  }
  getSuppliers(): Observable<SupplierResponse[]> {
    return this.http.get<SupplierResponse[]>(`${this.base}/suppliers`);
  }

  // Organization
  getBranches(): Observable<BranchResponse[]> {
    return this.http.get<BranchResponse[]>(`${this.base}/branches`);
  }
  getDepartments(): Observable<DepartmentResponse[]> {
    return this.http.get<DepartmentResponse[]>(`${this.base}/departments`);
  }

  // Forecasting
  getForecasts(): Observable<ForecastResponse[]> {
    return this.http.get<ForecastResponse[]>(`${this.base}/forecasts`);
  }

  // Audit
  getTransactions(): Observable<TransactionResponse[]> {
    return this.http.get<TransactionResponse[]>(`${this.base}/transactions`);
  }
}
