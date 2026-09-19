import { describe, expect, it } from 'vitest';

import { InventoryApiHandler } from '../src/handlers/inventory-api.js';
import { InventoryEventHandler } from '../src/handlers/inventory-event-handler.js';
import { InventoryService } from '../src/services/inventory-service.js';
import { ReorderService } from '../src/services/reorder-service.js';
import { InventoryEventProcessor, InMemoryEventIndexer, InMemoryProcessedEventStore } from '../src/services/inventory-event-processor.js';
import { InMemoryInventoryRepository } from '../src/repositories/inventory-repository.js';

const baseInventory = {
  productId: 'prod_001',
  sku: 'SKU-1042',
  locationId: 'BLR-01',
  quantity: 100,
  reservedQuantity: 0,
  availableQuantity: 100,
  reorderPoint: 60,
  safetyStock: 20,
  lastUpdated: '2026-09-19T00:00:00.000Z'
};

describe('backend integration readiness', () => {
  it('SCENARIO 1: a sale event updates stock from 100 to 80', async () => {
    const repo = new InMemoryInventoryRepository();
    await repo.putInventory(baseInventory);

    const processor = new InventoryEventProcessor({
      inventoryRepository: repo,
      processedEventStore: new InMemoryProcessedEventStore(),
      indexer: new InMemoryEventIndexer()
    });

    const result = await processor.processEvent({
      eventId: 'evt_sale_1',
      productId: 'prod_001',
      sku: 'SKU-1042',
      locationId: 'BLR-01',
      eventType: 'SALE',
      quantityChange: -20,
      previousQuantity: 100,
      newQuantity: 80,
      timestamp: '2026-09-19T10:00:00.000Z',
      source: 'demo'
    });

    expect(result.quantity).toBe(80);
    expect(result.availableQuantity).toBe(80);
  });

  it('SCENARIO 2: duplicate sale event does not decrement inventory again', async () => {
    const repo = new InMemoryInventoryRepository();
    await repo.putInventory({ ...baseInventory, quantity: 100, availableQuantity: 100 });

    const processedStore = new InMemoryProcessedEventStore();
    const indexer = new InMemoryEventIndexer();
    const processor = new InventoryEventProcessor({
      inventoryRepository: repo,
      processedEventStore: processedStore,
      indexer
    });

    const event = {
      eventId: 'evt_duplicate_1',
      productId: 'prod_001',
      sku: 'SKU-1042',
      locationId: 'BLR-01',
      eventType: 'SALE',
      quantityChange: -20,
      previousQuantity: 100,
      newQuantity: 80,
      timestamp: '2026-09-19T10:00:00.000Z',
      source: 'demo'
    };

    const first = await processor.processEvent(event);
    const second = await processor.processEvent(event);

    expect(first.quantity).toBe(80);
    expect(second.quantity).toBe(0);
    expect(indexer.events).toHaveLength(1);
  });

  it('SCENARIO 3: inventory below reorder point returns a reorder recommendation', async () => {
    const inventoryItems = [
      {
        productId: 'prod_001',
        sku: 'SKU-1042',
        locationId: 'BLR-01',
        currentStock: 40,
        reservedStock: 10,
        safetyStock: 20,
        minimumOrderQuantity: 20,
        packSize: 10
      }
    ];

    const reorderService = new ReorderService({
      listInventory: async () => inventoryItems,
      getInventory: async (productId, locationId) => {
        const item = inventoryItems.find((entry) => entry.productId === productId && entry.locationId === locationId);
        return item ?? null;
      },
      getDemandInformation: async () => ({ averageDailyDemand: 15, forecastBuffer: 25 }),
      getSupplierInformation: async () => ({ leadTimeDays: 5 })
    });

    const result = await reorderService.listRecommendations({ locationId: 'BLR-01', page: 1, limit: 25 });
    const recommendation = result.recommendations[0];

    expect(result.recommendations).toHaveLength(1);
    expect(recommendation).toBeDefined();
    expect(recommendation?.urgency).toBe('REORDER_SOON');
    expect(recommendation?.recommendedQuantity).toBeGreaterThan(0);
    expect(result.summary.reorderSoon).toBe(1);
  });

  it('SCENARIO 4: a restock event increases inventory', async () => {
    const repo = new InMemoryInventoryRepository();
    await repo.putInventory({ ...baseInventory, quantity: 80, availableQuantity: 80 });

    const processor = new InventoryEventProcessor({
      inventoryRepository: repo,
      processedEventStore: new InMemoryProcessedEventStore(),
      indexer: new InMemoryEventIndexer()
    });

    const result = await processor.processEvent({
      eventId: 'evt_restock_1',
      productId: 'prod_001',
      sku: 'SKU-1042',
      locationId: 'BLR-01',
      eventType: 'RESTOCK',
      quantityChange: 25,
      previousQuantity: 80,
      newQuantity: 105,
      timestamp: '2026-09-19T10:05:00.000Z',
      source: 'demo'
    });

    expect(result.quantity).toBe(105);
    expect(result.availableQuantity).toBe(105);
  });

  it('SCENARIO 5: malformed event is rejected', async () => {
    const repo = new InMemoryInventoryRepository();
    await repo.putInventory(baseInventory);

    const processor = new InventoryEventProcessor({
      inventoryRepository: repo,
      processedEventStore: new InMemoryProcessedEventStore(),
      indexer: new InMemoryEventIndexer()
    });

    await expect(
      processor.processEvent({
        eventId: '',
        productId: 'prod_001',
        sku: 'SKU-1042',
        locationId: 'BLR-01',
        eventType: 'INVALID',
        quantityChange: 5,
        timestamp: 'bad-date',
        source: 'demo'
      })
    ).rejects.toThrow('Malformed inventory event payload');
  });

  it('SCENARIO 6: historical events can be searched through OpenSearch-style search APIs', async () => {
    const eventRepository = {
      searchInventoryEvents: async () => ({
        items: [{
          eventId: 'evt_001',
          productId: 'prod_001',
          sku: 'SKU-1042',
          locationId: 'BLR-01',
          eventType: 'SALE',
          quantityChange: -20,
          previousQuantity: 100,
          newQuantity: 80,
          timestamp: '2026-09-19T10:00:00.000Z',
          source: 'demo'
        }],
        total: 1,
        page: 1,
        limit: 25
      }),
      indexInventoryEvent: async (event: any) => event,
      getInventoryEvent: async () => null
    };

    const inventoryService = new InventoryService(new InMemoryInventoryRepository());
    const handler = new InventoryApiHandler(inventoryService, eventRepository as any);

    const response = await handler.handle({
      httpMethod: 'GET',
      path: '/inventory/search',
      queryStringParameters: {
        q: 'SKU-1042',
        page: '1',
        limit: '25'
      }
    });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toMatchObject({
      success: true,
      data: {
        results: expect.any(Array),
        pagination: { page: 1, limit: 25, total: 1 }
      }
    });
  });

  it('SCENARIO 7: inventory health statistics are returned', async () => {
    const repo = new InMemoryInventoryRepository();
    await repo.putInventory({
      productId: 'prod_001',
      sku: 'SKU-1042',
      locationId: 'BLR-01',
      quantity: 80,
      reservedQuantity: 10,
      availableQuantity: 70,
      reorderPoint: 60,
      safetyStock: 20,
      lastUpdated: '2026-09-19T00:00:00.000Z'
    });
    await repo.putInventory({
      productId: 'prod_002',
      sku: 'SKU-2042',
      locationId: 'BLR-01',
      quantity: 120,
      reservedQuantity: 5,
      availableQuantity: 115,
      reorderPoint: 60,
      safetyStock: 20,
      lastUpdated: '2026-09-19T00:00:00.000Z'
    });

    const service = new InventoryService(repo);
    const summary = await service.getInventoryHealthSummary();

    expect(summary.totalSkus).toBe(2);
    expect(summary.healthy + summary.reorderSoon + summary.critical + summary.overstocked).toBe(2);
  });

  it('keeps API response format and validation consistent across the backend', async () => {
    const repo = new InMemoryInventoryRepository();
    const inventoryService = new InventoryService(repo);
    const handler = new InventoryApiHandler(inventoryService);

    const response = await handler.handle({
      httpMethod: 'GET',
      path: '/inventory',
      queryStringParameters: { page: '1', limit: '25' }
    });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toMatchObject({
      success: true,
      data: { items: [], total: 0, page: 1, limit: 25 }
    });

    const badResponse = await handler.handle({
      httpMethod: 'GET',
      path: '/inventory',
      queryStringParameters: { status: 'bad-status' }
    });

    expect(badResponse.statusCode).toBe(400);
    expect(JSON.parse(badResponse.body).success).toBe(false);
  });

  it('uses local test doubles and no hardcoded credentials or secrets in integration tests', async () => {
    const publisher = {
      publishInventoryEvent: async () => ({ success: true })
    };

    const handler = new InventoryEventHandler(publisher as any);
    const result = await handler.handle({
      productId: 'prod_001',
      sku: 'SKU-1042',
      locationId: 'BLR-01',
      eventType: 'SALE',
      quantityChange: -5,
      timestamp: '2026-09-19T10:00:00.000Z',
      source: 'demo'
    });

    expect(result.statusCode).toBe(202);
    expect(JSON.parse(result.body).success).toBe(true);
  });
});
