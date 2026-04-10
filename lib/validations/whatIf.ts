import { z } from "zod";

export const whatIfScenarioSchema = z.object({
  monthYear: z.string().regex(/^\d{4}-\d{2}$/),
  targetDate: z.string().optional(),
  horizonDays: z.number().int().min(7).max(31).optional(),
  scenario: z.object({
    salaryDelayDays: z.number().int().min(0).max(45).default(0),
    unexpectedExpenseAmount: z.number().min(0).max(100000000).default(0),
    unexpectedExpenseDate: z.string().optional(),
    incomeDropPercent: z.number().min(0).max(100).default(0),
    addedDebtAmount: z.number().min(0).max(100000000).default(0),
  }),
});

export type WhatIfScenarioInput = z.infer<typeof whatIfScenarioSchema>;
