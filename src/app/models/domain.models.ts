// --- USER & ROLE DOMAIN ---
export interface Role {
  id?: number;
  name: string;
  accessLevel: number;
}

export interface UserRequest {
  fullName: string;
  email: string;
  phoneNumber: string;
  roleId: number;
  departmentId: number;
  password?: string; // Optional on update, required on create
}

export interface UserResponse {
  id: number;
  fullName: string;
  roleId: number;
  roleName: string;
  email: string;
  phoneNumber: string;
  departmentId: number;
  departmentName: string;
}

export interface TransferItemResponseDto {
  itemId: number;
  itemName: string;
  quantity: number;
}

export interface Item {
  id: number;
  itemName: string;
  quantity: number;
}

export interface StockTransferCreateRequest {
  fromBranchId: number;
  toBranchId: number;
  requestedById: number;
  // statusId: number;
  items: Item[];
}

// Merged StockTransferResponse to prevent duplicates
export interface StockTransferResponse {
  id: number;
  fromBranchId?: number;
  fromBranchName?: string;
  toBranchId?: number;
  toBranchName?: string;
  requestedById?: number;
  requestedByUsername?: string;
  statusId?: number;
  statusName?: string;
  requestTime?: string;
  items?: TransferItemResponseDto[];

  // Alternative fields based on different components
  transferNumber?: string;
  sourceBranchName?: string;
  destinationBranchName?: string;
  status?: string;
  itemsCount?: number;
  createdAt?: string;
}

export interface Category {
  categoryId?: number;
  name: string;
  description?: string;
}

export interface UnitType {
  unitTypeId?: number;
  name: string;
}

export interface InventoryItem {
  id?: number;
  // sku: string;
  itemName: string;
  category: Category;
  unitType: UnitType;
  totalQuantity: number;
  description: string;
  reorderThreshold: number;
  unitPrice: number;
}

// --- STOCK DOMAIN ---
export interface StockItem {
  id: number;
  itemId: number;
  itemName: string;
  branchId: number;
  branchName: string;
  quantity: number;
  locationCode: string;
}

// --- DISTRIBUTION DOMAIN ---
// export interface RequestItemDTO {
//   itemId: number;
//   quantity: number;
// }
//
// export interface CreateInternalRequestDTO {
//   departmentId: number;
//   notes?: string;
//   items: RequestItemDTO[];
// }
//
// export interface ConsumptionResponseDTO {
//   id: number;
//   requestNumber: string;
//   departmentName: string;
//   totalCost: number;
//   status: 'SUBMITTED' | 'ALLOCATED' | 'CONSUMED';
//   date: string;
// }

// --- DISTRIBUTION DOMAIN ---

export interface InternalRequest {
  id: number;
  department?: any; // Nested entity
  requestedByUser?: any; // Nested entity
  requestedAt: string;
  emergencyRequest: boolean;
  status: string;
}

export interface RequestItemDTO {
  itemId: number;
  quantity: number;
}

export interface CreateInternalRequestDTO {
  departmentId: number;
  requestedByUserId: number;
  requestedAt: string;
  emergencyRequest: boolean;
  status: string;
  items: RequestItemDTO[];
}

export interface StockAllocationDTO {
  itemId: number;
  quantity: number;
}

export interface StockAllocationRequestDTO {
  items: StockAllocationDTO[];
}

export interface ConsumptionItemDTO {
  itemId: number;
  quantityConsumed: number;
}

export interface ConsumptionDTO {
  requestId: number;
  departmentId: number;
  items: ConsumptionItemDTO[];
}

export interface ConsumptionResponseDTO {
  consumptionId: number;
  requestId: number;
  departmentId: number;
  itemId: number;
  allocatedQuantity: number;
  quantityConsumed: number;
  consumedAt: string;
}

// --- PROCUREMENT DOMAIN ---

export interface OrderItemRequest {
  itemId: number;
  quantity: number;
  unitCost: number;
}

export interface OrderRequest {
  supplierId: number;
  createdByUserId: number;
  expectedDeliveryDate: string; // ISO date string
  items: OrderItemRequest[];
}

export interface OrderItemResponse {
  itemId: number;
  itemName: string;
  quantity: number;
  unitCost: number;
}

// Merged OrderResponse
export interface OrderResponse {
  id: number;
  supplierId: number;
  supplierName: string;
  createdByUserId: number;
  orderDate: string;
  expectedDeliveryDate: string;
  actualDeliveryDate: string | null;
  totalCost: number;
  status: string;
  items: OrderItemResponse[];

  // Fallbacks for older mock UI
  orderNumber?: string;
  totalAmount?: number;
}

export interface DeliveryUpdateRequest {
  status: string;
  actualDeliveryDate: string; // ISO date string
}

export interface SupplierRequest {
  companyName: string;
  contactPerson: string;
  email: string;
  phoneNumber: string;
  address: string;
}

// Merged SupplierResponse
export interface SupplierResponse {
  id: number;
  companyName: string;
  contactPerson: string;
  email: string;
  phoneNumber: string;
  address: string;

  // Fallbacks for older mock UI
  name?: string;
  contactEmail?: string;
  phone?: string;
  rating?: number;
}

export interface EvaluationRequest {
  evaluatedByUserId: number;
  rating: number;
  deliveryRating: number;
  qualityRating: number;
  comments: string;
}

export interface SupplierRatingResponse {
  supplierId: number;
  companyName: string;
  averageRating: number;
  totalEvaluations: number;
}

export interface QuotationRequest {
  supplierId: number;
  items: OrderItemRequest[];
  quotedUnitCost: number;
  availableQuantity: number;
  validUntil: string; // ISO date string
  status?: string;
  notes?: string;
}

export interface QuotationResponse {
  id: number;
  supplierId: number;
  supplierName: string;
  itemId: number;
  itemName: string;
  quotedUnitCost: number;
  availableQuantity: number;
  validUntil: string;
  status: string;
  notes: string;
  createdAt: string;
}

// --- ORGANIZATION DOMAIN ---
export interface BranchRequest {
  branchName: string;
  location: string;
}

// Merged BranchResponse
export interface BranchResponse {
  id: number;
  name: string;
  location: string;

  // Fallbacks for older mock UI
  branchName : string;
  code?: string;
  city?: string;
  active?: boolean;
}

export interface BranchSummaryResponse {
  id: number;
  name: string;
  location: string;
  stockCount: number;
  departmentCount: number;
}

export interface BranchOverviewResponse {
  branches: BranchSummaryResponse[];
  totalBranches: number;
}

export interface BranchInventoryResponse {
  stockId: number;
  branchId: number;
  branchName: string;
  quantity: number;
  manufactureDate: string;
  expiryDate: string;
}

export interface BranchPerformanceResponse {
  branchId: number;
  branchName: string;
  totalItems: number;
  totalQuantity: number;
  departmentCount: number;
  incomingTransfers: number;
  outgoingTransfers: number;
  pendingIncomingTransfers: number;
  pendingOutgoingTransfers: number;
}

export interface DepartmentRequest {
  departmentName: string;
  location: string;
  branchId: number;
}


// Merged DepartmentResponse
export interface DepartmentResponse {
  id: number;
  departmentName: string;
  location: string;
  branchId: number;
  branchName: string;

  // Fallbacks for older mock UI
  managerName?: string;
}

// --- FORECASTING DOMAIN ---

export interface ForecastResponse {
  itemId: number;
  itemName: string;
  currentStock: number;
  burnRatePerDay: number;
  predictedDepletionDays: number;
  suggestedReorderQuantity: number;
  confidenceScore: number;
}
export interface PlanningRecommendation {
  itemId: number;
  itemName: string;
  currentStock: number;
  reorderThreshold: number;
  forecastPeriod: string;
  predictedDemand: number;
  recommendedPurchase: number;
}

export interface ParsedForecastDbRow {
  id: string;
  itemName: string;
  predictedDemand: string;
  date: string;
  period: string;
}

// --- AUDIT DOMAIN ---
export interface TransactionResponse {
  id: number;
  transactionHash: string;
  type: 'INBOUND' | 'OUTBOUND' | 'TRANSFER' | 'CONSUMPTION';
  itemName: string;
  quantityDelta: number;
  performedBy: string;
  timestamp: string;
}

export interface AuditTransaction {
  id: number;
  transactionType: string;
  userUserid: {
    id: number;
    username?: string;
  };
  item: {
    id: number;
    itemName?: string;
  };
  transactedAt: string;
  quantityDelta: number;
  remarks: string;
}

export interface CreateTransactionRequest {
  transactionType: string;
  userUserid: { id: number };
  item: { id: number };
  quantityDelta: number;
  remarks: string;
}
