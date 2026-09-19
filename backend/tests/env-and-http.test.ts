import { describe, expect, it } from 'vitest';

import { getEnv } from '../src/config/env.js';
import { createApiResponse, createErrorResponse } from '../src/utils/http.js';

describe('backend foundation', () => {
  it('loads required environment variables', () => {
    const env = getEnv({
      AWS_REGION: 'us-east-1',
      INVENTORY_TABLE_NAME: 'inventory-table',
      INVENTORY_EVENTS_QUEUE_URL: 'https://example.com/queue',
      OPENSEARCH_ENDPOINT: 'https://example.com',
      OPENSEARCH_INDEX: 'inventory-index'
    });

    expect(env.AWS_REGION).toBe('us-east-1');
    expect(env.INVENTORY_TABLE_NAME).toBe('inventory-table');
    expect(env.OPENSEARCH_INDEX).toBe('inventory-index');
  });

  it('creates structured API responses', () => {
    const success = createApiResponse({
      statusCode: 200,
      body: { ok: true }
    });

    const failure = createErrorResponse(400, 'Validation failed');

    expect(success.statusCode).toBe(200);
    expect(success.body).toContain('"ok":true');
    expect(failure.statusCode).toBe(400);
    expect(failure.body).toContain('Validation failed');
  });
});
