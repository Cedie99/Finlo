"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { recurringTransactionSchema, type RecurringTransactionInput } from "@/lib/validations/transactions";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CurrencyInput } from "@/components/shared/CurrencyInput";
import { CheckCircle2 } from "lucide-react";
import type { BudgetCategory } from "@/lib/hooks/useBudget";

interface Props {
  categories: BudgetCategory[];
  onSubmit: (data: RecurringTransactionInput) => Promise<void>;
  isLoading?: boolean;
}

const FREQUENCIES = [
  { value: "WEEKLY", label: "Weekly" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "YEARLY", label: "Yearly" },
];

export function RecurringTransactionForm({ categories, onSubmit, isLoading }: Props) {
  const form = useForm<RecurringTransactionInput>({
    resolver: zodResolver(recurringTransactionSchema),
    defaultValues: {
      type: "EXPENSE",
      amount: 0,
      description: "",
      frequency: "MONTHLY",
      startDate: new Date().toISOString().split("T")[0],
      endDate: null,
      dayOfMonth: null,
      budgetCategoryId: null,
    },
  });

  const type = form.watch("type");
  const frequency = form.watch("frequency");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Type toggle */}
        <div className="grid grid-cols-2 gap-2">
          {(["EXPENSE", "INCOME"] as const).map((t) => (
            <button key={t} type="button" onClick={() => form.setValue("type", t)}
              className={`h-10 rounded-xl border text-sm font-medium transition-all ${
                type === t
                  ? t === "INCOME" ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" : "border-red-500/40 bg-red-500/10 text-red-400"
                  : "border-white/10 bg-white/[0.03] text-white/50 hover:text-white/70"
              }`}>
              {t === "INCOME" ? "Income" : "Expense"}
            </button>
          ))}
        </div>

        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm text-white/75">Description</FormLabel>
            <FormControl>
              <Input className="dashboard-input h-10 text-sm" placeholder="e.g. Rent, Netflix, Salary" {...field} />
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
          <FormField control={form.control} name="frequency" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm text-white/75">Frequency</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="dashboard-input h-10 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {FREQUENCIES.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        {frequency === "MONTHLY" && (
          <FormField control={form.control} name="dayOfMonth" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm text-white/75">Day of month <span className="text-white/40">(optional)</span></FormLabel>
              <FormControl>
                <Input className="dashboard-input h-10 text-sm" type="number" min={1} max={28} placeholder="e.g. 15"
                  value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        )}

        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="startDate" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm text-white/75">Start Date</FormLabel>
              <FormControl>
                <Input className="dashboard-input h-10 text-sm" type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="endDate" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm text-white/75">End Date <span className="text-white/40">(opt.)</span></FormLabel>
              <FormControl>
                <Input className="dashboard-input h-10 text-sm" type="date"
                  value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value || null)} />
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
                  <SelectTrigger className="dashboard-input h-10 text-sm"><SelectValue placeholder="Pick a category" /></SelectTrigger>
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
          {isLoading ? "Saving…" : <><CheckCircle2 size={15} /> Save Recurring</>}
        </Button>
      </form>
    </Form>
  );
}
