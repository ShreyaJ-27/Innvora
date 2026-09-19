import { Client } from '@opensearch-project/opensearch';
import { AwsSigv4Signer } from '@opensearch-project/opensearch/aws';
import { defaultProvider } from '@aws-sdk/credential-provider-node';

import { getEnv } from '../config/env.js';
import { InventoryEvent } from '../domain/models.js';
import { inventoryEventSchema } from '../validation/domain-schemas.js';

export interface InventoryEventRepository {
  indexInventoryEvent(event: InventoryEvent): Promise<InventoryEvent>;
  searchInventoryEvents(
    query?: string,
    filters?: {
      sku?: string;
      productId?: string;
      locationId?: string;
      eventType?: string;
      startDate?: string;
      endDate?: string;
    },
    pagination?: {
      page?: number;
      limit?: number;
    }
  ): Promise<{
    items: InventoryEvent[];
    total: number;
    page: number;
    limit: number;
  }>;
  getInventoryEvent(eventId: string): Promise<InventoryEvent | null>;
}

export interface EventSearchResult {
  items: InventoryEvent[];
  total: number;
  page: number;
  limit: number;
}

export class OpenSearchInventoryEventRepository implements InventoryEventRepository {
  constructor(
    private readonly client: Client,
    private readonly indexName: string = getEnv().OPENSEARCH_INDEX
  ) {}

  public async indexInventoryEvent(event: InventoryEvent): Promise<InventoryEvent> {
    const parsed = inventoryEventSchema.parse(event);

    const response = await this.client.index({
      index: this.indexName,
      id: parsed.eventId,
      body: {
        eventId: parsed.eventId,
        productId: parsed.productId,
        sku: parsed.sku,
        locationId: parsed.locationId,
        eventType: parsed.eventType,
        quantityChange: parsed.quantityChange,
        previousQuantity: parsed.previousQuantity,
        newQuantity: parsed.newQuantity,
        timestamp: parsed.timestamp,
        source: parsed.source
      }
    });

    if (response.body.result === 'created' || response.body.result === 'updated') {
      return parsed;
    }

    return parsed;
  }

  public async searchInventoryEvents(
    query = '',
    filters: {
      sku?: string;
      productId?: string;
      locationId?: string;
      eventType?: string;
      startDate?: string;
      endDate?: string;
    } = {},
    pagination: {
      page?: number;
      limit?: number;
    } = {}
  ): Promise<EventSearchResult> {
    const page = Math.max(1, pagination.page ?? 1);
    const limit = Math.max(1, pagination.limit ?? 25);
    const from = (page - 1) * limit;

    const must: Array<Record<string, unknown>> = [];

    if (query.trim()) {
      must.push({
        multi_match: {
          query,
          fields: ['sku', 'productId', 'locationId', 'eventType', 'source'],
          fuzziness: 'AUTO'
        }
      });
    }

    if (filters.sku) {
      must.push({ term: { sku: filters.sku } });
    }

    if (filters.productId) {
      must.push({ term: { productId: filters.productId } });
    }

    if (filters.locationId) {
      must.push({ term: { locationId: filters.locationId } });
    }

    if (filters.eventType) {
      must.push({ term: { eventType: filters.eventType.toUpperCase() } });
    }

    if (filters.startDate || filters.endDate) {
      const timestampRange: Record<string, string> = {};

      if (filters.startDate) {
        timestampRange.gte = filters.startDate;
      }

      if (filters.endDate) {
        timestampRange.lte = filters.endDate;
      }

      must.push({ range: { timestamp: timestampRange } });
    }

    const queryBody: Record<string, unknown> = {
      query: {
        bool: {
          must: must.length > 0 ? must : [{ match_all: {} }]
        }
      },
      from,
      size: limit,
      sort: [{ timestamp: 'desc' }]
    };

    const response = await this.client.search({
      index: this.indexName,
      body: queryBody
    });

    const hits = response.body.hits?.hits ?? [];
    const items = hits.map((hit: Record<string, unknown>) => {
      const source = hit._source as Record<string, unknown>;
      return inventoryEventSchema.parse(source);
    });

    const totalHits = response.body.hits?.total;
    const total =
      typeof totalHits === 'number'
        ? totalHits
        : totalHits && typeof totalHits === 'object' && 'value' in totalHits
          ? Number(totalHits.value)
          : items.length;

    return {
      items,
      total,
      page,
      limit
    };
  }

  public async getInventoryEvent(eventId: string): Promise<InventoryEvent | null> {
    const response = await this.client.get({
      index: this.indexName,
      id: eventId
    });

    if (!response.body.found) {
      return null;
    }

    return inventoryEventSchema.parse(response.body._source as Record<string, unknown>);
  }
}

export function createOpenSearchClient(): Client {
  const { OPENSEARCH_ENDPOINT } = getEnv();

  return new Client({
    ...AwsSigv4Signer({
      region: process.env.AWS_REGION ?? 'ap-south-1',
      service: 'es',
      getCredentials: defaultProvider()
    }),
    node: OPENSEARCH_ENDPOINT
  });
}

export function createInventoryEventRepository(
  client: Client = createOpenSearchClient(),
  indexName: string = getEnv().OPENSEARCH_INDEX
): InventoryEventRepository {
  return new OpenSearchInventoryEventRepository(client, indexName);
}

export const inventoryEventIndexMapping = {
  settings: {
    index: {
      number_of_shards: 1,
      number_of_replicas: 1
    }
  },
  mappings: {
    properties: {
      eventId: { type: 'keyword' },
      productId: { type: 'keyword' },
      sku: { type: 'keyword' },
      locationId: { type: 'keyword' },
      eventType: { type: 'keyword' },
      quantityChange: { type: 'integer' },
      previousQuantity: { type: 'integer' },
      newQuantity: { type: 'integer' },
      timestamp: { type: 'date' },
      source: { type: 'keyword' }
    }
  }
};
