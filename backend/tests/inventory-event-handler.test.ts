import { beforeEach, describe, expect, it, vi } from 'vitest';

import { InventoryEventHandler } from '../src/handlers/inventory-event-handler.js';
import { InventoryEventPublisher } from '../src/services/sqs-event-publisher.js';

const validPayload = {
  eventId: 'evt_001',
  productId: 'prod_001',
  sku: 'SKU-001',
  locationId: 'BLR-01',
  eventType: 'SALE',
  quantityChange: -3,
  timestamp: '2026-09-19T10:00:00.000Z',
  source: 'demo'
};

describe('inventory event handler', () => {
  let publisher: InventoryEventPublisher;

  beforeEach(() => {
    publisher = {
      publishInventoryEvent: vi.fn().mockResolvedValue(undefined)
    };
  });

  it('accepts a valid payload and publishes to SQS', async () => {
    const handler = new InventoryEventHandler(publisher);

    const result = await handler.handle(validPayload);

    expect(result.statusCode).toBe(202);
    expect(JSON.parse(result.body)).toMatchObject({
      success: true,
      eventId: 'evt_001',
      message: 'Inventory event accepted for processing.'
    });
    expect(publisher.publishInventoryEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventId: 'evt_001',
        productId: 'prod_001',
        eventType: 'SALE'
      })
    );
  });

  it('generates an event ID when the API request omits one', async () => {
    const handler = new InventoryEventHandler(publisher);

    const result = await handler.handle({
      productId: 'prod_001',
      sku: 'SKU-001',
      locationId: 'BLR-01',
      eventType: 'RESTOCK',
      quantityChange: 5,
      timestamp: '2026-09-19T10:30:00.000Z',
      source: 'demo'
    });

    const body = JSON.parse(result.body);
    expect(result.statusCode).toBe(202);
    expect(body.success).toBe(true);
    expect(body.eventId).toBeTruthy();
  });

  it('returns a 400 validation error for invalid payloads', async () => {
    const handler = new InventoryEventHandler(publisher);

    const result = await handler.handle({
      productId: 'prod_001',
      sku: 'SKU-001',
      locationId: 'BLR-01',
      eventType: 'INVALID',
      quantityChange: 'bad',
      timestamp: 'not-a-date',
      source: 'demo'
    });

    expect(result.statusCode).toBe(400);
  });

  it('returns infrastructure failure responses when SQS publishing fails', async () => {
    publisher = {
      publishInventoryEvent: vi.fn().mockRejectedValue(new Error('queue unavailable'))
    };

    const handler = new InventoryEventHandler(publisher);

    const result = await handler.handle(validPayload);

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body)).toMatchObject({
      error: 'Inventory event could not be processed.'
    });
  });
});
