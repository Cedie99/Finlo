"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { creditCardSchema, type CreditCardInput } from "@/lib/validations/credit-cards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CurrencyInput } from "@/components/shared/CurrencyInput";

const PRESET_COLORS = [
  "#6366f1", "#ec4899", "#f59e0b", "#10b981",
  "#3b82f6", "#8b5cf6", "#ef4444", "#14b8a6",
];

interface CreditCardFormProps {
  defaultValues?: Partial<CreditCardInput>;
  onSubmit: (data: CreditCardInput) => Promise<void>;
  isLoading?: boolean;
}

export function CreditCardForm({ defaultValues, onSubmit, isLoading }: CreditCardFormProps) {
  const form = useForm<CreditCardInput>({
    resolver: zodResolver(creditCardSchema) as Resolver<CreditCardInput>,
    defaultValues: {
      bankName: "",
      cardName: "",
      lastFourDigits: "",
      creditLimit: 0,
      currentBalance: 0,
      billingCycleDay: 1,
      dueDayOffset: 20,
      color: "#6366f1",
      isActive: true,
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="bankName" render={({ field }) => (
            <FormItem>
              <FormLabel>Bank Name</FormLabel>
              <FormControl><Input placeholder="BPI" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="cardName" render={({ field }) => (
            <FormItem>
              <FormLabel>Card Name</FormLabel>
              <FormControl><Input placeholder="Gold Mastercard" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="lastFourDigits" render={({ field }) => (
          <FormItem>
            <FormLabel>Last 4 Digits (optional)</FormLabel>
            <FormControl><Input placeholder="1234" maxLength={4} {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="creditLimit" render={({ field }) => (
            <FormItem>
              <FormLabel>Credit Limit</FormLabel>
              <FormControl><CurrencyInput placeholder="50000" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="currentBalance" render={({ field }) => (
            <FormItem>
              <FormLabel>Current Balance</FormLabel>
              <FormControl><CurrencyInput placeholder="0" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="billingCycleDay" render={({ field }) => (
            <FormItem>
              <FormLabel>Billing Cycle Day</FormLabel>
              <FormControl>
                <Input type="number" min={1} max={31} {...field}
                  onChange={e => field.onChange(parseInt(e.target.value) || 1)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="dueDayOffset" render={({ field }) => (
            <FormItem>
              <FormLabel>Due Day Offset (days)</FormLabel>
              <FormControl>
                <Input type="number" min={1} max={30} {...field}
                  onChange={e => field.onChange(parseInt(e.target.value) || 1)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="color" render={({ field }) => (
          <FormItem>
            <FormLabel>Card Color</FormLabel>
            <div className="flex gap-2 flex-wrap pt-1">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => field.onChange(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    field.value === c ? "border-gray-800 scale-110" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )} />

        <Button type="submit" disabled={isLoading} className="w-full rounded-full bg-[#245bff] hover:bg-[#1a47cc] h-11">
          {isLoading ? "Saving..." : "Save Card"}
        </Button>
      </form>
    </Form>
  );
}
