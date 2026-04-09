import { z } from "zod";

export const recurringTransactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  amount: z.number().positive("Amount must be positive"),
  description: z.string().min(1, "Description is required"),
  frequency: z.enum(["WEEKLY", "MONTHLY", "YEARLY"]),
  dayOfMonth: z.number().min(1).max(28).optional().nullable(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional().nullable(),
  budgetCategoryId: z.string().optional().nullable(),
});

export type RecurringTransactionInput = z.infer<typeof recurringTransactionSchema>;

export const transactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  amount: z.number().positive("Amount must be positive"),
  description: z.string().min(1, "Description is required"),
  date: z.string().min(1, "Date is required"),
  budgetCategoryId: z.string().optional().nullable(),
  installmentPlanId: z.string().optional().nullable(),
});

export const incomeSchema = z.object({
  source: z.string().min(1, "Source is required"),
  amount: z.number().positive("Amount must be positive"),
  monthYear: z.string().regex(/^\d{4}-\d{2}$/, "Invalid month format"),
  receivedAt: z.string().optional().nullable(),
});

export type TransactionInput = z.infer<typeof transactionSchema>;
export type IncomeInput = z.infer<typeof incomeSchema>;
