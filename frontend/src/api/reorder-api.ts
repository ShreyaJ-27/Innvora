import { apiClient } from './client';
import {
  ReorderRecommendation,
  ReorderSummary,
  BackendReorderRecommendation,
  BackendReorderSummary,
} from '../types/reorder';

// ─── Query Params ─────────────────────────────────────────────────────────────

export interface ReorderQueryParams {
  locationId?: string;
  urgency?: string;
  supplier?: string;   // note: backend does not support supplier filter — ignored
  search?: string;     // note: backend does not support text search — filtered client-side
  page?: number;
  limit?: number;
}

// ─── Adapter ──────────────────────────────────────────────────────────────────

/**
 * Convert a BackendReorderRecommendation to the richer UI ReorderRecommendation.
 * Fields not provided by the backend are filled with safe defaults.
 */
function adaptRecommendation(raw: BackendReorderRecommendation): ReorderRecommendation {
  const leadTimeDemand = raw.averageDailyDemand * raw.leadTimeDays;
  return {
    id: `${raw.productId}-${raw.locationId}`,
    productId: raw.productId,
    sku: raw.sku,
    productName: raw.sku,            // backend doesn't return product name — use SKU
    category: '—',                   // not available from backend
    locationId: raw.locationId,
    locationName: raw.locationId,    // backend doesn't return location name — use ID
    availableStock: raw.availableStock,
    dailyDemand: raw.averageDailyDemand,
    leadTimeDays: raw.leadTimeDays,
    reorderPoint: raw.reorderPoint,
    daysRemaining: raw.daysOfStockRemaining,
    recommendedQuantity: raw.recommendedQuantity,
    unitCost: 0,                     // not available from backend
    estimatedCost: 0,                // not available from backend
    urgency: raw.urgency,
    supplierName: '—',               // not available from backend
    supplierId: '—',                 // not available from backend
    explanation: {
      currentStock: raw.currentStock,
      dailyDemand: raw.averageDailyDemand,
      leadTimeDays: raw.leadTimeDays,
      leadTimeDemand,
      safetyStock: 0,                // not returned in backend recommendation
      reorderPoint: raw.reorderPoint,
      recommendedQuantity: raw.recommendedQuantity,
      stockCoverageDays: raw.daysOfStockRemaining,
      reason: raw.reason,
    },
  };
}

function adaptSummary(raw: BackendReorderSummary): ReorderSummary {
  return {
    criticalCount: raw.critical,
    reorderSoonCount: raw.reorderSoon,
    recommendedUnits: raw.recommendedUnits,
    estimatedTotalValue: raw.estimatedValue,
  };
}

// ─── Public API Functions ─────────────────────────────────────────────────────

export async function getReorders(params?: ReorderQueryParams): Promise<{
  items: ReorderRecommendation[];
  summary: ReorderSummary;
}> {
  const query = new URLSearchParams();
  if (params?.locationId && params.locationId !== 'ALL') query.append('locationId', params.locationId);
  if (params?.urgency && params.urgency !== 'ALL') query.append('urgency', params.urgency);
  if (params?.page) query.append('page', String(params.page));
  if (params?.limit) query.append('limit', String(params.limit));

  const qs = query.toString();
  const endpoint = `/reorders${qs ? `?${qs}` : ''}`;

  const result = await apiClient<{
    recommendations: BackendReorderRecommendation[];
    summary: BackendReorderSummary;
  }>(endpoint);

  let items = (result.recommendations ?? []).map(adaptRecommendation);

  // Client-side supplier / text search filtering (backend doesn't support these)
  if (params?.supplier && params.supplier !== 'ALL') {
    items = items.filter(
      (r) => r.supplierName === params.supplier || r.supplierId === params.supplier
    );
  }
  if (params?.search) {
    const q = params.search.toLowerCase();
    items = items.filter(
      (r) =>
        r.productName.toLowerCase().includes(q) ||
        r.sku.toLowerCase().includes(q) ||
        r.supplierName.toLowerCase().includes(q)
    );
  }

  // Sort by urgency: CRITICAL → REORDER_SOON → HEALTHY → OVERSTOCKED
  const urgencyOrder: Record<string, number> = {
    CRITICAL: 1,
    REORDER_SOON: 2,
    HEALTHY: 3,
    OVERSTOCKED: 4,
  };
  items.sort((a, b) => (urgencyOrder[a.urgency] ?? 99) - (urgencyOrder[b.urgency] ?? 99));

  return {
    items,
    summary: adaptSummary(result.summary ?? { critical: 0, reorderSoon: 0, healthy: 0, overstocked: 0, recommendedUnits: 0, estimatedValue: 0 }),
  };
}
