import { createApiResponse, createErrorResponse } from '../utils/http.js';
import { InventoryService } from '../services/inventory-service.js';
import { AppError, NotFoundError } from '../errors/AppError.js';
import { InventoryEventRepository } from '../repositories/event-repository.js';
import { ReorderService } from '../services/reorder-service.js';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
};

export interface ApiGatewayEvent {
  httpMethod: string;
  path: string;
  body?: string | null;
  queryStringParameters?: Record<string, string | null> | null;
  pathParameters?: Record<string, string | undefined> | null;
}

export class InventoryApiHandler {
  constructor(
    private readonly inventoryService: InventoryService,
    private readonly inventoryEventRepository?: InventoryEventRepository,
    private readonly reorderService?: ReorderService
  ) {}

  public async handle(event: ApiGatewayEvent): Promise<{ statusCode: number; headers: Record<string, string>; body: string }> {
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ success: true })
      };
    }

    try {
      // 1. Health Dashboard Summary
      if (event.path === '/inventory/health' && event.httpMethod === 'GET') {
        const params = event.queryStringParameters ?? {};
        const locationId = this.parseOptionalString(params.locationId);
        const data = await this.inventoryService.getInventoryHealthSummary(locationId);
        return createApiResponse({
          statusCode: 200,
          body: { success: true, data },
          headers: corsHeaders
        });
      }

      // 2. Inventory Listing
      if (event.path === '/inventory' && event.httpMethod === 'GET') {
        const params = event.queryStringParameters ?? {};
        const result = await this.inventoryService.listInventory({
          locationId: params.locationId ?? undefined,
          status: this.parseStatus(params.status ?? undefined),
          page: Number(params.page ?? 1),
          limit: Number(params.limit ?? 25)
        });

        return createApiResponse({
          statusCode: 200,
          body: { success: true, data: result },
          headers: corsHeaders
        });
      }

      // 3. OpenSearch Event Search
      if (event.path === '/inventory/search' && event.httpMethod === 'GET') {
        if (!this.inventoryEventRepository) {
          throw new AppError('Inventory event repository is not configured', {
            statusCode: 500,
            code: 'SEARCH_REPOSITORY_NOT_CONFIGURED'
          });
        }

        const params = event.queryStringParameters ?? {};
        const query = this.parseSearchQuery(params.q);
        const sku = this.parseOptionalString(params.sku);
        const productId = this.parseOptionalString(params.productId);
        const locationId = this.parseOptionalString(params.locationId);
        const eventType = this.parseOptionalString(params.eventType)?.toUpperCase();
        const startDate = this.parseOptionalDate(params.startDate, 'startDate');
        const endDate = this.parseOptionalDate(params.endDate, 'endDate');
        const page = this.parsePage(params.page ?? '1');
        const limit = this.parseLimit(params.limit ?? '25');

        if (!query && !sku && !productId && !locationId && !eventType && !startDate && !endDate) {
          throw new AppError('At least one search term or filter is required', {
            statusCode: 400,
            code: 'INVALID_SEARCH_PARAMETERS'
          });
        }

        if (startDate && endDate && startDate > endDate) {
          throw new AppError('startDate must be earlier than or equal to endDate', {
            statusCode: 400,
            code: 'INVALID_DATE_RANGE'
          });
        }

        const filters = {
          sku,
          productId,
          locationId,
          eventType,
          startDate,
          endDate
        };

        const result = await this.inventoryEventRepository.searchInventoryEvents(query, filters, { page, limit });

        return createApiResponse({
          statusCode: 200,
          body: {
            success: true,
            data: {
              results: result.items,
              pagination: {
                page: result.page,
                limit: result.limit,
                total: result.total
              }
            }
          },
          headers: corsHeaders
        });
      }

      // 4. Reorder Recommendations
      if (event.path === '/reorders' && event.httpMethod === 'GET') {
        if (!this.reorderService) {
          throw new AppError('Reorder service is not configured', {
            statusCode: 500,
            code: 'REORDER_SERVICE_NOT_CONFIGURED'
          });
        }

        const params = event.queryStringParameters ?? {};
        const locationId = this.parseOptionalString(params.locationId);
        const urgency = this.parseOptionalString(params.urgency)?.toUpperCase();
        const page = this.parsePage(params.page ?? '1');
        const limit = this.parseLimit(params.limit ?? '25');

        if (urgency && !['CRITICAL', 'REORDER_SOON', 'HEALTHY', 'OVERSTOCKED'].includes(urgency)) {
          throw new AppError('Invalid urgency filter', {
            statusCode: 400,
            code: 'INVALID_URGENCY_FILTER'
          });
        }

        const result = await this.reorderService.listRecommendations({
          locationId,
          urgency: urgency as 'CRITICAL' | 'REORDER_SOON' | 'HEALTHY' | 'OVERSTOCKED' | 'all' | undefined,
          page,
          limit
        });

        return createApiResponse({
          statusCode: 200,
          body: {
            success: true,
            data: {
              recommendations: result.recommendations.map((recommendation) => ({
                productId: recommendation.productId,
                sku: recommendation.sku,
                locationId: recommendation.locationId,
                currentStock: recommendation.currentStock,
                availableStock: recommendation.availableStock,
                averageDailyDemand: recommendation.averageDailyDemand,
                leadTimeDays: recommendation.leadTimeDays,
                reorderPoint: recommendation.reorderPoint,
                daysOfStockRemaining: recommendation.daysOfStockRemaining,
                recommendedQuantity: recommendation.recommendedQuantity,
                urgency: recommendation.urgency,
                reason: recommendation.reason
              })),
              summary: result.summary
            }
          },
          headers: corsHeaders
        });
      }

      // 5. Locations Catalog (Source of Truth)
      if (event.path === '/locations' && event.httpMethod === 'GET') {
        const locations = await this.inventoryService.listLocations();
        return createApiResponse({
          statusCode: 200,
          body: { success: true, data: locations },
          headers: corsHeaders
        });
      }

      // 6. Suppliers Catalog
      if (event.path === '/suppliers' && event.httpMethod === 'GET') {
        const suppliers = await this.inventoryService.listSuppliers();
        return createApiResponse({
          statusCode: 200,
          body: { success: true, data: suppliers },
          headers: corsHeaders
        });
      }

      // 7. Products Catalog & Creation
      if (event.path === '/products' && event.httpMethod === 'GET') {
        const products = await this.inventoryService.listProducts();
        return createApiResponse({
          statusCode: 200,
          body: { success: true, data: products },
          headers: corsHeaders
        });
      }

      if (event.path === '/products' && event.httpMethod === 'POST') {
        const payload = typeof event.body === 'string' ? JSON.parse(event.body) : (event.body ?? {});
        const result = await this.inventoryService.createProduct(payload);
        return createApiResponse({
          statusCode: 201,
          body: { success: true, data: result },
          headers: corsHeaders
        });
      }

      const isProductDetailPath = event.path === '/products/{productId}' || event.path.startsWith('/products/');
      if (isProductDetailPath && event.httpMethod === 'GET') {
        const prodId = event.pathParameters?.productId || event.path.split('/')[2];
        if (prodId) {
          const product = await this.inventoryService.getProductById(prodId);
          if (!product) {
            throw new NotFoundError(`Product '${prodId}'`);
          }
          return createApiResponse({
            statusCode: 200,
            body: { success: true, data: product },
            headers: corsHeaders
          });
        }
      }

      // 8. Real-time Notifications & Alerts
      if (event.path === '/notifications' && event.httpMethod === 'GET') {
        const alerts = await this.inventoryService.getNotifications();
        return createApiResponse({
          statusCode: 200,
          body: { success: true, data: alerts },
          headers: corsHeaders
        });
      }

      // 9. Single Product Inventory
      const productId = event.pathParameters?.productId;
      if (event.path === '/inventory/{productId}' && event.httpMethod === 'GET') {
        if (!productId) {
          throw new AppError('Product ID is required', {
            statusCode: 400,
            code: 'INVALID_PRODUCT_ID'
          });
        }

        const params = event.queryStringParameters ?? {};
        const result = await this.inventoryService.getInventory(productId, params.locationId ?? undefined);

        return createApiResponse({
          statusCode: 200,
          body: { success: true, data: result },
          headers: corsHeaders
        });
      }

      // 10. Location Inventory
      const locationId = event.pathParameters?.locationId;
      if (event.path === '/inventory/location/{locationId}' && event.httpMethod === 'GET') {
        if (!locationId) {
          throw new AppError('Location ID is required', {
            statusCode: 400,
            code: 'INVALID_LOCATION_ID'
          });
        }

        const result = await this.inventoryService.getInventoryByLocation(locationId);

        return createApiResponse({
          statusCode: 200,
          body: { success: true, data: result },
          headers: corsHeaders
        });
      }

      return createErrorResponse(404, 'Not found', {
        path: event.path,
        method: event.httpMethod
      });
    } catch (error) {
      if (error instanceof AppError) {
        return createApiResponse({
          statusCode: error.statusCode,
          body: {
            success: false,
            error: {
              code: error.code,
              message: error.message,
              ...(error.details ? { details: error.details } : {})
            }
          },
          headers: corsHeaders
        });
      }

      return createApiResponse({
        statusCode: 500,
        body: {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'An unexpected error occurred.'
          }
        },
        headers: corsHeaders
      });
    }
  }

  private parseStatus(status?: string): 'healthy' | 'reorderSoon' | 'critical' | 'overstocked' | 'all' | undefined {
    if (!status || status === 'all') {
      return 'all';
    }

    const normalized = status.toLowerCase();
    if (normalized === 'healthy' || normalized === 'reordersoon' || normalized === 'critical' || normalized === 'overstocked') {
      return normalized === 'reordersoon' ? 'reorderSoon' : normalized;
    }

    throw new AppError('Invalid inventory status filter', {
      statusCode: 400,
      code: 'INVALID_STATUS_FILTER'
    });
  }

  private parseSearchQuery(raw?: string | null): string {
    const value = raw?.trim() ?? '';
    if (!value) {
      return '';
    }

    if (value.length > 128) {
      throw new AppError('Search query is too long', {
        statusCode: 400,
        code: 'INVALID_SEARCH_QUERY'
      });
    }

    return value;
  }

  private parseOptionalString(raw?: string | null): string | undefined {
    const value = raw?.trim();
    return value ? value : undefined;
  }

  private parseOptionalDate(raw?: string | null, fieldName = 'date'): string | undefined {
    const value = raw?.trim();
    if (!value) {
      return undefined;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new AppError(`Invalid ${fieldName} format`, {
        statusCode: 400,
        code: 'INVALID_DATE'
      });
    }

    return value;
  }

  private parsePage(raw?: string | null): number {
    const value = Number(raw ?? 1);
    if (!Number.isInteger(value) || value < 1) {
      throw new AppError('Page must be a positive integer', {
        statusCode: 400,
        code: 'INVALID_PAGE'
      });
    }

    return value;
  }

  private parseLimit(raw?: string | null): number {
    const value = Number(raw ?? 25);
    if (!Number.isInteger(value) || value < 1 || value > 100) {
      throw new AppError('Limit must be between 1 and 100', {
        statusCode: 400,
        code: 'INVALID_LIMIT'
      });
    }

    return value;
  }
}
