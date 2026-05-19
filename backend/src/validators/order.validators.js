import { z } from "zod";

export const createOrderSchema = z.object({
  body: z.object({
    supplierId: z.string().length(24),
    productType: z.enum(["medicine", "parapharmacy"]),
    items: z.array(z.object({
      productId: z.string().length(24),
      orderedQty: z.number().int().min(1),
    })).min(1),
    notes: z.string().max(500).optional().default(""),
  }),
});

export const updateOrderSchema = z.object({
  body: z.object({
    status: z.enum(["received", "cancelled"]),
  }),
});
