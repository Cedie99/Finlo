"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { transactionSchema, type TransactionInput } from "@/lib/validations/transactions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CurrencyInput } from "@/components/shared/CurrencyInput";
import type { BudgetCategory } from "@/lib/hooks/useBudget";

interface TransactionFormProps {
  categories: BudgetCategory[];
  onSubmit: (data: TransactionInput) => Promise<void>;
  isLoading?: boolean;
}

export function TransactionForm({ categories, onSubmit, isLoading }: TransactionFormProps) {
  const form = useForm<TransactionInput>({
    resolver: zodResolver(transactionSchema) as Resolver<TransactionInput>,
    defaultValues: {
      type: "EXPENSE",
      amount: 0,
      description: "",
      date: new Date().toISOString().split("T")[0],
      budgetCategoryId: null,
      installmentPlanId: null,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="amount" render={({ field }) => (
            <FormItem><FormLabel>Amount</FormLabel><FormControl><CurrencyInput placeholder="500" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="date" render={({ field }) => (
            <FormItem><FormLabel>Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem><FormLabel>Description</FormLabel><FormControl><Input placeholder="Grocery shopping" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="budgetCategoryId" render={({ field }) => (
          <FormItem>
            <FormLabel>Category (optional)</FormLabel>
            <Select onValueChange={field.onChange} value={field.value ?? ""}>
              <FormControl><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger></FormControl>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Adding..." : "Add Transaction"}
        </Button>
      </form>
    </Form>
  );
}
