import { z } from "zod";

export const expiryThresholdSchema = z.object({
  body: z.object({
    thresholdDays: z.number().int().min(1).max(365),
  }),
});

export const adjustStockSchema = z.object({
  body: z.object({
    productType: z.enum(["medicine", "parapharmacy"]),
    productId: z.string().length(24),
    batchId: z.string().length(24).optional(),
    adjustmentType: z.enum(["add", "subtract"]),
    quantity: z.number().int().min(1),
    reason: z.string().min(3).max(500),
  }),
});

export const returnBatchSchema = z.object({
  body: z.object({
    batchId: z.string().length(24),
    returnQty: z.number().int().min(1),
    reason: z.string().min(3).max(500),
    notes: z.string().max(500).optional().default(""),
  }),
});
