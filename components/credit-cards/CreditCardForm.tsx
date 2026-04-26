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
import {
  CreditCard as CardIcon,
  Wifi,
  CheckCircle2,
  AlertTriangle,
  Info,
} from "lucide-react";

const PRESET_COLORS = [
  { hex: "#6366f1", name: "Indigo" },
  { hex: "#ec4899", name: "Pink" },
  { hex: "#f59e0b", name: "Amber" },
  { hex: "#10b981", name: "Emerald" },
  { hex: "#3b82f6", name: "Blue" },
  { hex: "#8b5cf6", name: "Violet" },
  { hex: "#ef4444", name: "Red" },
  { hex: "#14b8a6", name: "Teal" },
  { hex: "#06b6d4", name: "Cyan" },
  { hex: "#a855f7", name: "Purple" },
  { hex: "#f43f5e", name: "Rose" },
  { hex: "#eab308", name: "Yellow" },
];

interface CreditCardFormProps {
  defaultValues?: Partial<CreditCardInput>;
  onSubmit: (data: CreditCardInput) => Promise<void>;
  isLoading?: boolean;
}

function getOrdinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
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

  const bankName = form.watch("bankName");
  const cardName = form.watch("cardName");
  const lastFourDigits = form.watch("lastFourDigits");
  const creditLimit = form.watch("creditLimit");
  const currentBalance = form.watch("currentBalance");
  const selectedColor = form.watch("color");
  const billingCycleDay = form.watch("billingCycleDay");
  const dueDayOffset = form.watch("dueDayOffset");

  const utilization = creditLimit > 0 ? (currentBalance / creditLimit) * 100 : 0;
  const available = creditLimit - currentBalance;

  const utilizationMeta = (() => {
    if (utilization >= 90) return { bar: "from-red-500 to-red-400", text: "text-red-400", warn: true, critical: true };
    if (utilization >= 70) return { bar: "from-amber-500 to-amber-400", text: "text-amber-400", warn: true, critical: false };
    return { bar: "from-[#b4f03a] to-[#94d82d]", text: "text-[#b4f03a]", warn: false, critical: false };
  })();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

        {/* ── Card Preview ── */}
        <div
          className="relative rounded-2xl px-5 py-4 overflow-hidden shadow-lg"
          style={{ background: `linear-gradient(135deg, ${selectedColor} 0%, ${selectedColor}bb 70%, ${selectedColor}80 100%)` }}
        >
          <div className="absolute -top-5 -right-5 w-24 h-24 rounded-full bg-white/10" />
          <div className="absolute -bottom-3 -left-3 w-16 h-16 rounded-full bg-white/5" />
          <div className="relative z-10 flex items-start justify-between mb-4">
            <div>
              <p className="text-white/55 text-[10px] uppercase tracking-widest mb-0.5">Credit Card</p>
              <p className="text-white font-bold text-sm">{bankName || "Your Bank"}</p>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <Wifi size={16} className="text-white/40 rotate-90" />
              <CardIcon size={22} className="text-white/70" />
            </div>
          </div>
          <p className="text-white/75 text-xs font-mono tracking-[0.18em] mb-3">
            •••• •••• •••• <span className="text-white font-bold">{lastFourDigits || "····"}</span>
          </p>
          <div className="flex justify-between items-end">
            <p className="text-white/70 text-xs">{cardName || "Card Type"}</p>
            <div className="text-right">
              <p className="text-white/45 text-[10px] uppercase tracking-wide">Limit</p>
              <p className="text-white font-bold text-xs">₱{Number(creditLimit || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* ── Card Identity ── */}
        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="bankName" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm text-white/75">Bank / Issuer</FormLabel>
              <FormControl><Input className="dashboard-input h-9 text-sm" placeholder="BPI, BDO…" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="cardName" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm text-white/75">Card Name</FormLabel>
              <FormControl><Input className="dashboard-input h-9 text-sm" placeholder="Gold Mastercard" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="lastFourDigits" render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm text-white/75">Last 4 Digits</FormLabel>
            <FormControl>
              <Input className="dashboard-input h-9 text-sm font-mono tracking-widest" placeholder="1234" maxLength={4} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        {/* ── Balance ── */}
        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="creditLimit" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm text-white/75">Credit Limit</FormLabel>
              <FormControl><CurrencyInput className="dashboard-input h-9 text-sm" placeholder="50,000" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="currentBalance" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm text-white/75">Current Balance</FormLabel>
              <FormControl><CurrencyInput className="dashboard-input h-9 text-sm" placeholder="0" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        {/* Utilization bar */}
        {creditLimit > 0 && (
          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/65">Credit utilization</span>
              <span className={`font-bold ${utilizationMeta.text}`}>{utilization.toFixed(0)}% used</span>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${utilizationMeta.bar} rounded-full transition-all`}
                style={{ width: `${Math.min(100, utilization)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-white/55">
              <span>Available: <span className={`font-semibold ${utilizationMeta.text}`}>₱{Math.max(0, available).toLocaleString()}</span></span>
              <span>Limit: ₱{Number(creditLimit).toLocaleString()}</span>
            </div>
            {utilizationMeta.warn && (
              <div className={`flex items-center gap-1.5 text-[10px] rounded-lg px-2.5 py-1.5 border ${
                utilizationMeta.critical
                  ? "bg-red-500/8 border-red-500/15 text-red-400"
                  : "bg-amber-500/8 border-amber-500/15 text-amber-400"
              }`}>
                <AlertTriangle size={11} className="flex-shrink-0" />
                {utilizationMeta.critical
                  ? "High utilization — consider paying down the balance."
                  : "Above 70% may affect your credit score."}
              </div>
            )}
          </div>
        )}

        {/* ── Billing Cycle ── */}
        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="billingCycleDay" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm text-white/75">Cycle Start Day</FormLabel>
              <FormControl>
                <Input className="dashboard-input h-9 text-sm" type="number" min={1} max={31} {...field}
                  onChange={e => field.onChange(parseInt(e.target.value) || 1)} />
              </FormControl>
              <p className="text-xs text-white/50 mt-0.5">Day billing period opens</p>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="dueDayOffset" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm text-white/75">Days Until Due</FormLabel>
              <FormControl>
                <Input className="dashboard-input h-9 text-sm" type="number" min={1} max={30} {...field}
                  onChange={e => field.onChange(parseInt(e.target.value) || 1)} />
              </FormControl>
              <p className="text-xs text-white/50 mt-0.5">Days after cycle start</p>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        {billingCycleDay > 0 && dueDayOffset > 0 && (
          <div className="flex items-center gap-2 rounded-xl border border-indigo-500/15 bg-indigo-500/8 px-3.5 py-2.5 text-xs text-indigo-300">
            <Info size={12} className="text-indigo-400 flex-shrink-0" />
            Bill opens the <strong className="text-white/70">{billingCycleDay}{getOrdinal(billingCycleDay)}</strong>, due <strong className="text-white/70">{dueDayOffset} days</strong> later.
          </div>
        )}

        {/* ── Color ── */}
        <FormField control={form.control} name="color" render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm text-white/75 mb-2 block">Card Color</FormLabel>
            <div className="grid grid-cols-6 gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color.hex}
                  type="button"
                  onClick={() => field.onChange(color.hex)}
                  title={color.name}
                  className="relative h-8 rounded-xl border-2 overflow-hidden transition-all group"
                  style={{
                    backgroundColor: color.hex,
                    borderColor: field.value === color.hex ? "white" : "transparent",
                    boxShadow: field.value === color.hex ? `0 0 10px ${color.hex}70` : "none",
                  }}
                >
                  {field.value === color.hex && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <CheckCircle2 size={13} className="text-white drop-shadow" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/15 transition-colors rounded-xl" />
                </button>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )} />

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-full bg-[#b4f03a] text-[#0c0c10] hover:bg-[#ccff52] h-10 text-sm flex items-center justify-center gap-2 font-medium"
        >
          {isLoading ? "Saving…" : <><CheckCircle2 size={15} /> Save Card</>}
        </Button>
      </form>
    </Form>
  );
}
