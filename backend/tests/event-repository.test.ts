import { describe, expect, it, vi } from 'vitest';

import { InventoryEvent } from '../src/domain/models.js';
import { InventoryEventRepository, OpenSearchInventoryEventRepository } from '../src/repositories/event-repository.js';

const sampleEvent: InventoryEvent = {
  eventId: 'evt_001',
  productId: 'prod_001',
  sku: 'SKU-001',
  locationId: 'BLR-01',
  eventType: 'SALE',
  quantityChange: -3,
  previousQuantity: 100,
  newQuantity: 97,
  timestamp: '2026-09-19T10:00:00.000Z',
  source: 'demo'
};

describe('event repository', () => {
  it('indexes a valid inventory event', async () => {
    const client = {
      index: vi.fn().mockResolvedValue({ body: { result: 'created' } })
    } as any;

    const repository: InventoryEventRepository = new OpenSearchInventoryEventRepository(client, 'stockpulse-events');

    const result = await repository.indexInventoryEvent(sampleEvent);

    expect(result.eventId).toBe('evt_001');
    expect(client.index).toHaveBeenCalledWith(
      expect.objectContaining({
        index: 'stockpulse-events',
        id: 'evt_001'
      })
    );
  });

  it('searches inventory events with filters and pagination', async () => {
    const client = {
      search: vi.fn().mockResolvedValue({
        body: {
          hits: {
            total: { value: 2 },
            hits: [{ _source: sampleEvent }, { _source: { ...sampleEvent, eventId: 'evt_002', eventType: 'RESTOCK' } }]
          }
        }
      })
    } as any;

    const repository: InventoryEventRepository = new OpenSearchInventoryEventRepository(client, 'stockpulse-events');

    const result = await repository.searchInventoryEvents('SKU-001', {
      locationId: 'BLR-01',
      eventType: 'SALE',
      startDate: '2026-09-19T00:00:00.000Z',
      endDate: '2026-09-19T12:00:00.000Z'
    }, { page: 1, limit: 10 });

    expect(result.total).toBe(2);
    expect(result.items).toHaveLength(2);
    expect(client.search).toHaveBeenCalledWith(
      expect.objectContaining({
        index: 'stockpulse-events',
        body: expect.objectContaining({
          from: 0,
          size: 10
        })
      })
    );
  });

  it('gets an inventory event by id', async () => {
    const client = {
      get: vi.fn().mockResolvedValue({ body: { found: true, _source: sampleEvent } })
    } as any;

    const repository: InventoryEventRepository = new OpenSearchInventoryEventRepository(client, 'stockpulse-events');

    const result = await repository.getInventoryEvent('evt_001');

    expect(result).toEqual(sampleEvent);
  });

  it('returns null for a missing event', async () => {
    const client = {
      get: vi.fn().mockResolvedValue({ body: { found: false } })
    } as any;

    const repository: InventoryEventRepository = new OpenSearchInventoryEventRepository(client, 'stockpulse-events');

    const result = await repository.getInventoryEvent('missing-event');

    expect(result).toBeNull();
  });
});
