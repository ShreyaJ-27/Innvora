import { apiClient } from './client';
import { EventSubmitRequest } from '../types/events';

export interface EventPostResponse {
  accepted?: boolean;
  eventId: string;
  message: string;
}

/**
 * POST /inventory/events
 *
 * Submits an inventory event to the API Gateway → SQS → Lambda pipeline.
 * The backend validates the payload with Zod and queues it asynchronously.
 *
 * Required fields (per backend inventoryEventApiSchema):
 *   productId, sku, locationId, eventType, quantityChange, timestamp, source
 * Optional:
 *   eventId (backend generates a UUID if omitted)
 *
 * Processing is async — DynamoDB/OpenSearch changes are NOT immediate.
 */
export async function postInventoryEvent(event: EventSubmitRequest): Promise<EventPostResponse> {
  const response = await apiClient<EventPostResponse>('/inventory/events', {
    method: 'POST',
    body: JSON.stringify(event),
  });

  return {
    accepted: true,
    eventId: response.eventId,
    message: response.message || 'Inventory event accepted for async processing.',
  };
}
