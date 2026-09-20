import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand
} from '@aws-sdk/lib-dynamodb';

import { getEnv } from '../config/env.js';
import { AppError, ConflictError, NotFoundError } from '../errors/AppError.js';
import {
  InventoryLocation,
  InventoryState,
  Product,
  Supplier,
  HealthAggregate,
  ReorderRecommendation
} from '../domain/models.js';
import { inventoryStateSchema, productSchema } from '../validation/domain-schemas.js';

export interface InventoryRepository {
  getInventory(productId: string, locationId: string): Promise<InventoryState | null>;
  putInventory(inventory: InventoryState): Promise<InventoryState>;
  updateInventoryQuantity(
    productId: string,
    locationId: string,
    quantity: number,
    updates?: {
      reservedQuantity?: number;
      lastUpdated?: string;
    }
  ): Promise<InventoryState>;
  listAllInventory(): Promise<InventoryState[]>;
  listInventoryByLocation(locationId: string): Promise<InventoryState[]>;
  listLowStockInventory(locationId: string, threshold?: number): Promise<InventoryState[]>;

  // Catalog methods
  listLocations?(): Promise<InventoryLocation[]>;
  listSuppliers?(): Promise<Supplier[]>;
  listProducts?(): Promise<Product[]>;
  getProductById?(productId: string): Promise<Product | null>;
  getProductBySku?(sku: string): Promise<Product | null>;
  createProduct?(product: Product): Promise<Product>;
  updateProduct?(productId: string, updates: Partial<Product>): Promise<Product>;

  // Aggregates & Precomputed Read Models
  getHealthAggregate?(locationId?: string): Promise<HealthAggregate | null>;
  putHealthAggregate?(aggregate: HealthAggregate): Promise<HealthAggregate>;
  listPrecomputedReorders?(locationId?: string, urgency?: string): Promise<ReorderRecommendation[]>;
  putPrecomputedReorder?(reorder: ReorderRecommendation): Promise<ReorderRecommendation>;
}

const buildLocationKey = (locationId: string): string => `LOCATION#${locationId}`;
const buildProductKey = (productId: string): string => `PRODUCT#${productId}`;

export const DEFAULT_LOCATIONS: InventoryLocation[] = [
  {
    locationId: 'LOC-BOM-01',
    locationName: 'Mumbai Central Fulfillment Hub',
    region: 'West',
    address: 'G Block, Bandra Kurla Complex, Mumbai, Maharashtra 400051'
  },
  {
    locationId: 'LOC-DEL-02',
    locationName: 'Delhi NCR Logistics Depot',
    region: 'North',
    address: 'Sector 18, Udyog Vihar Phase IV, Gurugram, Haryana 122016'
  },
  {
    locationId: 'LOC-BLR-01',
    locationName: 'Bengaluru Tech Park Warehouse',
    region: 'South',
    address: 'Plot 14, EPIP Zone, Whitefield, Bengaluru, Karnataka 560066'
  },
  {
    locationId: 'LOC-HYD-01',
    locationName: 'Hyderabad Regional Depot',
    region: 'South',
    address: 'Plot 88, Hardware Park, Shamshabad, Hyderabad, Telangana 500081'
  }
];

export const DEFAULT_SUPPLIERS: Supplier[] = [
  {
    supplierId: 'SUP-IND-01',
    name: 'Bharat Electronics Components Ltd',
    leadTimeDays: 5,
    reliabilityScore: 96
  },
  {
    supplierId: 'SUP-IND-02',
    name: 'Zenith Power & Audio Solutions Mumbai',
    leadTimeDays: 7,
    reliabilityScore: 92
  },
  {
    supplierId: 'SUP-IND-03',
    name: 'Delta Cables & Ergonomics Pune',
    leadTimeDays: 4,
    reliabilityScore: 98
  },
  {
    supplierId: 'SUP-IND-04',
    name: 'Apex Peripherals & Smart Devices Noida',
    leadTimeDays: 10,
    reliabilityScore: 88
  }
];

export const DEFAULT_PRODUCTS: Product[] = [
  {
    productId: 'PROD-EAR-01',
    sku: 'SKU-EAR-001',
    name: 'Wireless Earbuds with Active Noise Cancellation',
    category: 'Audio & Hearables',
    supplierId: 'SUP-IND-01',
    supplierName: 'Bharat Electronics Components Ltd',
    unitCost: 1499,
    sellingPrice: 3499,
    reorderPoint: 35,
    safetyStock: 15,
    minimumOrderQuantity: 50,
    packSize: 10
  },
  {
    productId: 'PROD-CHG-02',
    sku: 'SKU-CHG-002',
    name: '65W GaN USB-C Multiport Fast Charger',
    category: 'Power & Accessories',
    supplierId: 'SUP-IND-02',
    supplierName: 'Zenith Power & Audio Solutions Mumbai',
    unitCost: 699,
    sellingPrice: 1799,
    reorderPoint: 40,
    safetyStock: 20,
    minimumOrderQuantity: 100,
    packSize: 20
  },
  {
    productId: 'PROD-PWR-03',
    sku: 'SKU-PWR-003',
    name: '20000mAh 22.5W Fast Charging Power Bank',
    category: 'Power & Accessories',
    supplierId: 'SUP-IND-02',
    supplierName: 'Zenith Power & Audio Solutions Mumbai',
    unitCost: 1099,
    sellingPrice: 2499,
    reorderPoint: 30,
    safetyStock: 15,
    minimumOrderQuantity: 40,
    packSize: 10
  },
  {
    productId: 'PROD-SPK-04',
    sku: 'SKU-SPK-004',
    name: 'IPX7 Rugged Waterproof Bluetooth Speaker',
    category: 'Audio & Hearables',
    supplierId: 'SUP-IND-02',
    supplierName: 'Zenith Power & Audio Solutions Mumbai',
    unitCost: 1199,
    sellingPrice: 2999,
    reorderPoint: 25,
    safetyStock: 10,
    minimumOrderQuantity: 30,
    packSize: 5
  },
  {
    productId: 'PROD-STN-05',
    sku: 'SKU-STN-005',
    name: 'Ergonomic Aluminium Laptop Cooling Stand',
    category: 'Workspace & Ergonomics',
    supplierId: 'SUP-IND-03',
    supplierName: 'Delta Cables & Ergonomics Pune',
    unitCost: 899,
    sellingPrice: 2199,
    reorderPoint: 20,
    safetyStock: 8,
    minimumOrderQuantity: 25,
    packSize: 5
  },
  {
    productId: 'PROD-KBD-06',
    sku: 'SKU-KBD-006',
    name: 'Compact Tenkeyless Mechanical Keyboard',
    category: 'Computing & Peripherals',
    supplierId: 'SUP-IND-03',
    supplierName: 'Delta Cables & Ergonomics Pune',
    unitCost: 1899,
    sellingPrice: 4299,
    reorderPoint: 25,
    safetyStock: 10,
    minimumOrderQuantity: 20,
    packSize: 4
  },
  {
    productId: 'PROD-MOU-07',
    sku: 'SKU-MOU-007',
    name: 'Wireless Ergonomic Vertical Mouse 4000DPI',
    category: 'Computing & Peripherals',
    supplierId: 'SUP-IND-03',
    supplierName: 'Delta Cables & Ergonomics Pune',
    unitCost: 799,
    sellingPrice: 1899,
    reorderPoint: 30,
    safetyStock: 12,
    minimumOrderQuantity: 30,
    packSize: 6
  },
  {
    productId: 'PROD-WTC-08',
    sku: 'SKU-WTC-008',
    name: 'Smart Health & Fitness Tracker AMOLED',
    category: 'Wearables',
    supplierId: 'SUP-IND-04',
    supplierName: 'Apex Peripherals & Smart Devices Noida',
    unitCost: 1699,
    sellingPrice: 3999,
    reorderPoint: 20,
    safetyStock: 8,
    minimumOrderQuantity: 25,
    packSize: 5
  },
  {
    productId: 'PROD-CAM-09',
    sku: 'SKU-CAM-009',
    name: '1080p FHD Wide-Angle Conference Webcam',
    category: 'Computing & Peripherals',
    supplierId: 'SUP-IND-01',
    supplierName: 'Bharat Electronics Components Ltd',
    unitCost: 1299,
    sellingPrice: 2899,
    reorderPoint: 20,
    safetyStock: 8,
    minimumOrderQuantity: 20,
    packSize: 4
  },
  {
    productId: 'PROD-CAB-12',
    sku: 'SKU-CAB-012',
    name: 'Braided Type-C to Lightning Fast Cable (2m)',
    category: 'Cables & Connectivity',
    supplierId: 'SUP-IND-02',
    supplierName: 'Zenith Power & Audio Solutions Mumbai',
    unitCost: 249,
    sellingPrice: 799,
    reorderPoint: 50,
    safetyStock: 20,
    minimumOrderQuantity: 100,
    packSize: 25
  }
];

function normalizeInventoryItem(item: Record<string, unknown>): InventoryState {
  const parsed = inventoryStateSchema.safeParse(item);
  if (!parsed.success) {
    throw new AppError('Inventory item failed validation', {
      statusCode: 500,
      code: 'INVALID_INVENTORY_ITEM',
      details: { issues: parsed.error.issues }
    });
  }
  return parsed.data;
}

export class DynamoDbInventoryRepository implements InventoryRepository {
  constructor(
    private readonly client: DynamoDBDocumentClient,
    private readonly tableName: string = getEnv().INVENTORY_TABLE_NAME
  ) {}

  public async getInventory(productId: string, locationId: string): Promise<InventoryState | null> {
    if (!productId.trim() || !locationId.trim()) {
      throw new AppError('Product ID and location ID are required', {
        statusCode: 400,
        code: 'INVALID_ARGUMENT'
      });
    }

    const result = await this.client.send(
      new GetCommand({
        TableName: this.tableName,
        Key: {
          PK: buildLocationKey(locationId),
          SK: buildProductKey(productId)
        }
      })
    );

    if (!result.Item) {
      return null;
    }

    return normalizeInventoryItem(result.Item as Record<string, unknown>);
  }

  public async putInventory(inventory: InventoryState): Promise<InventoryState> {
    const parsed = inventoryStateSchema.parse(inventory);
    const item = {
      PK: buildLocationKey(parsed.locationId),
      SK: buildProductKey(parsed.productId),
      ...parsed
    };

    await this.client.send(
      new PutCommand({
        TableName: this.tableName,
        Item: item
      })
    );

    return parsed;
  }

  public async updateInventoryQuantity(
    productId: string,
    locationId: string,
    quantity: number,
    updates: {
      reservedQuantity?: number;
      lastUpdated?: string;
    } = {}
  ): Promise<InventoryState> {
    const existing = await this.getInventory(productId, locationId);

    if (!existing) {
      throw new NotFoundError(`Inventory item for product ${productId} at ${locationId}`);
    }

    const nextReservedQuantity =
      updates.reservedQuantity !== undefined ? updates.reservedQuantity : existing.reservedQuantity;

    const normalizedQuantity = Number(quantity);
    const normalizedReservedQuantity = Number(nextReservedQuantity);

    const nextItem: InventoryState = {
      ...existing,
      quantity: normalizedQuantity,
      reservedQuantity: normalizedReservedQuantity,
      availableQuantity: Math.max(0, normalizedQuantity - normalizedReservedQuantity),
      lastUpdated: updates.lastUpdated ?? new Date().toISOString()
    };

    return this.putInventory(nextItem);
  }

  /**
   * Scalable global inventory query:
   * Queries active locations with bounded concurrency (concurrency = 4).
   * Eliminates the full DynamoDB table Scan!
   */
  public async listAllInventory(): Promise<InventoryState[]> {
    const locations = await this.listLocations();
    const locationIds = locations.map((loc) => loc.locationId);

    const results: InventoryState[] = [];
    const concurrency = 4;
    for (let i = 0; i < locationIds.length; i += concurrency) {
      const chunk = locationIds.slice(i, i + concurrency);
      const chunkResults = await Promise.all(
        chunk.map((locId) => this.listInventoryByLocation(locId))
      );
      for (const list of chunkResults) {
        results.push(...list);
      }
    }
    return results;
  }

  public async listInventoryByLocation(locationId: string): Promise<InventoryState[]> {
    const result = await this.client.send(
      new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: 'PK = :pk',
        ExpressionAttributeValues: {
          ':pk': buildLocationKey(locationId)
        }
      })
    );

    const items = (result.Items ?? []) as Record<string, unknown>[];
    return items.map((item) => normalizeInventoryItem(item));
  }

  public async listLowStockInventory(locationId: string, threshold = 0): Promise<InventoryState[]> {
    const items = await this.listInventoryByLocation(locationId);

    return items.filter((item) => {
      const comparisonValue = threshold > 0 ? threshold : item.reorderPoint;
      return item.availableQuantity <= comparisonValue || item.quantity <= item.safetyStock;
    });
  }

  // --- Catalog Methods ---

  public async listLocations(): Promise<InventoryLocation[]> {
    return DEFAULT_LOCATIONS;
  }

  public async listSuppliers(): Promise<Supplier[]> {
    return DEFAULT_SUPPLIERS;
  }

  public async listProducts(): Promise<Product[]> {
    try {
      const result = await this.client.send(
        new QueryCommand({
          TableName: this.tableName,
          KeyConditionExpression: 'PK = :pk',
          ExpressionAttributeValues: {
            ':pk': 'CATALOG#PRODUCTS'
          }
        })
      );
      const customProducts = (result.Items ?? []) as unknown as Product[];
      const customIds = new Set(customProducts.map((p) => p.productId));
      const base = DEFAULT_PRODUCTS.filter((p) => !customIds.has(p.productId));
      return [...base, ...customProducts];
    } catch {
      return DEFAULT_PRODUCTS;
    }
  }

  public async getProductById(productId: string): Promise<Product | null> {
    const products = await this.listProducts();
    return products.find((p) => p.productId === productId) ?? null;
  }

  public async getProductBySku(sku: string): Promise<Product | null> {
    const normalizedSku = sku.trim().toUpperCase();
    const products = await this.listProducts();
    return products.find((p) => p.sku.trim().toUpperCase() === normalizedSku) ?? null;
  }

  public async createProduct(product: Product): Promise<Product> {
    const parsed = productSchema.parse(product);
    const existing = await this.getProductBySku(parsed.sku);
    if (existing) {
      throw new ConflictError(`Product with SKU '${parsed.sku}' already exists in catalog`);
    }

    await this.client.send(
      new PutCommand({
        TableName: this.tableName,
        Item: {
          PK: 'CATALOG#PRODUCTS',
          SK: `PRODUCT#${parsed.productId}`,
          GSI1PK: `SKU#${parsed.sku.toUpperCase()}`,
          GSI1SK: `PRODUCT#${parsed.productId}`,
          ...parsed,
          createdAt: new Date().toISOString()
        }
      })
    );

    return parsed;
  }

  public async updateProduct(productId: string, updates: Partial<Product>): Promise<Product> {
    const existing = await this.getProductById(productId);
    if (!existing) {
      throw new NotFoundError(`Product '${productId}'`);
    }

    const merged = productSchema.parse({ ...existing, ...updates, productId });
    await this.client.send(
      new PutCommand({
        TableName: this.tableName,
        Item: {
          PK: 'CATALOG#PRODUCTS',
          SK: `PRODUCT#${merged.productId}`,
          GSI1PK: `SKU#${merged.sku.toUpperCase()}`,
          GSI1SK: `PRODUCT#${merged.productId}`,
          ...merged,
          updatedAt: new Date().toISOString()
        }
      })
    );

    return merged;
  }

  // --- Aggregates & Precomputed Read Models ---

  public async getHealthAggregate(locationId?: string): Promise<HealthAggregate | null> {
    const targetSk = locationId ? `LOCATION#${locationId}` : 'GLOBAL';
    try {
      const result = await this.client.send(
        new GetCommand({
          TableName: this.tableName,
          Key: {
            PK: 'AGGREGATE#HEALTH',
            SK: targetSk
          }
        })
      );
      if (!result.Item) return null;
      return result.Item as unknown as HealthAggregate;
    } catch {
      return null;
    }
  }

  public async putHealthAggregate(aggregate: HealthAggregate): Promise<HealthAggregate> {
    const targetSk = aggregate.locationId === 'GLOBAL' ? 'GLOBAL' : `LOCATION#${aggregate.locationId}`;
    await this.client.send(
      new PutCommand({
        TableName: this.tableName,
        Item: {
          PK: 'AGGREGATE#HEALTH',
          SK: targetSk,
          ...aggregate,
          lastUpdated: new Date().toISOString()
        }
      })
    );
    return aggregate;
  }

  public async listPrecomputedReorders(locationId?: string, urgency?: string): Promise<ReorderRecommendation[]> {
    try {
      if (locationId) {
        const result = await this.client.send(
          new QueryCommand({
            TableName: this.tableName,
            KeyConditionExpression: 'PK = :pk',
            ExpressionAttributeValues: {
              ':pk': `REORDER#${locationId}`
            }
          })
        );
        const items = (result.Items ?? []) as unknown as ReorderRecommendation[];
        return urgency ? items.filter((i) => i.urgency === urgency.toUpperCase()) : items;
      }

      // Query across all known locations
      const locations = await this.listLocations();
      const all: ReorderRecommendation[] = [];
      for (const loc of locations) {
        const result = await this.client.send(
          new QueryCommand({
            TableName: this.tableName,
            KeyConditionExpression: 'PK = :pk',
            ExpressionAttributeValues: {
              ':pk': `REORDER#${loc.locationId}`
            }
          })
        );
        const items = (result.Items ?? []) as unknown as ReorderRecommendation[];
        all.push(...items);
      }
      return urgency ? all.filter((i) => i.urgency === urgency.toUpperCase()) : all;
    } catch {
      return [];
    }
  }

  public async putPrecomputedReorder(reorder: ReorderRecommendation): Promise<ReorderRecommendation> {
    await this.client.send(
      new PutCommand({
        TableName: this.tableName,
        Item: {
          PK: `REORDER#${reorder.locationId}`,
          SK: `PRODUCT#${reorder.productId}`,
          GSI1PK: `REORDER#${reorder.urgency}`,
          GSI1SK: `${reorder.locationId}#${reorder.productId}`,
          ...reorder,
          lastUpdated: new Date().toISOString()
        }
      })
    );
    return reorder;
  }
}

export function createInventoryRepository(
  client: DynamoDBDocumentClient = DynamoDBDocumentClient.from(
    new DynamoDBClient({ region: getEnv().AWS_REGION })
  ),
  tableName: string = getEnv().INVENTORY_TABLE_NAME
): InventoryRepository {
  return new DynamoDbInventoryRepository(client, tableName);
}

export class InMemoryInventoryRepository implements InventoryRepository {
  private readonly items = new Map<string, InventoryState>();
  private readonly products = new Map<string, Product>();
  private readonly healthAggregates = new Map<string, HealthAggregate>();
  private readonly precomputedReorders = new Map<string, ReorderRecommendation>();

  constructor() {
    for (const p of DEFAULT_PRODUCTS) {
      this.products.set(p.productId, { ...p });
    }
  }

  public async getInventory(productId: string, locationId: string): Promise<InventoryState | null> {
    return this.items.get(this.key(productId, locationId)) ?? null;
  }

  public async putInventory(inventory: InventoryState): Promise<InventoryState> {
    const parsed = inventoryStateSchema.parse(inventory);
    this.items.set(this.key(parsed.productId, parsed.locationId), parsed);
    return parsed;
  }

  public async updateInventoryQuantity(
    productId: string,
    locationId: string,
    quantity: number,
    updates: {
      reservedQuantity?: number;
      lastUpdated?: string;
    } = {}
  ): Promise<InventoryState> {
    const existing = await this.getInventory(productId, locationId);

    if (!existing) {
      throw new NotFoundError(`Inventory item for product ${productId} at ${locationId}`);
    }

    const nextReservedQuantity =
      updates.reservedQuantity !== undefined ? updates.reservedQuantity : existing.reservedQuantity;

    const next = {
      ...existing,
      quantity,
      reservedQuantity: nextReservedQuantity,
      availableQuantity: Math.max(0, quantity - nextReservedQuantity),
      lastUpdated: updates.lastUpdated ?? new Date().toISOString()
    };

    this.items.set(this.key(productId, locationId), next);
    return next;
  }

  public async listAllInventory(): Promise<InventoryState[]> {
    return Array.from(this.items.values());
  }

  public async listInventoryByLocation(locationId: string): Promise<InventoryState[]> {
    return Array.from(this.items.values()).filter((item) => item.locationId === locationId);
  }

  public async listLowStockInventory(locationId: string, threshold = 0): Promise<InventoryState[]> {
    return (await this.listInventoryByLocation(locationId)).filter((item) => {
      const comparisonValue = threshold > 0 ? threshold : item.reorderPoint;
      return item.availableQuantity <= comparisonValue || item.quantity <= item.safetyStock;
    });
  }

  public async listLocations(): Promise<InventoryLocation[]> {
    return DEFAULT_LOCATIONS;
  }

  public async listSuppliers(): Promise<Supplier[]> {
    return DEFAULT_SUPPLIERS;
  }

  public async listProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  public async getProductById(productId: string): Promise<Product | null> {
    return this.products.get(productId) ?? null;
  }

  public async getProductBySku(sku: string): Promise<Product | null> {
    const target = sku.trim().toUpperCase();
    for (const p of this.products.values()) {
      if (p.sku.trim().toUpperCase() === target) {
        return p;
      }
    }
    return null;
  }

  public async createProduct(product: Product): Promise<Product> {
    const parsed = productSchema.parse(product);
    const existing = await this.getProductBySku(parsed.sku);
    if (existing) {
      throw new ConflictError(`Product with SKU '${parsed.sku}' already exists in catalog`);
    }
    this.products.set(parsed.productId, parsed);
    return parsed;
  }

  public async updateProduct(productId: string, updates: Partial<Product>): Promise<Product> {
    const existing = await this.getProductById(productId);
    if (!existing) {
      throw new NotFoundError(`Product '${productId}'`);
    }
    const merged = productSchema.parse({ ...existing, ...updates, productId });
    this.products.set(productId, merged);
    return merged;
  }

  public async getHealthAggregate(locationId?: string): Promise<HealthAggregate | null> {
    const key = locationId ?? 'GLOBAL';
    return this.healthAggregates.get(key) ?? null;
  }

  public async putHealthAggregate(aggregate: HealthAggregate): Promise<HealthAggregate> {
    this.healthAggregates.set(aggregate.locationId, aggregate);
    return aggregate;
  }

  public async listPrecomputedReorders(locationId?: string, urgency?: string): Promise<ReorderRecommendation[]> {
    let list = Array.from(this.precomputedReorders.values());
    if (locationId) {
      list = list.filter((r) => r.locationId === locationId);
    }
    if (urgency) {
      list = list.filter((r) => r.urgency === urgency.toUpperCase());
    }
    return list;
  }

  public async putPrecomputedReorder(reorder: ReorderRecommendation): Promise<ReorderRecommendation> {
    const key = `${reorder.locationId}::${reorder.productId}`;
    this.precomputedReorders.set(key, reorder);
    return reorder;
  }

  private key(productId: string, locationId: string): string {
    return `${locationId}::${productId}`;
  }
}
