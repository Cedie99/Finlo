"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { getMonthYear } from "@/lib/utils/dates";
import { useBudgetByMonth, useSetBudgetLimit, useCreateBudgetCategory, useDeleteBudgetCategory } from "@/lib/hooks/useBudget";
import { CategoryCard } from "@/components/budget/CategoryCard";
import { MonthPicker } from "@/components/budget/MonthPicker";
import { PageHeader } from "@/components/shared/PageHeader";
import { FullPageSpinner } from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

const PRESET_COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#ef4444", "#14b8a6"];

export default function BudgetPage() {
  const [monthYear, setMonthYear] = useState(getMonthYear());
  const [limitDialog, setLimitDialog] = useState<{ open: boolean; categoryId: string; current: string | null }>({ open: false, categoryId: "", current: null });
  const [newCategoryOpen, setNewCategoryOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [limitAmount, setLimitAmount] = useState("");
  const [newCat, setNewCat] = useState({ name: "", icon: "tag", color: "#6366f1" });

  const { data: categories, isLoading } = useBudgetByMonth(monthYear);
  const setLimit = useSetBudgetLimit(monthYear);
  const createCategory = useCreateBudgetCategory();
  const deleteCategory = useDeleteBudgetCategory();

  function openSetLimit(categoryId: string, current: string | null) {
    setLimitAmount(current ?? "");
    setLimitDialog({ open: true, categoryId, current });
  }

  async function handleSetLimit() {
    if (!limitAmount) return;
    await setLimit.mutateAsync({ budgetCategoryId: limitDialog.categoryId, limitAmount: parseFloat(limitAmount) });
    setLimitDialog({ open: false, categoryId: "", current: null });
  }

  async function handleCreateCategory() {
    if (!newCat.name) return;
    await createCategory.mutateAsync(newCat);
    setNewCategoryOpen(false);
    setNewCat({ name: "", icon: "tag", color: "#6366f1" });
  }

  return (
    <div>
      <PageHeader
        title="Budget"
        description="Manage spending limits by category"
        action={
          <div className="flex gap-2 items-center">
            <MonthPicker value={monthYear} onChange={setMonthYear} />
            <Button
              onClick={() => setNewCategoryOpen(true)}
              size="sm"
              className="rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-100"
            >
              <Plus size={14} className="mr-1" /> Category
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <FullPageSpinner />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories?.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              onSetLimit={openSetLimit}
              onDelete={(id) => setDeleteId(id)}
            />
          ))}
        </div>
      )}

      {/* Set Limit Dialog */}
      <Dialog open={limitDialog.open} onOpenChange={(o) => setLimitDialog((s) => ({ ...s, open: o }))}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-bold">Set Budget Limit</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Monthly Limit (₱)</Label>
              <Input
                type="number"
                value={limitAmount}
                onChange={(e) => setLimitAmount(e.target.value)}
                placeholder="5000"
                className="mt-1.5 rounded-xl border-gray-200 h-11"
              />
            </div>
            <Button
              onClick={handleSetLimit}
              className="w-full rounded-full bg-indigo-600 hover:bg-indigo-700 h-11"
              disabled={setLimit.isPending}
            >
              {setLimit.isPending ? "Saving..." : "Save Limit"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Category Dialog */}
      <Dialog open={newCategoryOpen} onOpenChange={setNewCategoryOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-bold">New Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Name</Label>
              <Input
                value={newCat.name}
                onChange={(e) => setNewCat((s) => ({ ...s, name: e.target.value }))}
                placeholder="Entertainment"
                className="mt-1.5 rounded-xl border-gray-200 h-11"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Color</Label>
              <div className="flex gap-2 mt-2 flex-wrap">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewCat((s) => ({ ...s, color: c }))}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${newCat.color === c ? "border-gray-800 scale-110" : "border-transparent"}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <Button
              onClick={handleCreateCategory}
              className="w-full rounded-full bg-indigo-600 hover:bg-indigo-700 h-11"
              disabled={createCategory.isPending}
            >
              {createCategory.isPending ? "Creating..." : "Create Category"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete Category"
        description="This will permanently delete this category. Existing transactions will be unlinked."
        confirmLabel="Delete"
        onConfirm={async () => { if (deleteId) { await deleteCategory.mutateAsync(deleteId); setDeleteId(null); } }}
        destructive
      />
    </div>
  );
}
