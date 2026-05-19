import { z } from "zod";

const objectId = z.string().length(24);
const dateString = z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
  message: "Invalid date",
});

export const createMedicineSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(200),
    genericName: z.string().max(200).optional().default(""),
    category: z.enum(["prescription", "non-prescription", "regulated"]),
    unit: z.enum(["tablet", "capsule", "ml", "g", "unit", "other"]).default("unit"),
    supplierId: objectId,
    purchasePrice: z.number().min(0),
    salePrice: z.number().min(0),
    minStockLevel: z.number().int().min(0).default(0),
    initialBatch: z.object({
      batchNumber: z.string().min(1).max(100),
      expiryDate: dateString,
      receivedQty: z.number().int().min(1),
    }),
  }),
});

export const updateMedicineSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(200).optional(),
    genericName: z.string().max(200).optional(),
    category: z.enum(["prescription", "non-prescription", "regulated"]).optional(),
    unit: z.enum(["tablet", "capsule", "ml", "g", "unit", "other"]).optional(),
    supplierId: objectId.optional(),
    purchasePrice: z.number().min(0).optional(),
    salePrice: z.number().min(0).optional(),
    minStockLevel: z.number().int().min(0).optional(),
  }),
});
