import { describe, expect, it } from 'vitest';

import {
  inventoryEventSchema,
  inventoryLocationSchema,
  inventoryStateSchema,
  productSchema,
  reorderRecommendationSchema,
  supplierSchema
} from '../src/validation/domain-schemas.js';

describe('domain validation', () => {
  it('accepts valid product, supplier, location, state, event, and recommendation payloads', () => {
    const productResult = productSchema.safeParse({
      productId: 'prod-101',
      sku: 'SKU-1001',
      name: 'Wireless Mouse',
      category: 'Electronics',
      supplierId: 'sup-001',
      supplierName: 'Northwind Supply',
      unitCost: 15.5,
      sellingPrice: 29.99,
      reorderPoint: 20,
      safetyStock: 10,
      minimumOrderQuantity: 5,
      packSize: 1
    });

    const supplierResult = supplierSchema.safeParse({
      supplierId: 'sup-001',
      name: 'Northwind Supply',
      leadTimeDays: 7,
      reliabilityScore: 98
    });

    const locationResult = inventoryLocationSchema.safeParse({
      locationId: 'loc-nyc',
      locationName: 'New York DC',
      region: 'Northeast',
      address: '31 Hudson Ave'
    });

    const stateResult = inventoryStateSchema.safeParse({
      productId: 'prod-101',
      sku: 'SKU-1001',
      locationId: 'loc-nyc',
      quantity: 150,
      reservedQuantity: 30,
      availableQuantity: 120,
      reorderPoint: 20,
      safetyStock: 10,
      lastUpdated: '2026-09-19T10:00:00.000Z'
    });

    const eventResult = inventoryEventSchema.safeParse({
      eventId: 'evt-001',
      productId: 'prod-101',
      sku: 'SKU-1001',
      locationId: 'loc-nyc',
      eventType: 'SALE',
      quantityChange: -5,
      previousQuantity: 120,
      newQuantity: 115,
      timestamp: '2026-09-19T10:05:00.000Z',
      source: 'POS'
    });

    const recommendationResult = reorderRecommendationSchema.safeParse({
      productId: 'prod-101',
      sku: 'SKU-1001',
      locationId: 'loc-nyc',
      currentStock: 115,
      reservedStock: 25,
      availableStock: 90,
      averageDailyDemand: 8,
      leadTimeDays: 7,
      safetyStock: 10,
      reorderPoint: 20,
      daysOfStockRemaining: 12,
      recommendedQuantity: 25,
      urgency: 'REORDER_SOON',
      reason: 'Demand remains above target inventory threshold'
    });

    expect(productResult.success).toBe(true);
    expect(supplierResult.success).toBe(true);
    expect(locationResult.success).toBe(true);
    expect(stateResult.success).toBe(true);
    expect(eventResult.success).toBe(true);
    expect(recommendationResult.success).toBe(true);
  });

  it('rejects missing fields, invalid event types, empty IDs, numeric invalid values, and malformed timestamps', () => {
    expect(productSchema.safeParse({
      productId: '',
      sku: 'SKU-1001',
      name: 'Mouse',
      category: 'Electronics',
      supplierId: 'sup-001',
      supplierName: 'Northwind Supply',
      unitCost: 0,
      sellingPrice: 29.99,
      reorderPoint: 20,
      safetyStock: 10,
      minimumOrderQuantity: 5,
      packSize: 1
    }).success).toBe(false);

    expect(inventoryEventSchema.safeParse({
      eventId: 'evt-001',
      productId: 'prod-101',
      sku: 'SKU-1001',
      locationId: 'loc-nyc',
      eventType: 'INVALID_EVENT',
      quantityChange: -5,
      previousQuantity: 120,
      newQuantity: 115,
      timestamp: '2026-09-19T10:05:00.000Z',
      source: 'POS'
    }).success).toBe(false);

    expect(inventoryStateSchema.safeParse({
      productId: 'prod-101',
      sku: 'SKU-1001',
      locationId: 'loc-nyc',
      quantity: -1,
      reservedQuantity: 0,
      availableQuantity: 0,
      reorderPoint: 20,
      safetyStock: 10,
      lastUpdated: 'not-a-timestamp'
    }).success).toBe(false);

    expect(supplierSchema.safeParse({
      supplierId: 'sup-001',
      name: '',
      leadTimeDays: -2,
      reliabilityScore: 110
    }).success).toBe(false);

    expect(reorderRecommendationSchema.safeParse({
      productId: 'prod-101',
      sku: 'SKU-1001',
      locationId: 'loc-nyc',
      currentStock: 115,
      reservedStock: 25,
      availableStock: 90,
      averageDailyDemand: 8,
      leadTimeDays: 7,
      safetyStock: 10,
      reorderPoint: 20,
      daysOfStockRemaining: 12,
      recommendedQuantity: 25,
      urgency: 'UNKNOWN',
      reason: 'Demand remains above target inventory threshold'
    }).success).toBe(false);
  });
});
