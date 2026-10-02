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
  private base = '/api';

  // Inventory
  getInventory(): Observable<InventoryItem[]> {
    return this.http.get<InventoryItem[]>(`${this.base}/inventory-items`);
  }
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.base}/categories`);
  }
  getUnitTypes(): Observable<UnitType[]> {
    return this.http.get<UnitType[]>(`${this.base}/unit-types`);
  }

  // Stock
  getTransfers(): Observable<StockTransferResponse[]> {
    return this.http.get<StockTransferResponse[]>(`${this.base}/stock-transfers`);
  }
  createTransfer(req: StockTransferCreateRequest): Observable<StockTransferResponse> {
    return this.http.post<StockTransferResponse>(`${this.base}/stock-transfers`, req);
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
