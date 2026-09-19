import { describe, expect, it } from 'vitest';

import { InMemoryInventoryRepository } from '../src/repositories/inventory-repository.js';

const baseInventory = {
  productId: 'prod-100',
  sku: 'SKU-100',
  locationId: 'loc-nyc',
  quantity: 120,
  reservedQuantity: 20,
  availableQuantity: 100,
  reorderPoint: 40,
  safetyStock: 25,
  lastUpdated: '2026-09-19T10:00:00.000Z'
};

describe('inventory repository', () => {
  it('gets inventory by product and location', async () => {
    const repo = new InMemoryInventoryRepository();
    await repo.putInventory(baseInventory);

    const result = await repo.getInventory('prod-100', 'loc-nyc');

    expect(result).toEqual(baseInventory);
  });

  it('puts inventory into the repository', async () => {
    const repo = new InMemoryInventoryRepository();

    const result = await repo.putInventory(baseInventory);

    expect(result).toEqual(baseInventory);
  });

  it('updates inventory quantity and recalculates availability', async () => {
    const repo = new InMemoryInventoryRepository();
    await repo.putInventory(baseInventory);

    const updated = await repo.updateInventoryQuantity('prod-100', 'loc-nyc', 90, {
      reservedQuantity: 15,
      lastUpdated: '2026-09-19T11:00:00.000Z'
    });

    expect(updated.quantity).toBe(90);
    expect(updated.reservedQuantity).toBe(15);
    expect(updated.availableQuantity).toBe(75);
    expect(updated.lastUpdated).toBe('2026-09-19T11:00:00.000Z');
  });

  it('lists inventory by location', async () => {
    const repo = new InMemoryInventoryRepository();
    await repo.putInventory(baseInventory);
    await repo.putInventory({
      ...baseInventory,
      productId: 'prod-200',
      sku: 'SKU-200',
      quantity: 80,
      reservedQuantity: 10,
      availableQuantity: 70,
      reorderPoint: 30,
      safetyStock: 20
    });

    const result = await repo.listInventoryByLocation('loc-nyc');

    expect(result).toHaveLength(2);
    expect(result.map((item) => item.productId)).toEqual(['prod-100', 'prod-200']);
  });

  it('lists low stock inventory for a location', async () => {
    const repo = new InMemoryInventoryRepository();
    await repo.putInventory({
      ...baseInventory,
      productId: 'prod-100',
      quantity: 35,
      reservedQuantity: 10,
      availableQuantity: 25,
      reorderPoint: 40,
      safetyStock: 25
    });
    await repo.putInventory({
      ...baseInventory,
      productId: 'prod-200',
      sku: 'SKU-200',
      quantity: 90,
      reservedQuantity: 5,
      availableQuantity: 85,
      reorderPoint: 30,
      safetyStock: 15
    });

    const result = await repo.listLowStockInventory('loc-nyc', 30);

    expect(result).toHaveLength(1);
    expect(result).not.toBeUndefined();
    const [firstLowStockItem] = result;
    expect(firstLowStockItem?.productId).toBe('prod-100');
  });

  it('returns null when inventory is not found', async () => {
    const repo = new InMemoryInventoryRepository();

    const result = await repo.getInventory('missing-product', 'loc-nyc');

    expect(result).toBeNull();
  });

  it('throws a not-found error when updating missing inventory', async () => {
    const repo = new InMemoryInventoryRepository();

    await expect(repo.updateInventoryQuantity('missing-product', 'loc-nyc', 10)).rejects.toThrow(
      'Inventory item for product missing-product at loc-nyc not found'
    );
  });
});
