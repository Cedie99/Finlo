"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { recurringTransactionSchema, type RecurringTransactionInput } from "@/lib/validations/transactions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CurrencyInput } from "@/components/shared/CurrencyInput";
import type { BudgetCategory } from "@/lib/hooks/useBudget";

interface Props {
  categories: BudgetCategory[];
  onSubmit: (data: RecurringTransactionInput) => Promise<void>;
  isLoading?: boolean;
}

export function RecurringTransactionForm({ categories, onSubmit, isLoading }: Props) {
  const form = useForm<RecurringTransactionInput>({
    resolver: zodResolver(recurringTransactionSchema) as Resolver<RecurringTransactionInput>,
    defaultValues: {
      type: "EXPENSE",
      amount: 0,
      description: "",
      frequency: "MONTHLY",
      dayOfMonth: null,
      startDate: new Date().toISOString().split("T")[0],
      endDate: null,
      budgetCategoryId: null,
    },
  });

  const frequency = form.watch("frequency");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="type" render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="EXPENSE">Expense</SelectItem>
                  <SelectItem value="INCOME">Income</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="frequency" render={({ field }) => (
            <FormItem>
              <FormLabel>Frequency</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="WEEKLY">Weekly</SelectItem>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                  <SelectItem value="YEARLY">Yearly</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl><Input placeholder="Netflix, Rent, Salary…" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="amount" render={({ field }) => (
            <FormItem><FormLabel>Amount</FormLabel><FormControl><CurrencyInput placeholder="500" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          {(frequency === "MONTHLY" || frequency === "YEARLY") && (
            <FormField control={form.control} name="dayOfMonth" render={({ field }) => (
              <FormItem>
                <FormLabel>Day of month</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={28}
                    placeholder="e.g. 15"
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="startDate" render={({ field }) => (
            <FormItem><FormLabel>Start date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="endDate" render={({ field }) => (
            <FormItem>
              <FormLabel>End date (optional)</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value || null)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="budgetCategoryId" render={({ field }) => (
          <FormItem>
            <FormLabel>Category (optional)</FormLabel>
            <Select onValueChange={field.onChange} value={field.value ?? ""}>
              <FormControl><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger></FormControl>
              <SelectContent>
                {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Saving…" : "Create Recurring Transaction"}
        </Button>
      </form>
    </Form>
  );
}
