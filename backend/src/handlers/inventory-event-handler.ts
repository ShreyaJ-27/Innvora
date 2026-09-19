import { randomUUID } from 'node:crypto';
import { z } from 'zod';

import { AppError } from '../errors/AppError.js';
import { createApiResponse, createErrorResponse } from '../utils/http.js';
import { logger } from '../utils/logger.js';
import { inventoryEventTypeSchema } from '../validation/domain-schemas.js';
import { InventoryEventPublisher } from '../services/sqs-event-publisher.js';

const inventoryEventApiSchema = z.object({
  eventId: z.string().trim().min(1).optional(),
  productId: z.string().trim().min(1),
  sku: z.string().trim().min(1),
  locationId: z.string().trim().min(1),
  eventType: inventoryEventTypeSchema,
  quantityChange: z.number().finite(),
  timestamp: z.string().datetime('Invalid timestamp format'),
  source: z.string().trim().min(1)
});

export type InventoryEventApiRequest = z.infer<typeof inventoryEventApiSchema>;

export class InventoryEventHandler {
  constructor(private readonly publisher: InventoryEventPublisher) {}

  public async handle(event: unknown): Promise<{ statusCode: number; body: string }> {
    const parsedResult = inventoryEventApiSchema.safeParse(event);

    if (!parsedResult.success) {
      return createErrorResponse(400, 'Invalid inventory event payload', {
        issues: parsedResult.error.issues
      });
    }

    const parsed = parsedResult.data;
    const eventId = parsed.eventId ?? randomUUID();
    const payload = {
      eventId,
      productId: parsed.productId,
      sku: parsed.sku,
      locationId: parsed.locationId,
      eventType: parsed.eventType,
      quantityChange: parsed.quantityChange,
      previousQuantity: 0,
      newQuantity: 0,
      timestamp: parsed.timestamp,
      source: parsed.source
    };

    try {
      await this.publisher.publishInventoryEvent(payload);
    } catch (error) {
      if (error instanceof AppError) {
        return createErrorResponse(error.statusCode, error.message, error.details);
      }

      logger.error('Unexpected ingestion failure', { error });
      return createErrorResponse(500, 'Inventory event could not be processed.');
    }

    return createApiResponse({
      statusCode: 202,
      body: {
        success: true,
        eventId,
        message: 'Inventory event accepted for processing.'
      }
    });
  }
}
