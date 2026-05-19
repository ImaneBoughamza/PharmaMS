import { z } from "zod";

const category = z.enum(["cosmetics", "supplements", "medical-device", "hygiene", "other"]);

export const createParapharmacySchema = z.object({
  body: z.object({
    name: z.string().min(2).max(200),
    brand: z.string().max(100).optional().default(""),
    category,
    supplierId: z.string().length(24),
    purchasePrice: z.number().min(0),
    salePrice: z.number().min(0),
    stockQty: z.number().int().min(0).default(0),
    minStockLevel: z.number().int().min(0).default(0),
  }),
});

export const updateParapharmacySchema = z.object({
  body: z.object({
    name: z.string().min(2).max(200).optional(),
    brand: z.string().max(100).optional(),
    category: category.optional(),
    supplierId: z.string().length(24).optional(),
    purchasePrice: z.number().min(0).optional(),
    salePrice: z.number().min(0).optional(),
    stockQty: z.number().int().min(0).optional(),
    minStockLevel: z.number().int().min(0).optional(),
  }),
});
