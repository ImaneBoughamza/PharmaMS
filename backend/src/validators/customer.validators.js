import { z } from "zod";

export const updateCustomerSchema = z.object({
  params: z.object({
    id: z.string().length(24),
  }),
  body: z.object({
    fullName: z.string().min(2).max(100).trim().optional(),
    phone: z.string().min(8).max(20).trim().optional(),
    email: z.string().email().trim().toLowerCase().optional(),
    notes: z.string().max(1000).optional(),
    insuranceType: z.string().max(50).optional(),
    insuranceNumber: z.string().max(50).optional(),
  }),
});
