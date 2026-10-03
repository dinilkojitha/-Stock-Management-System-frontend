export interface TransferItemResponseDto {
  itemId: number;
  itemName: string;
  quantity: number;
}

export interface StockTransferResponse {
  id: number;
  fromBranchId: number;
  fromBranchName: string;
  toBranchId: number;
  toBranchName: string;
  requestedById: number;
  requestedByUsername: string;
  statusId: number;
  statusName: string;
  requestTime: string;
  items: TransferItemResponseDto[];
}

export interface TransferItemDto {
  inventoryItemId: number;
  quantity: number;
}

export interface StockTransferCreateRequest {
  fromBranchId: number;
  toBranchId: number;
  requestedById: number;
  statusId: number;
  items: TransferItemDto[];
}

export interface Category {
  id?: number;
  categoryName: string;
  description?: string;
}

export interface UnitType {
  id?: number;
  unit: string;
}

export interface InventoryItem {
  id?: number;
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
