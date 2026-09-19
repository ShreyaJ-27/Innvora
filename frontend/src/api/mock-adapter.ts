import {
  INITIAL_MOCK_PRODUCTS,
  INITIAL_MOCK_REORDERS,
  INITIAL_MOCK_EVENTS,
  MOCK_LOCATIONS,
} from './mock-data';
import { ProductInventory, InventoryHealthSummary, LocationInventorySummary } from '../types/inventory';
import { ReorderRecommendation } from '../types/reorder';
import { InventoryEvent, EventSimulationRequest } from '../types/events';

// Mutable in-memory store for development session
class MockDatabase {
  products: ProductInventory[] = [...INITIAL_MOCK_PRODUCTS];
  reorders: ReorderRecommendation[] = [...INITIAL_MOCK_REORDERS];
  events: InventoryEvent[] = [...INITIAL_MOCK_EVENTS];
  locations: LocationInventorySummary[] = [...MOCK_LOCATIONS];

  private delay(ms = 150): Promise<void> {
    return new Promise((res) => setTimeout(res, ms));
  }

  async getInventory(filters?: {
    locationId?: string;
    status?: string;
    search?: string;
  }): Promise<ProductInventory[]> {
    await this.delay(100);
    let result = [...this.products];

    if (filters?.locationId && filters.locationId !== 'ALL') {
      result = result.filter((p) => p.locationId === filters.locationId);
    }
    if (filters?.status && filters.status !== 'ALL') {
      result = result.filter((p) => p.status === filters.status);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.locationName.toLowerCase().includes(q)
      );
    }
    return result;
  }

  async getInventoryByProduct(productId: string): Promise<ProductInventory | null> {
    await this.delay(100);
    return this.products.find((p) => p.productId === productId || p.id === productId || p.sku === productId) || null;
  }

  async getInventoryByLocation(locationId: string): Promise<ProductInventory[]> {
    await this.delay(100);
    return this.products.filter((p) => p.locationId === locationId);
  }

  async getInventoryHealth(locationId?: string): Promise<{
    summary: InventoryHealthSummary;
    locations: LocationInventorySummary[];
  }> {
    await this.delay(120);
    const relevantProducts =
      locationId && locationId !== 'ALL'
        ? this.products.filter((p) => p.locationId === locationId)
        : this.products;

    const totalSkus = relevantProducts.length;
    const totalUnits = relevantProducts.reduce((sum, p) => sum + p.currentStock, 0);
    const totalValue = relevantProducts.reduce((sum, p) => sum + p.currentStock * p.unitCost, 0);

    const healthyCount = relevantProducts.filter((p) => p.status === 'HEALTHY').length;
    const reorderSoonCount = relevantProducts.filter((p) => p.status === 'REORDER_SOON').length;
    const criticalCount = relevantProducts.filter((p) => p.status === 'CRITICAL').length;
    const overstockedCount = relevantProducts.filter((p) => p.status === 'OVERSTOCKED').length;

    const stockTrend = [
      { date: 'Sep 13', totalStock: totalUnits + 620, inboundUnits: 180, outboundUnits: 140 },
      { date: 'Sep 14', totalStock: totalUnits + 450, inboundUnits: 40, outboundUnits: 210 },
      { date: 'Sep 15', totalStock: totalUnits + 290, inboundUnits: 90, outboundUnits: 250 },
      { date: 'Sep 16', totalStock: totalUnits + 180, inboundUnits: 110, outboundUnits: 220 },
      { date: 'Sep 17', totalStock: totalUnits + 90, inboundUnits: 80, outboundUnits: 170 },
      { date: 'Sep 18', totalStock: totalUnits + 15, inboundUnits: 75, outboundUnits: 150 },
      { date: 'Sep 19', totalStock: totalUnits, inboundUnits: 50, outboundUnits: 65 },
    ];

    return {
      summary: {
        totalSkus,
        totalUnits,
        totalValue,
        healthyCount,
        reorderSoonCount,
        criticalCount,
        overstockedCount,
        itemsNeedingReorder: criticalCount + reorderSoonCount,
        stockTrend,
      },
      locations: this.locations,
    };
  }

  async getReorders(filters?: {
    locationId?: string;
    urgency?: string;
    supplier?: string;
    search?: string;
  }): Promise<ReorderRecommendation[]> {
    await this.delay(100);
    let result = [...this.reorders];

    if (filters?.locationId && filters.locationId !== 'ALL') {
      result = result.filter((r) => r.locationId === filters.locationId);
    }
    if (filters?.urgency && filters.urgency !== 'ALL') {
      result = result.filter((r) => r.urgency === filters.urgency);
    }
    if (filters?.supplier && filters.supplier !== 'ALL') {
      result = result.filter((r) => r.supplierName === filters.supplier || r.supplierId === filters.supplier);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (r) =>
          r.productName.toLowerCase().includes(q) ||
          r.sku.toLowerCase().includes(q) ||
          r.supplierName.toLowerCase().includes(q)
      );
    }

    // Urgency sorting: CRITICAL -> REORDER_SOON -> HEALTHY -> OVERSTOCKED
    const urgencyOrder: Record<string, number> = {
      CRITICAL: 1,
      REORDER_SOON: 2,
      HEALTHY: 3,
      OVERSTOCKED: 4,
    };
    result.sort((a, b) => (urgencyOrder[a.urgency] || 99) - (urgencyOrder[b.urgency] || 99));

    return result;
  }

  async searchInventoryEvents(filters?: {
    q?: string;
    locationId?: string;
    eventType?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<InventoryEvent[]> {
    await this.delay(120);
    let result = [...this.events];

    if (filters?.q) {
      const query = filters.q.toLowerCase().trim();
      result = result.filter(
        (e) =>
          e.sku.toLowerCase().includes(query) ||
          e.productName.toLowerCase().includes(query) ||
          e.locationName.toLowerCase().includes(query) ||
          e.source.toLowerCase().includes(query) ||
          (e.referenceId && e.referenceId.toLowerCase().includes(query))
      );
    }

    if (filters?.locationId && filters.locationId !== 'ALL') {
      result = result.filter((e) => e.locationId === filters.locationId);
    }

    if (filters?.eventType && filters.eventType !== 'ALL') {
      result = result.filter((e) => e.eventType === filters.eventType);
    }

    // Sort by timestamp descending
    result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return result;
  }

  async processInventoryEvent(event: EventSimulationRequest): Promise<{
    accepted: boolean;
    eventId: string;
    message: string;
    updatedProduct?: ProductInventory;
  }> {
    await this.delay(200);

    const product = this.products.find((p) => p.sku === event.sku);
    const location = this.locations.find((l) => l.locationId === event.locationId);

    const prevStock = product ? product.currentStock : 50;
    let qtyChange = event.quantity;

    if (event.eventType === 'SALE' || event.eventType === 'TRANSFER_OUT') {
      qtyChange = -Math.abs(event.quantity);
    } else if (event.eventType === 'RESTOCK' || event.eventType === 'RETURN' || event.eventType === 'TRANSFER_IN') {
      qtyChange = Math.abs(event.quantity);
    } else if (event.eventType === 'ADJUSTMENT') {
      qtyChange = event.quantity; // can be positive or negative
    }

    const newStock = Math.max(0, prevStock + qtyChange);

    const newEvent: InventoryEvent = {
      id: `evt-${Date.now()}`,
      sku: event.sku,
      productName: product ? product.name : 'Simulated Item',
      locationId: event.locationId,
      locationName: location ? location.locationName : 'Simulated Location',
      eventType: event.eventType,
      quantityChange: qtyChange,
      previousStock: prevStock,
      newStock: newStock,
      timestamp: new Date().toISOString(),
      source: event.source || 'StockPulse Demo Simulator',
      referenceId: `SIM-${Math.floor(1000 + Math.random() * 9000)}`,
    };

    // Prepend event
    this.events.unshift(newEvent);

    // Update in-memory product
    if (product) {
      product.currentStock = newStock;
      product.availableStock = Math.max(0, newStock - product.reservedStock);
      product.daysOfStock = parseFloat((product.availableStock / Math.max(1, product.dailyDemand)).toFixed(1));
      product.lastUpdated = new Date().toISOString();

      // Recalculate status
      if (product.availableStock <= product.safetyStock) {
        product.status = 'CRITICAL';
      } else if (product.availableStock <= product.reorderPoint) {
        product.status = 'REORDER_SOON';
      } else if (product.daysOfStock > 60) {
        product.status = 'OVERSTOCKED';
      } else {
        product.status = 'HEALTHY';
      }

      // If critical or reorder soon, update or add recommendation
      const existingReorder = this.reorders.find((r) => r.sku === product.sku);
      if (product.status === 'CRITICAL' || product.status === 'REORDER_SOON') {
        if (existingReorder) {
          existingReorder.availableStock = product.availableStock;
          existingReorder.daysRemaining = product.daysOfStock;
          existingReorder.urgency = product.status;
          existingReorder.explanation.currentStock = product.availableStock;
          existingReorder.explanation.stockCoverageDays = product.daysOfStock;
        }
      }
    }

    return {
      accepted: true,
      eventId: newEvent.id,
      message: `Event accepted for processing by SQS Queue (Batch ID: ${newEvent.referenceId})`,
      updatedProduct: product,
    };
  }
}

export const mockDb = new MockDatabase();
