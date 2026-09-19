import { z } from 'zod';

export const inventoryItemSchema = z.object({
  sku: z.string().min(1),
  quantity: z.number().int().nonnegative(),
  location: z.string().min(1).optional(),
  updatedAt: z.string().datetime().optional()
});

export type InventoryItemInput = z.infer<typeof inventoryItemSchema>;
