import { apiClient } from './client';
import { InventoryEvent, BackendInventoryEvent } from '../types/events';

// ─── Query Params ─────────────────────────────────────────────────────────────

export interface SearchQueryParams {
  q?: string;
  sku?: string;
  productId?: string;
  locationId?: string;
  eventType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// ─── Adapter ──────────────────────────────────────────────────────────────────

/**
 * Convert a BackendInventoryEvent (eventId, quantityChange, previousQuantity, newQuantity)
 * to the frontend InventoryEvent shape (id, quantityChange, previousStock, newStock).
 */
function adaptEvent(raw: BackendInventoryEvent): InventoryEvent {
  return {
    id: raw.eventId,
    sku: raw.sku,
    productId: raw.productId,
    productName: raw.sku,          // backend doesn't store product name in events
    locationId: raw.locationId,
    locationName: raw.locationId,  // backend doesn't store location name in events
    eventType: raw.eventType,
    quantityChange: raw.quantityChange,
    previousStock: raw.previousQuantity,
    newStock: raw.newQuantity,
    timestamp: raw.timestamp,
    source: raw.source,
  };
}

/** Returns true when at least one meaningful search parameter is provided. */
function hasSearchParams(params: SearchQueryParams): boolean {
  return Boolean(
    params.q ||
    params.sku ||
    params.productId ||
    (params.locationId && params.locationId !== 'ALL') ||
    (params.eventType && params.eventType !== 'ALL') ||
    params.startDate ||
    params.endDate
  );
}

// ─── Public API Function ──────────────────────────────────────────────────────

/**
 * Search inventory events via GET /inventory/search.
 * IMPORTANT: The backend requires at least one filter — returns HTTP 400 otherwise.
 * This function returns an empty array without calling the API when no params are set.
 */
export async function searchInventoryEvents(params?: SearchQueryParams): Promise<InventoryEvent[]> {
  if (!params || !hasSearchParams(params)) {
    // Guard: don't fire an empty search request — backend returns 400
    return [];
  }

  const query = new URLSearchParams();
  if (params.q) query.append('q', params.q);
  if (params.sku) query.append('sku', params.sku);
  if (params.productId) query.append('productId', params.productId);
  if (params.locationId && params.locationId !== 'ALL') query.append('locationId', params.locationId);
  if (params.eventType && params.eventType !== 'ALL') query.append('eventType', params.eventType);
  if (params.startDate) query.append('startDate', params.startDate);
  if (params.endDate) query.append('endDate', params.endDate);
  if (params.page) query.append('page', String(params.page));
  if (params.limit) query.append('limit', String(params.limit));

  const result = await apiClient<{
    results: BackendInventoryEvent[];
    pagination: { page: number; limit: number; total: number };
  }>(`/inventory/search?${query.toString()}`);

  const items = (result.results ?? []).map(adaptEvent);

  // Sort newest first
  items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return items;
}
