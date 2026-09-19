import { apiClient } from './client';
import { ReorderRecommendation } from '../types/reorder';
import { mockDb } from './mock-adapter';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === 'true';

export interface ReorderQueryParams {
  locationId?: string;
  urgency?: string;
  supplier?: string;
  search?: string;
}

export async function getReorders(params?: ReorderQueryParams): Promise<ReorderRecommendation[]> {
  if (USE_MOCK) {
    return mockDb.getReorders(params);
  }

  const query = new URLSearchParams();
  if (params?.locationId && params.locationId !== 'ALL') query.append('locationId', params.locationId);
  if (params?.urgency && params.urgency !== 'ALL') query.append('urgency', params.urgency);
  if (params?.supplier && params.supplier !== 'ALL') query.append('supplier', params.supplier);
  if (params?.search) query.append('search', params.search);

  const queryString = query.toString();
  const endpoint = `/reorders${queryString ? `?${queryString}` : ''}`;
  return apiClient<ReorderRecommendation[]>(endpoint);
}
