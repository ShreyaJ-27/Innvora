// ─── Reorder Urgency ─────────────────────────────────────────────────────────

export type ReorderUrgency = 'CRITICAL' | 'REORDER_SOON' | 'HEALTHY' | 'OVERSTOCKED';

// ─── Backend Response Shapes ──────────────────────────────────────────────────

/**
 * One recommendation as returned by GET /reorders (inside `recommendations` array).
 * Field names match the backend handler response exactly.
 */
export interface BackendReorderRecommendation {
  productId: string;
  sku: string;
  locationId: string;
  currentStock: number;
  availableStock: number;
  averageDailyDemand: number;
  leadTimeDays: number;
  reorderPoint: number;
  daysOfStockRemaining: number;
  recommendedQuantity: number;
  urgency: ReorderUrgency;
  reason: string;
}

/**
 * Summary block returned by GET /reorders alongside the recommendations array.
 */
export interface BackendReorderSummary {
  critical: number;
  reorderSoon: number;
  healthy: number;
  overstocked: number;
  recommendedUnits: number;
  estimatedValue: number;
}

// ─── Frontend / UI Types ──────────────────────────────────────────────────────

export interface ReorderExplanation {
  currentStock: number;
  dailyDemand: number;
  leadTimeDays: number;
  leadTimeDemand: number;
  safetyStock: number;
  reorderPoint: number;
  recommendedQuantity: number;
  stockCoverageDays: number;
  reason: string;
}

/**
 * Rich reorder recommendation used throughout the UI.
 * Adapted from BackendReorderRecommendation by the adapter in reorder-api.ts.
 * Fields not provided by the backend (productName, locationName, supplierName, estimatedCost)
 * are filled with safe fallbacks.
 */
export interface ReorderRecommendation {
  id: string;
  productId: string;
  sku: string;
  productName: string;
  category: string;
  locationId: string;
  locationName: string;
  availableStock: number;
  dailyDemand: number;
  leadTimeDays: number;
  reorderPoint: number;
  daysRemaining: number;
  recommendedQuantity: number;
  unitCost: number;
  estimatedCost: number;
  urgency: ReorderUrgency;
  supplierName: string;
  supplierId: string;
  explanation: ReorderExplanation;
}

export interface ReorderSummary {
  criticalCount: number;
  reorderSoonCount: number;
  recommendedUnits: number;
  estimatedTotalValue: number;
}
