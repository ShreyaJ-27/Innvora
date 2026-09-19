import { SQSClient, SendMessageCommand, SendMessageCommandInput } from '@aws-sdk/client-sqs';

import { AppError } from '../errors/AppError.js';
import { InventoryEvent } from '../domain/models.js';
import { getEnv } from '../config/env.js';

export interface InventoryEventPublisher {
  publishInventoryEvent(event: InventoryEvent): Promise<void>;
}

export class SqsInventoryEventPublisher implements InventoryEventPublisher {
  constructor(
    private readonly client: SQSClient,
    private readonly queueUrl: string = getEnv().INVENTORY_EVENTS_QUEUE_URL
  ) {}

  public async publishInventoryEvent(event: InventoryEvent): Promise<void> {
    const input: SendMessageCommandInput = {
      QueueUrl: this.queueUrl,
      MessageBody: JSON.stringify(event),
      MessageAttributes: {
        eventType: {
          DataType: 'String',
          StringValue: event.eventType
        },
        productId: {
          DataType: 'String',
          StringValue: event.productId
        },
        locationId: {
          DataType: 'String',
          StringValue: event.locationId
        }
      }
    };

    try {
      await this.client.send(new SendMessageCommand(input));
    } catch (error) {
      throw new AppError('Failed to publish inventory event to SQS', {
        statusCode: 503,
        code: 'SQS_PUBLISH_ERROR',
        cause: error
      });
    }
  }
}

export function createSqsInventoryEventPublisher(
  client: SQSClient = new SQSClient({ region: getEnv().AWS_REGION }),
  queueUrl: string = getEnv().INVENTORY_EVENTS_QUEUE_URL
): InventoryEventPublisher {
  return new SqsInventoryEventPublisher(client, queueUrl);
}
