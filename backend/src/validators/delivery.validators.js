import { z } from "zod";

const dateString = z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
  message: "Invalid date",
});

export const createDeliverySchema = z.object({
  body: z.object({
    supplierId: z.string().length(24),
    deliveryDate: dateString.optional(),
    orderId: z.string().length(24).optional(),
    medicineItems: z.array(z.object({
      medicineId: z.string().length(24),
      batchNumber: z.string().min(1).max(100),
      expiryDate: dateString,
      receivedQty: z.number().int().min(1),
      purchasePrice: z.number().min(0),
      salePrice: z.number().min(0),
    })).optional().default([]),
    parapharmacyItems: z.array(z.object({
      productId: z.string().length(24),
      receivedQty: z.number().int().min(1),
      purchasePrice: z.number().min(0),
    })).optional().default([]),
    notes: z.string().max(500).optional().default(""),
  }).refine(
    (body) => body.medicineItems.length > 0 || body.parapharmacyItems.length > 0,
    { message: "Delivery must contain at least one item", path: ["medicineItems"] }
  ),
});
