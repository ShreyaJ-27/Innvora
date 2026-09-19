// ─── Event Type Enum ──────────────────────────────────────────────────────────

export type InventoryEventType =
  | 'SALE'
  | 'RESTOCK'
  | 'RETURN'
  | 'TRANSFER_IN'
  | 'TRANSFER_OUT'
  | 'ADJUSTMENT';

// ─── Backend Response Shape ───────────────────────────────────────────────────

/**
 * An inventory event as stored and returned by the backend
 * (OpenSearch / DynamoDB via GET /inventory/search).
 * Uses backend field names: eventId, quantityChange, previousQuantity, newQuantity.
 */
export interface BackendInventoryEvent {
  eventId: string;
  productId: string;
  sku: string;
  locationId: string;
  eventType: InventoryEventType;
  quantityChange: number;
  previousQuantity: number;
  newQuantity: number;
  timestamp: string;
  source: string;
}

// ─── Frontend / UI Types ──────────────────────────────────────────────────────

/**
 * Inventory event as used throughout the UI components.
 * Adapted from BackendInventoryEvent by the adapter in search-api.ts.
 */
export interface InventoryEvent {
  id: string;
  sku: string;
  productId?: string;
  productName: string;
  locationId: string;
  locationName: string;
  eventType: InventoryEventType;
  quantityChange: number;
  previousStock: number;
  newStock: number;
  timestamp: string;
  source: string;
  referenceId?: string;
}

/**
 * Payload for POST /inventory/events.
 * Matches the backend inventoryEventApiSchema exactly.
 *
 * IMPORTANT DIFFERENCES vs old mock adapter:
 *   - `productId` is required (backend validates it)
 *   - `quantityChange` is the field name (not `quantity`)
 *   - `timestamp` is required (ISO 8601 datetime string)
 *   - `eventId` is optional (backend generates a UUID if omitted)
 */
export interface EventSubmitRequest {
  eventId?: string;
  productId: string;
  sku: string;
  locationId: string;
  eventType: InventoryEventType;
  quantityChange: number;
  timestamp: string;
  source: string;
}

/**
 * @deprecated Use EventSubmitRequest instead.
 * Kept for reference only — DO NOT use with the live backend.
 */
export interface EventSimulationRequest {
  sku: string;
  locationId: string;
  quantity: number;
  eventType: InventoryEventType;
  source?: string;
}
