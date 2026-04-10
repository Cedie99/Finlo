"use client";

import { useState, useEffect } from "react";
import { Plus, Filter, X, ArrowLeftRight, RefreshCw } from "lucide-react";
import { ApiError, useTransactions, useCreateTransaction, useDeleteTransaction } from "@/lib/hooks/useTransactions";
import { useRecurringTransactions, useCreateRecurringTransaction, useToggleRecurring, useDeleteRecurringTransaction, useProcessRecurring } from "@/lib/hooks/useRecurringTransactions";
import { useBudgetCategories } from "@/lib/hooks/useBudget";
import { TransactionRow } from "@/components/transactions/TransactionRow";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { RecurringTransactionForm } from "@/components/transactions/RecurringTransactionForm";
import { RecurringTransactionRow } from "@/components/transactions/RecurringTransactionRow";
import { PageHeader } from "@/components/shared/PageHeader";
import { FullPageSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { toast } from "@/lib/utils/toast";
import type { TransactionInput, RecurringTransactionInput } from "@/lib/validations/transactions";

export default function TransactionsPage() {
  const [tab, setTab] = useState<"transactions" | "recurring">("transactions");
  const [open, setOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [riskDialogOpen, setRiskDialogOpen] = useState(false);
  const [riskDialogText, setRiskDialogText] = useState("This transaction may impact upcoming bills.");
  const [pendingTransaction, setPendingTransaction] = useState<TransactionInput | null>(null);
  const [filters, setFilters] = useState<{
    type?: "INCOME" | "EXPENSE" | null;
    categoryId?: string | null;
    search?: string | null;
    dateFrom?: string | null;
    dateTo?: string | null;
  }>({});

  const { data: pages, isLoading, fetchNextPage, hasNextPage } = useTransactions(filters);
  const { data: recurring = [], isLoading: recurringLoading } = useRecurringTransactions();
  const { data: categories = [] } = useBudgetCategories();

  const create = useCreateTransaction();
  const remove = useDeleteTransaction();
  const createRecurring = useCreateRecurringTransaction();
  const toggleRecurring = useToggleRecurring();
  const deleteRecurring = useDeleteRecurringTransaction();
  const process = useProcessRecurring();

  // Process due recurring transactions on page load
  useEffect(() => { process.mutate(); }, []); // eslint-disable-line

  const transactions = pages?.pages.flatMap((p) => p.items) ?? [];

  async function handleCreate(data: TransactionInput) {
    try {
      await create.mutateAsync(data);
      setOpen(false);
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        const payload = error.payload as {
          requiresConfirmation?: boolean;
          risks?: Array<{ message?: string; shortfall?: string }>;
        };

        if (payload.requiresConfirmation) {
          const firstRisk = payload.risks?.[0];
          const shortfall = firstRisk?.shortfall ? ` Shortfall: ${firstRisk.shortfall}.` : "";
          setRiskDialogText(`${firstRisk?.message ?? "This transaction may put your buffer at risk."}${shortfall}`);
          setPendingTransaction(data);
          setRiskDialogOpen(true);
          return;
        }
      }
    }
  }

  async function confirmRiskyCreate() {
    if (!pendingTransaction) return;
    try {
      await create.mutateAsync({ ...pendingTransaction, ignoreRisks: true });
      setRiskDialogOpen(false);
      setPendingTransaction(null);
      setOpen(false);
      toast.success("Transaction recorded", "Saved with risk override.");
    } catch {
      toast.error("Failed to record transaction", "Try again or adjust the amount/date.");
    }
  }

  async function handleCreateRecurring(data: RecurringTransactionInput) {
    await createRecurring.mutateAsync(data);
    setOpen(false);
  }

  function clearFilters() { setFilters({}); }
  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div>
      <PageHeader
        title="Transactions"
        description="Track your income and expenses"
        action={
          <div className="flex gap-2">
            {tab === "transactions" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="rounded-full border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center gap-1.5"
              >
                <Filter size={13} /> Filter
                {hasFilters && <span className="w-2 h-2 bg-indigo-500 rounded-full" />}
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => setOpen(true)}
              className="rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-100"
            >
              <Plus size={14} className="mr-1" />
              {tab === "recurring" ? "Add Recurring" : "Add"}
            </Button>
          </div>
        }
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="space-y-4">
        <TabsList className="rounded-2xl bg-gray-100 p-1">
          <TabsTrigger value="transactions" className="rounded-xl text-xs">Transactions</TabsTrigger>
          <TabsTrigger value="recurring" className="rounded-xl text-xs flex items-center gap-1.5">
            <RefreshCw size={11} /> Recurring
            {recurring.filter(r => r.isActive).length > 0 && (
              <span className="bg-indigo-100 text-indigo-600 text-[10px] font-bold rounded-full px-1.5 py-0">
                {recurring.filter(r => r.isActive).length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          {showFilters && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Select value={filters.type ?? "all"} onValueChange={(v) => setFilters((f) => ({ ...f, type: v === "all" ? null : v as "INCOME" | "EXPENSE" }))}>
                  <SelectTrigger className="h-9 text-xs rounded-xl border-gray-200"><SelectValue placeholder="Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="INCOME">Income</SelectItem>
                    <SelectItem value="EXPENSE">Expense</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filters.categoryId ?? "all"} onValueChange={(v) => setFilters((f) => ({ ...f, categoryId: v === "all" ? null : v }))}>
                  <SelectTrigger className="h-9 text-xs rounded-xl border-gray-200"><SelectValue placeholder="Category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input className="h-9 text-xs rounded-xl border-gray-200" type="date" value={filters.dateFrom ?? ""} onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value || null }))} />
                <Input className="h-9 text-xs rounded-xl border-gray-200" type="date" value={filters.dateTo ?? ""} onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value || null }))} />
              </div>
              <div className="flex gap-2">
                <Input
                  className="h-9 text-xs flex-1 rounded-xl border-gray-200"
                  placeholder="Search description..."
                  value={filters.search ?? ""}
                  onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value || null }))}
                />
                {hasFilters && (
                  <button onClick={clearFilters} className="w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-400">
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          )}

          {isLoading ? (
            <FullPageSpinner />
          ) : transactions.length === 0 ? (
            <EmptyState
              icon={ArrowLeftRight}
              title="No transactions"
              description="Add your first transaction to get started"
              action={
                <Button onClick={() => setOpen(true)} className="rounded-full bg-indigo-600 hover:bg-indigo-700">
                  Add Transaction
                </Button>
              }
            />
          ) : (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm divide-y divide-gray-50 px-2">
              {transactions.map((tx) => (
                <TransactionRow key={tx.id} transaction={tx} onDelete={(id) => remove.mutate(id)} />
              ))}
              {hasNextPage && (
                <div className="p-4 text-center">
                  <Button variant="outline" size="sm" className="rounded-full" onClick={() => fetchNextPage()}>
                    Load more
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="recurring">
          {recurringLoading ? (
            <FullPageSpinner />
          ) : recurring.length === 0 ? (
            <EmptyState
              icon={RefreshCw}
              title="No recurring transactions"
              description="Set up automatic transactions for rent, subscriptions, salary, and more"
              action={
                <Button onClick={() => setOpen(true)} className="rounded-full bg-indigo-600 hover:bg-indigo-700">
                  Add Recurring
                </Button>
              }
            />
          ) : (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm divide-y divide-gray-50 px-2">
              {recurring.map((r) => (
                <RecurringTransactionRow
                  key={r.id}
                  item={r}
                  onToggle={(id, isActive) => toggleRecurring.mutate({ id, isActive })}
                  onDelete={(id) => deleteRecurring.mutate(id)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-bold">
              {tab === "recurring" ? "Add Recurring Transaction" : "Add Transaction"}
            </DialogTitle>
          </DialogHeader>
          {tab === "recurring" ? (
            <RecurringTransactionForm
              categories={categories}
              onSubmit={handleCreateRecurring}
              isLoading={createRecurring.isPending}
            />
          ) : (
            <TransactionForm
              categories={categories}
              onSubmit={handleCreate}
              isLoading={create.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={riskDialogOpen}
        onOpenChange={setRiskDialogOpen}
        title="Potential cash flow risk"
        description={riskDialogText}
        confirmLabel="Save anyway"
        cancelLabel="Adjust transaction"
        onConfirm={confirmRiskyCreate}
      />
    </div>
  );
}
