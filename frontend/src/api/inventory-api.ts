import { apiClient } from './client';
import { ProductInventory, InventoryHealthSummary, LocationInventorySummary } from '../types/inventory';
import { mockDb } from './mock-adapter';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === 'true';

export interface InventoryQueryParams {
  locationId?: string;
  status?: string;
  search?: string;
}

export async function getInventory(params?: InventoryQueryParams): Promise<ProductInventory[]> {
  if (USE_MOCK) {
    return mockDb.getInventory(params);
  }

  const query = new URLSearchParams();
  if (params?.locationId && params.locationId !== 'ALL') query.append('locationId', params.locationId);
  if (params?.status && params.status !== 'ALL') query.append('status', params.status);
  if (params?.search) query.append('search', params.search);

  const queryString = query.toString();
  const endpoint = `/inventory${queryString ? `?${queryString}` : ''}`;
  return apiClient<ProductInventory[]>(endpoint);
}

export async function getInventoryByProduct(productId: string): Promise<ProductInventory | null> {
  if (USE_MOCK) {
    return mockDb.getInventoryByProduct(productId);
  }
  return apiClient<ProductInventory>(`/inventory/${productId}`);
}

export async function getInventoryByLocation(locationId: string): Promise<ProductInventory[]> {
  if (USE_MOCK) {
    return mockDb.getInventoryByLocation(locationId);
  }
  return apiClient<ProductInventory[]>(`/inventory/location/${locationId}`);
}

export async function getInventoryHealth(locationId?: string): Promise<{
  summary: InventoryHealthSummary;
  locations: LocationInventorySummary[];
}> {
  if (USE_MOCK) {
    return mockDb.getInventoryHealth(locationId);
  }
  const endpoint = locationId && locationId !== 'ALL'
    ? `/inventory/health?locationId=${locationId}`
    : '/inventory/health';
  return apiClient<{ summary: InventoryHealthSummary; locations: LocationInventorySummary[] }>(endpoint);
}
