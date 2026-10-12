import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, FileText, Sparkles, X } from "lucide-react";
import { useDashboard } from "../context/DashboardContext";
import { formatCurrency } from "../lib/format";
import { monthKeyOf, periodLabelOf } from "../lib/export/buildReport";
import type { TabKey } from "../types";

/**
 * Scoped, per-period dismissal key. Kept under the `aureus.` namespace and
 * written ONLY on dismiss, so it can never clobber `aureus.dashboard.v1`,
 * `aureus.welcome.v1` or the theme key.
 */
const STORAGE_PREFIX = "aureus.report.";

function readDismissed(month: string): boolean {
  try {
    return localStorage.getItem(STORAGE_PREFIX + month) === "1";
  } catch {
    return false; // private mode — a storage failure must not hide data
  }
}

/**
 * Dismissible "Monthly Report Ready" card on Overview.
 *
 * It only ever renders once the store has hydrated AND the current month
 * actually has transactions, so it can never appear as a blank or "No Data"
 * surface during a cold start.
 */
export default function MonthlyReportCard({ goTo }: { goTo: (t: TabKey) => void }) {
  const { transactions, currency, hydrated } = useDashboard();
  const [month] = useState(() => monthKeyOf());
  const [dismissed, setDismissed] = useState(() => readDismissed(month));

  const monthTx = useMemo(
    () => transactions.filter((t) => t.date.startsWith(month)),
    [transactions, month]
  );

  const income = useMemo(
    () => monthTx.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0),
    [monthTx]
  );
  const expense = useMemo(
    () => monthTx.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0),
    [monthTx]
  );

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(STORAGE_PREFIX + month, "1");
    } catch {
      /* private mode — the card is hidden for this render either way */
    }
  };

  if (!hydrated || dismissed || monthTx.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="rounded-3xl border border-gold-400/25 bg-gradient-to-br from-gold-400/[0.08] to-transparent p-5 sm:p-6"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gold-400/25 bg-gold-400/10">
          <Sparkles className="h-5 w-5 text-gold-300" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-display text-base font-semibold text-white">Monthly Report Ready</p>
              <p className="mt-0.5 text-sm text-white/45">
                {periodLabelOf(month)} · {monthTx.length} transaction{monthTx.length === 1 ? "" : "s"}
              </p>
            </div>
            <button
              onClick={dismiss}
              aria-label="Dismiss monthly report card"
              className="rounded-md p-1 text-white/30 transition hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
              Income {formatCurrency(income, currency)}
            </span>
            <span className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-3 py-1 text-xs font-medium text-rose-300">
              Expenses {formatCurrency(expense, currency)}
            </span>
            <span className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-medium text-white/70">
              Net {formatCurrency(income - expense, currency)}
            </span>
          </div>

          <button
            onClick={() => goTo("transactions")}
            className="gold-btn mt-4 inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold"
          >
            <FileText className="h-3.5 w-3.5" />
            Export this month
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}