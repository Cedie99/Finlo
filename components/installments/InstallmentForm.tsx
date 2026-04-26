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
import { ProviderSelector, AutoFilledBadge } from "@/components/installments/ProviderSelector";
import { generatePaymentSchedule } from "@/lib/utils/installments";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/dates";
import { calcProcessingFee, type ProviderEntry } from "@/lib/data/providerRegistry";
import type { CreditCard } from "@/lib/hooks/useCreditCards";
import {
  CreditCard as CreditCardIcon,
  Building2,
  Smartphone,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Calendar,
  Info,
  ChevronRight,
  HelpCircle,
} from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

interface InstallmentFormProps {
  creditCards: CreditCard[];
  onSubmit: (data: InstallmentInput) => Promise<void>;
  isLoading?: boolean;
}

const TYPE_OPTIONS = [
  {
    value: "CREDIT_CARD",
    label: "Credit Card",
    desc: "Purchases split through your credit card",
    icon: CreditCardIcon,
    examples: ["BPI", "BDO", "Metrobank"],
    accent: "#6366f1",
  },
  {
    value: "LOAN",
    label: "Bank Loan",
    desc: "Personal or salary loans with fixed terms",
    icon: Building2,
    examples: ["SSS", "Pag-IBIG", "Cash Loan"],
    accent: "#10b981",
  },
  {
    value: "BNPL",
    label: "Buy Now Pay Later",
    desc: "Zero-interest splits from BNPL apps",
    icon: Smartphone,
    examples: ["SPayLater", "TikTok", "Atome"],
    accent: "#f59e0b",
  },
];

function StepDots({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-1.5 mb-5">
      {[1, 2, 3].map((s) => (
        <div
          key={s}
          className={`h-1 rounded-full transition-all ${
            s === current
              ? "w-6 bg-[#b4f03a]"
              : s < current
              ? "w-3 bg-[#b4f03a]/40"
              : "w-3 bg-white/15"
          }`}
        />
      ))}
      <span className="ml-1 text-[11px] text-white/50">
        {current === 1 ? "Choose type" : current === 2 ? "Fill details" : "Confirm"}
      </span>
    </div>
  );
}

export function InstallmentForm({
  creditCards,
  onSubmit,
  isLoading,
}: InstallmentFormProps) {
  const [step, setStep] = useState(1);
  const [preview, setPreview] = useState<ReturnType<typeof generatePaymentSchedule>>([]);
  const [autoFilled, setAutoFilled] = useState(false);

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
      processingFee: null,
      lenderName: null,
      notes: null,
    },
  });

  function handleProviderSelect(provider: ProviderEntry | null) {
    if (provider && provider.id !== "other") {
      const totalAmount = form.getValues("totalAmount") ?? 0;
      // For PayLater providers, prefer serviceFeePercent from payLaterDetails
      // over the legacy processingFeePercent, then fall back to calcProcessingFee.
      let fee = 0;
      if (provider.payLaterDetails?.serviceFeePercent != null) {
        fee = (provider.payLaterDetails.serviceFeePercent / 100) * totalAmount;
      } else {
        fee = calcProcessingFee(provider, totalAmount);
      }
      form.setValue("interestRate", provider.interestRate);
      form.setValue("processingFee", fee > 0 ? fee : null);
      // Append PayLater mechanic note to the notes field so users understand what they're signing up for
      if (provider.payLaterDetails) {
        const existingNotes = form.getValues("notes") ?? "";
        if (!existingNotes) {
          form.setValue("notes", provider.payLaterDetails.mechanicNote);
        }
      }
      setAutoFilled(true);
    } else {
      setAutoFilled(false);
    }
  }

  function handlePreview() {
    const v = form.getValues();
    if (v.totalAmount && v.monthlyAmount && v.totalMonths && v.startDate) {
      setPreview(
        generatePaymentSchedule(
          new Date(v.startDate),
          v.totalAmount,
          v.monthlyAmount,
          v.totalMonths
        )
      );
      setStep(3);
    }
  }

  // ── Step 1 ────────────────────────────────────────────────────────────────
  if (step === 1) {
    return (
      <div>
        <StepDots current={1} />
        <p className="text-sm text-white/70 mb-4">What type of installment is this?</p>
        <div className="space-y-2">
          {TYPE_OPTIONS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => {
                  form.setValue("type", t.value as InstallmentInput["type"]);
                  setStep(2);
                }}
                className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl border border-white/10 hover:border-white/20 bg-white/[0.03] hover:bg-white/[0.06] transition-all group"
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${t.accent}15`, border: `1px solid ${t.accent}28` }}
                >
                  <Icon size={17} style={{ color: t.accent }} />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-white">{t.label}</p>
                  <p className="text-xs text-white/55 mt-0.5">{t.desc}</p>
                </div>
                <div className="flex gap-1 mr-1">
                  {t.examples.map((ex) => (
                    <span key={ex} className="text-[10px] px-1.5 py-0.5 rounded bg-white/8 text-white/50 hidden sm:inline">
                      {ex}
                    </span>
                  ))}
                </div>
                <ChevronRight size={15} className="text-white/20 group-hover:text-white/40 flex-shrink-0 transition-colors" />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Step 3 ────────────────────────────────────────────────────────────────
  if (step === 3) {
    const planName = form.watch("name");
    const totalMonths = form.watch("totalMonths");
    const monthlyAmount = form.watch("monthlyAmount");
    const totalAmount = form.watch("totalAmount");
    const processingFeeVal = form.watch("processingFee") ?? 0;
    const type = form.watch("type");
    const typeInfo = TYPE_OPTIONS.find((t) => t.value === type)!;
    const TypeIcon = typeInfo.icon;
    const totalCost = monthlyAmount * totalMonths;
    const interest = totalCost - totalAmount;
    const trueTotalCost = totalCost + processingFeeVal;

    return (
      <div>
        <StepDots current={3} />

        {/* Plan identity */}
        <div
          className="flex items-center gap-3 rounded-xl px-4 py-3 mb-4 border"
          style={{ background: `${typeInfo.accent}0c`, borderColor: `${typeInfo.accent}22` }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: `${typeInfo.accent}18` }}
          >
            <TypeIcon size={16} style={{ color: typeInfo.accent }} />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">{planName || "Unnamed Plan"}</p>
            <p className="text-xs text-white/60">{typeInfo.label}</p>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3 text-center">
            <p className="text-[10px] text-white/55 uppercase tracking-wide mb-1">Total</p>
            <p className="font-bold text-sm text-white">{formatCurrency(totalAmount)}</p>
          </div>
          <div className="rounded-xl border p-3 text-center" style={{ background: "#b4f03a0d", borderColor: "#b4f03a28" }}>
            <p className="text-[10px] text-[#b4f03a]/60 uppercase tracking-wide mb-1">Monthly</p>
            <p className="font-bold text-sm text-[#b4f03a]">{formatCurrency(monthlyAmount)}</p>
          </div>
          <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3 text-center">
            <p className="text-[10px] text-white/55 uppercase tracking-wide mb-1">Duration</p>
            <p className="font-bold text-sm text-white">{totalMonths}<span className="text-white/55 text-xs font-normal">mo</span></p>
          </div>
        </div>

        {/* Processing fee note */}
        {processingFeeVal > 0 && (
          <div className="flex items-center justify-between rounded-xl px-3.5 py-2.5 mb-2 text-xs border bg-amber-500/8 border-amber-500/15 text-amber-400">
            <div className="flex items-center gap-2">
              <Info size={13} className="flex-shrink-0" />
              <span>Processing Fee</span>
            </div>
            <span className="font-semibold">+{formatCurrency(processingFeeVal)}</span>
          </div>
        )}

        {/* Interest note */}
        {interest !== 0 && (
          <div className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 mb-4 text-xs border ${
            interest > 0
              ? "bg-red-500/8 border-red-500/15 text-red-400"
              : "bg-emerald-500/8 border-emerald-500/15 text-emerald-400"
          }`}>
            <Info size={13} className="flex-shrink-0" />
            {interest > 0
              ? `+${formatCurrency(interest)} in interest over ${totalMonths} months · True total: ${formatCurrency(trueTotalCost)}`
              : `No extra interest — saves ${formatCurrency(Math.abs(interest))}`}
          </div>
        )}

        {/* Schedule */}
        <div className="border border-white/10 rounded-xl overflow-hidden mb-5">
          <div className="px-3.5 py-2 border-b border-white/8 flex items-center gap-1.5">
            <Calendar size={12} className="text-white/50" />
            <span className="text-[11px] font-semibold text-white/60 uppercase tracking-wide">Payment Schedule</span>
          </div>
          {preview.slice(0, 5).map((p, i) => (
            <div key={p.monthNumber} className="flex justify-between items-center px-3.5 py-2.5 text-xs border-b border-white/[0.05] last:border-0 hover:bg-white/[0.03] transition-colors">
              <div className="flex items-center gap-2.5">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                  i === 0 ? "bg-[#b4f03a]/20 text-[#b4f03a]" : "bg-white/8 text-white/55"
                }`}>{p.monthNumber}</span>
                <span className="text-white/70">{formatDate(p.dueDate)}</span>
              </div>
              <span className="font-semibold text-white">{formatCurrency(p.amount)}</span>
            </div>
          ))}
          {preview.length > 5 && (
            <div className="px-3.5 py-2 text-white/50 text-xs">
              +{preview.length - 5} more payments
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setStep(2)}
            className="flex items-center gap-1.5 bg-white/5 border-white/10 text-white hover:bg-white/10 h-10 text-sm px-4"
          >
            <ArrowLeft size={14} /> Back
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={isLoading}
            className="flex-1 rounded-full bg-[#b4f03a] text-[#0c0c10] hover:bg-[#ccff52] h-10 text-sm flex items-center justify-center gap-1.5 font-medium"
          >
            {isLoading ? "Creating…" : <><CheckCircle2 size={15} /> Confirm & Create</>}
          </Button>
        </div>
      </div>
    );
  }

  // ── Step 2 ────────────────────────────────────────────────────────────────
  const type = form.watch("type");
  const totalAmount = form.watch("totalAmount");
  const monthlyAmount = form.watch("monthlyAmount");
  const totalMonths = form.watch("totalMonths");
  const typeInfo = TYPE_OPTIONS.find((t) => t.value === type)!;
  const TypeIcon = typeInfo.icon;
  const totalCost = monthlyAmount * totalMonths;
  const interest = totalCost - totalAmount;
  const canPreview = totalAmount > 0 && monthlyAmount > 0 && totalMonths > 0;

  return (
    <Form {...form}>
      <form className="space-y-0">
        <StepDots current={2} />

        {/* Type pill + change */}
        <div className="flex items-center gap-2 mb-4">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="text-xs text-white/50 hover:text-white/80 flex items-center gap-1 transition-colors"
          >
            <ArrowLeft size={11} /> Change type
          </button>
          <div
            className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border font-medium"
            style={{ background: `${typeInfo.accent}0d`, borderColor: `${typeInfo.accent}25`, color: typeInfo.accent }}
          >
            <TypeIcon size={12} />
            {typeInfo.label}
          </div>
        </div>

        {/* ── Section: Identity ── */}
        <div className="space-y-3 mb-4">
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm text-white/75">Item / Plan Name</FormLabel>
              <FormControl>
                <Input className="dashboard-input h-10 text-sm" placeholder="e.g. iPhone 15 Pro, BDO Salary Loan" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          {/* Provider row — card link + provider selector side by side when card exists */}
          {type === "CREDIT_CARD" && creditCards.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="creditCardId" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-white/75">Linked Card <span className="text-white/45">(optional)</span></FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ""}>
                    <FormControl>
                      <SelectTrigger className="dashboard-input h-10 text-sm">
                        <SelectValue placeholder="Select card" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {creditCards.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.bankName} — {c.cardName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="lenderName" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-white/75">Provider <span className="text-white/45">(optional)</span></FormLabel>
                  <FormControl>
                    <ProviderSelector
                      type={type}
                      value={field.value ?? ""}
                      onChange={(v) => field.onChange(v || null)}
                      onProviderSelect={handleProviderSelect}
                      placeholder="Search provider…"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          ) : (
            <FormField control={form.control} name="lenderName" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-white/75">Provider / Lender <span className="text-white/45">(optional)</span></FormLabel>
                <FormControl>
                  <ProviderSelector
                    type={type}
                    value={field.value ?? ""}
                    onChange={(v) => field.onChange(v || null)}
                    onProviderSelect={handleProviderSelect}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          )}
        </div>

        {/* ── Section divider ── */}
        <div className="h-px bg-white/[0.06] my-4" />

        {/* ── Section: Amounts ── */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <FormField control={form.control} name="totalAmount" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm text-white/75">Total Amount</FormLabel>
              <FormControl>
                <CurrencyInput className="dashboard-input h-10 text-sm" placeholder="10,000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="monthlyAmount" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm text-white/75">Monthly Payment</FormLabel>
              <FormControl>
                <CurrencyInput className="dashboard-input h-10 text-sm" placeholder="1,000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <FormField control={form.control} name="totalMonths" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm text-white/75">Duration (months)</FormLabel>
              <FormControl>
                <Input className="dashboard-input h-10 text-sm" type="number" min={1} max={120} {...field}
                  onChange={e => field.onChange(parseInt(e.target.value) || 1)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="startDate" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm text-white/75">First Payment Date</FormLabel>
              <FormControl>
                <Input className="dashboard-input h-10 text-sm" type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        {/* ── Section divider ── */}
        <div className="h-px bg-white/[0.06] my-4" />

        {/* ── Section: Rates & fees ── */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <FormField control={form.control} name="interestRate" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-white/75 flex items-center gap-1.5">
                  Interest Rate %
                  {autoFilled && <AutoFilledBadge />}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger render={<span />} className="inline-flex items-center cursor-help">
                        <HelpCircle size={13} className="text-white/35 hover:text-[#b4f03a] transition-colors" />
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        align="start"
                        className="!flex-col !items-start w-72 bg-[#16161f] border border-white/10 text-xs p-4 rounded-2xl shadow-xl gap-0"
                      >
                        <p className="font-semibold text-white text-sm mb-3">Where to find your interest rate</p>
                        <div className="flex flex-col gap-3 w-full">
                          <div className="flex gap-2.5">
                            <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-white/90 mb-0.5">Credit Card</p>
                              <p className="text-white/50 leading-relaxed">Look for "add-on rate" or "monthly interest rate" on your billing statement.</p>
                            </div>
                          </div>
                          <div className="flex gap-2.5">
                            <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-white/90 mb-0.5">Bank Loan</p>
                              <p className="text-white/50 leading-relaxed">Check your loan contract or amortization schedule.</p>
                            </div>
                          </div>
                          <div className="flex gap-2.5">
                            <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-white/90 mb-0.5">BNPL / PayLater (Atome, SPayLater, TikTok…)</p>
                              <p className="text-white/50 leading-relaxed">Usually 0% — the purchase is split into equal monthly payments auto-debited each billing cycle. Watch for late fees per missed cycle. Enter 0 if unsure.</p>
                            </div>
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </FormLabel>
                <FormControl>
                  <Input className="dashboard-input h-10 text-sm" type="number" step="0.01" placeholder="0 for none"
                    value={field.value ?? ""}
                    onChange={e => { setAutoFilled(false); field.onChange(e.target.value ? parseFloat(e.target.value) : null); }} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="processingFee" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-white/75 flex items-center gap-1.5">
                  Processing Fee ₱
                  {autoFilled && <AutoFilledBadge />}
                </FormLabel>
                <FormControl>
                  <Input className="dashboard-input h-10 text-sm" type="number" step="0.01" placeholder="0 for none"
                    value={field.value ?? ""}
                    onChange={e => { setAutoFilled(false); field.onChange(e.target.value ? parseFloat(e.target.value) : null); }} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <FormField control={form.control} name="notes" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm text-white/75">Notes <span className="text-white/45">(optional)</span></FormLabel>
              <FormControl>
                <Input className="dashboard-input h-10 text-sm" placeholder="e.g. 0% promo until Dec, check renewal date"
                  {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          {autoFilled && (
            <p className="text-xs text-white/55 flex items-center gap-1.5">
              <Info size={11} className="shrink-0" />
              Rates are estimates — always verify with your provider before committing
            </p>
          )}
        </div>

        {/* Live summary strip */}
        {canPreview && (
          <div className="flex items-center gap-3 mt-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs">
            <TrendingUp size={14} className="text-[#b4f03a] flex-shrink-0" />
            <span className="text-white/65">
              True total: <span className="font-bold text-white">{formatCurrency(totalCost + (form.watch("processingFee") ?? 0))}</span>
            </span>
            {interest !== 0 && (
              <>
                <span className="text-white/15">·</span>
                <span className={interest > 0 ? "text-red-400" : "text-emerald-400"}>
                  {interest > 0 ? `+${formatCurrency(interest)} interest` : "No interest"}
                </span>
              </>
            )}
            {(form.watch("processingFee") ?? 0) > 0 && (
              <>
                <span className="text-white/15">·</span>
                <span className="text-amber-400">+{formatCurrency(form.watch("processingFee") ?? 0)} fee</span>
              </>
            )}
          </div>
        )}

        <Button
          type="button"
          onClick={handlePreview}
          disabled={!canPreview}
          className="w-full rounded-full bg-[#b4f03a] text-[#0c0c10] hover:bg-[#ccff52] h-10 text-sm mt-4 flex items-center justify-center gap-2 font-medium"
        >
          Preview Schedule <ArrowRight size={15} />
        </Button>
      </form>
    </Form>
  );
}
