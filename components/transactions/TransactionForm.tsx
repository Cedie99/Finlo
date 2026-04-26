"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { transactionSchema, type TransactionInput } from "@/lib/validations/transactions";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CurrencyInput } from "@/components/shared/CurrencyInput";
import { CheckCircle2 } from "lucide-react";
import type { BudgetCategory } from "@/lib/hooks/useBudget";

interface Props {
  categories: BudgetCategory[];
  onSubmit: (data: TransactionInput) => Promise<void>;
  isLoading?: boolean;
}

export function TransactionForm({ categories, onSubmit, isLoading }: Props) {
  const form = useForm<TransactionInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "EXPENSE",
      amount: 0,
      description: "",
      date: new Date().toISOString().split("T")[0],
      budgetCategoryId: null,
      installmentPlanId: null,
    },
  });

  const type = form.watch("type");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Type toggle */}
        <div className="grid grid-cols-2 gap-2">
          {(["EXPENSE", "INCOME"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => form.setValue("type", t)}
              className={`h-10 rounded-xl border text-sm font-medium transition-all ${
                type === t
                  ? t === "INCOME"
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                    : "border-red-500/40 bg-red-500/10 text-red-400"
                  : "border-white/10 bg-white/[0.03] text-white/50 hover:text-white/70"
              }`}
            >
              {t === "INCOME" ? "Income" : "Expense"}
            </button>
          ))}
        </div>

        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm text-white/75">Description</FormLabel>
            <FormControl>
              <Input className="dashboard-input h-10 text-sm" placeholder="e.g. Grocery run, Salary" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="amount" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm text-white/75">Amount</FormLabel>
              <FormControl>
                <CurrencyInput className="dashboard-input h-10 text-sm" placeholder="0" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="date" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm text-white/75">Date</FormLabel>
              <FormControl>
                <Input className="dashboard-input h-10 text-sm" type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        {categories.length > 0 && (
          <FormField control={form.control} name="budgetCategoryId" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm text-white/75">Category <span className="text-white/40">(optional)</span></FormLabel>
              <Select onValueChange={(v) => field.onChange(v === "none" ? null : v)} value={field.value ?? "none"}>
                <FormControl>
                  <SelectTrigger className="dashboard-input h-10 text-sm">
                    <SelectValue placeholder="Pick a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">No category</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full inline-block" style={{ background: c.color }} />
                        {c.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        )}

        <Button type="submit" disabled={isLoading}
          className="w-full rounded-full bg-[#b4f03a] text-[#0c0c10] hover:bg-[#ccff52] h-10 text-sm font-medium flex items-center justify-center gap-2">
          {isLoading ? "Saving…" : <><CheckCircle2 size={15} /> Save Transaction</>}
        </Button>
      </form>
    </Form>
  );
}
