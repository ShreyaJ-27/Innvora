export type InventoryEventType =
  | 'SALE'
  | 'RESTOCK'
  | 'ADJUSTMENT'
  | 'TRANSFER_IN'
  | 'TRANSFER_OUT'
  | 'RETURN';

export type ReorderUrgency = 'CRITICAL' | 'REORDER_SOON' | 'HEALTHY' | 'OVERSTOCKED';

export interface Product {
  productId: string;
  sku: string;
  name: string;
  category: string;
  supplierId: string;
  supplierName: string;
  unitCost: number;
  sellingPrice: number;
  reorderPoint: number;
  safetyStock: number;
  minimumOrderQuantity: number;
  packSize: number;
}

export interface Supplier {
  supplierId: string;
  name: string;
  leadTimeDays: number;
  reliabilityScore: number;
}

export interface InventoryLocation {
  locationId: string;
  locationName: string;
  region: string;
  address: string;
}

export interface InventoryState {
  productId: string;
  sku: string;
  locationId: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  reorderPoint: number;
  safetyStock: number;
  lastUpdated: string;
}

export interface InventoryEvent {
  eventId: string;
  productId: string;
  sku: string;
  locationId: string;
  eventType: InventoryEventType;
  quantityChange: number;
  previousQuantity: number;
  newQuantity: number;
  timestamp: string;
  source: string;
}

export interface ReorderRecommendation {
  productId: string;
  sku: string;
  locationId: string;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  averageDailyDemand: number;
  leadTimeDays: number;
  safetyStock: number;
  reorderPoint: number;
  daysOfStockRemaining: number;
  recommendedQuantity: number;
  urgency: ReorderUrgency;
  reason: string;
}

export interface HealthAggregate {
  locationId: string; // 'GLOBAL' or specific location ID
  totalSkus: number;
  healthy: number;
  reorderSoon: number;
  critical: number;
  overstocked: number;
  lastUpdated: string;
}

export interface NotificationAlert {
  id: string;
  sku: string;
  productName: string;
  locationId: string;
  locationName?: string;
  urgency: ReorderUrgency;
  message: string;
  timestamp: string;
}

export interface CreateProductInput {
  productId?: string;
  sku: string;
  name: string;
  category: string;
  supplierId: string;
  supplierName?: string;
  unitCost: number;
  sellingPrice: number;
  reorderPoint: number;
  safetyStock: number;
  minimumOrderQuantity: number;
  packSize: number;
  locationId?: string;
  initialStock?: number;
}

