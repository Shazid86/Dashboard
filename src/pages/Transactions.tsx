import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Copy, Eye, MoreHorizontal, Pencil, Plus, Receipt, Search, Trash2, X } from "lucide-react";
import PageTransition from "../components/PageTransition";
import SectionHeader from "../components/SectionHeader";
import EmptyState from "../components/EmptyState";
import TiltCard from "../components/TiltCard";
import { useDashboard } from "../context/DashboardContext";
import { formatCurrency, formatDate } from "../lib/format";
import TransactionFormModal from "../components/forms/TransactionFormModal";
import ConfirmDialog from "../components/ConfirmDialog";
import TransactionDetailsModal from "../components/TransactionDetailsModal";
import { DropdownMenu, DropdownMenuItem } from "../components/ui/DropdownMenu";
import { useToast } from "../context/ToastContext";
import { cn } from "../utils/cn";
import type { Transaction } from "../types";

type Filter = "all" | "income" | "expense";

interface Props {
  categoryFilter?: string | null;
  onClearFilter?: () => void;
}

export default function Transactions({ categoryFilter, onClearFilter }: Props) {
  const { transactions, accounts, removeTransaction, addTransaction, totals, currency } = useDashboard();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [detailsTarget, setDetailsTarget] = useState<Transaction | null>(null);

  const money = (n: number) => formatCurrency(n, currency);
  const accountName = (id: string) => accounts.find((a) => a.id === id)?.name ?? "—";

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (categoryFilter && t.category !== categoryFilter) return false;
      if (filter !== "all" && t.type !== filter) return false;
      if (query && !`${t.description} ${t.category}`.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [transactions, filter, query, categoryFilter]);

  return (
    <PageTransition>
      <TransactionFormModal
        open={open || editing !== null}
        initial={editing}
        onClose={() => {
          setOpen(false);
          setEditing(null);
        }}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <TiltCard className="p-5" intensity={4}>
          <p className="text-xs uppercase tracking-wider text-white/40">Total Income</p>
          <p className="mt-2 font-display text-2xl font-semibold text-emerald-300">{money(totals.totalIncome)}</p>
        </TiltCard>
        <TiltCard className="p-5" intensity={4}>
          <p className="text-xs uppercase tracking-wider text-white/40">Total Expenses</p>
          <p className="mt-2 font-display text-2xl font-semibold text-rose-300">{money(totals.totalExpense)}</p>
        </TiltCard>
        <TiltCard className="p-5" intensity={4}>
          <p className="text-xs uppercase tracking-wider text-white/40">Net Flow</p>
          <p className="mt-2 font-display text-2xl font-semibold text-gold-300">
            {money(totals.totalIncome - totals.totalExpense)}
          </p>
        </TiltCard>
      </div>

      <TiltCard className="w-full overflow-hidden p-6" intensity={1}>
        <SectionHeader
          title="All Transactions"
          subtitle={`${transactions.length} record${transactions.length === 1 ? "" : "s"}`}
          action={
            <button
              onClick={() => setOpen(true)}
              className="gold-btn flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-transform hover:scale-[1.03] active:scale-95"
            >
              <Plus className="h-3.5 w-3.5" /> Add Transaction
            </button>
          }
        />

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 sm:w-72">
            <Search className="h-4 w-4 text-white/30" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search transactions…"
              className="w-full bg-transparent text-sm text-white placeholder:text-white/25 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1">
            {(["all", "income", "expense"] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition",
                  filter === f ? "bg-gold-500 text-gold-900" : "text-white/40 hover:text-white/70"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {categoryFilter && (
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gold-400/30 bg-gold-400/10 px-3 py-1 text-xs font-medium text-gold-300">
              Category: {categoryFilter}
              <button
                onClick={onClearFilter}
                aria-label="Clear category filter"
                className="ml-0.5 rounded-full transition hover:bg-gold-400/20"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
            <span className="text-xs text-white/30">{filtered.length} matching</span>
          </div>
        )}

        <div className="mt-5">          {transactions.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No transactions yet"
              subtitle="Once you add income or expenses, they'll appear here beautifully organized."
              action={
                <button
                  onClick={() => setOpen(true)}
                  className="gold-btn flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Transaction
                </button>
              }
            />
          ) : filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-white/30">No transactions match your filters.</p>
          ) : (
            <div className="table-scroll w-full max-w-full overflow-x-auto">
              <table className="w-full min-w-[600px] border-separate border-spacing-y-1 text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-white/35">
                    <th className="whitespace-nowrap px-3 pb-2 font-medium">Description</th>
                    <th className="whitespace-nowrap px-3 pb-2 font-medium">Category</th>
                    <th className="whitespace-nowrap px-3 pb-2 font-medium">Account</th>
                    <th className="whitespace-nowrap px-3 pb-2 font-medium">Date</th>
                    <th className="whitespace-nowrap px-3 pb-2 text-right font-medium">Amount</th>
                    <th className="whitespace-nowrap px-3 pb-2"></th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence initial={false}>
                    {filtered.map((t) => (
                      <motion.tr
                        key={t.id}
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="group rounded-xl bg-white/[0.02] transition hover:bg-white/[0.045]"
                      >
                        <td className="whitespace-nowrap rounded-l-xl px-3 py-3">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                t.type === "income" ? "bg-emerald-400/10 text-emerald-300" : "bg-rose-400/10 text-rose-300"
                              }`}
                            >
                              {t.type === "income" ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                            </div>
                            <span className="max-w-[240px] truncate font-medium text-white/85">{t.description}</span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-white/50">{t.category}</td>
                        <td className="whitespace-nowrap px-3 py-3 text-white/50">{accountName(t.accountId)}</td>
                        <td className="whitespace-nowrap px-3 py-3 text-white/50">{formatDate(t.date)}</td>
                        <td className={`whitespace-nowrap px-3 py-3 text-right font-semibold ${t.type === "income" ? "text-emerald-300" : "text-white/80"}`}>
                          {t.type === "income" ? "+" : "-"}
                          {money(t.amount)}
                        </td>
                        <td className="whitespace-nowrap rounded-r-xl px-3 py-3 text-right">
                          <div className="flex items-center justify-end gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1">
                            <button
                              onClick={() => setEditing(t)}
                              aria-label="Edit transaction"
                              title="Edit transaction"
                              className="rounded-lg p-1.5 text-white/40 transition hover:bg-white/[0.06] hover:text-gold-300"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>

                            <button
                              onClick={() => setPendingDelete(t.id)}
                              aria-label="Delete transaction"
                              title="Delete transaction"
                              className="rounded-lg p-1.5 text-white/40 transition hover:bg-rose-500/10 hover:text-rose-300"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>

                            <DropdownMenu
                              align="end"
                              label="Transaction Options"
                              trigger={({ onToggle, open: menuOpen }) => (
                                <button
                                  onClick={onToggle}
                                  aria-label="Transaction options"
                                  title="More actions"
                                  aria-expanded={menuOpen}
                                  className={cn(
                                    "rounded-lg p-1.5 text-white/40 transition hover:bg-white/[0.06] hover:text-white",
                                    menuOpen && "bg-white/[0.08] text-white"
                                  )}
                                >
                                  <MoreHorizontal className="h-3.5 w-3.5" />
                                </button>
                              )}
                            >
                              <DropdownMenuItem icon={Eye} onSelect={() => setDetailsTarget(t)}>
                                View Details
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                icon={Copy}
                                onSelect={() => {
                                  addTransaction({
                                    description: t.description,
                                    amount: t.amount,
                                    type: t.type,
                                    category: t.category,
                                    accountId: t.accountId,
                                    date: t.date,
                                  });
                                  toast.success("Transaction duplicated", `${t.description} copied as a new entry.`);
                                }}
                              >
                                Duplicate Transaction
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                icon={Copy}
                                onSelect={() => {
                                  navigator.clipboard
                                    .writeText(money(t.amount))
                                    .then(() => toast.success("Amount copied to clipboard", money(t.amount)))
                                    .catch(() => toast.error("Copy failed", "Clipboard is unavailable in this browser."));
                                }}
                              >
                                Copy Amount
                              </DropdownMenuItem>
                            </DropdownMenu>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </TiltCard>

      <ConfirmDialog
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) {
            removeTransaction(pendingDelete);
            toast.success("Transaction deleted", "The transaction has been removed.");
          }
        }}
      />

      <TransactionDetailsModal
        transaction={detailsTarget}
        open={detailsTarget !== null}
        onClose={() => setDetailsTarget(null)}
        currency={currency}
      />
    </PageTransition>
  );
}