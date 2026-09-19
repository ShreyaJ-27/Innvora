import { describe, expect, it, vi } from 'vitest';

import { InventoryService } from '../src/services/inventory-service.js';
import { InventoryRepository } from '../src/repositories/inventory-repository.js';

const inventoryItems = [
  {
    productId: 'prod_001',
    sku: 'SKU-001',
    locationId: 'BLR-01',
    quantity: 120,
    reservedQuantity: 20,
    availableQuantity: 100,
    reorderPoint: 40,
    safetyStock: 20,
    lastUpdated: '2026-09-19T00:00:00.000Z'
  },
  {
    productId: 'prod_002',
    sku: 'SKU-002',
    locationId: 'BLR-01',
    quantity: 30,
    reservedQuantity: 5,
    availableQuantity: 25,
    reorderPoint: 40,
    safetyStock: 20,
    lastUpdated: '2026-09-19T00:00:00.000Z'
  },
  {
    productId: 'prod_003',
    sku: 'SKU-003',
    locationId: 'BLR-02',
    quantity: 200,
    reservedQuantity: 10,
    availableQuantity: 190,
    reorderPoint: 40,
    safetyStock: 20,
    lastUpdated: '2026-09-19T00:00:00.000Z'
  }
];

describe('inventory service', () => {
  it('lists inventory with pagination and optional status filters', async () => {
    const repository: InventoryRepository = {
      getInventory: vi.fn(),
      putInventory: vi.fn(),
      updateInventoryQuantity: vi.fn(),
      listAllInventory: vi.fn().mockResolvedValue(inventoryItems),
      listInventoryByLocation: vi.fn().mockResolvedValue(inventoryItems),
      listLowStockInventory: vi.fn()
    };

    const service = new InventoryService(repository);

    const result = await service.listInventory({ page: 1, limit: 2, status: 'all' });

    expect(result.total).toBe(3);
    expect(result.items).toHaveLength(2);
  });

  it('returns inventory for a specific product and location', async () => {
    const repository: InventoryRepository = {
      getInventory: vi.fn().mockResolvedValue(inventoryItems[0]),
      putInventory: vi.fn(),
      updateInventoryQuantity: vi.fn(),
      listAllInventory: vi.fn(),
      listInventoryByLocation: vi.fn(),
      listLowStockInventory: vi.fn()
    };

    const service = new InventoryService(repository);
    const result = await service.getInventory('prod_001', 'BLR-01');

    expect(result).toEqual([inventoryItems[0]]);
  });

  it('returns all inventory for a location', async () => {
    const repository: InventoryRepository = {
      getInventory: vi.fn(),
      putInventory: vi.fn(),
      updateInventoryQuantity: vi.fn(),
      listAllInventory: vi.fn(),
      listInventoryByLocation: vi.fn().mockResolvedValue(inventoryItems.slice(0, 2)),
      listLowStockInventory: vi.fn()
    };

    const service = new InventoryService(repository);
    const result = await service.getInventoryByLocation('BLR-01');

    expect(result).toHaveLength(2);
  });

  it('calculates inventory health metrics', async () => {
    const repository: InventoryRepository = {
      getInventory: vi.fn(),
      putInventory: vi.fn(),
      updateInventoryQuantity: vi.fn(),
      listAllInventory: vi.fn().mockResolvedValue(inventoryItems),
      listInventoryByLocation: vi.fn(),
      listLowStockInventory: vi.fn()
    };

    const service = new InventoryService(repository);
    const summary = await service.getInventoryHealthSummary();

    expect(summary.totalSkus).toBe(3);
    expect(summary.healthy).toBeGreaterThanOrEqual(0);
    expect(summary.reorderSoon + summary.critical + summary.healthy + summary.overstocked).toBe(3);
  });
});
