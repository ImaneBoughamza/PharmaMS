import { z } from "zod";

const reservationItem = z.object({
  productType: z.enum(["medicine", "parapharmacy"]),
  productId: z.string().length(24),
  qty: z.number().int().min(1),
});

export const submitReservationSchema = z.object({
  body: z.object({
    customerName: z.string().min(2).max(100).trim(),
    customerPhone: z.string().min(8).max(20).trim(),
    customerEmail: z.string().email().trim().toLowerCase(),
    items: z.array(reservationItem).min(1),
    paymentMethod: z.enum(["online", "pay-on-pickup"]).default("pay-on-pickup"),
    notes: z.string().max(500).optional().default(""),
    prescriptionImage: z.string().max(8_000_000).optional(),
    prescriptionImageName: z.string().max(200).optional(),
    prescriptionImageType: z.enum(["image/jpeg", "image/png"]).optional(),
  }),
});

export const updateByCodeSchema = z.object({
  params: z.object({
    code: z.string().min(1),
  }),
  body: z.object({
    items: z.array(reservationItem).min(1).optional(),
    paymentMethod: z.enum(["online", "pay-on-pickup"]).optional(),
    notes: z.string().max(500).optional(),
    prescriptionImage: z.string().max(8_000_000).optional(),
    prescriptionImageName: z.string().max(200).optional(),
    prescriptionImageType: z.enum(["image/jpeg", "image/png"]).optional(),
  }),
});

export const updateReservationByCodeSchema = updateByCodeSchema;

export const rejectReservationSchema = z.object({
  body: z.object({
    reason: z.string().min(10).max(500),
  }),
});

export const verifyPrescriptionSchema = z.object({
  body: z.object({
    verified: z.boolean(),
  }),
});
