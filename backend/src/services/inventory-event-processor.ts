import { AppError, ValidationError } from '../errors/AppError.js';
import { InventoryEvent, InventoryState } from '../domain/models.js';
import { InventoryRepository } from '../repositories/inventory-repository.js';
import { inventoryEventSchema, inventoryStateSchema } from '../validation/domain-schemas.js';
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

    const currentInventory = await this.dependencies.inventoryRepository.getInventory(
      event.productId,
      event.locationId
    );

    if (!currentInventory) {
      throw new AppError('Inventory record not found for event', {
        statusCode: 404,
        code: 'INVENTORY_NOT_FOUND',
        details: {
          productId: event.productId,
          locationId: event.locationId
        }
      });
    }

    const previousQuantity = currentInventory.quantity;
    const newQuantity = previousQuantity + event.quantityChange;
    const availableQuantity = newQuantity - currentInventory.reservedQuantity;

    const nextInventory: InventoryState = {
      ...currentInventory,
      quantity: newQuantity,
      availableQuantity,
      lastUpdated: event.timestamp
    };

    await this.dependencies.inventoryRepository.putInventory(nextInventory);

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
