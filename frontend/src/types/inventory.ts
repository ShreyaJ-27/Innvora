export type InventoryStatus = 'HEALTHY' | 'REORDER_SOON' | 'CRITICAL' | 'OVERSTOCKED';

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
