// --- INVENTORY DOMAIN ---
export interface UnitType {
  id: number;
  name: string;
  abbreviation: string;
}

export interface Category {
  id: number;
  name: string;
  code: string;
}

export interface InventoryItem {
  id: number;
  sku: string;
  name: string;
  category: Category;
  unitType: UnitType;
  reorderLevel: number;
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

export interface TransferItemDto {
  itemId: number;
  quantity: number;
}

export interface StockTransferCreateRequest {
  sourceBranchId: number;
  destinationBranchId: number;
  items: TransferItemDto[];
  notes?: string;
}

export interface StockTransferResponse {
  id: number;
  transferNumber: string;
  sourceBranchName: string;
  destinationBranchName: string;
  status: 'PENDING' | 'DISPATCHED' | 'RECEIVED' | 'CANCELLED';
  itemsCount: number;
  createdAt: string;
}

// --- DISTRIBUTION DOMAIN ---
export interface RequestItemDTO {
  itemId: number;
  quantity: number;
}

export interface CreateInternalRequestDTO {
  departmentId: number;
  notes?: string;
  items: RequestItemDTO[];
}

export interface ConsumptionResponseDTO {
  id: number;
  requestNumber: string;
  departmentName: string;
  totalCost: number;
  status: 'SUBMITTED' | 'ALLOCATED' | 'CONSUMED';
  date: string;
}

// --- PROCUREMENT DOMAIN ---
export interface SupplierResponse {
  id: number;
  name: string;
  contactEmail: string;
  phone: string;
  rating: number;
}

export interface OrderResponse {
  id: number;
  orderNumber: string;
  supplierName: string;
  totalAmount: number;
  status: 'DRAFT' | 'ORDERED' | 'CONFIRMED' | 'DELIVERED';
  orderDate: string;
}

// --- ORGANIZATION DOMAIN ---
export interface BranchResponse {
  id: number;
  name: string;
  code: string;
  city: string;
  active: boolean;
}

export interface DepartmentResponse {
  id: number;
  name: string;
  branchId: number;
  managerName: string;
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
