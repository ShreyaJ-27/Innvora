import { apiClient } from './client';
import { InventoryEvent } from '../types/events';
import { mockDb } from './mock-adapter';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === 'true';

export interface SearchQueryParams {
  q?: string;
  locationId?: string;
  eventType?: string;
  startDate?: string;
  endDate?: string;
}

export async function searchInventoryEvents(params?: SearchQueryParams): Promise<InventoryEvent[]> {
  if (USE_MOCK) {
    return mockDb.searchInventoryEvents(params);
  }

  const query = new URLSearchParams();
  if (params?.q) query.append('q', params.q);
  if (params?.locationId && params.locationId !== 'ALL') query.append('locationId', params.locationId);
  if (params?.eventType && params.eventType !== 'ALL') query.append('eventType', params.eventType);
  if (params?.startDate) query.append('startDate', params.startDate);
  if (params?.endDate) query.append('endDate', params.endDate);

  const queryString = query.toString();
  const endpoint = `/inventory/search${queryString ? `?${queryString}` : ''}`;
  return apiClient<InventoryEvent[]>(endpoint);
}
