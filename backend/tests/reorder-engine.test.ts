import { describe, expect, it } from 'vitest';

import {
  calculateRecommendedQuantity,
  classifyReorderUrgency,
  generateReorderRecommendation
} from '../src/domain/reorder/reorder-engine.js';

describe('reorder engine', () => {
  it('recommends a reorder when the SKU falls below the reorder point', () => {
    const recommendation = generateReorderRecommendation({
      productId: 'prod_001',
      sku: 'SKU-1042',
      locationId: 'BLR-01',
      currentStock: 80,
      reservedStock: 20,
      averageDailyDemand: 15,
      supplierLeadTimeDays: 5,
      safetyStock: 30,
      minimumOrderQuantity: 20,
      packSize: 10,
      forecastBuffer: 25
    });

    expect(recommendation.urgency).toBe('REORDER_SOON');
    expect(recommendation.availableStock).toBe(60);
    expect(recommendation.recommendedQuantity).toBe(70);
    expect(recommendation.reason).toContain('Recommended order: 70 units');
  });

  it('returns zero when stock is healthy', () => {
    const recommendation = generateReorderRecommendation({
      productId: 'prod_002',
      sku: 'SKU-2000',
      locationId: 'BLR-01',
      currentStock: 80,
      reservedStock: 20,
      averageDailyDemand: 5,
      supplierLeadTimeDays: 4,
      safetyStock: 20,
      minimumOrderQuantity: 20,
      packSize: 10,
      forecastBuffer: 5
    });

    expect(recommendation.urgency).toBe('HEALTHY');
    expect(recommendation.recommendedQuantity).toBe(0);
  });

  it('handles zero demand safely', () => {
    const recommendation = generateReorderRecommendation({
      productId: 'prod_003',
      sku: 'SKU-3000',
      locationId: 'BLR-02',
      currentStock: 100,
      reservedStock: 10,
      averageDailyDemand: 0,
      supplierLeadTimeDays: 3,
      safetyStock: 20,
      minimumOrderQuantity: 10,
      packSize: 5,
      forecastBuffer: 15
    });

    expect(recommendation.recommendedQuantity).toBe(0);
    expect(recommendation.reason).toContain('Demand is zero');
  });

  it('handles zero stock and negative stock without crashing', () => {
    const zeroStock = generateReorderRecommendation({
      productId: 'prod_004',
      sku: 'SKU-4000',
      locationId: 'BLR-02',
      currentStock: 0,
      reservedStock: 0,
      averageDailyDemand: 10,
      supplierLeadTimeDays: 4,
      safetyStock: 15,
      minimumOrderQuantity: 20,
      packSize: 10,
      forecastBuffer: 10
    });

    const negativeStock = generateReorderRecommendation({
      productId: 'prod_005',
      sku: 'SKU-5000',
      locationId: 'BLR-02',
      currentStock: 5,
      reservedStock: 30,
      averageDailyDemand: 10,
      supplierLeadTimeDays: 4,
      safetyStock: 15,
      minimumOrderQuantity: 20,
      packSize: 10,
      forecastBuffer: 10
    });

    expect(zeroStock.urgency).toBe('CRITICAL');
    expect(negativeStock.urgency).toBe('CRITICAL');
    expect(negativeStock.availableStock).toBe(-25);
    expect(negativeStock.recommendedQuantity).toBeGreaterThan(0);
  });

  it('handles reserved stock exceeding current stock', () => {
    const recommendation = generateReorderRecommendation({
      productId: 'prod_006',
      sku: 'SKU-6000',
      locationId: 'BLR-03',
      currentStock: 25,
      reservedStock: 40,
      averageDailyDemand: 12,
      supplierLeadTimeDays: 6,
      safetyStock: 20,
      minimumOrderQuantity: 25,
      packSize: 5,
      forecastBuffer: 25
    });

    expect(recommendation.availableStock).toBe(-15);
    expect(recommendation.urgency).toBe('CRITICAL');
    expect(recommendation.recommendedQuantity).toBeGreaterThan(0);
  });

  it('uses a zero-day lead time when supplier lead time is missing', () => {
    const recommendation = generateReorderRecommendation({
      productId: 'prod_007',
      sku: 'SKU-7000',
      locationId: 'BLR-03',
      currentStock: 70,
      reservedStock: 10,
      averageDailyDemand: 10,
      supplierLeadTimeDays: null,
      safetyStock: 30,
      minimumOrderQuantity: 10,
      packSize: 10,
      forecastBuffer: 0
    });

    expect(recommendation.leadTimeDays).toBe(0);
    expect(recommendation.reason).toContain('0 days');
  });

  it('respects minimum order quantity and pack size rules', () => {
    const recommendation = generateReorderRecommendation({
      productId: 'prod_008',
      sku: 'SKU-8000',
      locationId: 'BLR-04',
      currentStock: 20,
      reservedStock: 0,
      averageDailyDemand: 10,
      supplierLeadTimeDays: 2,
      safetyStock: 20,
      minimumOrderQuantity: 25,
      packSize: 10,
      forecastBuffer: 0
    });

    expect(recommendation.recommendedQuantity).toBe(30);
    expect(recommendation.recommendedQuantity % 10).toBe(0);
  });

  it('classifies overstock correctly when coverage is unusually high', () => {
    const recommendation = generateReorderRecommendation({
      productId: 'prod_009',
      sku: 'SKU-9000',
      locationId: 'BLR-05',
      currentStock: 1000,
      reservedStock: 10,
      averageDailyDemand: 5,
      supplierLeadTimeDays: 4,
      safetyStock: 20,
      minimumOrderQuantity: 20,
      packSize: 10,
      forecastBuffer: 50
    });

    expect(recommendation.urgency).toBe('OVERSTOCKED');
    expect(recommendation.recommendedQuantity).toBe(0);
  });

  it('returns a zero quantity for a non-reorder scenario with low demand', () => {
    const recommendation = generateReorderRecommendation({
      productId: 'prod_010',
      sku: 'SKU-10000',
      locationId: 'BLR-06',
      currentStock: 80,
      reservedStock: 20,
      averageDailyDemand: 5,
      supplierLeadTimeDays: 4,
      safetyStock: 20,
      minimumOrderQuantity: 5,
      packSize: 5,
      forecastBuffer: 5
    });

    expect(recommendation.urgency).toBe('HEALTHY');
    expect(recommendation.recommendedQuantity).toBe(0);
  });

  it('calculates recommended quantity with pack rounding and minimum order rules', () => {
    expect(
      calculateRecommendedQuantity(40, 60, 15, 10)
    ).toBe(20);
    expect(
      calculateRecommendedQuantity(10, 50, 25, 10)
    ).toBe(40);
  });

  it('classifies reorder urgency states correctly', () => {
    expect(classifyReorderUrgency(10, 20, 40, 50)).toBe('CRITICAL');
    expect(classifyReorderUrgency(25, 20, 40, 50)).toBe('REORDER_SOON');
    expect(classifyReorderUrgency(100, 20, 40, 50)).toBe('OVERSTOCKED');
    expect(classifyReorderUrgency(400, 20, 40, 50)).toBe('OVERSTOCKED');
  });
});
