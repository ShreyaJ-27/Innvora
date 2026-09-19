import { describe, expect, it, vi } from 'vitest';

import { ReorderService } from '../src/services/reorder-service.js';

describe('reorder service', () => {
  it('creates a reorder recommendation by combining inventory, demand, and supplier data', async () => {
    const inventory = {
      productId: 'prod_001',
      sku: 'SKU-1042',
      locationId: 'BLR-01',
      currentStock: 80,
      reservedStock: 20,
      safetyStock: 30,
      minimumOrderQuantity: 20,
      packSize: 10
    };

    const dependencies = {
      listInventory: vi.fn().mockResolvedValue([inventory]),
      getInventory: vi.fn().mockResolvedValue(inventory),
      getDemandInformation: vi.fn().mockResolvedValue({
        averageDailyDemand: 15,
        forecastBuffer: 25
      }),
      getSupplierInformation: vi.fn().mockResolvedValue({
        supplierId: 'sup_001',
        name: 'Northwind Supply',
        leadTimeDays: 5
      })
    };

    const service = new ReorderService(dependencies);

    const recommendation = await service.createRecommendation('prod_001', 'BLR-01');

    expect(recommendation.urgency).toBe('REORDER_SOON');
    expect(recommendation.recommendedQuantity).toBe(70);
    expect(recommendation.reason).toContain('Recommended order: 70 units');
    expect(dependencies.getInventory).toHaveBeenCalledWith('prod_001', 'BLR-01');
    expect(dependencies.getDemandInformation).toHaveBeenCalledWith('prod_001', 'BLR-01');
    expect(dependencies.getSupplierInformation).toHaveBeenCalledWith('prod_001', 'BLR-01');
  });

  it('throws if inventory, demand, or supplier data is unavailable', async () => {
    const service = new ReorderService({
      listInventory: vi.fn().mockResolvedValue([]),
      getInventory: vi.fn().mockResolvedValue(null),
      getDemandInformation: vi.fn().mockResolvedValue({ averageDailyDemand: 10, forecastBuffer: 10 }),
      getSupplierInformation: vi.fn().mockResolvedValue({ leadTimeDays: 5 })
    });

    await expect(service.createRecommendation('prod_missing', 'BLR-99')).rejects.toThrow('Inventory not found');
  });
});
