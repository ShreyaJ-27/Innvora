export type InventoryEventType =
  | 'SALE'
  | 'RESTOCK'
  | 'RETURN'
  | 'TRANSFER_IN'
  | 'TRANSFER_OUT'
  | 'ADJUSTMENT';

export interface InventoryEvent {
  id: string;
  sku: string;
  productId?: string;
  productName: string;
  locationId: string;
  locationName: string;
  eventType: InventoryEventType;
  quantityChange: number;
  previousStock: number;
  newStock: number;
  timestamp: string;
  source: string;
  referenceId?: string;
}

export interface EventSimulationRequest {
  sku: string;
  locationId: string;
  quantity: number;
  eventType: InventoryEventType;
  source?: string;
}
