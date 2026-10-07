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
  ForecastResponse,
  TransactionResponse,
  BranchRequest,
  BranchOverviewResponse,
  BranchPerformanceResponse,
  BranchSummaryResponse,
  BranchInventoryResponse,
  DepartmentRequest,
  DepartmentResponse,
  OrderRequest,
  DeliveryUpdateRequest,
  SupplierRequest,
  EvaluationRequest,
  SupplierRatingResponse,
  QuotationRequest,
  QuotationResponse,
  InternalRequest,
  CreateInternalRequestDTO,
  StockAllocationRequestDTO,
  ConsumptionDTO,
  AuditTransaction,
  CreateTransactionRequest,
  Role,
  UserResponse,
  UserRequest,
} from '../../models/domain.models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private base = 'http://localhost:8080/api';

  // --- ROLES ---
  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.base}/roles`);
  }

  createRole(role: Role): Observable<Role> {
    return this.http.post<Role>(`${this.base}/roles/create`, role);
  }

  updateRole(id: number, role: Role): Observable<Role> {
    return this.http.put<Role>(`${this.base}/roles/${id}/update`, role);
  }

  deleteRole(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/roles/${id}/delete`);
  }

  // --- USERS ---
  getUsers(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${this.base}/users`);
  }

  createUser(user: UserRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.base}/users`, user);
  }

  updateUser(id: number, user: UserRequest): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.base}/users/${id}/update`, user);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/users/${id}/delete`);
  }

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
    return this.http.post<InventoryItem>(`${this.base}/inventory-items/create`, item);
  }

  updateInventoryItem(id: number, item: InventoryItem): Observable<InventoryItem> {
    return this.http.put<InventoryItem>(`${this.base}/inventory-items/${id}/update`, item);
  }

  deleteInventoryItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/inventory-items/delete/${id}` , { responseType: 'text' as 'json' });
  }

  downloadManifest(id: number): Observable<Blob> {
    return this.http.get(`${this.base}/stock-transfers/${id}/manifest`, { responseType: 'blob' });
  }

  // --- DISTRIBUTION / INTERNAL REQUESTS ---

  getInternalRequests(): Observable<InternalRequest[]> {
    return this.http.get<InternalRequest[]>(`${this.base}/internal-requests`);
  }

  createInternalRequest(request: CreateInternalRequestDTO): Observable<InternalRequest> {
    return this.http.post<InternalRequest>(`${this.base}/internal-requests/complete`, request);
  }

  deleteInternalRequest(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/internal-requests/${id}/delete`);
  }

  allocateStock(requestId: number, request: StockAllocationRequestDTO): Observable<void> {
    return this.http.post<void>(`${this.base}/internal-requests/${requestId}/allocate`, request);
  }

  // --- CONSUMPTIONS ---
  getConsumptions(): Observable<ConsumptionResponseDTO[]> {
    return this.http.get<ConsumptionResponseDTO[]>(`${this.base}/consumptions`);
  }

  createConsumption(request: ConsumptionDTO): Observable<ConsumptionResponseDTO[]> {
    return this.http.post<ConsumptionResponseDTO[]>(`${this.base}/consumptions`, request);
  }

  // --- FORECASTING & WASTAGE ENDPOINTS ---

  createForecast(forecast: any): Observable<string> {
    return this.http.post(`${this.base}/forecasts`, forecast, { responseType: 'text' });
  }

  getAllForecastsRaw(): Observable<string> {
    return this.http.get(`${this.base}/forecasts`, { responseType: 'text' });
  }

  deleteForecast(id: number): Observable<string> {
    return this.http.delete(`${this.base}/forecasts/${id}`, { responseType: 'text' });
  }

  getPlanningRecommendation(itemId: number, period: string): Observable<string> {
    return this.http.get(`${this.base}/forecasts/planning/${itemId}?forecastPeriod=${period}`, {
      responseType: 'text',
    });
  }

  recordWastage(
    itemId: number,
    userId: number,
    quantity: number,
    reason: string,
  ): Observable<string> {
    return this.http.post(
      `${this.base}/forecasts/wastage/${itemId}?userId=${userId}&quantity=${quantity}&reason=${reason}`,
      {},
      { responseType: 'text' },
    );
  }

  getWastageHistory(itemId: number): Observable<string> {
    return this.http.get(`${this.base}/forecasts/wastage/${itemId}`, { responseType: 'text' });
  }

  getTotalWastage(itemId: number): Observable<string> {
    return this.http.get(`${this.base}/forecasts/wastage/${itemId}/total`, {
      responseType: 'text',
    });
  }

  getWastageCost(itemId: number): Observable<string> {
    return this.http.get(`${this.base}/forecasts/wastage/${itemId}/cost`, { responseType: 'text' });
  }

  // --- AUDIT / TRANSACTIONS ---

  getTransactions(): Observable<AuditTransaction[]> {
    return this.http.get<AuditTransaction[]>(`${this.base}/transactions`);
  }

  getTransactionById(id: number): Observable<AuditTransaction> {
    return this.http.get<AuditTransaction>(`${this.base}/transactions/${id}`);
  }

  createTransaction(transaction: CreateTransactionRequest): Observable<AuditTransaction> {
    return this.http.post<AuditTransaction>(`${this.base}/transactions/add-new`, transaction);
  }

  updateTransaction(
    id: number,
    transaction: CreateTransactionRequest,
  ): Observable<AuditTransaction> {
    return this.http.put<AuditTransaction>(`${this.base}/transactions/${id}`, transaction);
  }

  deleteTransaction(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/transactions/${id}`);
  }

  getTransactionsByUser(userId: number): Observable<AuditTransaction[]> {
    return this.http.get<AuditTransaction[]>(`${this.base}/transactions/user/${userId}`);
  }

  getTransactionsByType(type: string): Observable<AuditTransaction[]> {
    return this.http.get<AuditTransaction[]>(`${this.base}/transactions/type/${type}`);
  }

  // --- BRANCH ENDPOINTS ---
  createBranch(request: BranchRequest): Observable<BranchResponse> {
    return this.http.post<BranchResponse>(`${this.base}/branches/create`, request);
  }

  getAllBranches(): Observable<BranchResponse[]> {
    return this.http.get<BranchResponse[]>(`${this.base}/branches/all`);
  }

  getBranchOverview(): Observable<BranchOverviewResponse> {
    return this.http.get<BranchOverviewResponse>(`${this.base}/branches/overview`);
  }

  getAllBranchPerformance(): Observable<BranchPerformanceResponse[]> {
    return this.http.get<BranchPerformanceResponse[]>(`${this.base}/branches/performance`);
  }

  getBranchById(id: number): Observable<BranchResponse> {
    return this.http.get<BranchResponse>(`${this.base}/branches/${id}`);
  }

  updateBranch(id: number, request: BranchRequest): Observable<BranchResponse> {
    return this.http.put<BranchResponse>(`${this.base}/branches/${id}/update`, request);
  }

  deleteBranch(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/branches/${id}/delete`);
  }

  getBranchStockSummary(id: number): Observable<BranchSummaryResponse> {
    return this.http.get<BranchSummaryResponse>(`${this.base}/branches/${id}/stock-summary`);
  }

  getBranchInventory(id: number): Observable<BranchInventoryResponse[]> {
    return this.http.get<BranchInventoryResponse[]>(`${this.base}/branches/${id}/inventory`);
  }

  getBranchPerformance(id: number): Observable<BranchPerformanceResponse> {
    return this.http.get<BranchPerformanceResponse>(`${this.base}/branches/${id}/performance`);
  }

  // --- DEPARTMENT ENDPOINTS ---
  createDepartment(request: DepartmentRequest): Observable<DepartmentResponse> {
    return this.http.post<DepartmentResponse>(`${this.base}/departments/create`, request);
  }

  getAllDepartments(): Observable<DepartmentResponse[]> {
    return this.http.get<DepartmentResponse[]>(`${this.base}/departments/all`);
  }

  getDepartmentById(id: number): Observable<DepartmentResponse> {
    return this.http.get<DepartmentResponse>(`${this.base}/departments/${id}`);
  }

  getDepartmentsByBranch(branchId: number): Observable<DepartmentResponse[]> {
    return this.http.get<DepartmentResponse[]>(`${this.base}/departments/by-branch/${branchId}`);
  }

  updateDepartment(id: number, request: DepartmentRequest): Observable<DepartmentResponse> {
    return this.http.put<DepartmentResponse>(`${this.base}/departments/update/${id}`, request);
  }

  deleteDepartment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/departments/delete/${id}`);
  }

  // --- ORDERS ---

  createOrder(request: OrderRequest): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(`${this.base}/orders`, request);
  }

  getOrders(): Observable<OrderResponse[]> {
    return this.http.get<OrderResponse[]>(`${this.base}/orders`);
  }

  getItems(): Observable<InventoryItem[]> {
    return this.http.get<InventoryItem[]>(`${this.base}/inventory-items/all`);
  }
  getOrderById(id: number): Observable<OrderResponse> {
    return this.http.get<OrderResponse>(`${this.base}/orders/${id}`);
  }

  updateDelivery(id: number, request: DeliveryUpdateRequest): Observable<OrderResponse> {
    return this.http.patch<OrderResponse>(`${this.base}/orders/${id}/delivery`, request);
  }

  // --- SUPPLIERS ---
  createSupplier(request: SupplierRequest): Observable<SupplierResponse> {
    return this.http.post<SupplierResponse>(`${this.base}/suppliers`, request);
  }

  getSuppliers(): Observable<SupplierResponse[]> {
    return this.http.get<SupplierResponse[]>(`${this.base}/suppliers`);
  }

  getSupplierById(id: number): Observable<SupplierResponse> {
    return this.http.get<SupplierResponse>(`${this.base}/suppliers/${id}`);
  }

  updateSupplier(id: number, request: SupplierRequest): Observable<SupplierResponse> {
    return this.http.put<SupplierResponse>(`${this.base}/suppliers/${id}`, request);
  }

  deleteSupplier(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/suppliers/${id}`);
  }

  evaluateSupplier(id: number, request: EvaluationRequest): Observable<SupplierRatingResponse> {
    return this.http.post<SupplierRatingResponse>(
      `${this.base}/suppliers/${id}/evaluations`,
      request,
    );
  }

  getSupplierRating(id: number): Observable<SupplierRatingResponse> {
    return this.http.get<SupplierRatingResponse>(`${this.base}/suppliers/${id}/rating`);
  }

  // --- QUOTATIONS ---
  createQuotation(request: QuotationRequest): Observable<QuotationResponse> {
    return this.http.post<QuotationResponse>(`${this.base}/quotations`, request);
  }

  getQuotations(itemId?: number): Observable<QuotationResponse[]> {
    const url = itemId ? `${this.base}/quotations?itemId=${itemId}` : `${this.base}/quotations`;
    return this.http.get<QuotationResponse[]>(url);
  }
}
