import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  ScanCommand
} from '@aws-sdk/lib-dynamodb';

import { getEnv } from '../config/env.js';
import { AppError, NotFoundError } from '../errors/AppError.js';
import { InventoryState } from '../domain/models.js';
import { inventoryStateSchema } from '../validation/domain-schemas.js';

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
}

const buildLocationKey = (locationId: string): string => `LOCATION#${locationId}`;
const buildProductKey = (productId: string): string => `PRODUCT#${productId}`;

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

  public async listAllInventory(): Promise<InventoryState[]> {
    const result = await this.client.send(
      new ScanCommand({
        TableName: this.tableName
      })
    );

    const items = (result.Items ?? []) as Record<string, unknown>[];
    return items
      .filter((item) => typeof item.PK === 'string' && item.PK.startsWith('LOCATION#'))
      .map((item) => normalizeInventoryItem(item));
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

  private key(productId: string, locationId: string): string {
    return `${locationId}::${productId}`;
  }
}
