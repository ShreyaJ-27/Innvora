import { ReorderRecommendation, ReorderUrgency } from '../models.js';

export interface ReorderEngineInput {
  productId: string;
  sku: string;
  locationId: string;
  currentStock: number;
  reservedStock: number;
  averageDailyDemand: number;
  supplierLeadTimeDays?: number | null;
  safetyStock: number;
  minimumOrderQuantity: number;
  packSize: number;
  forecastBuffer: number;
}

const toNonNegativeNumber = (value: number | null | undefined, fallback = 0): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.max(0, value);
};

const formatDays = (value: number): string => {
  if (!Number.isFinite(value)) {
    return 'unlimited';
  }

  if (value === 0) {
    return '0.0';
  }

  return value.toFixed(1);
};

export function classifyReorderUrgency(
  availableStock: number,
  safetyStock: number,
  reorderPoint: number,
  targetStock: number
): ReorderUrgency {
  if (availableStock <= safetyStock) {
    return 'CRITICAL';
  }

  if (availableStock <= reorderPoint) {
    return 'REORDER_SOON';
  }

  if (targetStock > 0 && availableStock > targetStock * 1.5) {
    return 'OVERSTOCKED';
  }

  return 'HEALTHY';
}

export function calculateRecommendedQuantity(
  availableStock: number,
  targetStock: number,
  minimumOrderQuantity: number,
  packSize: number
): number {
  const effectivePackSize = packSize > 0 ? Math.ceil(packSize) : 1;
  const effectiveMinimum = minimumOrderQuantity > 0 ? Math.ceil(minimumOrderQuantity) : 0;

  const rawRecommendedQuantity = targetStock - availableStock;
  if (rawRecommendedQuantity <= 0) {
    return 0;
  }

  let recommendedQuantity = Math.ceil(rawRecommendedQuantity / effectivePackSize) * effectivePackSize;

  if (effectiveMinimum > 0 && recommendedQuantity < effectiveMinimum) {
    recommendedQuantity = effectiveMinimum;
  }

  if (effectivePackSize > 0) {
    recommendedQuantity = Math.ceil(recommendedQuantity / effectivePackSize) * effectivePackSize;
  }

  return Math.max(0, recommendedQuantity);
}

export function generateReorderRecommendation(input: ReorderEngineInput): ReorderRecommendation {
  const currentStock = toNonNegativeNumber(input.currentStock, 0);
  const reservedStock = toNonNegativeNumber(input.reservedStock, 0);
  const averageDailyDemand = toNonNegativeNumber(input.averageDailyDemand, 0);
  const safetyStock = toNonNegativeNumber(input.safetyStock, 0);
  const minimumOrderQuantity = toNonNegativeNumber(input.minimumOrderQuantity, 0);
  const forecastBuffer = toNonNegativeNumber(input.forecastBuffer, 0);
  const supplierLeadTimeDays = toNonNegativeNumber(input.supplierLeadTimeDays ?? undefined, 0);
  const packSize = input.packSize > 0 ? Math.ceil(input.packSize) : 1;

  const availableStock = currentStock - reservedStock;
  const leadTimeDemand = averageDailyDemand * supplierLeadTimeDays;
  const reorderPoint = leadTimeDemand + safetyStock;
  const daysOfStockRemaining = averageDailyDemand > 0 ? availableStock / averageDailyDemand : availableStock > 0 ? Number.POSITIVE_INFINITY : 0;
  const targetStock = leadTimeDemand + safetyStock + forecastBuffer;
  const recommendedQuantity = calculateRecommendedQuantity(
    availableStock,
    targetStock,
    minimumOrderQuantity,
    packSize
  );

  const urgency = classifyReorderUrgency(availableStock, safetyStock, reorderPoint, targetStock);

  const detailParts: string[] = [];
  if (averageDailyDemand > 0) {
    detailParts.push(`Current stock covers approximately ${formatDays(daysOfStockRemaining)} days of demand`);
  } else {
    detailParts.push('Demand is zero, so there is no replenishment pressure from daily usage');
  }

  detailParts.push(`while supplier lead time is ${supplierLeadTimeDays} days`);

  if (availableStock <= safetyStock) {
    detailParts.push('The SKU is at or below the critical safety threshold');
  } else if (availableStock <= reorderPoint) {
    detailParts.push('The SKU is below its reorder point');
  } else if (urgency === 'OVERSTOCKED') {
    detailParts.push('The SKU is above its target stock coverage and is overstocked');
  } else {
    detailParts.push('The SKU remains above its reorder point');
  }

  if (recommendedQuantity > 0) {
    detailParts.push(`Recommended order: ${recommendedQuantity} units.`);
  } else {
    detailParts.push('No reorder is recommended at this time.');
  }

  const reason = `${detailParts.join(', ')}.`;

  return {
    productId: input.productId,
    sku: input.sku,
    locationId: input.locationId,
    currentStock,
    reservedStock,
    availableStock,
    averageDailyDemand,
    leadTimeDays: supplierLeadTimeDays,
    safetyStock,
    reorderPoint,
    daysOfStockRemaining: Number.isFinite(daysOfStockRemaining) ? Math.max(0, daysOfStockRemaining) : 0,
    recommendedQuantity,
    urgency,
    reason
  };
}

export function calculateReorderRecommendation(input: ReorderEngineInput): ReorderRecommendation {
  return generateReorderRecommendation(input);
}

export const reorderEngine = {
  generateReorderRecommendation,
  calculateReorderRecommendation,
  classifyReorderUrgency,
  calculateRecommendedQuantity
};
