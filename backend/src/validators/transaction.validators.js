import { z } from "zod";

export const closeDaySchema = z.object({
  body: z.object({
    confirmedDiscrepancies: z.boolean().optional().default(false),
  }),
});
