import { z } from "zod";

export const creditCardSchema = z.object({
  bankName: z.string().min(1, "Bank name is required"),
  cardName: z.string().min(1, "Card name is required"),
  lastFourDigits: z
    .string()
    .length(4, "Must be 4 digits")
    .regex(/^\d{4}$/, "Must be 4 digits")
    .optional()
    .or(z.literal("")),
  creditLimit: z.number().positive("Credit limit must be positive"),
  currentBalance: z.number().min(0, "Balance cannot be negative"),
  billingCycleDay: z.number().int().min(1).max(31, "Day must be between 1 and 31"),
  dueDayOffset: z.number().int().min(1).max(30),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid color"),
  isActive: z.boolean().default(true),
});

export type CreditCardInput = z.infer<typeof creditCardSchema>;
