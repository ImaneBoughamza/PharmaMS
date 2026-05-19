import { z } from "zod";

export const createSaleSchema = z.object({
  body: z
    .object({
      items: z
        .array(
          z.object({
            medicineId: z.string().length(24),
            qty: z.number().int().min(1),
          }),
        )
        .optional()
        .default([]),
      parapharmacyItems: z
        .array(
          z.object({
            productId: z.string().length(24),
            qty: z.number().int().min(1),
          }),
        )
        .optional()
        .default([]),
      paymentMethod: z.enum(["cash", "card"]),
      reservationId: z.string().length(24).optional(),
      prescriptionImage: z
        .object({
          filename: z.string().max(255).optional(),
          mimeType: z.enum(["image/jpeg", "image/png"]),
          size: z
            .number()
            .int()
            .positive()
            .max(10 * 1024 * 1024),
          dataUrl: z.string().startsWith("data:image/"),
        })
        .optional(),
    })
    .refine(
      (body) => body.items.length > 0 || body.parapharmacyItems.length > 0,
      { message: "Sale must contain at least one item", path: ["items"] },
    ),
});

export const voidSaleSchema = z.object({
  body: z.object({
    reason: z.string().min(10).max(500),
  }),
});

export const approvalResponseSchema = z.object({
  body: z.object({
    approved: z.boolean(),
    reason: z.string().max(500).optional(),
  }),
});
