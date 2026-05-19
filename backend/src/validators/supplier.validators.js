import { z } from "zod";

const supplierType = z.enum(["grossiste", "laboratoire", "parapharmacy-distributor", "other"]);

export const createSupplierSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(200),
    type: supplierType,
    contact: z.string().min(1).max(100),
    email: z.string().email(),
    phone: z.string().max(30).optional().default(""),
    address: z.string().max(300).optional().default(""),
    notes: z.string().max(500).optional().default(""),
  }),
});

export const updateSupplierSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(200).optional(),
    type: supplierType.optional(),
    contact: z.string().min(1).max(100).optional(),
    email: z.string().email().optional(),
    phone: z.string().max(30).optional(),
    address: z.string().max(300).optional(),
    notes: z.string().max(500).optional(),
  }),
});
