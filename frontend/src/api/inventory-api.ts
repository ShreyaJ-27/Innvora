import { apiClient } from './client';
import {
  ProductInventory,
  InventoryHealthSummary,
  LocationInventorySummary,
  BackendInventoryState,
  BackendInventoryListResponse,
  BackendInventoryHealthSummary,
  InventoryStatus,
} from '../types/inventory';

// ─── Query Params ─────────────────────────────────────────────────────────────

export interface InventoryQueryParams {
  locationId?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// ─── Adapters ─────────────────────────────────────────────────────────────────

/**
 * Derive a frontend InventoryStatus from the lean backend InventoryState.
 * Mirrors the backend getHealthStatus() logic in inventory-service.ts.
 */
function deriveStatus(item: BackendInventoryState): InventoryStatus {
  if (item.availableQuantity <= item.reorderPoint) {
    return 'CRITICAL';
  }
  if (item.availableQuantity <= item.reorderPoint + item.safetyStock) {
    return 'REORDER_SOON';
  }
  if (item.availableQuantity > item.reorderPoint + item.safetyStock * 2) {
    return 'OVERSTOCKED';
  }
  return 'HEALTHY';
}

/**
 * Convert a lean BackendInventoryState → rich ProductInventory UI object.
 * Fields not available from the backend are filled with safe defaults so
 * existing table/drawer components don't crash on null/undefined.
 */
function adaptInventoryState(item: BackendInventoryState): ProductInventory {
  const status = deriveStatus(item);
  return {
    id: `${item.productId}-${item.locationId}`,
    productId: item.productId,
    sku: item.sku,
    name: item.sku,                  // backend doesn't return name — use SKU as fallback
    category: '—',                   // not available from backend
    locationId: item.locationId,
    locationName: item.locationId,   // not available from backend — use locationId
    currentStock: item.quantity,
    reservedStock: item.reservedQuantity,
    availableStock: item.availableQuantity,
    safetyStock: item.safetyStock,
    reorderPoint: item.reorderPoint,
    unitCost: 0,                     // not in backend InventoryState
    dailyDemand: 0,                  // not in backend InventoryState
    daysOfStock: 0,                  // not in backend InventoryState
    status,
    supplier: {
      id: '—',
      name: '—',
      leadTimeDays: 0,
      reliabilityRate: 0,
    },
    lastUpdated: item.lastUpdated,
  };
}

/**
 * Map the backend health summary to the frontend InventoryHealthSummary shape.
 * Backend uses `healthy/reorderSoon/critical/overstocked` (no Count suffix).
 * totalUnits, totalValue, and stockTrend are not provided by the backend health
 * endpoint and default to 0 / [].
 */
function adaptHealthSummary(raw: BackendInventoryHealthSummary): InventoryHealthSummary {
  return {
    totalSkus: raw.totalSkus,
    totalUnits: 0,
    totalValue: 0,
    healthyCount: raw.healthy,
    reorderSoonCount: raw.reorderSoon,
    criticalCount: raw.critical,
    overstockedCount: raw.overstocked,
    itemsNeedingReorder: raw.critical + raw.reorderSoon,
    stockTrend: [],
  };
}

// ─── Public API Functions ─────────────────────────────────────────────────────

export async function getInventory(params?: InventoryQueryParams): Promise<ProductInventory[]> {
  const query = new URLSearchParams();
  if (params?.locationId && params.locationId !== 'ALL') query.append('locationId', params.locationId);
  if (params?.status && params.status !== 'ALL') {
    // Backend expects lowercase status values (e.g. 'critical', 'reorderSoon')
    const statusMap: Record<string, string> = {
      HEALTHY: 'healthy',
      REORDER_SOON: 'reorderSoon',
      CRITICAL: 'critical',
      OVERSTOCKED: 'overstocked',
    };
    query.append('status', statusMap[params.status] ?? params.status.toLowerCase());
  }
  if (params?.page) query.append('page', String(params.page));
  if (params?.limit) query.append('limit', String(params.limit));

  const qs = query.toString();
  const endpoint = `/inventory${qs ? `?${qs}` : ''}`;

  const result = await apiClient<BackendInventoryListResponse>(endpoint);
  return (result.items ?? []).map(adaptInventoryState);
}

export async function getInventoryByProduct(productId: string): Promise<ProductInventory[]> {
  const result = await apiClient<BackendInventoryState[]>(`/inventory/${encodeURIComponent(productId)}`);
  return (Array.isArray(result) ? result : [result]).map(adaptInventoryState);
}

export async function getInventoryByLocation(locationId: string): Promise<ProductInventory[]> {
  const result = await apiClient<BackendInventoryState[]>(
    `/inventory/location/${encodeURIComponent(locationId)}`
  );
  return (Array.isArray(result) ? result : [result]).map(adaptInventoryState);
}

export async function getInventoryHealth(_locationId?: string): Promise<{
  summary: InventoryHealthSummary;
  locations: LocationInventorySummary[];
}> {
  // Backend health endpoint does not filter by location — locationId param is ignored for now.
  const raw = await apiClient<BackendInventoryHealthSummary>('/inventory/health');
  return {
    summary: adaptHealthSummary(raw),
    locations: [],   // backend health endpoint does not return per-location breakdowns
  };
}
