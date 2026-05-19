import { z } from "zod";

export const createBatchSchema = z.object({
  body: z.object({
    medicineId: z.string().length(24),
    batchNumber: z.string().min(1).max(100),
    expiryDate: z.string().datetime(),
    receivedQty: z.number().int().min(1),
    purchasePrice: z.number().min(0),
    salePrice: z.number().min(0),
  }),
});
