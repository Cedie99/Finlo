import { z } from "zod";

export const updateUserPreferencesSchema = z.object({
  minimumCashBuffer: z.number().min(0).max(100000000).nullable().optional(),
  bufferPercentage: z.number().gt(0).max(100).optional(),
  paydayDaysOfMonth: z.array(z.number().int().min(1).max(31)).min(1).max(4).optional(),
  enableDailyDigest: z.boolean().optional(),
});

export type UpdateUserPreferencesInput = z.infer<typeof updateUserPreferencesSchema>;
