import { AppError } from '../errors/AppError.js';
import { InventoryState } from '../domain/models.js';
import { InventoryRepository } from '../repositories/inventory-repository.js';

export type InventoryHealthStatus = 'healthy' | 'reorderSoon' | 'critical' | 'overstocked';

export interface InventoryQueryOptions {
  locationId?: string;
  status?: InventoryHealthStatus | 'all';
  page?: number;
  limit?: number;
}

export interface InventoryHealthSummary {
  totalSkus: number;
  healthy: number;
  reorderSoon: number;
  critical: number;
  overstocked: number;
}

export class InventoryService {
  constructor(private readonly inventoryRepository: InventoryRepository) {}

  public async listInventory(options: InventoryQueryOptions = {}): Promise<{
    items: InventoryState[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = Math.max(1, options.page ?? 1);
    const limit = Math.max(1, options.limit ?? 25);

    const items = options.locationId
      ? await this.inventoryRepository.listInventoryByLocation(options.locationId)
      : await this.inventoryRepository.listAllInventory();

    const filtered = this.filterByStatus(items, options.status);
    const start = (page - 1) * limit;
    const pagedItems = filtered.slice(start, start + limit);

    return {
      items: pagedItems,
      total: filtered.length,
      page,
      limit
    };
  }

  public async getInventory(productId: string, locationId?: string): Promise<InventoryState[]> {
    if (!productId.trim()) {
      throw new AppError('Product ID is required', {
        statusCode: 400,
        code: 'INVALID_PRODUCT_ID'
      });
    }

    if (locationId) {
      const item = await this.inventoryRepository.getInventory(productId, locationId);
      return item ? [item] : [];
    }

    const items = await this.inventoryRepository.listAllInventory();
    return items.filter((item) => item.productId === productId);
  }

  public async getInventoryByLocation(locationId: string): Promise<InventoryState[]> {
    if (!locationId.trim()) {
      throw new AppError('Location ID is required', {
        statusCode: 400,
        code: 'INVALID_LOCATION_ID'
      });
    }

    return this.inventoryRepository.listInventoryByLocation(locationId);
  }

  public async getInventoryHealthSummary(): Promise<InventoryHealthSummary> {
    const items = await this.inventoryRepository.listAllInventory();
    const summary: InventoryHealthSummary = {
      totalSkus: new Set(items.map((item) => item.productId)).size,
      healthy: 0,
      reorderSoon: 0,
      critical: 0,
      overstocked: 0
    };

    for (const item of items) {
      const status = this.getHealthStatus(item);
      if (status === 'healthy') summary.healthy += 1;
      if (status === 'reorderSoon') summary.reorderSoon += 1;
      if (status === 'critical') summary.critical += 1;
      if (status === 'overstocked') summary.overstocked += 1;
    }

    return summary;
  }

  private filterByStatus(items: InventoryState[], status?: InventoryHealthStatus | 'all'): InventoryState[] {
    if (!status || status === 'all') {
      return items;
    }

    return items.filter((item) => this.getHealthStatus(item) === status);
  }

  private getHealthStatus(item: InventoryState): InventoryHealthStatus {
    if (item.availableQuantity <= item.reorderPoint) {
      return 'critical';
    }

    if (item.availableQuantity <= item.reorderPoint + item.safetyStock) {
      return 'reorderSoon';
    }

    if (item.availableQuantity > item.reorderPoint + item.safetyStock * 2) {
      return 'overstocked';
    }

    return 'healthy';
  }
}
