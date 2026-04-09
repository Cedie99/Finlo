import { z } from "zod";

export const budgetCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  icon: z.string().min(1, "Icon is required"),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid color"),
});

export const budgetLimitSchema = z.object({
  budgetCategoryId: z.string().min(1, "Category is required"),
  monthYear: z.string().regex(/^\d{4}-\d{2}$/, "Invalid month format"),
  limitAmount: z.number().positive("Limit must be positive"),
});

export type BudgetCategoryInput = z.infer<typeof budgetCategorySchema>;
export type BudgetLimitInput = z.infer<typeof budgetLimitSchema>;
