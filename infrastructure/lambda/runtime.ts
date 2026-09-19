import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { GetCommand, PutCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { SQSClient } from '@aws-sdk/client-sqs';
import { Client } from '@opensearch-project/opensearch';
import { AwsSigv4Signer } from '@opensearch-project/opensearch/aws';
import { defaultProvider } from '@aws-sdk/credential-provider-node';
import type { APIGatewayProxyEvent, APIGatewayProxyResult, SQSEvent } from 'aws-lambda';

import { InventoryApiHandler, ApiGatewayEvent } from '../../backend/src/handlers/inventory-api.js';
import { InventoryEventHandler } from '../../backend/src/handlers/inventory-event-handler.js';
import { InventoryEventProcessor, InventoryEventProcessorLambdaHandler } from '../../backend/src/services/inventory-event-processor.js';
import { InventoryService } from '../../backend/src/services/inventory-service.js';
import { ReorderService } from '../../backend/src/services/reorder-service.js';
import { createInventoryRepository } from '../../backend/src/repositories/inventory-repository.js';
import { OpenSearchInventoryEventRepository } from '../../backend/src/repositories/event-repository.js';
import { SqsInventoryEventPublisher } from '../../backend/src/services/sqs-event-publisher.js';

const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.AWS_REGION }));
const inventoryRepository = createInventoryRepository(dynamo, required('INVENTORY_TABLE_NAME'));
const openSearch = new Client({
  ...AwsSigv4Signer({
    region: process.env.AWS_REGION ?? 'ap-south-1',
    service: 'es',
    getCredentials: defaultProvider()
  }),
  node: required('OPENSEARCH_ENDPOINT'),
  ssl: { rejectUnauthorized: false }
});
const eventRepository = new OpenSearchInventoryEventRepository(openSearch, required('OPENSEARCH_INDEX'));
const inventoryService = new InventoryService(inventoryRepository);

class DynamoProcessedEventStore {
  public async hasProcessed(eventId: string): Promise<boolean> {
    const result = await dynamo.send(new GetCommand({
      TableName: required('INVENTORY_TABLE_NAME'),
      Key: { PK: `EVENT#${eventId}`, SK: 'PROCESSED' },
      ProjectionExpression: 'PK'
    }));
    return Boolean(result.Item);
  }

  public async markProcessed(eventId: string): Promise<void> {
    await dynamo.send(new PutCommand({
      TableName: required('INVENTORY_TABLE_NAME'),
      Item: { PK: `EVENT#${eventId}`, SK: 'PROCESSED', processedAt: new Date().toISOString() },
      ConditionExpression: 'attribute_not_exists(PK)'
    }));
  }
}

const processor = new InventoryEventProcessor({
  inventoryRepository,
  processedEventStore: new DynamoProcessedEventStore(),
  indexer: { indexEvent: (event) => eventRepository.indexInventoryEvent(event).then(() => undefined) }
});

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function normalizeApiEvent(event: APIGatewayProxyEvent): ApiGatewayEvent {
  const queryStringParameters = event.queryStringParameters
    ? Object.fromEntries(Object.entries(event.queryStringParameters).map(([key, value]) => [key, value ?? null]))
    : event.queryStringParameters;

  return {
    httpMethod: event.httpMethod,
    path: event.resource || event.path,
    queryStringParameters,
    pathParameters: event.pathParameters
  };
}

function parseBody(event: APIGatewayProxyEvent): unknown {
  if (!event.body) return undefined;
  return JSON.parse(event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf8') : event.body);
}

export async function inventoryApi(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  if (event.httpMethod === 'POST' && (event.resource || event.path) === '/inventory/events') {
    const publisher = new SqsInventoryEventPublisher(new SQSClient({ region: process.env.AWS_REGION }), required('INVENTORY_EVENTS_QUEUE_URL'));
    const result = await new InventoryEventHandler(publisher).handle(parseBody(event));
    return { ...result, headers: { 'Access-Control-Allow-Origin': '*' } };
  }

  return new InventoryApiHandler(inventoryService).handle(normalizeApiEvent(event));
}

export async function searchApi(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  return new InventoryApiHandler(inventoryService, eventRepository).handle(normalizeApiEvent(event));
}

export async function reorderApi(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const reorderService = new ReorderService({
    listInventory: async (locationId) => (await inventoryRepository.listAllInventory())
      .filter((item) => !locationId || item.locationId === locationId)
      .map((item) => ({
        productId: item.productId,
        sku: item.sku,
        locationId: item.locationId,
        currentStock: item.quantity,
        reservedStock: item.reservedQuantity,
        safetyStock: item.safetyStock,
        minimumOrderQuantity: Number(process.env.DEFAULT_MINIMUM_ORDER_QUANTITY ?? 1),
        packSize: Number(process.env.DEFAULT_PACK_SIZE ?? 1)
      })),
    getInventory: async (productId, locationId) => {
      const item = await inventoryRepository.getInventory(productId, locationId);
      return item ? {
        productId: item.productId,
        sku: item.sku,
        locationId: item.locationId,
        currentStock: item.quantity,
        reservedStock: item.reservedQuantity,
        safetyStock: item.safetyStock,
        minimumOrderQuantity: Number(process.env.DEFAULT_MINIMUM_ORDER_QUANTITY ?? 1),
        packSize: Number(process.env.DEFAULT_PACK_SIZE ?? 1)
      } : null;
    },
    getDemandInformation: async () => ({
      averageDailyDemand: Number(process.env.DEFAULT_AVERAGE_DAILY_DEMAND ?? 1),
      forecastBuffer: Number(process.env.DEFAULT_FORECAST_BUFFER ?? 0)
    }),
    getSupplierInformation: async () => ({ leadTimeDays: Number(process.env.DEFAULT_LEAD_TIME_DAYS ?? 7) })
  });

  return new InventoryApiHandler(inventoryService, undefined, reorderService).handle(normalizeApiEvent(event));
}

export async function inventoryEventProcessor(event: SQSEvent): Promise<void> {
  await new InventoryEventProcessorLambdaHandler(processor).handle({
    Records: event.Records.map((record) => ({ body: record.body }))
  });
}