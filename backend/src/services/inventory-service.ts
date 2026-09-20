import { AppError, ConflictError } from '../errors/AppError.js';
import {
  InventoryLocation,
  InventoryState,
  Product,
  Supplier,
  CreateProductInput,
  NotificationAlert
} from '../domain/models.js';
import {
  InventoryRepository,
  DEFAULT_LOCATIONS,
  DEFAULT_SUPPLIERS,
  DEFAULT_PRODUCTS
} from '../repositories/inventory-repository.js';
import { createProductSchema } from '../validation/domain-schemas.js';

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

  /**
   * Scalable Health Summary:
   * 1. Attempts to read the precomputed aggregate item in O(1).
   * 2. Falls back to calculating and caching if not yet initialized.
   */
  public async getInventoryHealthSummary(locationId?: string): Promise<InventoryHealthSummary> {
    if (typeof this.inventoryRepository.getHealthAggregate === 'function') {
      const aggregate = await this.inventoryRepository.getHealthAggregate(locationId);
      if (aggregate) {
        return {
          totalSkus: aggregate.totalSkus,
          healthy: aggregate.healthy,
          reorderSoon: aggregate.reorderSoon,
          critical: aggregate.critical,
          overstocked: aggregate.overstocked
        };
      }
    }

    // Fallback on first run: compute from inventory query and cache
    const items = locationId
      ? await this.inventoryRepository.listInventoryByLocation(locationId)
      : await this.inventoryRepository.listAllInventory();

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

    // Cache the computed aggregate if repository supports it
    if (typeof this.inventoryRepository.putHealthAggregate === 'function') {
      await this.inventoryRepository.putHealthAggregate({
        locationId: locationId ?? 'GLOBAL',
        ...summary,
        lastUpdated: new Date().toISOString()
      });
    }

    return summary;
  }

  // --- Catalog & Onboarding Methods ---

  public async listLocations(): Promise<InventoryLocation[]> {
    if (typeof this.inventoryRepository.listLocations === 'function') {
      return this.inventoryRepository.listLocations();
    }
    return DEFAULT_LOCATIONS;
  }

  public async listSuppliers(): Promise<Supplier[]> {
    if (typeof this.inventoryRepository.listSuppliers === 'function') {
      return this.inventoryRepository.listSuppliers();
    }
    return DEFAULT_SUPPLIERS;
  }

  public async listProducts(): Promise<Product[]> {
    if (typeof this.inventoryRepository.listProducts === 'function') {
      return this.inventoryRepository.listProducts();
    }
    return DEFAULT_PRODUCTS;
  }

  public async getProductById(productId: string): Promise<Product | null> {
    if (typeof this.inventoryRepository.getProductById === 'function') {
      return this.inventoryRepository.getProductById(productId);
    }
    return DEFAULT_PRODUCTS.find((p) => p.productId === productId) ?? null;
  }

  public async createProduct(input: CreateProductInput): Promise<{
    product: Product;
    initialInventoryCreated: boolean;
    initialStockEvent?: {
      eventType: 'RESTOCK';
      quantity: number;
      locationId: string;
    };
  }> {
    const parsed = createProductSchema.parse(input);

    // Verify SKU uniqueness
    const existing = typeof this.inventoryRepository.getProductBySku === 'function'
      ? await this.inventoryRepository.getProductBySku(parsed.sku)
      : null;
    if (existing) {
      throw new ConflictError(`Product with SKU '${parsed.sku}' already exists in catalog`);
    }

    // Resolve supplier name if missing
    let supplierName = parsed.supplierName;
    if (!supplierName) {
      const suppliers = await this.listSuppliers();
      const sup = suppliers.find((s) => s.supplierId === parsed.supplierId);
      supplierName = sup?.name ?? 'Assigned Logistics Supplier';
    }

    const productId = parsed.productId || `PROD-${Date.now().toString(36).toUpperCase()}`;

    const newProduct: Product = {
      productId,
      sku: parsed.sku.trim().toUpperCase(),
      name: parsed.name.trim(),
      category: parsed.category.trim(),
      supplierId: parsed.supplierId.trim(),
      supplierName,
      unitCost: parsed.unitCost,
      sellingPrice: parsed.sellingPrice,
      reorderPoint: parsed.reorderPoint,
      safetyStock: parsed.safetyStock,
      minimumOrderQuantity: parsed.minimumOrderQuantity,
      packSize: parsed.packSize
    };

    const savedProduct = typeof this.inventoryRepository.createProduct === 'function'
      ? await this.inventoryRepository.createProduct(newProduct)
      : newProduct;

    let initialInventoryCreated = false;
    let initialStockEvent: { eventType: 'RESTOCK'; quantity: number; locationId: string } | undefined;

    // If initial stock is specified for a location, create baseline inventory
    if (parsed.initialStock && parsed.initialStock > 0 && parsed.locationId) {
      const initialStock = parsed.initialStock;
      const locationId = parsed.locationId;

      const baselineItem: InventoryState = {
        productId: savedProduct.productId,
        sku: savedProduct.sku,
        locationId,
        quantity: initialStock,
        reservedQuantity: 0,
        availableQuantity: initialStock,
        reorderPoint: savedProduct.reorderPoint,
        safetyStock: savedProduct.safetyStock,
        lastUpdated: new Date().toISOString()
      };

      await this.inventoryRepository.putInventory(baselineItem);
      initialInventoryCreated = true;

      initialStockEvent = {
        eventType: 'RESTOCK',
        quantity: initialStock,
        locationId
      };
    }

    return {
      product: savedProduct,
      initialInventoryCreated,
      initialStockEvent
    };
  }

  // --- Real-time Notifications & Alerts ---

  public async getNotifications(limit = 10): Promise<NotificationAlert[]> {
    const precomputed = typeof this.inventoryRepository.listPrecomputedReorders === 'function'
      ? await this.inventoryRepository.listPrecomputedReorders()
      : [];
    const urgent = precomputed.filter((r) => r.urgency === 'CRITICAL' || r.urgency === 'REORDER_SOON');

    const alerts: NotificationAlert[] = urgent.slice(0, limit).map((item, idx) => ({
      id: `alert-${item.locationId}-${item.productId}-${idx}`,
      sku: item.sku,
      productName: item.productId,
      locationId: item.locationId,
      urgency: item.urgency,
      message:
        item.urgency === 'CRITICAL'
          ? `Critical inventory breach: ${item.availableStock} units available (Safety buffer: ${item.safetyStock})`
          : `Approaching reorder point: ${item.daysOfStockRemaining.toFixed(1)} days of coverage remaining`,
      timestamp: new Date().toISOString()
    }));

    // If no precomputed alerts yet, check low stock inventory
    if (alerts.length === 0) {
      const items = await this.inventoryRepository.listAllInventory();
      for (const item of items) {
        if (item.availableQuantity <= item.safetyStock) {
          alerts.push({
            id: `alert-${item.locationId}-${item.productId}`,
            sku: item.sku,
            productName: item.sku,
            locationId: item.locationId,
            urgency: 'CRITICAL',
            message: `Critical stock level: ${item.availableQuantity} units remaining at ${item.locationId}`,
            timestamp: item.lastUpdated
          });
        } else if (item.availableQuantity <= item.reorderPoint) {
          alerts.push({
            id: `alert-${item.locationId}-${item.productId}`,
            sku: item.sku,
            productName: item.sku,
            locationId: item.locationId,
            urgency: 'REORDER_SOON',
            message: `Reorder recommended: ${item.availableQuantity} units remaining (ROP: ${item.reorderPoint})`,
            timestamp: item.lastUpdated
          });
        }
        if (alerts.length >= limit) break;
      }
    }

    return alerts;
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
