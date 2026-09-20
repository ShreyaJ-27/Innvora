import { ReorderRecommendation, ReorderUrgency } from '../domain/models.js';
import { generateReorderRecommendation } from '../domain/reorder/reorder-engine.js';

export interface ReorderInventorySnapshot {
  productId: string;
  sku: string;
  locationId: string;
  currentStock: number;
  reservedStock: number;
  safetyStock: number;
  minimumOrderQuantity: number;
  packSize: number;
  unitCost?: number;
}

export interface ReorderDemandSnapshot {
  averageDailyDemand: number;
  forecastBuffer: number;
}

export interface ReorderSupplierSnapshot {
  supplierId?: string;
  name?: string;
  leadTimeDays?: number | null;
  unitCost?: number;
}

export interface ReorderRecommendationListOptions {
  locationId?: string;
  urgency?: ReorderUrgency | 'all';
  page?: number;
  limit?: number;
}

export interface ReorderRecommendationSummary {
  critical: number;
  reorderSoon: number;
  healthy: number;
  overstocked: number;
  recommendedUnits: number;
  estimatedValue: number;
}

export interface ReorderServiceDependencies {
  listInventory(locationId?: string): Promise<ReorderInventorySnapshot[]>;
  getInventory(productId: string, locationId: string): Promise<ReorderInventorySnapshot | null>;
  getDemandInformation(productId: string, locationId: string): Promise<ReorderDemandSnapshot | null>;
  getSupplierInformation(productId: string, locationId: string): Promise<ReorderSupplierSnapshot | null>;
  listPrecomputedRecommendations?: (locationId?: string, urgency?: string) => Promise<ReorderRecommendation[]>;
}

const urgencyOrder: Record<ReorderUrgency, number> = {
  CRITICAL: 0,
  REORDER_SOON: 1,
  HEALTHY: 2,
  OVERSTOCKED: 3
};

export class ReorderService {
  constructor(private readonly dependencies: ReorderServiceDependencies) {}

  public async listInventory(locationId?: string): Promise<ReorderInventorySnapshot[]> {
    return this.dependencies.listInventory(locationId);
  }

  public async getInventory(productId: string, locationId: string): Promise<ReorderInventorySnapshot | null> {
    return this.dependencies.getInventory(productId, locationId);
  }

  public async getDemandInformation(productId: string, locationId: string): Promise<ReorderDemandSnapshot | null> {
    return this.dependencies.getDemandInformation(productId, locationId);
  }

  public async getSupplierInformation(productId: string, locationId: string): Promise<ReorderSupplierSnapshot | null> {
    return this.dependencies.getSupplierInformation(productId, locationId);
  }

  public async createRecommendation(productId: string, locationId: string): Promise<ReorderRecommendation> {
    const inventory = await this.getInventory(productId, locationId);
    const demand = await this.getDemandInformation(productId, locationId);
    const supplier = await this.getSupplierInformation(productId, locationId);

    if (!inventory) {
      throw new Error(`Inventory not found for product ${productId} at ${locationId}`);
    }

    if (!demand) {
      throw new Error(`Demand information not found for product ${productId} at ${locationId}`);
    }

    if (!supplier) {
      throw new Error(`Supplier information not found for product ${productId} at ${locationId}`);
    }

    return generateReorderRecommendation({
      productId: inventory.productId,
      sku: inventory.sku,
      locationId: inventory.locationId,
      currentStock: inventory.currentStock,
      reservedStock: inventory.reservedStock,
      averageDailyDemand: demand.averageDailyDemand,
      supplierLeadTimeDays: supplier.leadTimeDays ?? null,
      safetyStock: inventory.safetyStock,
      minimumOrderQuantity: inventory.minimumOrderQuantity,
      packSize: inventory.packSize,
      forecastBuffer: demand.forecastBuffer
    });
  }

  /**
   * Scalable Reorder Recommendations:
   * 1. Reads from precomputed read-model when available (no table scan, no on-the-fly math).
   * 2. Falls back to on-demand calculation if precomputed items not yet seeded.
   */
  public async listRecommendations(options: ReorderRecommendationListOptions = {}): Promise<{
    recommendations: ReorderRecommendation[];
    summary: ReorderRecommendationSummary;
  }> {
    const page = Math.max(1, options.page ?? 1);
    const limit = Math.min(100, Math.max(1, options.limit ?? 25));
    const locationId = options.locationId?.trim() || undefined;
    const urgency = options.urgency && options.urgency !== 'all' ? options.urgency.toUpperCase() as ReorderUrgency : undefined;

    // Fast-path: read precomputed read model
    if (this.dependencies.listPrecomputedRecommendations) {
      const precomputed = await this.dependencies.listPrecomputedRecommendations(locationId, urgency);
      if (precomputed && precomputed.length > 0) {
        const sorted = precomputed.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);
        const summary = sorted.reduce(
          (acc, rec) => {
            acc[rec.urgency === 'CRITICAL' ? 'critical' : rec.urgency === 'REORDER_SOON' ? 'reorderSoon' : rec.urgency === 'HEALTHY' ? 'healthy' : 'overstocked'] += 1;
            acc.recommendedUnits += rec.recommendedQuantity;
            return acc;
          },
          {
            critical: 0,
            reorderSoon: 0,
            healthy: 0,
            overstocked: 0,
            recommendedUnits: 0,
            estimatedValue: 0
          } as ReorderRecommendationSummary
        );

        const startIndex = (page - 1) * limit;
        return {
          recommendations: sorted.slice(startIndex, startIndex + limit),
          summary
        };
      }
    }

    // Fallback: calculate on-demand
    const inventoryItems = await this.dependencies.listInventory(locationId);
    const recommendations = await Promise.all(
      inventoryItems.map(async (inventory) => {
        const demand = await this.dependencies.getDemandInformation(inventory.productId, inventory.locationId);
        const supplier = await this.dependencies.getSupplierInformation(inventory.productId, inventory.locationId);

        if (!demand || !supplier) {
          return null;
        }

        return generateReorderRecommendation({
          productId: inventory.productId,
          sku: inventory.sku,
          locationId: inventory.locationId,
          currentStock: inventory.currentStock,
          reservedStock: inventory.reservedStock,
          averageDailyDemand: demand.averageDailyDemand,
          supplierLeadTimeDays: supplier.leadTimeDays ?? null,
          safetyStock: inventory.safetyStock,
          minimumOrderQuantity: inventory.minimumOrderQuantity,
          packSize: inventory.packSize,
          forecastBuffer: demand.forecastBuffer
        });
      })
    );

    const filtered = recommendations
      .filter((item): item is ReorderRecommendation => item !== null)
      .filter((item) => !urgency || item.urgency === urgency)
      .sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);

    const summary = filtered.reduce(
      (acc, recommendation) => {
        acc[recommendation.urgency === 'CRITICAL' ? 'critical' : recommendation.urgency === 'REORDER_SOON' ? 'reorderSoon' : recommendation.urgency === 'HEALTHY' ? 'healthy' : 'overstocked'] += 1;
        acc.recommendedUnits += recommendation.recommendedQuantity;
        const unitCost = recommendation.currentStock > 0 ? 0 : 0;
        acc.estimatedValue += recommendation.recommendedQuantity * unitCost;
        return acc;
      },
      {
        critical: 0,
        reorderSoon: 0,
        healthy: 0,
        overstocked: 0,
        recommendedUnits: 0,
        estimatedValue: 0
      } as ReorderRecommendationSummary
    );

    const startIndex = (page - 1) * limit;
    const paginatedRecommendations = filtered.slice(startIndex, startIndex + limit);

    return {
      recommendations: paginatedRecommendations,
      summary
    };
  }
}
