import { describe, expect, it, vi } from 'vitest';

import { InventoryApiHandler } from '../src/handlers/inventory-api.js';
import { InventoryService } from '../src/services/inventory-service.js';

const items = [
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
    quantity: 25,
    reservedQuantity: 5,
    availableQuantity: 20,
    reorderPoint: 40,
    safetyStock: 20,
    lastUpdated: '2026-09-19T00:00:00.000Z'
  }
];

describe('inventory api handler', () => {
  it('returns inventory list with success envelope', async () => {
    const inventoryService = {
      listInventory: vi.fn().mockResolvedValue({ items, total: 2, page: 1, limit: 25 }),
      getInventory: vi.fn(),
      getInventoryByLocation: vi.fn(),
      getInventoryHealthSummary: vi.fn()
    } as unknown as InventoryService;

    const handler = new InventoryApiHandler(inventoryService);

    const response = await handler.handle({
      httpMethod: 'GET',
      path: '/inventory'
    });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toMatchObject({
      success: true,
      data: {
        total: 2,
        items: expect.any(Array)
      }
    });
  });

  it('returns a specific inventory item by product id and optional location', async () => {
    const inventoryService = {
      listInventory: vi.fn(),
      getInventory: vi.fn().mockResolvedValue(items.slice(0, 1)),
      getInventoryByLocation: vi.fn(),
      getInventoryHealthSummary: vi.fn()
    } as unknown as InventoryService;

    const handler = new InventoryApiHandler(inventoryService);

    const response = await handler.handle({
      httpMethod: 'GET',
      path: '/inventory/{productId}',
      pathParameters: { productId: 'prod_001' },
      queryStringParameters: { locationId: 'BLR-01' }
    });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body).data).toHaveLength(1);
  });

  it('returns location inventory', async () => {
    const inventoryService = {
      listInventory: vi.fn(),
      getInventory: vi.fn(),
      getInventoryByLocation: vi.fn().mockResolvedValue(items),
      getInventoryHealthSummary: vi.fn()
    } as unknown as InventoryService;

    const handler = new InventoryApiHandler(inventoryService);

    const response = await handler.handle({
      httpMethod: 'GET',
      path: '/inventory/location/{locationId}',
      pathParameters: { locationId: 'BLR-01' }
    });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body).data).toHaveLength(2);
  });

  it('returns health metrics', async () => {
    const inventoryService = {
      listInventory: vi.fn(),
      getInventory: vi.fn(),
      getInventoryByLocation: vi.fn(),
      getInventoryHealthSummary: vi.fn().mockResolvedValue({
        totalSkus: 3,
        healthy: 1,
        reorderSoon: 1,
        critical: 1,
        overstocked: 0
      })
    } as unknown as InventoryService;

    const handler = new InventoryApiHandler(inventoryService);

    const response = await handler.handle({
      httpMethod: 'GET',
      path: '/inventory/health'
    });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body).data.critical).toBe(1);
  });

  it('returns historical inventory search results with pagination', async () => {
    const inventoryService = {
      listInventory: vi.fn(),
      getInventory: vi.fn(),
      getInventoryByLocation: vi.fn(),
      getInventoryHealthSummary: vi.fn()
    } as unknown as InventoryService;

    const eventRepository = {
      searchInventoryEvents: vi.fn().mockResolvedValue({
        items: [{ eventId: 'evt_001', productId: 'prod_001', sku: 'SKU-1042', locationId: 'BLR-01', eventType: 'SALE' }],
        total: 120,
        page: 1,
        limit: 25
      }),
      indexInventoryEvent: vi.fn(),
      getInventoryEvent: vi.fn()
    };

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
        pagination: {
          page: 1,
          limit: 25,
          total: 120
        }
      }
    });
  });

  it('rejects invalid search pagination and date values', async () => {
    const inventoryService = {
      listInventory: vi.fn(),
      getInventory: vi.fn(),
      getInventoryByLocation: vi.fn(),
      getInventoryHealthSummary: vi.fn()
    } as unknown as InventoryService;

    const eventRepository = {
      searchInventoryEvents: vi.fn(),
      indexInventoryEvent: vi.fn(),
      getInventoryEvent: vi.fn()
    };

    const handler = new InventoryApiHandler(inventoryService, eventRepository as any);

    const hugeLimitResponse = await handler.handle({
      httpMethod: 'GET',
      path: '/inventory/search',
      queryStringParameters: { limit: '9999' }
    });
    expect(hugeLimitResponse.statusCode).toBe(400);

    const invalidDateResponse = await handler.handle({
      httpMethod: 'GET',
      path: '/inventory/search',
      queryStringParameters: { startDate: 'not-a-date' }
    });
    expect(invalidDateResponse.statusCode).toBe(400);

    const invalidPageResponse = await handler.handle({
      httpMethod: 'GET',
      path: '/inventory/search',
      queryStringParameters: { page: '0' }
    });
    expect(invalidPageResponse.statusCode).toBe(400);
  });

  it('returns reorder recommendations with live calculations and summary', async () => {
    const inventoryService = {
      listInventory: vi.fn(),
      getInventory: vi.fn(),
      getInventoryByLocation: vi.fn(),
      getInventoryHealthSummary: vi.fn()
    } as unknown as InventoryService;

    const reorderService = {
      listRecommendations: vi.fn().mockResolvedValue({
        recommendations: [
          {
            productId: 'prod_001',
            sku: 'SKU-1042',
            locationId: 'BLR-01',
            currentStock: 80,
            availableStock: 60,
            averageDailyDemand: 15,
            leadTimeDays: 5,
            reorderPoint: 75,
            daysOfStockRemaining: 4,
            recommendedQuantity: 70,
            urgency: 'REORDER_SOON',
            reason: 'Current stock covers approximately 4.0 days of demand, while supplier lead time is 5 days. The SKU is below its reorder point. Recommended order: 70 units.'
          }
        ],
        summary: {
          critical: 0,
          reorderSoon: 1,
          healthy: 0,
          overstocked: 0,
          recommendedUnits: 70,
          estimatedValue: 0
        }
      })
    } as any;

    const handler = new InventoryApiHandler(inventoryService, undefined, reorderService);

    const response = await handler.handle({
      httpMethod: 'GET',
      path: '/reorders',
      queryStringParameters: { locationId: 'BLR-01', urgency: 'REORDER_SOON', page: '1', limit: '25' }
    });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toMatchObject({
      success: true,
      data: {
        recommendations: [expect.objectContaining({ productId: 'prod_001', urgency: 'REORDER_SOON' })],
        summary: { reorderSoon: 1, recommendedUnits: 70 }
      }
    });
  });

  it('validates reorder urgency and pagination inputs', async () => {
    const inventoryService = {
      listInventory: vi.fn(),
      getInventory: vi.fn(),
      getInventoryByLocation: vi.fn(),
      getInventoryHealthSummary: vi.fn()
    } as unknown as InventoryService;

    const reorderService = {
      listRecommendations: vi.fn()
    } as any;

    const handler = new InventoryApiHandler(inventoryService, undefined, reorderService);

    const invalidUrgencyResponse = await handler.handle({
      httpMethod: 'GET',
      path: '/reorders',
      queryStringParameters: { urgency: 'BAD' }
    });
    expect(invalidUrgencyResponse.statusCode).toBe(400);

    const invalidPageResponse = await handler.handle({
      httpMethod: 'GET',
      path: '/reorders',
      queryStringParameters: { page: '0' }
    });
    expect(invalidPageResponse.statusCode).toBe(400);
  });

  it('returns a 400 error for invalid status', async () => {
    const inventoryService = {
      listInventory: vi.fn().mockImplementation(() => {
        throw new Error('should not be called');
      }),
      getInventory: vi.fn(),
      getInventoryByLocation: vi.fn(),
      getInventoryHealthSummary: vi.fn()
    } as unknown as InventoryService;

    const handler = new InventoryApiHandler(inventoryService);

    const response = await handler.handle({
      httpMethod: 'GET',
      path: '/inventory',
      queryStringParameters: { status: 'bad-status' }
    });

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body).success).toBe(false);
  });
});
