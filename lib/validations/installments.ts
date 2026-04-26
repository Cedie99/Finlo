import { z } from "zod";

export const installmentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  type: z.enum(["CREDIT_CARD", "LOAN", "BNPL"]),
  creditCardId: z.string().optional().nullable(),
  totalAmount: z.number().positive("Total amount must be positive"),
  monthlyAmount: z.number().positive("Monthly amount must be positive"),
  totalMonths: z.number().int().min(1).max(360),
  startDate: z.string().min(1, "Start date is required"),
  interestRate: z.number().min(0).max(100).optional().nullable(),
  processingFee: z.number().min(0).optional().nullable(),
  lenderName: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type InstallmentInput = z.infer<typeof installmentSchema>;
