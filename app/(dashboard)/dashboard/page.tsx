"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { useDashboard } from "@/lib/hooks/useDashboard";
import { useCashFlowPlan } from "@/lib/hooks/useCashFlowPlan";
import { useInstallments } from "@/lib/hooks/useInstallments";
import { useCreditCards } from "@/lib/hooks/useCreditCards";
import {
  usePaymentNotifications,
  useDailyCashDigest,
} from "@/lib/hooks/usePaymentNotifications";
import { useSafeToSpend } from "@/lib/hooks/useSafeToSpend";
import { useUserPreferences } from "@/lib/hooks/useUserPreferences";
import { FullPageSpinner } from "@/components/shared/LoadingSpinner";
import { getMonthYear } from "@/lib/utils/dates";
import { formatCurrency } from "@/lib/utils/currency";
import {
  addMonths,
  addDays,
  format,
  differenceInDays,
  parseISO,
  isAfter,
  isSameDay,
} from "date-fns";
import {
  Plus,
  Zap,
  Search,
  ArrowDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import type { PriorityItem } from "@/app/api/dashboard/debt-priority/route";
import { NotificationCenter } from "@/components/layout/NotificationCenter";
import { BrandLogo } from "@/components/shared/BrandLogo";

type PaymentItem = {
  date: Date;
  name: string;
  amount: number;
  paymentNum: number;
  totalMonths: number;
  source: string;
  isMinDue?: boolean;
};

const SOURCE_COLORS = [
  "#9b7bff", // violet
  "#3ec8e8", // cyan
  "#ff6f6f", // coral red
  "#9be250", // lime
  "#f59e0b", // amber
  "#22c55e", // green
  "#ec4899", // pink
];

const SOURCE_PALETTE = [
  { dot: "bg-violet-400", badge: "bg-violet-500/16 text-violet-300" },
  { dot: "bg-cyan-400",   badge: "bg-cyan-500/16 text-cyan-300" },
  { dot: "bg-rose-400",   badge: "bg-rose-500/16 text-rose-300" },
  { dot: "bg-lime-400",   badge: "bg-lime-500/16 text-lime-300" },
  { dot: "bg-amber-400",  badge: "bg-amber-400/[0.12] text-amber-400" },
  { dot: "bg-green-400",  badge: "bg-green-400/[0.12] text-green-400" },
  { dot: "bg-pink-400",   badge: "bg-pink-400/[0.12] text-pink-400" },
];

const ICON_PALETTE = [
  "bg-violet-500/15 text-violet-400",
  "bg-green-500/15 text-green-400",
  "bg-blue-500/15 text-blue-400",
  "bg-red-500/15 text-red-400",
  "bg-amber-500/15 text-amber-400",
  "bg-cyan-500/15 text-cyan-400",
  "bg-pink-500/15 text-pink-400",
];

function cardIconClass(color: string): string {
  const map: Record<string, string> = {
    "#ef4444": "bg-red-500/15 text-red-400",
    "#f97316": "bg-orange-500/15 text-orange-400",
    "#eab308": "bg-yellow-500/15 text-yellow-400",
    "#22c55e": "bg-emerald-500/15 text-emerald-400",
    "#3b82f6": "bg-blue-500/15 text-blue-400",
    "#8b5cf6": "bg-violet-500/15 text-violet-400",
    "#ec4899": "bg-pink-500/15 text-pink-400",
  };
  return map[color] ?? "bg-indigo-500/15 text-indigo-400";
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function useDebtPriority() {
  return useQuery<{ items: PriorityItem[] }>({
    queryKey: ["debt-priority"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/debt-priority");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}

export default function DashboardPage() {
  const [activeFilter, setActiveFilter] = useState("All");

  const monthYear = getMonthYear();
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(" ")[0] || "there";

  const { data } = useDashboard(monthYear);
  const { data: cashFlow } = useCashFlowPlan(monthYear);
  const { data: safeToSpend } = useSafeToSpend(monthYear, undefined);
  const { data: preferences } = useUserPreferences();
  const { data: installments, isLoading } = useInstallments();
  const { data: creditCards, isLoading: cardsLoading } = useCreditCards();
  const { data: priorityData } = useDebtPriority();

  usePaymentNotifications(data);

  const dueTodayCount =
    data?.upcomingPayments.filter((p) => {
      const due = new Date(p.nextDueDate);
      const now = new Date();
      return (
        due.getFullYear() === now.getFullYear() &&
        due.getMonth() === now.getMonth() &&
        due.getDate() === now.getDate()
      );
    }).length ?? 0;

  useDailyCashDigest(safeToSpend, dueTodayCount, preferences?.enableDailyDigest ?? true);

  const activeInstallments = installments?.filter((p) => p.status === "ACTIVE") ?? [];
  const activeCards = (creditCards ?? []).filter((c) => c.isActive);

  // ── Debt stats ──────────────────────────────────────────────────────────────
  const debtStats = useMemo(() => {
    const installmentDebt = activeInstallments.reduce(
      (s, p) => s + Math.max(0, Number(p.totalAmount) - Number(p.monthlyAmount) * p.paidMonths),
      0
    );
    const cardDebt = activeCards.reduce((s, c) => s + Number(c.currentBalance), 0);
    const totalOutstanding = installmentDebt + cardDebt;
    const monthlyCommitment = activeInstallments.reduce(
      (s, p) => s + Number(p.monthlyAmount),
      0
    );
    const monthsToPayoff =
      monthlyCommitment > 0 ? Math.ceil(totalOutstanding / monthlyCommitment) : 0;
    const debtFreeDate =
      monthsToPayoff > 0 ? addMonths(new Date(), monthsToPayoff) : null;
    return { totalOutstanding, installmentDebt, cardDebt, monthlyCommitment, monthsToPayoff, debtFreeDate };
  }, [activeInstallments, activeCards]);

  // ── Donut chart data (by source) ──────────────────────────────────────────
  const donutData = useMemo(() => {
    const sourceMap = new Map<string, number>();

    for (const plan of activeInstallments) {
      const src = plan.lenderName || (plan.creditCard
        ? `${plan.creditCard.bankName} ${plan.creditCard.cardName}`
        : plan.name);
      const remaining = Math.max(0, Number(plan.totalAmount) - Number(plan.monthlyAmount) * plan.paidMonths);
      sourceMap.set(src, (sourceMap.get(src) ?? 0) + remaining);
    }

    for (const card of activeCards) {
      const src = `${card.bankName} ${card.cardName}`;
      const bal = Number(card.currentBalance);
      if (bal > 0) {
        sourceMap.set(src, (sourceMap.get(src) ?? 0) + bal);
      }
    }

    return Array.from(sourceMap.entries()).map(([name, value], i) => ({
      name,
      value,
      color: SOURCE_COLORS[i % SOURCE_COLORS.length],
    }));
  }, [activeInstallments, activeCards]);

  // ── Payment schedule (next 60 days) ─────────────────────────────────────────
  const { allPayments, sources, sourceColorMap } = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const cutoff = addDays(now, 60);

    const items: PaymentItem[] = [];

    for (const plan of activeInstallments) {
      const start = parseISO(plan.startDate);
      const src =
        plan.lenderName ||
        (plan.creditCard
          ? `${plan.creditCard.bankName} ${plan.creditCard.cardName}`
          : plan.name);

      for (let i = plan.paidMonths; i < plan.totalMonths; i++) {
        const dueDate = addMonths(start, i);
        if (dueDate < now) continue;
        if (isAfter(dueDate, cutoff)) break;
        items.push({
          date: dueDate,
          name: plan.name,
          amount: Number(plan.monthlyAmount),
          paymentNum: i + 1,
          totalMonths: plan.totalMonths,
          source: src,
        });
      }
    }

    if (cashFlow) {
      for (const d of cashFlow.calendar.dueDates) {
        if (d.kind !== "recurring") continue;
        const date = parseISO(d.date);
        if (date < now || isAfter(date, cutoff)) continue;
        const card = activeCards.find(
          (c) =>
            d.name.toLowerCase().includes(c.bankName.toLowerCase()) ||
            d.name.toLowerCase().includes(c.cardName.toLowerCase())
        );
        items.push({
          date,
          name: d.name,
          amount: Number(d.amount),
          paymentNum: 0,
          totalMonths: 0,
          source: card ? `${card.bankName} ${card.cardName}` : d.name,
          isMinDue: true,
        });
      }
    }

    items.sort((a, b) => a.date.getTime() - b.date.getTime());

    const sourceList = Array.from(new Set(items.map((i) => i.source)));
    const colorMap = new Map(
      sourceList.map((s, idx) => [s, SOURCE_PALETTE[idx % SOURCE_PALETTE.length]])
    );

    return { allPayments: items, sources: sourceList, sourceColorMap: colorMap };
  }, [activeInstallments, activeCards, cashFlow]);

  const filteredPayments = useMemo(
    () =>
      activeFilter === "All"
        ? allPayments
        : allPayments.filter((p) => p.source === activeFilter),
    [allPayments, activeFilter]
  );

  // ── Upcoming payments calendar strip (21 days) ────────────────────────────
  const calendarStrip = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = Array.from({ length: 21 }, (_, i) => {
      const date = addDays(today, i);
      const dayPayments = allPayments.filter((p) => isSameDay(p.date, date));
      const total = dayPayments.reduce((s, p) => s + p.amount, 0);
      return {
        date,
        dayOfWeek: format(date, "EEE"),
        dayNum: format(date, "d"),
        isToday: i === 0,
        hasPayments: dayPayments.length > 0,
        total,
        sources: dayPayments.map((p) => p.source),
      };
    });
    return days;
  }, [allPayments]);

  // ── Count payments due in next 7 days ─────────────────────────────────────
  const dueNext7Days = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const cutoff = addDays(today, 7);
    return allPayments.filter((p) => p.date >= today && p.date < cutoff).length;
  }, [allPayments]);

  // ── Helpers ──────────────────────────────────────────────────────────────────
  function urgencyLabel(date: Date): { text: string; className: string } {
    const days = differenceInDays(date, new Date());
    if (days < 0)  return { text: `${Math.abs(days)}d overdue`, className: "text-red-400" };
    if (days === 0) return { text: "Today",                      className: "text-amber-400" };
    if (days <= 3)  return { text: `In ${days} day${days === 1 ? "" : "s"}`, className: "text-red-400" };
    if (days <= 6)  return { text: `In ${days} days`,            className: "text-white/70" };
    if (days <= 13) return { text: "Next week",                  className: "text-white/60" };
    if (days < 30)  return { text: `In ${days} days`,            className: "text-white/55" };
    return            { text: `In ${Math.round(days / 30)} mo`,  className: "text-white/50" };
  }

  const topPriority = priorityData?.items?.[0] ?? null;

  if (isLoading || cardsLoading) return <FullPageSpinner />;

  return (
    <div className="space-y-5">
      {/* ── Section 1: Greeting Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {getGreeting()}, {firstName}
          </h1>
          <p className="mt-1 text-sm text-white/60">
            {format(new Date(), "EEEE, MMMM d")} · You have{" "}
            <span className="font-semibold text-[#b4f03a]">{dueNext7Days} payment{dueNext7Days !== 1 ? "s" : ""}</span>{" "}
            due in the next 7 days.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-2 transition-colors focus-within:border-white/[0.12]">
            <Search size={14} className="shrink-0 text-white/30" />
            <input
              type="text"
              placeholder="Search merchants, accounts..."
              className="w-40 bg-transparent text-sm text-white outline-none placeholder:text-white/40 lg:w-48"
            />
            <kbd className="inline-flex items-center rounded-md border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-semibold text-white/25">
              ⌘K
            </kbd>
          </div>
          <NotificationCenter />
          <Link href="/installments?add=true">
            <button className="flex items-center gap-1.5 rounded-full bg-[#b4f03a] px-4 py-2 text-xs font-bold text-black transition-colors hover:bg-[#ccff52]">
              <Plus size={14} strokeWidth={2.5} />
              Add installment
            </button>
          </Link>
        </div>
      </div>

      {/* ── Section 2: Total Outstanding Hero ── */}
      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        {/* Left: Donut chart + breakdown */}
        <div className="h-[360px] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0f1626]">
          <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] h-full">
            <div className="relative flex items-center justify-center border-b border-white/[0.06] md:border-b-0 md:border-r md:border-white/[0.07] bg-[radial-gradient(circle_at_10%_10%,rgba(155,226,80,0.20),transparent_48%),linear-gradient(180deg,rgba(42,56,92,0.50),rgba(42,56,92,0.22))] p-4.5">
              <div className="relative h-[176px] w-[176px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData.length > 0 ? donutData : [{ name: "No data", value: 1 }]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={78}
                      paddingAngle={donutData.length > 1 ? 2 : 0}
                      dataKey="value"
                      stroke="none"
                    >
                      {donutData.length > 0
                        ? donutData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))
                        : <Cell fill="rgba(255,255,255,0.08)" />
                      }
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-heading text-3xl font-bold leading-none text-[#f2f6ff]">{donutData.length}</span>
                  <span className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">
                    Active Sources
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4.5 md:p-5.5 flex flex-col relative">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/50">
                Total Outstanding · All Sources
              </p>
              <p className="mt-1.5 font-heading text-4xl font-bold leading-none tracking-tight text-[#ecf3ff] md:text-5xl">
                {formatCurrency(debtStats.totalOutstanding)}
              </p>
              <div className="mt-2.5 flex flex-wrap items-center gap-2 text-sm md:text-base">
                {debtStats.monthlyCommitment > 0 && (
                  <span className="inline-flex items-center gap-1.5 font-semibold text-[#9be250]">
                    <ArrowDown size={14} />
                    {formatCurrency(debtStats.monthlyCommitment)} vs last month
                  </span>
                )}
                {debtStats.debtFreeDate && (
                  <>
                    <span className="text-white/25">·</span>
                    <span className="text-white/45">
                      Projected debt-free{" "}
                      <span className="font-bold text-white">{format(debtStats.debtFreeDate, "MMM yyyy")}</span>
                    </span>
                  </>
                )}
              </div>

              <div className="mt-5 space-y-2.5 pr-1 overflow-y-auto no-scrollbar flex-1">
                {donutData.map((item, i) => {
                  const pct = debtStats.totalOutstanding > 0
                    ? (item.value / debtStats.totalOutstanding) * 100
                    : 0;
                  const sourceTag = SOURCE_PALETTE[i % SOURCE_PALETTE.length];

                  return (
                    <div key={i} className="grid grid-cols-[130px_minmax(0,1fr)_auto] items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex min-w-0 items-center gap-2 rounded-full px-2.5 py-1.5 text-xs font-semibold",
                          sourceTag.badge
                        )}
                      >
                        <BrandLogo name={item.name} size={16} />
                        <span className="truncate">{item.name}</span>
                      </span>

                      <div className="h-2 w-full overflow-hidden rounded-full bg-[#242d3f]">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${Math.max(8, pct)}%`, backgroundColor: item.color }}
                        />
                      </div>

                      <span className="shrink-0 font-heading text-base font-bold leading-none tracking-tight text-[#f2f6ff] md:text-lg">
                        {formatCurrency(item.value)}
                      </span>
                    </div>
                  );
                })}
                {donutData.length === 0 && (
                  <p className="text-sm text-white/35">No active debt sources</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Pay this first */}
        <div className="h-90 rounded-2xl border border-white/[0.07] bg-[#111118] p-5 flex flex-col">
          <div className="mb-4 flex items-center justify-between shrink-0">
            <div>
              <h2 className="text-base font-bold text-white">Pay this first</h2>
              <p className="text-xs text-white/50">Smart prioritization</p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06]">
              <Zap size={14} className="text-white/40" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar">
            {topPriority ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-[#b4f03a]/20 bg-[#b4f03a]/[0.04] p-4">
                  {/* Name row with icon */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#b4f03a]/15">
                      <BrandLogo name={topPriority.name} size={22} className="bg-transparent" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white">{topPriority.name}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-white/45">
                        {topPriority.interestRate && topPriority.interestRate > 0
                          ? `Highest APR at ${topPriority.interestRate}% — every ${formatCurrency(1000)} unpaid costs →${formatCurrency((1000 * topPriority.interestRate) / 100 / 12)}/month in interest.`
                          : topPriority.reason}
                      </p>
                    </div>
                  </div>

                  {/* Suggested Pay / You Save */}
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2.5">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-white/50">
                        Suggested Pay
                      </p>
                      <p className="mt-0.5 text-lg font-bold text-white">
                        {formatCurrency(topPriority.amount)}
                      </p>
                    </div>
                    <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2.5">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-white/50">
                        You Save
                      </p>
                      <p className="mt-0.5 text-lg font-bold text-[#b4f03a]">
                        {formatCurrency(
                          topPriority.interestRate && topPriority.interestRate > 0
                            ? (topPriority.balance * topPriority.interestRate) / 100 / 12
                            : debtStats.monthlyCommitment
                        )}
                      </p>
                    </div>
                  </div>

                  <Link href={topPriority.href}>
                    <button className="mt-4 w-full rounded-xl bg-[#b4f03a] py-2.5 text-sm font-bold text-black transition-colors hover:bg-[#ccff52]">
                      Pay {formatCurrency(topPriority.amount)} now
                    </button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center h-full">
                <p className="text-sm text-white/30">No debts to prioritize</p>
                <p className="mt-1 text-xs text-white/20">You&apos;re debt-free!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Section 3: Upcoming Payments Calendar Strip ── */}
      <div className="h-40 rounded-2xl border border-white/[0.07] bg-[#111118] p-5 flex flex-col">
        <h2 className="mb-3 text-base font-bold text-white shrink-0">Upcoming payments</h2>
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar flex-1">
          {calendarStrip.map((day, i) => (
            <div
              key={i}
              className={cn(
                "flex min-w-[56px] shrink-0 flex-col items-center rounded-xl border px-2 py-2.5 transition-colors",
                day.isToday
                  ? "border-[#b4f03a]/40 bg-[#b4f03a]/[0.06]"
                  : day.hasPayments
                  ? "border-white/[0.07] bg-white/[0.03]"
                  : "border-transparent bg-transparent"
              )}
            >
              <span className={cn(
                "text-xs font-semibold uppercase",
                day.isToday ? "text-[#b4f03a]" : "text-white/30"
              )}>
                {day.dayOfWeek}
              </span>
              <span className={cn(
                "mt-0.5 text-lg font-bold leading-tight",
                day.isToday ? "text-[#b4f03a]" : day.hasPayments ? "text-white" : "text-white/25"
              )}>
                {day.dayNum}
              </span>
              {day.hasPayments && (
                <>
                  <span className="mt-1 text-xs font-semibold text-white/70">
                    {formatCurrency(day.total)}
                  </span>
                  <div className="mt-1 flex gap-0.5">
                    {Array.from(new Set(day.sources)).map((src, si) => {
                      const col = sourceColorMap.get(src);
                      return (
                        <span
                          key={si}
                          className={cn("h-1.5 w-1.5 rounded-full", col?.dot ?? "bg-white/20")}
                        />
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 4: Bottom Row ── */}
      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[1fr_360px]">

        {/* ── Payment Schedule ── */}
        <div className="h-90 rounded-2xl border border-white/[0.07] bg-[#111118] p-5 flex flex-col">
          {/* Header */}
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3 shrink-0">
            <div>
              <h2 className="text-base font-bold text-white">Payment schedule</h2>
              <p className="mt-0.5 text-sm text-white/50">
                Next 60 days · {allPayments.length} payment{allPayments.length !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Source filter pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setActiveFilter("All")}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold transition-all",
                  activeFilter === "All"
                    ? "bg-white/[0.09] text-white"
                    : "text-white/40 hover:text-white"
                )}
              >
                All
              </button>
              {sources.map((src) => {
                const col = sourceColorMap.get(src)!;
                return (
                  <button
                    key={src}
                    onClick={() => setActiveFilter(src)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all",
                      activeFilter === src
                        ? "bg-white/[0.09] text-white"
                        : "text-white/40 hover:text-white"
                    )}
                  >
                    <span className={cn("h-1.5 w-1.5 rounded-full", col.dot)} />
                    {src}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payment rows */}
          <div className="divide-y divide-white/[0.04] overflow-y-auto no-scrollbar flex-1">
            {filteredPayments.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm text-white/30">No payments in the next 60 days</p>
              </div>
            ) : (
              filteredPayments.map((payment, idx) => {
                const col = sourceColorMap.get(payment.source)!;
                const urgency = urgencyLabel(payment.date);
                return (
                  <div key={idx} className="flex items-center gap-3 py-3">
                    {/* Date block */}
                    <div className="flex w-10 shrink-0 flex-col items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03] py-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">
                        {format(payment.date, "MMM")}
                      </span>
                      <span className="text-sm font-bold leading-tight text-white">
                        {format(payment.date, "d")}
                      </span>
                    </div>

                    {/* Name + badge + progress */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">{payment.name}</p>
                      <div className="mt-0.5 flex items-center gap-1.5">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2 py-[2px] text-[10px] font-bold",
                            col.badge
                          )}
                        >
                          <span className={cn("h-[5px] w-[5px] rounded-full", col.dot)} />
                          {payment.source}
                        </span>
                        {payment.paymentNum > 0 && (
                          <span className="text-xs text-white/40">
                            · {payment.paymentNum}/{payment.totalMonths}
                          </span>
                        )}
                        {payment.isMinDue && (
                          <span className="text-xs text-white/40">· min due</span>
                        )}
                      </div>
                    </div>

                    {/* Amount + urgency */}
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-bold text-white">{formatCurrency(payment.amount)}</p>
                      <span className={cn("text-xs font-medium", urgency.className)}>
                        {urgency.text}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Your Accounts ── */}
        <div className="h-90 rounded-2xl border border-white/[0.07] bg-[#111118] p-5 flex flex-col">
          <div className="mb-4 flex items-start justify-between shrink-0">
            <div>
              <h2 className="text-base font-bold text-white">Your accounts</h2>
              <p className="mt-0.5 text-sm text-white/50">
                {activeCards.length + activeInstallments.length} source
                {activeCards.length + activeInstallments.length !== 1 ? "s" : ""} connected
              </p>
            </div>
            <Link href="/credit-cards">
              <button className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-white/60 transition-colors hover:bg-white/[0.05] hover:text-white">
                <Plus size={11} /> Link
              </button>
            </Link>
          </div>

          <div className="space-y-0.5 overflow-y-auto no-scrollbar flex-1">
            {/* Credit cards */}
            {activeCards.map((card) => {
              const utilPct =
                Number(card.creditLimit) > 0
                  ? Math.round((Number(card.currentBalance) / Number(card.creditLimit)) * 100)
                  : null;
              return (
                <Link key={card.id} href={`/credit-cards/${card.id}`}>
                  <div className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-white/[0.04]">
                    <div
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                        cardIconClass(card.color)
                      )}
                    >
                      <BrandLogo name={`${card.bankName} ${card.cardName}`} size={20} className="bg-transparent" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white">
                        {card.bankName} {card.cardName}
                      </p>
                      <p className="text-xs text-white/50">
                        Credit Card · {card.lastFourDigits}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-bold text-white">
                        {formatCurrency(card.currentBalance)}
                      </p>
                      {utilPct !== null && (
                        <p className="text-xs text-white/40">
                          {utilPct}% of {formatCurrency(card.creditLimit)}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}

            {/* Installment plans */}
            {activeInstallments.map((plan, idx) => {
              const remaining = Math.max(
                0,
                Number(plan.totalAmount) - Number(plan.monthlyAmount) * plan.paidMonths
              );
              const aprPct =
                plan.interestRate && Number(plan.interestRate) > 0
                  ? `${(Number(plan.interestRate) * 100).toFixed(0)}% APR`
                  : "0% APR";
              const typeStr =
                plan.type === "BNPL"
                  ? "BNPL"
                  : plan.type === "CREDIT_CARD"
                  ? "Credit Card"
                  : "Loan";
              return (
                <Link key={plan.id} href={`/installments/${plan.id}`}>
                  <div className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-white/[0.04]">
                    <div
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                        ICON_PALETTE[(activeCards.length + idx) % ICON_PALETTE.length]
                      )}
                    >
                      <BrandLogo name={plan.lenderName || plan.name} size={20} className="bg-transparent" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">
                        {plan.lenderName || plan.name}
                      </p>
                      <p className="text-[11px] text-white/35">
                        {typeStr} · {plan.totalMonths}-mo installment · {aprPct}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-bold text-white">{formatCurrency(remaining)}</p>
                    </div>
                  </div>
                </Link>
              );
            })}

            {activeCards.length === 0 && activeInstallments.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-sm text-white/30">No accounts connected</p>
                <Link href="/installments">
                  <button className="mt-3 text-xs font-semibold text-[#b4f03a] hover:text-[#ccff52]">
                    + Add your first plan
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
