"use client";

import { useState } from "react";
import Decimal from "decimal.js";
import { AlertTriangle, Beaker, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/dates";
import { useWhatIfSimulator } from "@/lib/hooks/useWhatIfSimulator";

interface WhatIfSimulatorProps {
  monthYear: string;
  targetDate?: string;
}

export function WhatIfSimulator({ monthYear, targetDate }: WhatIfSimulatorProps) {
  const simulate = useWhatIfSimulator();
  const [salaryDelayDays, setSalaryDelayDays] = useState("0");
  const [unexpectedExpenseAmount, setUnexpectedExpenseAmount] = useState("0");
  const [unexpectedExpenseDate, setUnexpectedExpenseDate] = useState("");
  const [incomeDropPercent, setIncomeDropPercent] = useState("0");
  const [addedDebtAmount, setAddedDebtAmount] = useState("0");

  function runSimulation() {
    simulate.mutate({
      monthYear,
      targetDate,
      horizonDays: 14,
      scenario: {
        salaryDelayDays: Math.max(0, parseInt(salaryDelayDays || "0", 10) || 0),
        unexpectedExpenseAmount: Math.max(0, parseFloat(unexpectedExpenseAmount || "0") || 0),
        unexpectedExpenseDate: unexpectedExpenseDate || undefined,
        incomeDropPercent: Math.max(0, parseFloat(incomeDropPercent || "0") || 0),
        addedDebtAmount: Math.max(0, parseFloat(addedDebtAmount || "0") || 0),
      },
    });
  }

  const data = simulate.data;
  const safeToSpendWorse = data
    ? new Decimal(data.delta.safeToSpendChange).lt(0)
    : false;

  return (
    <section className="rounded-3xl border border-[#d1e3df] bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-base font-bold text-gray-900">
            <Beaker size={16} className="text-[#2f7f76]" />
            What-If Cashflow Simulator
          </h3>
          <p className="mt-1 text-xs text-gray-500">Stress test salary delays, sudden expenses, and new debt before they happen.</p>
        </div>
        <Button onClick={runSimulation} disabled={simulate.isPending} className="rounded-full bg-[#2f7f76] hover:bg-[#266a63]">
          {simulate.isPending ? "Simulating..." : "Run Simulation"}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
        <div>
          <p className="mb-1 text-xs font-medium text-gray-600">Salary delay (days)</p>
          <Input type="number" min={0} value={salaryDelayDays} onChange={(e) => setSalaryDelayDays(e.target.value)} />
        </div>
        <div>
          <p className="mb-1 text-xs font-medium text-gray-600">Unexpected expense</p>
          <Input type="number" min={0} step="0.01" value={unexpectedExpenseAmount} onChange={(e) => setUnexpectedExpenseAmount(e.target.value)} />
        </div>
        <div>
          <p className="mb-1 text-xs font-medium text-gray-600">Shock expense date</p>
          <Input type="date" value={unexpectedExpenseDate} onChange={(e) => setUnexpectedExpenseDate(e.target.value)} />
        </div>
        <div>
          <p className="mb-1 text-xs font-medium text-gray-600">Income drop (%)</p>
          <Input type="number" min={0} max={100} step="0.1" value={incomeDropPercent} onChange={(e) => setIncomeDropPercent(e.target.value)} />
        </div>
        <div>
          <p className="mb-1 text-xs font-medium text-gray-600">Added monthly debt</p>
          <Input type="number" min={0} step="0.01" value={addedDebtAmount} onChange={(e) => setAddedDebtAmount(e.target.value)} />
        </div>
      </div>

      {simulate.isError ? (
        <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertTriangle size={14} /> {(simulate.error as Error).message}
        </div>
      ) : null}

      {data ? (
        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Baseline safe to spend</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(data.baseline.safeToSpendToday)}</p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Scenario safe to spend</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(data.scenario.safeToSpendToday)}</p>
            </div>
            <div className={`rounded-2xl border p-3 ${safeToSpendWorse ? "border-red-200 bg-red-50" : "border-emerald-200 bg-emerald-50"}`}>
              <p className="text-xs text-gray-600">Change</p>
              <p className={`text-lg font-bold ${safeToSpendWorse ? "text-red-600" : "text-emerald-700"}`}>
                {new Decimal(data.delta.safeToSpendChange).gte(0) ? "+" : ""}
                {formatCurrency(data.delta.safeToSpendChange)}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-[#d1e3df] bg-[#edf5f2]/60 p-3">
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#1f5c55]">
              <Sparkles size={14} /> Auto-Rescue Plan
            </p>
            <div className="space-y-2">
              {data.rescuePlan.map((item, idx) => (
                <div key={`${item.title}-${idx}`} className="rounded-xl border border-[#d1e3df] bg-white px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                    <p className="text-sm font-semibold text-[#2b7d74]">+{formatCurrency(item.impactAmount)}</p>
                  </div>
                  <p className="text-xs text-gray-500">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 p-3">
            <p className="mb-2 text-sm font-semibold text-gray-700">Scenario timeline (14-day)</p>
            <div className="max-h-52 space-y-2 overflow-auto pr-1">
              {data.scenario.timeline.map((day) => (
                <div key={day.date} className="grid grid-cols-[112px_1fr] items-center gap-2 rounded-xl border border-gray-100 px-3 py-2 text-xs">
                  <span className="font-medium text-gray-600">{formatDate(day.date)}</span>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-emerald-600">+{formatCurrency(day.inflow)}</span>
                    <span className="text-red-500">-{formatCurrency(day.outflow)}</span>
                    <span className="font-semibold text-[#266a63]">{formatCurrency(day.projectedBalance)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
