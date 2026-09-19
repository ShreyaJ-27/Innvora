import { apiClient } from './client';
import { EventSimulationRequest } from '../types/events';
import { mockDb } from './mock-adapter';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === 'true';

export async function postInventoryEvent(event: EventSimulationRequest): Promise<{
  accepted: boolean;
  eventId: string;
  message: string;
}> {
  if (USE_MOCK) {
    return mockDb.processInventoryEvent(event);
  }

  return apiClient<{ accepted: boolean; eventId: string; message: string }>('/inventory/events', {
    method: 'POST',
    body: JSON.stringify(event),
  });
}
