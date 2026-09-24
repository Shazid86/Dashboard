import { useState } from "react";
import { motion } from "framer-motion";
import { PiggyBank, Plus, X } from "lucide-react";
import PageTransition from "../components/PageTransition";
import SectionHeader from "../components/SectionHeader";
import EmptyState from "../components/EmptyState";
import TiltCard from "../components/TiltCard";
import ProgressRing from "../components/ProgressRing";
import { useDashboard } from "../context/DashboardContext";
import { formatCurrency } from "../lib/format";
import BudgetFormModal from "../components/forms/BudgetFormModal";
import ConfirmDialog from "../components/ConfirmDialog";
import { useToast } from "../context/ToastContext";

const COLOR_HEX: Record<string, string> = {
  gold: "#e3ac37",
  emerald: "#34d399",
  sky: "#38bdf8",
  violet: "#a78bfa",
  rose: "#fb7185",
  cyan: "#22d3ee",
};

export default function Budgets() {
  const { budgets, removeBudget, currency } = useDashboard();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const money = (n: number) => formatCurrency(n, currency);
  const totalLimit = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);

  return (
    <PageTransition>
      <BudgetFormModal open={open} onClose={() => setOpen(false)} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <TiltCard className="p-5" intensity={4}>
          <p className="text-xs uppercase tracking-wider text-white/40">Total Budgeted</p>
          <p className="mt-2 font-display text-2xl font-semibold text-white">{money(totalLimit)}</p>
        </TiltCard>
        <TiltCard className="p-5" intensity={4}>
          <p className="text-xs uppercase tracking-wider text-white/40">Total Spent</p>
          <p className="mt-2 font-display text-2xl font-semibold text-rose-300">{money(totalSpent)}</p>
        </TiltCard>
        <TiltCard className="p-5" intensity={4}>
          <p className="text-xs uppercase tracking-wider text-white/40">Remaining</p>
          <p className="mt-2 font-display text-2xl font-semibold text-emerald-300">{money(Math.max(0, totalLimit - totalSpent))}</p>
        </TiltCard>
      </div>

      <div>
        <SectionHeader
          title="Budget Categories"
          subtitle={`${budgets.length} categor${budgets.length === 1 ? "y" : "ies"}`}
          action={
            <button
              onClick={() => setOpen(true)}
              className="gold-btn flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-transform hover:scale-[1.03] active:scale-95"
            >
              <Plus className="h-3.5 w-3.5" /> New Budget
            </button>
          }
        />
        <div className="mt-5">
          {budgets.length === 0 ? (
            <EmptyState
              icon={PiggyBank}
              title="No budgets created"
              subtitle="Set monthly limits per category so you always know exactly where your money should go."
              action={
                <button onClick={() => setOpen(true)} className="gold-btn flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold">
                  <Plus className="h-3.5 w-3.5" /> New Budget
                </button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {budgets.map((b, i) => {
                const pct = b.limit > 0 ? (b.spent / b.limit) * 100 : 0;
                const over = b.spent > b.limit;
                return (
                  <motion.div
                    key={b.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <TiltCard className="group relative p-5" intensity={6}>
                      <button
                        onClick={() => setPendingDelete(b.id)}
                        aria-label="Delete budget"
                        title="Delete budget"
                        className="absolute right-3 top-3 z-10 rounded-full border border-rose-500/25 bg-rose-500/10 p-1 text-rose-300 transition hover:bg-rose-500/20"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                      <div className="flex items-center gap-4">
                        <ProgressRing percent={pct} color={over ? "#fb7185" : COLOR_HEX[b.color] ?? COLOR_HEX.gold}>
                          <span className="text-sm font-bold text-white">{Math.round(pct)}%</span>
                        </ProgressRing>
                        <div>
                          <p className="text-sm font-semibold text-white/90">
                            {b.icon} {b.category}
                          </p>
                          <p className="mt-1 text-xs text-white/40">
                            {money(b.spent)} of {money(b.limit)}
                          </p>
                          {over && <p className="mt-1 text-[11px] font-medium text-rose-300">Over budget</p>}
                        </div>
                      </div>
                    </TiltCard>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) {
            removeBudget(pendingDelete);
            toast.success("Budget deleted", "The budget category has been removed.");
          }
        }}
      />
    </PageTransition>
  );
}