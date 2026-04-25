"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { installmentSchema, type InstallmentInput } from "@/lib/validations/installments";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CurrencyInput } from "@/components/shared/CurrencyInput";
import { generatePaymentSchedule } from "@/lib/utils/installments";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/dates";
import type { CreditCard } from "@/lib/hooks/useCreditCards";
import { BrandLogo } from "@/components/shared/BrandLogo";

interface InstallmentFormProps {
  creditCards: CreditCard[];
  onSubmit: (data: InstallmentInput) => Promise<void>;
  isLoading?: boolean;
}

export function InstallmentForm({
  creditCards,
  onSubmit,
  isLoading,
}: InstallmentFormProps) {
  const [step, setStep] = useState(1);
  const [preview, setPreview] = useState<
    ReturnType<typeof generatePaymentSchedule>
  >([]);

  const form = useForm<InstallmentInput>({
    resolver: zodResolver(installmentSchema) as Resolver<InstallmentInput>,
    defaultValues: {
      name: "",
      type: "CREDIT_CARD",
      totalAmount: 0,
      monthlyAmount: 0,
      totalMonths: 12,
      startDate: new Date().toISOString().split("T")[0],
      creditCardId: null,
      interestRate: null,
      lenderName: null,
      notes: null,
    },
  });

  function handlePreview() {
    const values = form.getValues();
    if (values.totalAmount && values.monthlyAmount && values.totalMonths && values.startDate) {
      const schedule = generatePaymentSchedule(
        new Date(values.startDate),
        values.totalAmount,
        values.monthlyAmount,
        values.totalMonths
      );
      setPreview(schedule);
      setStep(3);
    }
  }

  if (step === 1) {
    return (
      <div className="space-y-4">
        <h3 className="font-medium text-sm text-white/50">Step 1 of 3 — Select Type</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: "CREDIT_CARD", label: "Credit Card", desc: "Card installment" },
            { value: "LOAN", label: "Loan", desc: "Personal/Bank loan" },
            { value: "BNPL", label: "BNPL", desc: "Buy Now Pay Later" },
          ].map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => {
                form.setValue("type", t.value as InstallmentInput["type"]);
                setStep(2);
              }}
              className="p-4 rounded-lg border-2 border-white/[0.07] hover:border-[#b4f03a]/40 bg-[#111118] text-left transition-colors"
            >
              <div className="font-medium text-sm text-white">{t.label}</div>
              <div className="text-xs text-white/40">{t.desc}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="space-y-4">
        <h3 className="font-medium text-sm text-white/50">Step 3 of 3 — Preview Schedule</h3>
        <div className="max-h-64 overflow-y-auto border border-white/[0.07] bg-[#111118] rounded-lg divide-y divide-white/[0.04] text-sm">
          {preview.slice(0, 6).map((p) => (
            <div key={p.monthNumber} className="flex justify-between px-3 py-2">
              <span className="text-white/50">
                Month {p.monthNumber} — {formatDate(p.dueDate)}
              </span>
              <span className="font-medium text-white">{formatCurrency(p.amount)}</span>
            </div>
          ))}
          {preview.length > 6 && (
            <div className="px-3 py-2 text-white/40 text-xs">
              +{preview.length - 6} more months...
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setStep(2)}
            className="flex-1"
          >
            ← Back
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? "Creating..." : "Create Plan"}
          </Button>
        </div>
      </div>
    );
  }

  const type = form.watch("type");

  return (
    <Form {...form}>
      <form className="space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="text-xs text-[#b4f03a] hover:underline"
          >
            ← Change type
          </button>
          <span className="text-xs text-white/50">
            Step 2 of 3 — Type: <strong className="text-white">{type}</strong>
          </span>
        </div>

        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>Plan Name</FormLabel>
            <FormControl><Input placeholder="iPhone 15 Pro" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        {type === "CREDIT_CARD" && creditCards.length > 0 && (
          <FormField control={form.control} name="creditCardId" render={({ field }) => (
            <FormItem>
              <FormLabel>Credit Card (optional)</FormLabel>
              <Select onValueChange={field.onChange} value={field.value ?? ""}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Select card" /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  {creditCards.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      <span className="inline-flex items-center gap-1.5">
                        <BrandLogo
                          name={`${c.bankName} ${c.cardName}`}
                          size={14}
                          className="bg-white/10 text-white/70"
                        />
                        {c.bankName} — {c.cardName}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        )}

        {(type === "LOAN" || type === "BNPL") && (
          <FormField control={form.control} name="lenderName" render={({ field }) => (
            <FormItem>
              <FormLabel>Lender / Provider</FormLabel>
              <FormControl>
                <Input placeholder="BDO / Akulaku" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="totalAmount" render={({ field }) => (
            <FormItem>
              <FormLabel>Total Amount</FormLabel>
              <FormControl><CurrencyInput placeholder="10000" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="monthlyAmount" render={({ field }) => (
            <FormItem>
              <FormLabel>Monthly Payment</FormLabel>
              <FormControl><CurrencyInput placeholder="1000" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="totalMonths" render={({ field }) => (
            <FormItem>
              <FormLabel>Total Months</FormLabel>
              <FormControl>
                <Input type="number" min={1} {...field}
                  onChange={e => field.onChange(parseInt(e.target.value) || 1)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="startDate" render={({ field }) => (
            <FormItem>
              <FormLabel>Start Date</FormLabel>
              <FormControl><Input type="date" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="interestRate" render={({ field }) => (
          <FormItem>
            <FormLabel>Interest Rate % (optional)</FormLabel>
            <FormControl>
              <Input type="number" step="0.01" placeholder="0"
                value={field.value ?? ""}
                onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : null)} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="notes" render={({ field }) => (
          <FormItem>
            <FormLabel>Notes (optional)</FormLabel>
            <FormControl>
              <Input placeholder="Additional notes" {...field} value={field.value ?? ""} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <Button type="button" onClick={handlePreview} className="w-full">
          Preview Schedule →
        </Button>
      </form>
    </Form>
  );
}
