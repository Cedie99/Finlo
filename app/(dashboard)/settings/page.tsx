"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { User, ShieldCheck, Bell, Settings as SettingsIcon, Download, Trash2, AlertTriangle } from "lucide-react";
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
  const [displaySettings, setDisplaySettings] = useState({
    currency: "PHP",
    dateFormat: "DD/MM/YYYY",
    thousandsSeparator: ",",
  });
  const [notifications, setNotifications] = useState({
    dueDateReminders: true,
    overdueAlerts: true,
    weeklyDigest: true,
    monthlyReport: true,
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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

  async function saveDisplaySettings() {
    try {
      // Save display settings to localStorage for now
      localStorage.setItem("displaySettings", JSON.stringify(displaySettings));
      toast.success("Display settings updated", "Your preferences have been saved.");
    } catch (error) {
      toast.error("Failed to update display settings", "Please try again.");
    }
  }

  async function saveNotificationPreferences() {
    try {
      // Save notification preferences to localStorage
      localStorage.setItem("notificationPreferences", JSON.stringify(notifications));
      toast.success("Notification settings updated", "Your preferences have been saved.");
    } catch (error) {
      toast.error("Failed to update notification settings", "Please try again.");
    }
  }

  async function exportData() {
    try {
      // Create mock export data
      const exportData = {
        exportDate: new Date().toISOString(),
        userData: {
          name: session?.user?.name,
          email: session?.user?.email,
        },
        preferences: {
          displaySettings,
          notificationPreferences: notifications,
          cashGuardSettings: cashGuard,
        },
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `finlo-data-${new Date().toISOString().split("T")[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success("Data exported", "Your settings have been downloaded.");
    } catch (error) {
      toast.error("Export failed", "Unable to download your data.");
    }
  }

  async function deleteAccount() {
    try {
      const response = await fetch("/api/user/delete-account", { method: "POST" });
      if (!response.ok) throw new Error("Failed to delete account");
      // Redirect to login after deletion
      window.location.href = "/auth/login";
    } catch (error) {
      toast.error("Deletion failed", error instanceof Error ? error.message : "Please try again.");
    }
  }

  const initials = (session?.user?.name ?? "U")
    .split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div>
      <PageHeader title="Settings" description="Manage your account and payment preferences" />

      <div className="space-y-6">
        {/* Top Row: Profile + Quick Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile - Larger card */}
          <div className="lg:col-span-1 dashboard-surface p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-[#b4f03a]/12">
                <User size={16} className="text-[#b4f03a]" />
              </div>
              <h2 className="font-bold text-white">Profile</h2>
            </div>
            <div className="flex flex-col items-center gap-4 flex-1">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#b4f03a]/18 text-2xl font-bold text-[#b4f03a]">
                {initials}
              </div>
              <div className="text-center">
                <p className="font-semibold text-white">{session?.user?.name}</p>
                <p className="text-sm text-white/45 break-all">{session?.user?.email}</p>
              </div>
            </div>
          </div>

          {/* Display Settings - Right side */}
          <div className="lg:col-span-2 dashboard-surface p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-[#b4f03a]/12">
                <SettingsIcon size={16} className="text-[#b4f03a]" />
              </div>
              <div>
                <h2 className="font-bold text-white">Display Settings</h2>
                <p className="text-xs text-white/45">Currency, date format, and number display</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium text-white/60">Currency</Label>
                <select
                  value={displaySettings.currency}
                  onChange={(e) => setDisplaySettings((s) => ({ ...s, currency: e.target.value }))}
                  className="dashboard-input mt-1.5 h-11 w-full"
                >
                  <option value="PHP">Philippine Peso (PHP)</option>
                  <option value="USD">US Dollar (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                  <option value="GBP">British Pound (GBP)</option>
                  <option value="JPY">Japanese Yen (JPY)</option>
                </select>
              </div>

              <div>
                <Label className="text-sm font-medium text-white/60">Date Format</Label>
                <select
                  value={displaySettings.dateFormat}
                  onChange={(e) => setDisplaySettings((s) => ({ ...s, dateFormat: e.target.value }))}
                  className="dashboard-input mt-1.5 h-11 w-full"
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>

              <div>
                <Label className="text-sm font-medium text-white/60">Thousands Separator</Label>
                <select
                  value={displaySettings.thousandsSeparator}
                  onChange={(e) => setDisplaySettings((s) => ({ ...s, thousandsSeparator: e.target.value }))}
                  className="dashboard-input mt-1.5 h-11 w-full"
                >
                  <option value=",">Comma (1,000)</option>
                  <option value=".">Period (1.000)</option>
                  <option value=" ">Space (1 000)</option>
                </select>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={saveDisplaySettings}
                className="dashboard-accent-btn h-11 px-6"
              >
                Save Display Settings
              </button>
            </div>
          </div>
        </div>

        {/* Middle Row: Cash Guard + Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cash Guard Settings */}
          <div className="dashboard-surface p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-[#b4f03a]/12">
                <ShieldCheck size={16} className="text-[#b4f03a]" />
              </div>
              <div>
                <h2 className="font-bold text-white">Cash Guard</h2>
                <p className="text-xs text-white/45">Safe to Spend settings</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-white/60">Buffer percentage</Label>
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
                <p className="mt-1 text-xs text-white/35">% of monthly income</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-white/60">Fixed minimum buffer (optional)</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={cashGuard.minimumCashBuffer}
                  onChange={(e) => setCashGuard((s) => ({ ...s, minimumCashBuffer: e.target.value }))}
                  className="dashboard-input mt-1.5 h-11"
                  placeholder="e.g. 5000"
                />
                <p className="mt-1 text-xs text-white/35">Overrides percentage if set</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-white/60">Payday days</Label>
                <Input
                  value={cashGuard.paydayDays}
                  onChange={(e) => setCashGuard((s) => ({ ...s, paydayDays: e.target.value }))}
                  className="dashboard-input mt-1.5 h-11"
                  placeholder="15, 30"
                />
                <p className="mt-1 text-xs text-white/35">Comma-separated, 1-31</p>
              </div>

              <label className="flex items-center gap-2 p-2.5 rounded-lg bg-white/5 hover:bg-white/[0.08] transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={cashGuard.enableDailyDigest}
                  onChange={(e) => setCashGuard((s) => ({ ...s, enableDailyDigest: e.target.checked }))}
                  className="h-4 w-4 rounded border-white/20 bg-[#0a0a0f] text-[#b4f03a]"
                />
                <span className="text-sm text-white/65">Daily reminders</span>
              </label>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={saveCashGuardSettings}
                disabled={updatePreferences.isPending}
                className="dashboard-accent-btn h-11 px-6"
              >
                {updatePreferences.isPending ? "Saving..." : "Save"}
              </button>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="dashboard-surface p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-[#b4f03a]/12">
                <Bell size={16} className="text-[#b4f03a]" />
              </div>
              <div>
                <h2 className="font-bold text-white">Notifications</h2>
                <p className="text-xs text-white/45">Alert preferences</p>
              </div>
            </div>

            <div className="space-y-2.5">
              <label className="flex items-start gap-3 p-2.5 rounded-lg bg-white/5 hover:bg-white/[0.08] transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.dueDateReminders}
                  onChange={(e) => setNotifications((s) => ({ ...s, dueDateReminders: e.target.checked }))}
                  className="h-4 w-4 rounded border-white/20 bg-[#0a0a0f] text-[#b4f03a] mt-0.5"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">Due reminders</p>
                  <p className="text-xs text-white/40">3 days before</p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-2.5 rounded-lg bg-white/5 hover:bg-white/[0.08] transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.overdueAlerts}
                  onChange={(e) => setNotifications((s) => ({ ...s, overdueAlerts: e.target.checked }))}
                  className="h-4 w-4 rounded border-white/20 bg-[#0a0a0f] text-[#b4f03a] mt-0.5"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">Overdue alerts</p>
                  <p className="text-xs text-white/40">Immediate</p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-2.5 rounded-lg bg-white/5 hover:bg-white/[0.08] transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.weeklyDigest}
                  onChange={(e) => setNotifications((s) => ({ ...s, weeklyDigest: e.target.checked }))}
                  className="h-4 w-4 rounded border-white/20 bg-[#0a0a0f] text-[#b4f03a] mt-0.5"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">Weekly digest</p>
                  <p className="text-xs text-white/40">Sundays</p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-2.5 rounded-lg bg-white/5 hover:bg-white/[0.08] transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.monthlyReport}
                  onChange={(e) => setNotifications((s) => ({ ...s, monthlyReport: e.target.checked }))}
                  className="h-4 w-4 rounded border-white/20 bg-[#0a0a0f] text-[#b4f03a] mt-0.5"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">Monthly report</p>
                  <p className="text-xs text-white/40">1st of month</p>
                </div>
              </label>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={saveNotificationPreferences}
                className="dashboard-accent-btn h-11 px-6"
              >
                Save
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Row: Data & Privacy */}
        <div className="dashboard-surface p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-[#b4f03a]/12">
              <Download size={16} className="text-[#b4f03a]" />
            </div>
            <div>
              <h2 className="font-bold text-white">Data & Privacy</h2>
              <p className="text-xs text-white/45">Export your data or delete your account</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={exportData}
              className="flex items-center justify-between p-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-left group"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-white group-hover:text-[#b4f03a] transition-colors">Export Your Data</p>
                <p className="text-xs text-white/40 mt-1">Download settings as JSON</p>
              </div>
              <Download size={18} className="text-white/40 group-hover:text-[#b4f03a] transition-colors ml-3 flex-shrink-0" />
            </button>

            <button
              onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
              className="flex items-center justify-between p-4 rounded-2xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 transition-colors text-left group"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-red-400 group-hover:text-red-300 transition-colors">Delete Account</p>
                <p className="text-xs text-red-400/60 mt-1">Permanently remove account & data</p>
              </div>
              <Trash2 size={18} className="text-red-400/60 group-hover:text-red-400 transition-colors ml-3 flex-shrink-0" />
            </button>
          </div>

          {showDeleteConfirm && (
            <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">Are you sure?</p>
                  <p className="text-xs text-white/60 mt-1">
                    This action cannot be undone. All your data will be permanently deleted from our servers.
                  </p>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 h-9 text-sm rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteAccount}
                  className="px-4 py-2 h-9 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  Delete My Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
