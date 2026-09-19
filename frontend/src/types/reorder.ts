export type ReorderUrgency = 'CRITICAL' | 'REORDER_SOON' | 'HEALTHY' | 'OVERSTOCKED';

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
