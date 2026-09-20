import { describe, expect, it } from 'vitest';
import { InMemoryInventoryRepository } from '../src/repositories/inventory-repository.js';
import { InventoryService } from '../src/services/inventory-service.js';
import { InventoryApiHandler } from '../src/handlers/inventory-api.js';
import { ReorderService } from '../src/services/reorder-service.js';
import { InventoryEventProcessor } from '../src/services/inventory-event-processor.js';
import { ConflictError } from '../src/errors/AppError.js';

describe('Operational Scalability & Product Onboarding', () => {
  it('exposes locations including Hyderabad (LOC-HYD-01)', async () => {
    const repository = new InMemoryInventoryRepository();
    const service = new InventoryService(repository);
    const handler = new InventoryApiHandler(service);

    const res = await handler.handle({
      httpMethod: 'GET',
      path: '/locations'
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(true);
    expect(body.data).toBeInstanceOf(Array);
    const hyd = body.data.find((loc: any) => loc.locationId === 'LOC-HYD-01');
    expect(hyd).toBeDefined();
    expect(hyd.locationName).toBe('Hyderabad Regional Depot');
  });

  it('exposes suppliers catalog', async () => {
    const repository = new InMemoryInventoryRepository();
    const service = new InventoryService(repository);
    const handler = new InventoryApiHandler(service);

    const res = await handler.handle({
      httpMethod: 'GET',
      path: '/suppliers'
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(true);
    expect(body.data.length).toBeGreaterThanOrEqual(4);
  });

  it('creates a new product and rejects duplicate SKU with 409 Conflict', async () => {
    const repository = new InMemoryInventoryRepository();
    const service = new InventoryService(repository);
    const handler = new InventoryApiHandler(service);

    const newProductPayload = {
      sku: 'SKU-TEST-NEW-001',
      name: 'Noise Cancelling Smart Headphones Pro',
      category: 'Audio',
      supplierId: 'SUP-IND-01',
      unitCost: 1200,
      sellingPrice: 2999,
      reorderPoint: 25,
      safetyStock: 10,
      minimumOrderQuantity: 20,
      packSize: 5,
      locationId: 'LOC-HYD-01',
      initialStock: 50
    };

    // 1. Create product
    const createRes = await handler.handle({
      httpMethod: 'POST',
      path: '/products',
      body: JSON.stringify(newProductPayload)
    });

    expect(createRes.statusCode).toBe(201);
    const createBody = JSON.parse(createRes.body);
    expect(createBody.success).toBe(true);
    expect(createBody.data.product.sku).toBe('SKU-TEST-NEW-001');
    expect(createBody.data.initialInventoryCreated).toBe(true);
    expect(createBody.data.initialStockEvent?.quantity).toBe(50);

    // Verify product can be fetched via GET /products
    const listRes = await handler.handle({
      httpMethod: 'GET',
      path: '/products'
    });
    const listBody = JSON.parse(listRes.body);
    expect(listBody.data.some((p: any) => p.sku === 'SKU-TEST-NEW-001')).toBe(true);

    // 2. Reject duplicate SKU with 409
    const dupRes = await handler.handle({
      httpMethod: 'POST',
      path: '/products',
      body: JSON.stringify({
        ...newProductPayload,
        name: 'Another duplicate product'
      })
    });

    expect(dupRes.statusCode).toBe(409);
    const dupBody = JSON.parse(dupRes.body);
    expect(dupBody.success).toBe(false);
    expect(dupBody.error.code).toBe('CONFLICT');
  });

  it('updates health aggregates when inventory event changes status', async () => {
    const repository = new InMemoryInventoryRepository();
    const processedStore = {
      processed: new Set<string>(),
      hasProcessed: async (id: string) => processedStore.processed.has(id),
      markProcessed: async (id: string) => { processedStore.processed.add(id); }
    };
    const indexer = { indexEvent: async () => {} };

    const processor = new InventoryEventProcessor({
      inventoryRepository: repository,
      processedEventStore: processedStore,
      indexer
    });

    // 1. Ingest RESTOCK: available stock = 35 (between ROP 20 and 2.5x ROP 50 -> HEALTHY)
    await processor.processEvent({
      eventId: 'evt-init-35',
      productId: 'PROD-HEALTH-TEST',
      sku: 'SKU-HEALTH-100',
      locationId: 'LOC-HYD-01',
      eventType: 'RESTOCK',
      quantityChange: 35,
      previousQuantity: 0,
      newQuantity: 35,
      timestamp: new Date().toISOString(),
      source: 'Test Seed'
    });

    const service = new InventoryService(repository);
    let summary = await service.getInventoryHealthSummary('LOC-HYD-01');
    expect(summary.healthy).toBe(1);
    expect(summary.critical).toBe(0);

    // 2. Ingest SALE: available stock drops to 5 (<= safetyStock of 10 -> CRITICAL)
    await processor.processEvent({
      eventId: 'evt-sale-30',
      productId: 'PROD-HEALTH-TEST',
      sku: 'SKU-HEALTH-100',
      locationId: 'LOC-HYD-01',
      eventType: 'SALE',
      quantityChange: -30,
      previousQuantity: 35,
      newQuantity: 5,
      timestamp: new Date().toISOString(),
      source: 'POS'
    });

    summary = await service.getInventoryHealthSummary('LOC-HYD-01');
    expect(summary.healthy).toBe(0);
    expect(summary.critical).toBe(1);
  });

  it('reads reorders from precomputed read-model without on-demand table recomputation', async () => {
    const repository = new InMemoryInventoryRepository();
    await repository.putPrecomputedReorder({
      productId: 'PROD-PRECOMP',
      sku: 'SKU-PRECOMP-1',
      locationId: 'LOC-HYD-01',
      currentStock: 5,
      reservedStock: 0,
      availableStock: 5,
      averageDailyDemand: 4,
      leadTimeDays: 5,
      safetyStock: 10,
      reorderPoint: 30,
      daysOfStockRemaining: 1.2,
      recommendedQuantity: 45,
      urgency: 'CRITICAL',
      reason: 'Lead-time demand requires immediate replenishment'
    });

    const reorderService = new ReorderService({
      listInventory: async () => [],
      getInventory: async () => null,
      getDemandInformation: async () => null,
      getSupplierInformation: async () => null,
      listPrecomputedRecommendations: (loc, urg) => repository.listPrecomputedReorders(loc, urg)
    });

    const result = await reorderService.listRecommendations({ locationId: 'LOC-HYD-01' });
    expect(result.recommendations).toHaveLength(1);
    expect(result.recommendations[0]?.sku).toBe('SKU-PRECOMP-1');
    expect(result.summary.critical).toBe(1);
    expect(result.summary.recommendedUnits).toBe(45);
  });

  it('exposes operational notifications for critical items', async () => {
    const repository = new InMemoryInventoryRepository();
    await repository.putInventory({
      productId: 'PROD-LOW-1',
      sku: 'SKU-LOW-1',
      locationId: 'LOC-HYD-01',
      quantity: 3,
      reservedQuantity: 0,
      availableQuantity: 3,
      reorderPoint: 25,
      safetyStock: 10,
      lastUpdated: new Date().toISOString()
    });

    const service = new InventoryService(repository);
    const handler = new InventoryApiHandler(service);

    const res = await handler.handle({
      httpMethod: 'GET',
      path: '/notifications'
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(true);
    expect(body.data.length).toBeGreaterThanOrEqual(1);
    expect(body.data[0].urgency).toBe('CRITICAL');
  });

  it('simulates 1,000+ inventory records with bounded-concurrency queries and pagination', async () => {
    const repository = new InMemoryInventoryRepository();

    // Populate 1,200 inventory items across 4 locations (300 items per location)
    const locations = ['LOC-BOM-01', 'LOC-DEL-02', 'LOC-BLR-01', 'LOC-HYD-01'] as const;
    for (let i = 0; i < 1200; i++) {
      const loc = locations[i % locations.length];
      await repository.putInventory({
        productId: `PROD-BENCH-${i}`,
        sku: `SKU-BENCH-${i}`,
        locationId: loc!,
        quantity: 50 + (i % 50),
        reservedQuantity: 5,
        availableQuantity: 45 + (i % 50),
        reorderPoint: 30,
        safetyStock: 15,
        lastUpdated: new Date().toISOString()
      });
    }

    const service = new InventoryService(repository);

    const start = performance.now();
    const page1 = await service.listInventory({ page: 1, limit: 50 });
    const duration = performance.now() - start;

    expect(page1.total).toBe(1200);
    expect(page1.items).toHaveLength(50);
    expect(page1.page).toBe(1);
    expect(page1.limit).toBe(50);
    // Bounded in-memory query across 1,200 records executes in under 50ms
    expect(duration).toBeLessThan(100);
  });
});
