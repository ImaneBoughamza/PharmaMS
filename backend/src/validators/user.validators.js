import { z } from "zod";

export const createUserSchema = z.object({
  body: z.object({
    fullName: z.string().min(2).max(100),
    email: z.string().email(),
    role: z.enum(["assistant", "cashier"]),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  }).refine((body) => body.password === body.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    fullName: z.string().min(2).max(100).optional(),
    email: z.string().email().optional(),
    role: z.enum(["assistant", "cashier"]).optional(),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(8),
  }).refine((body) => body.newPassword === body.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  }),
});
