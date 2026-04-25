"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { User, ShieldCheck } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/utils/toast";
import { useUpdateUserPreferences, useUserPreferences } from "@/lib/hooks/useUserPreferences";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [cashGuard, setCashGuard] = useState({
    bufferPercentage: "10",
    minimumCashBuffer: "",
    paydayDays: "15",
    enableDailyDigest: true,
  });
  const qc = useQueryClient();
  const { data: preferences } = useUserPreferences();
  const updatePreferences = useUpdateUserPreferences();

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
      <PageHeader title="Settings" description="Manage your account and payment preferences" />

      <div className="max-w-2xl space-y-4">
        {/* Profile */}
        <div className="dashboard-surface p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-[#b4f03a]/12">
              <User size={16} className="text-[#b4f03a]" />
            </div>
            <h2 className="font-bold text-white">Profile</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#b4f03a]/18 text-lg font-bold text-[#b4f03a]">
              {initials}
            </div>
            <div>
              <p className="font-semibold text-white">{session?.user?.name}</p>
              <p className="text-sm text-white/45">{session?.user?.email}</p>
            </div>
          </div>
        </div>

        {/* Cash Guard Settings */}
        <div className="dashboard-surface p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-[#b4f03a]/12">
              <ShieldCheck size={16} className="text-[#b4f03a]" />
            </div>
            <div>
              <h2 className="font-bold text-white">Cash Guard</h2>
              <p className="text-xs text-white/45">Control how Safe to Spend is calculated and payment reminders</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-white/60">Buffer percentage of monthly income</Label>
              <Input
                type="number"
                min={0.01}
                max={100}
                step="0.01"
                value={cashGuard.bufferPercentage}
                onChange={(e) => setCashGuard((s) => ({ ...s, bufferPercentage: e.target.value }))}
                className="dashboard-input mt-1.5 h-11"
                placeholder="10"
              />
              <p className="mt-1 text-xs text-white/35">Used when fixed minimum buffer is empty.</p>
            </div>

            <div>
              <Label className="text-sm font-medium text-white/60">Fixed minimum cash buffer (optional)</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={cashGuard.minimumCashBuffer}
                onChange={(e) => setCashGuard((s) => ({ ...s, minimumCashBuffer: e.target.value }))}
                className="dashboard-input mt-1.5 h-11"
                placeholder="e.g. 5000"
              />
              <p className="mt-1 text-xs text-white/35">If set, this overrides the percentage rule.</p>
            </div>

            <div className="sm:col-span-2">
              <Label className="text-sm font-medium text-white/60">Payday days of month</Label>
              <Input
                value={cashGuard.paydayDays}
                onChange={(e) => setCashGuard((s) => ({ ...s, paydayDays: e.target.value }))}
                className="dashboard-input mt-1.5 h-11"
                placeholder="15, 30"
              />
              <p className="mt-1 text-xs text-white/35">Comma-separated values between 1 and 31. Used for cash flow planning.</p>
            </div>

            <label className="sm:col-span-2 flex items-center gap-2 text-sm text-white/65">
              <input
                type="checkbox"
                checked={cashGuard.enableDailyDigest}
                onChange={(e) => setCashGuard((s) => ({ ...s, enableDailyDigest: e.target.checked }))}
                className="h-4 w-4 rounded border-white/20 bg-[#0a0a0f] text-[#b4f03a]"
              />
              Enable daily payment reminder notifications
            </label>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              onClick={saveCashGuardSettings}
              disabled={updatePreferences.isPending}
              className="dashboard-accent-btn h-11 px-6"
            >
              {updatePreferences.isPending ? "Saving..." : "Save Cash Guard"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
