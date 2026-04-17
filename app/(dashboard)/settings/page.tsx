"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Plus, Trash2, User, DollarSign, BookTemplate, ShieldCheck } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDate, getMonthYear } from "@/lib/utils/dates";
import { toast } from "@/lib/utils/toast";
import { cn } from "@/lib/utils";
import { useUpdateUserPreferences, useUserPreferences } from "@/lib/hooks/useUserPreferences";

interface IncomeTemplate { id: string; source: string; amount: string; dayOfMonth: number | null; }
interface Income { id: string; source: string; amount: string; receivedAt: string | null; monthYear: string; }

export default function SettingsPage() {
  const { data: session } = useSession();
  const [monthYear] = useState(getMonthYear());
  const [incomeDialog, setIncomeDialog] = useState(false);
  const [templateDialog, setTemplateDialog] = useState(false);
  const [income, setIncome] = useState({ source: "", amount: "", monthYear, receivedAt: "" });
  const [newTemplate, setNewTemplate] = useState({ source: "", amount: "", dayOfMonth: "" });
  const [cashGuard, setCashGuard] = useState({
    bufferPercentage: "10",
    minimumCashBuffer: "",
    paydayDays: "15",
    enableDailyDigest: true,
  });
  const qc = useQueryClient();
  const { data: preferences } = useUserPreferences();
  const updatePreferences = useUpdateUserPreferences();

  const { data: incomes = [] } = useQuery<Income[]>({
    queryKey: ["incomes", monthYear],
    queryFn: async () => {
      const res = await fetch(`/api/income?monthYear=${monthYear}`);
      return res.json();
    },
  });

  const { data: templates = [] } = useQuery<IncomeTemplate[]>({
    queryKey: ["income-templates"],
    queryFn: async () => {
      const res = await fetch("/api/income/templates");
      return res.json();
    },
  });

  const addIncome = useMutation({
    mutationFn: async (data: typeof income) => {
      const res = await fetch("/api/income", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, amount: parseFloat(data.amount), receivedAt: data.receivedAt || null }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["incomes"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["cash-flow-plan"] });
      toast.success("Income added", `${income.source} has been recorded for this month.`);
      setIncomeDialog(false);
      setIncome({ source: "", amount: "", monthYear, receivedAt: "" });
    },
    onError: () => toast.error("Failed to add income"),
  });

  const removeIncome = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/income/${id}`, { method: "DELETE" });
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["incomes"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["cash-flow-plan"] });
      toast.success("Income removed");
    },
  });

  const addTemplate = useMutation({
    mutationFn: async (data: typeof newTemplate) => {
      const res = await fetch("/api/income/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, amount: parseFloat(data.amount), dayOfMonth: data.dayOfMonth ? parseInt(data.dayOfMonth) : null }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["income-templates"] });
      toast.success("Template saved", `${newTemplate.source} can now be reused every month.`);
      setTemplateDialog(false);
      setNewTemplate({ source: "", amount: "", dayOfMonth: "" });
    },
    onError: () => toast.error("Failed to save template"),
  });

  const removeTemplate = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/income/templates/${id}`, { method: "DELETE" });
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["income-templates"] });
      toast.success("Template deleted");
    },
  });

  function applyTemplate(t: IncomeTemplate) {
    let receivedAt = "";
    if (t.dayOfMonth) {
      const [year, month] = income.monthYear.split("-").map(Number);
      const day = Math.min(t.dayOfMonth, new Date(year, month, 0).getDate());
      receivedAt = `${income.monthYear}-${String(day).padStart(2, "0")}`;
    }
    setIncome((s) => ({ ...s, source: t.source, amount: t.amount, receivedAt }));
  }

  useEffect(() => {
    if (!preferences) return;
    setCashGuard({
      bufferPercentage: preferences.bufferPercentage,
      minimumCashBuffer: preferences.minimumCashBuffer ?? "",
      paydayDays: preferences.paydayDaysOfMonth.join(", "),
      enableDailyDigest: preferences.enableDailyDigest,
    });
  }, [preferences]);

  function parsePaydayDays(value: string): number[] {
    const parsed = value
      .split(",")
      .map((v) => parseInt(v.trim(), 10))
      .filter((v) => Number.isFinite(v) && v >= 1 && v <= 31);

    return Array.from(new Set(parsed)).sort((a, b) => a - b).slice(0, 4);
  }

  async function saveCashGuardSettings() {
    const bufferPercentage = parseFloat(cashGuard.bufferPercentage);
    if (!Number.isFinite(bufferPercentage) || bufferPercentage <= 0 || bufferPercentage > 100) {
      toast.error("Invalid buffer percentage", "Use a number between 0.01 and 100.");
      return;
    }

    const paydayDays = parsePaydayDays(cashGuard.paydayDays);
    if (paydayDays.length === 0) {
      toast.error("Invalid payday days", "Provide at least one day between 1 and 31.");
      return;
    }

    const fixedBuffer = cashGuard.minimumCashBuffer.trim() === ""
      ? null
      : parseFloat(cashGuard.minimumCashBuffer);

    if (fixedBuffer !== null && (!Number.isFinite(fixedBuffer) || fixedBuffer < 0)) {
      toast.error("Invalid fixed buffer", "Use a non-negative amount or leave it blank.");
      return;
    }

    try {
      await updatePreferences.mutateAsync({
        bufferPercentage,
        minimumCashBuffer: fixedBuffer,
        paydayDaysOfMonth: paydayDays,
        enableDailyDigest: cashGuard.enableDailyDigest,
      });
      toast.success("Cash Guard updated", "Safe-to-spend now uses your latest settings.");
    } catch (error) {
      toast.error(
        "Failed to update Cash Guard",
        error instanceof Error ? error.message : "Please try again."
      );
    }
  }

  const initials = (session?.user?.name ?? "U")
    .split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div>
      <PageHeader title="Settings" description="Manage your account and income sources" />

      <div className="space-y-4 max-w-2xl">
        {/* Profile */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 bg-indigo-50 rounded-2xl flex items-center justify-center">
              <User size={16} className="text-indigo-600" />
            </div>
            <h2 className="font-bold text-gray-900">Profile</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-lg shadow-sm shadow-indigo-200">
              {initials}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{session?.user?.name}</p>
              <p className="text-sm text-gray-400">{session?.user?.email}</p>
            </div>
          </div>
        </div>

        {/* Cash Guard Settings */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 bg-sky-50 rounded-2xl flex items-center justify-center">
              <ShieldCheck size={16} className="text-sky-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Cash Guard</h2>
              <p className="text-xs text-gray-400">Control how Safe to Spend is calculated and how daily alerts behave</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Buffer percentage of monthly income</Label>
              <Input
                type="number"
                min={0.01}
                max={100}
                step="0.01"
                value={cashGuard.bufferPercentage}
                onChange={(e) => setCashGuard((s) => ({ ...s, bufferPercentage: e.target.value }))}
                className="mt-1.5 rounded-xl border-gray-200 h-11"
                placeholder="10"
              />
              <p className="text-xs text-gray-400 mt-1">Used when fixed minimum buffer is empty.</p>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">Fixed minimum cash buffer (optional)</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={cashGuard.minimumCashBuffer}
                onChange={(e) => setCashGuard((s) => ({ ...s, minimumCashBuffer: e.target.value }))}
                className="mt-1.5 rounded-xl border-gray-200 h-11"
                placeholder="e.g. 5000"
              />
              <p className="text-xs text-gray-400 mt-1">If set, this overrides the percentage rule.</p>
            </div>

            <div className="sm:col-span-2">
              <Label className="text-sm font-medium text-gray-700">Payday days of month</Label>
              <Input
                value={cashGuard.paydayDays}
                onChange={(e) => setCashGuard((s) => ({ ...s, paydayDays: e.target.value }))}
                className="mt-1.5 rounded-xl border-gray-200 h-11"
                placeholder="15, 30"
              />
              <p className="text-xs text-gray-400 mt-1">Comma-separated values between 1 and 31.</p>
            </div>

            <label className="sm:col-span-2 flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={cashGuard.enableDailyDigest}
                onChange={(e) => setCashGuard((s) => ({ ...s, enableDailyDigest: e.target.checked }))}
              />
              Enable daily safe-to-spend digest notification
            </label>
          </div>

          <div className="mt-5 flex justify-end">
            <Button
              onClick={saveCashGuardSettings}
              disabled={updatePreferences.isPending}
              className="rounded-full bg-[#245bff] hover:bg-[#1a47cc]"
            >
              {updatePreferences.isPending ? "Saving..." : "Save Cash Guard"}
            </Button>
          </div>
        </div>

        {/* Income Templates */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#edf2ff] rounded-2xl flex items-center justify-center">
                <BookTemplate size={16} className="text-[#2d53c9]" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">Income Templates</h2>
                <p className="text-xs text-gray-400">Reusable income sources — apply them in one click each month</p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => setTemplateDialog(true)}
              className="rounded-full bg-[#245bff] hover:bg-[#1a47cc] shadow-[0_10px_24px_rgba(36,91,255,0.2)]"
            >
              <Plus size={14} className="mr-1" /> New Template
            </Button>
          </div>

          {templates.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              No templates yet. Create one to quickly apply income each month.
            </p>
          ) : (
            <div className="space-y-2">
              {templates.map((t) => (
                <div key={t.id} className="flex items-center justify-between py-3 px-3 rounded-2xl hover:bg-gray-50 group transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#edf2ff] flex items-center justify-center">
                      <BookTemplate size={13} className="text-[#4c68ac]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{t.source}</p>
                      {t.dayOfMonth && <p className="text-xs text-gray-400">Usually received on day {t.dayOfMonth}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-[#2d53c9]">{formatCurrency(t.amount)}</span>
                    <button
                      onClick={() => removeTemplate.mutate(t.id)}
                      className="w-7 h-7 rounded-xl hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Income Sources */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-50 rounded-2xl flex items-center justify-center">
                <DollarSign size={16} className="text-emerald-600" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">Income Sources</h2>
                <p className="text-xs text-gray-400">Recorded income for {monthYear}</p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => setIncomeDialog(true)}
              className="rounded-full bg-[#245bff] hover:bg-[#1a47cc] shadow-[0_10px_24px_rgba(36,91,255,0.2)]"
            >
              <Plus size={14} className="mr-1" /> Add Income
            </Button>
          </div>

          {incomes.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No income sources recorded for this month</p>
          ) : (
            <div className="space-y-2">
              {incomes.map((inc) => (
                <div key={inc.id} className="flex items-center justify-between py-3 px-3 rounded-2xl hover:bg-gray-50 group transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{inc.source}</p>
                    {inc.receivedAt && <p className="text-xs text-gray-400">{formatDate(inc.receivedAt)}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-emerald-600">{formatCurrency(inc.amount)}</span>
                    <button
                      onClick={() => removeIncome.mutate(inc.id)}
                      className="w-7 h-7 rounded-xl hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Income Dialog */}
      <Dialog open={incomeDialog} onOpenChange={setIncomeDialog}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-bold">Add Income Source</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Template chips */}
            {templates.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">Apply from template</p>
                <div className="flex flex-wrap gap-2">
                  {templates.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => applyTemplate(t)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                        income.source === t.source && income.amount === t.amount
                          ? "bg-[#245bff] text-white border-[#245bff]"
                          : "bg-[#edf2ff] text-[#2d53c9] border-[#d8e1ff] hover:bg-[#e3ebff]"
                      )}
                    >
                      <BookTemplate size={11} />
                      {t.source} · {formatCurrency(t.amount)}{t.dayOfMonth ? ` · day ${t.dayOfMonth}` : ""}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Label className="text-sm font-medium text-gray-700">Source</Label>
              <Input value={income.source} onChange={(e) => setIncome((s) => ({ ...s, source: e.target.value }))} placeholder="Salary / Freelance" className="mt-1.5 rounded-xl border-gray-200 h-11" />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Amount (₱)</Label>
              <Input type="number" value={income.amount} onChange={(e) => setIncome((s) => ({ ...s, amount: e.target.value }))} placeholder="50000" className="mt-1.5 rounded-xl border-gray-200 h-11" />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Month</Label>
              <Input type="month" value={income.monthYear} onChange={(e) => setIncome((s) => ({ ...s, monthYear: e.target.value }))} className="mt-1.5 rounded-xl border-gray-200 h-11" />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Received Date (optional)</Label>
              <Input type="date" value={income.receivedAt} onChange={(e) => setIncome((s) => ({ ...s, receivedAt: e.target.value }))} className="mt-1.5 rounded-xl border-gray-200 h-11" />
            </div>
            <Button onClick={() => addIncome.mutate(income)} className="w-full rounded-full bg-[#245bff] hover:bg-[#1a47cc] h-11" disabled={addIncome.isPending || !income.source || !income.amount}>
              {addIncome.isPending ? "Adding..." : "Add Income"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Template Dialog */}
      <Dialog open={templateDialog} onOpenChange={setTemplateDialog}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-bold">New Income Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Source name</Label>
              <Input value={newTemplate.source} onChange={(e) => setNewTemplate((s) => ({ ...s, source: e.target.value }))} placeholder="Salary, Freelance, Side hustle…" className="mt-1.5 rounded-xl border-gray-200 h-11" />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Default amount (₱)</Label>
              <Input type="number" value={newTemplate.amount} onChange={(e) => setNewTemplate((s) => ({ ...s, amount: e.target.value }))} placeholder="50000" className="mt-1.5 rounded-xl border-gray-200 h-11" />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Typical day received <span className="text-gray-400 font-normal">(optional, 1–31)</span></Label>
              <Input type="number" min={1} max={31} value={newTemplate.dayOfMonth} onChange={(e) => setNewTemplate((s) => ({ ...s, dayOfMonth: e.target.value }))} placeholder="e.g. 15" className="mt-1.5 rounded-xl border-gray-200 h-11" />
            </div>
            <Button
              onClick={() => addTemplate.mutate(newTemplate)}
              className="w-full rounded-full bg-[#245bff] hover:bg-[#1a47cc] h-11"
              disabled={addTemplate.isPending || !newTemplate.source || !newTemplate.amount}
            >
              {addTemplate.isPending ? "Saving…" : "Save Template"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
