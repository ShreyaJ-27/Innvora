import { Client } from '@opensearch-project/opensearch';
import { AwsSigv4Signer } from '@opensearch-project/opensearch/aws';
import { defaultProvider } from '@aws-sdk/credential-provider-node';
import type { CloudFormationCustomResourceEvent, CloudFormationCustomResourceHandler } from 'aws-lambda';

import { inventoryEventIndexMapping } from '../../backend/src/repositories/event-repository.js';

const indexName = 'inventory-events';

const client = new Client({
  ...AwsSigv4Signer({
    region: process.env.AWS_REGION ?? 'ap-south-1',
    service: 'es',
    getCredentials: defaultProvider()
  }),
  node: required('OPENSEARCH_ENDPOINT')
});

export const handler: CloudFormationCustomResourceHandler = async (event) => {
  try {
    if (event.RequestType !== 'Delete') {
      const exists = await client.indices.exists({ index: indexName });
      if (exists.statusCode !== 200) {
        try {
          await client.indices.create({
            index: indexName,
            body: inventoryEventIndexMapping as unknown as NonNullable<Parameters<Client['indices']['create']>[0]['body']>
          });
        } catch (error) {
          if (!isAlreadyExistsError(error)) {
            throw error;
          }
        }
      }
    }

    await respond(event, 'SUCCESS');
  } catch (error) {
    await respond(event, 'FAILED');
    throw error;
  }
};

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function isAlreadyExistsError(error: unknown): boolean {
  const response = error as { statusCode?: number; body?: { error?: { type?: string } } };
  return response.statusCode === 409 || response.body?.error?.type === 'resource_already_exists_exception';
}

async function respond(event: CloudFormationCustomResourceEvent, status: 'SUCCESS' | 'FAILED'): Promise<void> {
  await fetch(event.ResponseURL, {
    method: 'PUT',
    headers: { 'content-type': '' },
    body: JSON.stringify({
      Status: status,
      Reason: status === 'SUCCESS' ? 'Index initialization completed' : 'Index initialization failed',
      PhysicalResourceId: 'PhysicalResourceId' in event && event.PhysicalResourceId
        ? event.PhysicalResourceId
        : 'StockPulseInventoryEventsIndex',
      StackId: event.StackId,
      RequestId: event.RequestId,
      LogicalResourceId: event.LogicalResourceId,
      Data: { IndexName: indexName }
    })
  });
}
