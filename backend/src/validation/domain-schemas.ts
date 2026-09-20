import { z } from 'zod';

const nonEmptyString = z.string().trim().min(1, 'Value cannot be empty');
const nonNegativeNumber = z.number().finite().nonnegative();
const positiveNumber = z.number().finite().positive();
const isoTimestamp = z.string().datetime('Invalid timestamp format');

export const inventoryEventTypeSchema = z.enum([
  'SALE',
  'RESTOCK',
  'ADJUSTMENT',
  'TRANSFER_IN',
  'TRANSFER_OUT',
  'RETURN'
]);

export const reorderUrgencySchema = z.enum(['CRITICAL', 'REORDER_SOON', 'HEALTHY', 'OVERSTOCKED']);

export const productSchema = z.object({
  productId: nonEmptyString,
  sku: nonEmptyString,
  name: nonEmptyString,
  category: nonEmptyString,
  supplierId: nonEmptyString,
  supplierName: nonEmptyString,
  unitCost: positiveNumber,
  sellingPrice: positiveNumber,
  reorderPoint: nonNegativeNumber,
  safetyStock: nonNegativeNumber,
  minimumOrderQuantity: z.number().int().finite().positive(),
  packSize: z.number().int().finite().positive()
});

export const supplierSchema = z.object({
  supplierId: nonEmptyString,
  name: nonEmptyString,
  leadTimeDays: z.number().int().nonnegative(),
  reliabilityScore: z.number().min(0).max(100)
});

export const inventoryLocationSchema = z.object({
  locationId: nonEmptyString,
  locationName: nonEmptyString,
  region: nonEmptyString,
  address: nonEmptyString
});

export const inventoryStateSchema = z.object({
  productId: nonEmptyString,
  sku: nonEmptyString,
  locationId: nonEmptyString,
  quantity: nonNegativeNumber,
  reservedQuantity: nonNegativeNumber,
  availableQuantity: nonNegativeNumber,
  reorderPoint: nonNegativeNumber,
  safetyStock: nonNegativeNumber,
  lastUpdated: isoTimestamp
});

export const inventoryEventSchema = z.object({
  eventId: nonEmptyString,
  productId: nonEmptyString,
  sku: nonEmptyString,
  locationId: nonEmptyString,
  eventType: inventoryEventTypeSchema,
  quantityChange: z.number().finite(),
  previousQuantity: nonNegativeNumber,
  newQuantity: nonNegativeNumber,
  timestamp: isoTimestamp,
  source: nonEmptyString
});

export const reorderRecommendationSchema = z.object({
  productId: nonEmptyString,
  sku: nonEmptyString,
  locationId: nonEmptyString,
  currentStock: nonNegativeNumber,
  reservedStock: nonNegativeNumber,
  availableStock: nonNegativeNumber,
  averageDailyDemand: nonNegativeNumber,
  leadTimeDays: z.number().int().nonnegative(),
  safetyStock: nonNegativeNumber,
  reorderPoint: nonNegativeNumber,
  daysOfStockRemaining: z.number().finite().nonnegative(),
  recommendedQuantity: nonNegativeNumber,
  urgency: reorderUrgencySchema,
  reason: nonEmptyString
});

export const createProductSchema = z.object({
  productId: z.string().trim().optional(),
  sku: nonEmptyString,
  name: nonEmptyString,
  category: nonEmptyString,
  supplierId: nonEmptyString,
  supplierName: z.string().trim().optional(),
  unitCost: positiveNumber,
  sellingPrice: positiveNumber,
  reorderPoint: nonNegativeNumber,
  safetyStock: nonNegativeNumber,
  minimumOrderQuantity: z.number().int().finite().positive().default(1),
  packSize: z.number().int().finite().positive().default(1),
  locationId: z.string().trim().optional(),
  initialStock: z.number().int().finite().nonnegative().optional().default(0)
});

export const healthAggregateSchema = z.object({
  locationId: nonEmptyString,
  totalSkus: nonNegativeNumber,
  healthy: nonNegativeNumber,
  reorderSoon: nonNegativeNumber,
  critical: nonNegativeNumber,
  overstocked: nonNegativeNumber,
  lastUpdated: isoTimestamp
});

export type ProductInput = z.infer<typeof productSchema>;
export type SupplierInput = z.infer<typeof supplierSchema>;
export type InventoryLocationInput = z.infer<typeof inventoryLocationSchema>;
export type InventoryStateInput = z.infer<typeof inventoryStateSchema>;
export type InventoryEventInput = z.infer<typeof inventoryEventSchema>;
export type ReorderRecommendationInput = z.infer<typeof reorderRecommendationSchema>;
export type CreateProductSchemaInput = z.infer<typeof createProductSchema>;
export type HealthAggregateInput = z.infer<typeof healthAggregateSchema>;

