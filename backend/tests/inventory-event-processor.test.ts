import { describe, expect, it, vi } from 'vitest';

import {
  InventoryEventProcessor,
  InMemoryEventIndexer,
  InMemoryProcessedEventStore,
  InventoryEventProcessorLambdaHandler
} from '../src/services/inventory-event-processor.js';
import { InventoryRepository } from '../src/repositories/inventory-repository.js';

const baseInventory = {
  productId: 'prod_001',
  sku: 'SKU-001',
  locationId: 'BLR-01',
  quantity: 100,
  reservedQuantity: 20,
  availableQuantity: 80,
  reorderPoint: 30,
  safetyStock: 15,
  lastUpdated: '2026-09-19T09:00:00.000Z'
};

const buildEvent = (eventType: string, quantityChange: number, eventId = 'evt_001') => ({
  eventId,
  productId: 'prod_001',
  sku: 'SKU-001',
  locationId: 'BLR-01',
  eventType,
  quantityChange,
  previousQuantity: 100,
  newQuantity: 100 + quantityChange,
  timestamp: '2026-09-19T10:00:00.000Z',
  source: 'demo'
});

describe('inventory event processor', () => {
  it.each([
    ['SALE', -3],
    ['RESTOCK', 10],
    ['RETURN', 2],
    ['TRANSFER_IN', 5],
    ['TRANSFER_OUT', -4]
  ])('processes %s events and updates inventory', async (eventType, quantityChange) => {
    const repo: InventoryRepository = {
      getInventory: vi.fn().mockResolvedValue(baseInventory),
      putInventory: vi.fn().mockImplementation(async (inventory) => inventory),
      updateInventoryQuantity: vi.fn(),
      listAllInventory: vi.fn(),
      listInventoryByLocation: vi.fn(),
      listLowStockInventory: vi.fn()
    };

    const processedStore = {
      hasProcessed: vi.fn().mockResolvedValue(false),
      markProcessed: vi.fn().mockResolvedValue(undefined)
    };

    const indexer = {
      indexEvent: vi.fn().mockResolvedValue(undefined)
    };

    const processor = new InventoryEventProcessor({
      inventoryRepository: repo,
      processedEventStore: processedStore,
      indexer
    });

    const result = await processor.processEvent(buildEvent(eventType, quantityChange, `evt_${eventType}`));

    expect(result.quantity).toBe(100 + quantityChange);
    expect(result.availableQuantity).toBe((100 + quantityChange) - baseInventory.reservedQuantity);
    expect(processedStore.markProcessed).toHaveBeenCalledWith(`evt_${eventType}`);
    expect(indexer.indexEvent).toHaveBeenCalled();
  });

  it('ignores duplicate events without modifying inventory again', async () => {
    const repo: InventoryRepository = {
      getInventory: vi.fn(),
      putInventory: vi.fn(),
      updateInventoryQuantity: vi.fn(),
      listAllInventory: vi.fn(),
      listInventoryByLocation: vi.fn(),
      listLowStockInventory: vi.fn()
    };

    const processedStore = {
      hasProcessed: vi.fn().mockResolvedValue(true),
      markProcessed: vi.fn()
    };

    const indexer = {
      indexEvent: vi.fn()
    };

    const processor = new InventoryEventProcessor({
      inventoryRepository: repo,
      processedEventStore: processedStore,
      indexer
    });

    await expect(processor.processEvent(buildEvent('SALE', -2, 'duplicate-1'))).resolves.toBeTruthy();
    expect(repo.getInventory).not.toHaveBeenCalled();
    expect(repo.putInventory).not.toHaveBeenCalled();
    expect(indexer.indexEvent).not.toHaveBeenCalled();
  });

  it('rejects malformed events', async () => {
    const processor = new InventoryEventProcessor({
      inventoryRepository: {
        getInventory: vi.fn(),
        putInventory: vi.fn(),
        updateInventoryQuantity: vi.fn(),
        listAllInventory: vi.fn(),
        listInventoryByLocation: vi.fn(),
        listLowStockInventory: vi.fn()
      },
      processedEventStore: new InMemoryProcessedEventStore(),
      indexer: new InMemoryEventIndexer()
    });

    await expect(
      processor.processEvent({
        eventId: '',
        productId: 'prod_001',
        sku: 'SKU-001',
        locationId: 'BLR-01',
        eventType: 'INVALID',
        quantityChange: 5,
        timestamp: 'bad-date',
        source: 'demo'
      })
    ).rejects.toThrow('Malformed inventory event payload');
  });

  it('fails when inventory is missing', async () => {
    const repo: InventoryRepository = {
      getInventory: vi.fn().mockResolvedValue(null),
      putInventory: vi.fn(),
      updateInventoryQuantity: vi.fn(),
      listAllInventory: vi.fn(),
      listInventoryByLocation: vi.fn(),
      listLowStockInventory: vi.fn()
    };

    const processor = new InventoryEventProcessor({
      inventoryRepository: repo,
      processedEventStore: new InMemoryProcessedEventStore(),
      indexer: new InMemoryEventIndexer()
    });

    await expect(processor.processEvent(buildEvent('SALE', -2, 'evt_missing'))).rejects.toThrow('Inventory record not found for event');
  });

  it('fails when DynamoDB update throws', async () => {
    const repo: InventoryRepository = {
      getInventory: vi.fn().mockResolvedValue(baseInventory),
      putInventory: vi.fn().mockRejectedValue(new Error('DynamoDB failure')),
      updateInventoryQuantity: vi.fn(),
      listAllInventory: vi.fn(),
      listInventoryByLocation: vi.fn(),
      listLowStockInventory: vi.fn()
    };

    const processor = new InventoryEventProcessor({
      inventoryRepository: repo,
      processedEventStore: new InMemoryProcessedEventStore(),
      indexer: new InMemoryEventIndexer()
    });

    await expect(processor.processEvent(buildEvent('RESTOCK', 8, 'evt_dynamodb'))).rejects.toThrow('DynamoDB failure');
  });

  it('fails when OpenSearch indexing throws', async () => {
    const repo: InventoryRepository = {
      getInventory: vi.fn().mockResolvedValue(baseInventory),
      putInventory: vi.fn().mockImplementation(async (inventory) => inventory),
      updateInventoryQuantity: vi.fn(),
      listAllInventory: vi.fn(),
      listInventoryByLocation: vi.fn(),
      listLowStockInventory: vi.fn()
    };

    const processedStore = new InMemoryProcessedEventStore();
    const indexer = {
      indexEvent: vi.fn().mockRejectedValue(new Error('OpenSearch failure'))
    };

    const processor = new InventoryEventProcessor({
      inventoryRepository: repo,
      processedEventStore: processedStore,
      indexer
    });

    await expect(processor.processEvent(buildEvent('RETURN', 4, 'evt_opensearch'))).rejects.toThrow('OpenSearch failure');
  });

  it('handles SQS records by processing each message and does not swallow errors', async () => {
    const repo: InventoryRepository = {
      getInventory: vi.fn().mockResolvedValue(baseInventory),
      putInventory: vi.fn().mockImplementation(async (inventory) => inventory),
      updateInventoryQuantity: vi.fn(),
      listAllInventory: vi.fn(),
      listInventoryByLocation: vi.fn(),
      listLowStockInventory: vi.fn()
    };

    const processedStore = new InMemoryProcessedEventStore();
    const indexer = new InMemoryEventIndexer();
    const processor = new InventoryEventProcessor({
      inventoryRepository: repo,
      processedEventStore: processedStore,
      indexer
    });

    const handler = new InventoryEventProcessorLambdaHandler(processor);

    await expect(
      handler.handle({
        Records: [{ body: JSON.stringify(buildEvent('SALE', -2, 'evt_lambda')) }]
      })
    ).resolves.toBeUndefined();

    await expect(
      handler.handle({
        Records: [{ body: '{not-json}' }]
      })
    ).rejects.toThrow(SyntaxError);
  });
});
