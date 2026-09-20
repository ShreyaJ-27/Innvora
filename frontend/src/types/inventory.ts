// ─── Status Types ────────────────────────────────────────────────────────────

export type InventoryStatus = 'HEALTHY' | 'REORDER_SOON' | 'CRITICAL' | 'OVERSTOCKED';

// ─── Backend Response Shapes (as returned by the deployed API) ────────────────

/**
 * What GET /inventory returns per item (inside the `items` array).
 * The backend InventoryState is lean — no product name, category, or supplier.
 */
export interface BackendInventoryState {
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

/**
 * Paginated envelope returned by GET /inventory.
 */
export interface BackendInventoryListResponse {
  items: BackendInventoryState[];
  total: number;
  page: number;
  limit: number;
}

/**
 * What GET /inventory/health returns inside data.
 * Note: field names differ from the legacy frontend shape.
 */
export interface BackendInventoryHealthSummary {
  totalSkus: number;
  healthy: number;       // backend uses camelCase, not "healthyCount"
  reorderSoon: number;   // backend uses camelCase, not "reorderSoonCount"
  critical: number;      // backend uses camelCase, not "criticalCount"
  overstocked: number;   // backend uses camelCase, not "overstockedCount"
}

// ─── Frontend / UI Types ──────────────────────────────────────────────────────

export interface SupplierInfo {
  id: string;
  name: string;
  leadTimeDays: number;
  reliabilityRate: number; // e.g. 0.96 for 96%
  contactEmail?: string;
}

export interface StockHistoryPoint {
  date: string;
  stockLevel: number;
  dailyDemand: number;
  reorderPoint: number;
}

/**
 * Rich product inventory object used throughout the UI.
 * When data comes from the live backend most optional fields will be absent —
 * the adapter in inventory-api.ts fills in safe defaults.
 */
export interface ProductInventory {
  id: string;
  productId: string;
  sku: string;
  name: string;
  category: string;
  locationId: string;
  locationName: string;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  safetyStock: number;
  reorderPoint: number;
  unitCost: number;
  dailyDemand: number;
  daysOfStock: number;
  status: InventoryStatus;
  supplier: SupplierInfo;
  history?: StockHistoryPoint[];
  lastUpdated: string;
}

export interface LocationInventorySummary {
  locationId: string;
  locationName: string;
  city: string;
  totalSkus: number;
  totalUnits: number;
  inventoryValue: number;
  healthyPercent: number;
  criticalCount: number;
  reorderSoonCount: number;
}

/**
 * Frontend health summary used in the Dashboard.
 * Derived from BackendInventoryHealthSummary by the adapter in inventory-api.ts.
 * totalUnits / totalValue / stockTrend are not provided by the backend health endpoint
 * and will be 0 / [] unless a separate call provides them.
 */
export interface InventoryHealthSummary {
  totalSkus: number;
  totalUnits: number;
  totalValue: number;
  healthyCount: number;
  reorderSoonCount: number;
  criticalCount: number;
  overstockedCount: number;
  itemsNeedingReorder: number;
  stockTrend?: {
    date: string;
    totalStock: number;
    inboundUnits: number;
    outboundUnits: number;
  }[];
}

// ─── Catalog & Notification Types ──────────────────────────────────────────────

export interface LocationRecord {
  locationId: string;
  locationName: string;
  city: string;
  region: string;
  status: 'ACTIVE' | 'INACTIVE';
  capacityUnits: number;
}

export interface SupplierRecord {
  supplierId: string;
  supplierName: string;
  contactEmail: string;
  leadTimeDays: number;
  reliabilityRate: number;
}

export interface ProductRecord {
  productId: string;
  sku: string;
  name: string;
  category: string;
  description?: string;
  unitCost: number;
  sellingPrice: number;
  reorderPoint: number;
  safetyStock: number;
  minimumOrderQuantity: number;
  packSize: number;
  defaultLocationId: string;
  supplierId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductPayload {
  sku: string;
  name: string;
  category: string;
  description?: string;
  unitCost: number;
  sellingPrice: number;
  reorderPoint: number;
  safetyStock: number;
  minimumOrderQuantity?: number;
  packSize?: number;
  defaultLocationId?: string;
  supplierId?: string;
  initialStock?: number;
}

export interface NotificationAlert {
  id: string;
  title: string;
  message: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  type: string;
  timestamp: string;
  locationId?: string;
  productId?: string;
  sku?: string;
}
