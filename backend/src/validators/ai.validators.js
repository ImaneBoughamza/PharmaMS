import { z } from "zod";

const optionalTrimmedString = (max = 1000) =>
  z.preprocess((value) => {
    if (typeof value !== "string") return value;
    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
  }, z.string().max(max).optional());

const optionalEmail = z.preprocess((value) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim().toLowerCase();
  return trimmed.length ? trimmed : undefined;
}, z.string().email().optional());

export const scanPrescriptionSchema = z.object({
  body: z.object({
    base64Image: z.string().min(1),
    mediaType: z
      .enum(["image/jpeg", "image/jpg", "image/png"])
      .transform((value) => (value === "image/jpg" ? "image/jpeg" : value)),
    patientNotes: optionalTrimmedString(1000).default(""),
    patientName: optionalTrimmedString(100),
    patientPhone: optionalTrimmedString(30),
    patientEmail: optionalEmail,
    saveImage: z.boolean().optional().default(false),
  }),
});

const medicineSchema = z.object({
  name: z.string().min(1).max(200),
  manual: z.boolean().optional().default(false),
});

const suggestionSchema = z.object({
  productId: z.string().length(24),
  name: z.string().min(1).max(200).optional(),
  brand: z.string().max(100).optional().nullable(),
  category: z.string().max(100).optional(),
  salePrice: z.number().min(0).optional(),
  price: z.number().min(0).optional(),
  stockQty: z.number().min(0).optional(),
  stock: z.number().min(0).optional(),
  rationale: z.string().min(1).max(1000),
});

export const recommendSchema = z.object({
  body: z.object({
    medicines: z.array(medicineSchema).min(1),
    patientNotes: optionalTrimmedString(1000).default(""),
  }),
});

export const saveConsultationSchema = z.object({
  body: z.object({
    patientName: optionalTrimmedString(100),
    patientPhone: optionalTrimmedString(30),
    patientEmail: optionalEmail,
    patientNotes: optionalTrimmedString(1000).default(""),
    extractedMedicines: z.array(medicineSchema).min(1),
    suggestions: z.array(suggestionSchema).default([]),
    prescriptionImage: z.string().max(8_000_000).optional(),
    prescriptionImageType: z.enum(["image/jpeg", "image/png"]).optional(),
    saveImage: z.boolean().optional().default(false),
  }),
});
