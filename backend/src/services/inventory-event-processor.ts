import { AppError, ValidationError } from '../errors/AppError.js';
import { InventoryEvent, InventoryState } from '../domain/models.js';
import { InventoryRepository } from '../repositories/inventory-repository.js';
import { inventoryEventSchema, inventoryStateSchema } from '../validation/domain-schemas.js';
import { generateReorderRecommendation } from '../domain/reorder/reorder-engine.js';
import { logger } from '../utils/logger.js';

export interface EventIndexer {
  indexEvent(event: InventoryEvent): Promise<void>;
}

export interface ProcessedEventStore {
  hasProcessed(eventId: string): Promise<boolean>;
  markProcessed(eventId: string): Promise<void>;
}

export interface InventoryEventProcessorDependencies {
  inventoryRepository: InventoryRepository;
  indexer: EventIndexer;
  processedEventStore: ProcessedEventStore;
}

type HealthStatusKey = 'healthy' | 'reorderSoon' | 'critical' | 'overstocked';

function deriveStatusKey(availableStock: number, safetyStock: number, reorderPoint: number): HealthStatusKey {
  if (availableStock <= safetyStock) {
    return 'critical';
  }
  if (availableStock <= reorderPoint) {
    return 'reorderSoon';
  }
  if (reorderPoint > 0 && availableStock > reorderPoint * 2.5) {
    return 'overstocked';
  }
  return 'healthy';
}

export class InventoryEventProcessor {
  constructor(private readonly dependencies: InventoryEventProcessorDependencies) {}

  public async processEvent(rawEvent: unknown): Promise<InventoryState> {
    const parsed = inventoryEventSchema.safeParse(rawEvent);

    if (!parsed.success) {
      throw new ValidationError('Malformed inventory event payload', {
        details: { issues: parsed.error.issues }
      });
    }

    const event = parsed.data;

    const alreadyProcessed = await this.dependencies.processedEventStore.hasProcessed(event.eventId);
    if (alreadyProcessed) {
      logger.warn('Duplicate inventory event ignored', {
        eventId: event.eventId,
        productId: event.productId,
        locationId: event.locationId,
        eventType: event.eventType,
        processingStatus: 'duplicate'
      });
      return inventoryStateSchema.parse({
        productId: event.productId,
        sku: event.sku,
        locationId: event.locationId,
        quantity: 0,
        reservedQuantity: 0,
        availableQuantity: 0,
        reorderPoint: 0,
        safetyStock: 0,
        lastUpdated: event.timestamp
      });
    }

    let currentInventory = await this.dependencies.inventoryRepository.getInventory(
      event.productId,
      event.locationId
    );

    const isNew = !currentInventory;
    let previousStatus: HealthStatusKey | null = null;

    if (!currentInventory) {
      if (['RESTOCK', 'ADJUSTMENT', 'TRANSFER_IN', 'RETURN'].includes(event.eventType)) {
        currentInventory = {
          productId: event.productId,
          sku: event.sku,
          locationId: event.locationId,
          quantity: 0,
          reservedQuantity: 0,
          availableQuantity: 0,
          reorderPoint: 20,
          safetyStock: 10,
          lastUpdated: event.timestamp
        };
      } else {
        throw new AppError('Inventory record not found for event', {
          statusCode: 404,
          code: 'INVENTORY_NOT_FOUND',
          details: {
            productId: event.productId,
            locationId: event.locationId
          }
        });
      }
    } else {
      previousStatus = deriveStatusKey(
        currentInventory.availableQuantity,
        currentInventory.safetyStock,
        currentInventory.reorderPoint
      );
    }

    const previousQuantity = currentInventory.quantity;
    const newQuantity = previousQuantity + event.quantityChange;
    const availableQuantity = Math.max(0, newQuantity - currentInventory.reservedQuantity);

    const nextInventory: InventoryState = {
      ...currentInventory,
      quantity: newQuantity,
      availableQuantity,
      lastUpdated: event.timestamp
    };

    // 1. Put updated inventory state
    await this.dependencies.inventoryRepository.putInventory(nextInventory);

    // 2. Compute status and update aggregate read models (location-specific and global)
    const newStatus = deriveStatusKey(
      nextInventory.availableQuantity,
      nextInventory.safetyStock,
      nextInventory.reorderPoint
    );

    await this.updateAggregates(event.locationId, isNew, previousStatus, newStatus);

    // 3. Precompute reorder recommendation and persist to read model
    await this.updatePrecomputedReorder(nextInventory);

    // 4. Mark processed & index in OpenSearch
    await this.dependencies.processedEventStore.markProcessed(event.eventId);
    await this.dependencies.indexer.indexEvent(event);

    logger.info('Inventory event processed successfully', {
      eventId: event.eventId,
      productId: event.productId,
      locationId: event.locationId,
      eventType: event.eventType,
      processingStatus: 'success'
    });

    return nextInventory;
  }

  private async updateAggregates(
    locationId: string,
    isNew: boolean,
    previousStatus: HealthStatusKey | null,
    newStatus: HealthStatusKey
  ): Promise<void> {
    if (
      typeof this.dependencies.inventoryRepository.getHealthAggregate !== 'function' ||
      typeof this.dependencies.inventoryRepository.putHealthAggregate !== 'function'
    ) {
      return;
    }

    const targets = [locationId, 'GLOBAL'];

    for (const target of targets) {
      try {
        let aggregate = await this.dependencies.inventoryRepository.getHealthAggregate(
          target === 'GLOBAL' ? undefined : target
        );

        if (!aggregate) {
          aggregate = {
            locationId: target,
            totalSkus: 0,
            healthy: 0,
            reorderSoon: 0,
            critical: 0,
            overstocked: 0,
            lastUpdated: new Date().toISOString()
          };
        }

        if (isNew) {
          aggregate.totalSkus += 1;
          aggregate[newStatus] += 1;
        } else if (previousStatus && previousStatus !== newStatus) {
          aggregate[previousStatus] = Math.max(0, aggregate[previousStatus] - 1);
          aggregate[newStatus] += 1;
        }

        aggregate.lastUpdated = new Date().toISOString();
        await this.dependencies.inventoryRepository.putHealthAggregate(aggregate);
      } catch (err) {
        logger.warn(`Failed to update health aggregate for target ${target}:`, { error: String(err) });
      }
    }
  }

  private async updatePrecomputedReorder(inventory: InventoryState): Promise<void> {
    if (typeof this.dependencies.inventoryRepository.putPrecomputedReorder !== 'function') {
      return;
    }

    try {
      const recommendation = generateReorderRecommendation({
        productId: inventory.productId,
        sku: inventory.sku,
        locationId: inventory.locationId,
        currentStock: inventory.quantity,
        reservedStock: inventory.reservedQuantity,
        averageDailyDemand: 3,
        supplierLeadTimeDays: 7,
        safetyStock: inventory.safetyStock,
        minimumOrderQuantity: 10,
        packSize: 5,
        forecastBuffer: 0
      });

      await this.dependencies.inventoryRepository.putPrecomputedReorder(recommendation);
    } catch (err) {
      logger.warn('Failed to persist precomputed reorder recommendation:', { error: String(err) });
    }
  }
}

export class InMemoryProcessedEventStore implements ProcessedEventStore {
  private readonly processed = new Set<string>();

  public async hasProcessed(eventId: string): Promise<boolean> {
    return this.processed.has(eventId);
  }

  public async markProcessed(eventId: string): Promise<void> {
    this.processed.add(eventId);
  }
}

export class InMemoryEventIndexer implements EventIndexer {
  public readonly events: InventoryEvent[] = [];

  public async indexEvent(event: InventoryEvent): Promise<void> {
    this.events.push(event);
  }
}

export interface SqsMessageRecord {
  body: string;
}

export interface SqsEvent {
  Records: SqsMessageRecord[];
}

export class InventoryEventProcessorLambdaHandler {
  constructor(private readonly processor: InventoryEventProcessor) {}

  public async handle(sqsEvent: SqsEvent): Promise<void> {
    for (const record of sqsEvent.Records ?? []) {
      const parsed = JSON.parse(record.body) as unknown;
      await this.processor.processEvent(parsed);
    }
  }
}
