import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Wallet, ArrowDownRight, ArrowUpRight, Plus, Receipt, PiggyBank, Target as TargetIcon, Flame } from "lucide-react";
import PageTransition from "../components/PageTransition";
import SectionHeader from "../components/SectionHeader";
import EmptyState from "../components/EmptyState";
import TiltCard from "../components/TiltCard";
import { useDashboard } from "../context/DashboardContext";
import { formatCurrency, formatDateShort } from "../lib/format";
import TransactionFormModal from "../components/forms/TransactionFormModal";
import AccountFormModal from "../components/forms/AccountFormModal";
import BudgetFormModal from "../components/forms/BudgetFormModal";
import GoalFormModal from "../components/forms/GoalFormModal";
import CashFlowChart from "../components/charts/CashFlowChart";
import CategoryDonut from "../components/charts/CategoryDonut";
import Sparkline from "../components/charts/Sparkline";
import {
  RANGE_OPTIONS,
  computeCashFlow,
  computeCategoryBreakdown,
  computeKpis,
  computeSparkline,
  type ChartRange,
} from "../lib/chartData";
import { cn } from "../utils/cn";
import type { TabKey } from "../types";

interface Props {
  goTo: (t: TabKey) => void;
  onFilterCategory?: (category: string) => void;
}

function KpiCard({
  label,
  value,
  icon: Icon,
  accent,
  sparkColor,
  spark,
  delay,
}: {
  label: string;
  value: string;
  icon: typeof Wallet;
  accent: string;
  sparkColor: string;
  spark: number[];
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: "easeOut" }}
    >
      <TiltCard className="p-5" intensity={4}>
        <div className="flex min-w-0 items-center justify-between gap-2">
          <p className="truncate text-xs uppercase tracking-wider text-white/40">{label}</p>
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${accent}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <p className="mt-2 truncate font-display text-2xl font-semibold text-white">{value}</p>
        <Sparkline data={spark} color={sparkColor} height={32} className="mt-3" />
      </TiltCard>
    </motion.div>
  );
}

function RangeSelector({ value, onChange }: { value: ChartRange; onChange: (r: ChartRange) => void }) {
  return (
    <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1">
      {RANGE_OPTIONS.map((r) => (
        <button
          key={r.key}
          onClick={() => onChange(r.key)}
          className={cn(
            "rounded-lg px-2.5 py-1 text-[11px] font-semibold transition",
            value === r.key ? "bg-gold-400/90 text-ink-950 shadow" : "text-white/45 hover:text-white/80"
          )}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}

export default function Overview({ goTo, onFilterCategory }: Props) {
  const { totals, transactions, budgets, currency } = useDashboard();
  const [openTx, setOpenTx] = useState(false);
  const [openAcc, setOpenAcc] = useState(false);
  const [openBudget, setOpenBudget] = useState(false);
  const [openGoal, setOpenGoal] = useState(false);
  const [range, setRange] = useState<ChartRange>("6m");

  const money = (n: number) => formatCurrency(n, currency);

  const cashFlow = useMemo(() => computeCashFlow(transactions, range), [transactions, range]);
  const categories = useMemo(() => computeCategoryBreakdown(transactions, range), [transactions, range]);
  const kpis = useMemo(() => computeKpis(transactions, totals.netWorth), [transactions, totals.netWorth]);
  const netSpark = useMemo(() => computeSparkline(transactions, 30), [transactions]);
  const savingsSpark = useMemo(() => computeSparkline(transactions.filter((t) => t.type === "income"), 30), [transactions]);
  const expenseSpark = useMemo(() => computeSparkline(transactions.filter((t) => t.type === "expense"), 30), [transactions]);
  const hasActivity = transactions.length > 0;


  return (
    <PageTransition>
      <TransactionFormModal open={openTx} onClose={() => setOpenTx(false)} />
      <AccountFormModal open={openAcc} onClose={() => setOpenAcc(false)} />
      <BudgetFormModal open={openBudget} onClose={() => setOpenBudget(false)} />
      <GoalFormModal open={openGoal} onClose={() => setOpenGoal(false)} />

      <TiltCard className="overflow-hidden p-6 sm:p-8" intensity={4}>
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold-300/80">Total Net Worth</p>
            <p className="mt-3 font-display text-4xl font-bold text-white sm:text-5xl">
              {money(totals.netWorth)}
            </p>
            <p className="mt-3 max-w-md text-sm text-white/40">
              Every account, investment, and goal — unified into a single number that reflects where you truly stand.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            <div className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <p className="flex items-center gap-1 text-[11px] uppercase tracking-wider text-emerald-300/80">
                <ArrowUpRight className="h-3 w-3" /> Income
              </p>
              <p className="mt-1 truncate font-display text-lg font-semibold text-white">{money(totals.totalIncome)}</p>
            </div>
            <div className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <p className="flex items-center gap-1 text-[11px] uppercase tracking-wider text-rose-300/80">
                <ArrowDownRight className="h-3 w-3" /> Expenses
              </p>
              <p className="mt-1 truncate font-display text-lg font-semibold text-white">{money(totals.totalExpense)}</p>
            </div>
          </div>
        </div>
      </TiltCard>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="hidden md:block">
          <KpiCard
            label="Total Net Worth"
            value={money(kpis.netWorth)}
            icon={Wallet}
            accent="bg-gold-400/10 text-gold-300"
            sparkColor="#e3ac37"
            spark={netSpark}
            delay={0.05}
          />
        </div>
        <KpiCard
          label="Savings Rate"
          value={`${kpis.savingsRate.toFixed(1)}%`}
          icon={PiggyBank}
          accent="bg-emerald-400/10 text-emerald-300"
          sparkColor="#34d399"
          spark={savingsSpark}
          delay={0.1}
        />
        <KpiCard
          label="Top Expense"
          value={kpis.topExpense ? money(kpis.topExpense.amount) : money(0)}
          icon={Flame}
          accent="bg-rose-400/10 text-rose-300"
          sparkColor="#fb7185"
          spark={expenseSpark}
          delay={0.15}
        />
      </div>
      {kpis.topExpense && (
        <p className="-mt-2 text-xs text-white/35">
          Top category: <span className="font-semibold text-white/70">{kpis.topExpense.category}</span> ·{" "}
          <button
            onClick={() => onFilterCategory?.(kpis.topExpense!.category)}
            className="text-gold-300 underline-offset-2 hover:underline"
          >
            view transactions →
          </button>
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <TiltCard className="p-6" intensity={2}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <SectionHeader
                title="Cash Flow"
                subtitle={range === "7d" || range === "1m" ? "Income vs expenses, daily" : "Income vs expenses, monthly"}
              />
              <RangeSelector value={range} onChange={setRange} />
            </div>
            <div className="mt-4">
              <CashFlowChart data={cashFlow} currency={currency} />
            </div>
            <div className="mt-3 flex items-center gap-5 text-xs text-white/45">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400" /> Income
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-400" /> Expenses
              </span>
            </div>
          </TiltCard>
        </div>

        <TiltCard className="p-6" intensity={2}>
          <SectionHeader title="Quick Actions" />
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Add Transaction", icon: Receipt, action: () => setOpenTx(true) },
              { label: "Add Account", icon: Wallet, action: () => setOpenAcc(true) },
              { label: "New Budget", icon: PiggyBank, action: () => setOpenBudget(true) },
              { label: "New Goal", icon: TargetIcon, action: () => setOpenGoal(true) },
            ].map((item) => (
              <motion.button
                key={item.label}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={item.action}
                className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-center transition hover:border-gold-400/30 hover:bg-white/[0.05]"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-400/10 text-gold-300">
                  <item.icon className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium text-white/70">{item.label}</span>
              </motion.button>
            ))}
          </div>
        </TiltCard>
      </div>

      <TiltCard className="p-6" intensity={1}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SectionHeader
            title="Spending by Category"
            subtitle={hasActivity ? "Click a slice to drill into its transactions" : "Where your money goes"}
          />
          <span className="text-[11px] text-white/30">Range: {RANGE_OPTIONS.find((r) => r.key === range)?.label}</span>
        </div>
        <div className="mt-5">
          {categories.length === 0 && !hasActivity ? (
            <EmptyState
              icon={Receipt}
              title="No expense data yet"
              subtitle="Category insights appear automatically once you record expenses."
              action={
                <button onClick={() => setOpenTx(true)} className="gold-btn flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold">
                  <Plus className="h-3.5 w-3.5" /> Add Transaction
                </button>
              }
            />
          ) : (
            <CategoryDonut data={categories} currency={currency} onCategoryClick={onFilterCategory} />
          )}
        </div>
      </TiltCard>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <TiltCard className="p-6" intensity={2}>
            <SectionHeader
              title="Recent Transactions"
              subtitle="Your latest activity"
              action={
                <button onClick={() => goTo("transactions")} className="text-xs font-medium text-gold-300 hover:text-gold-200">
                  View all →
                </button>
              }
            />
            <div className="mt-4">
              {transactions.length === 0 ? (
                <EmptyState
                  icon={Receipt}
                  title="No transactions yet"
                  subtitle="Once you add income or expenses, they'll appear here beautifully organized."
                  action={
                    <button
                      onClick={() => setOpenTx(true)}
                      className="gold-btn flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Transaction
                    </button>
                  }
                />
              ) : (
                <ul className="divide-y divide-white/[0.06]">
                  {transactions.slice(0, 5).map((t) => (
                    <li key={t.id} className="flex items-center justify-between gap-4 py-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                            t.type === "income" ? "bg-emerald-400/10 text-emerald-300" : "bg-rose-400/10 text-rose-300"
                          }`}
                        >
                          {t.type === "income" ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-white/85">{t.description}</p>
                          <p className="truncate text-xs text-white/35">
                            {t.category} · {formatDateShort(t.date)}
                          </p>
                        </div>
                      </div>
                      <p className={`shrink-0 text-right text-sm font-semibold ${t.type === "income" ? "text-emerald-300" : "text-white/80"}`}>
                        {t.type === "income" ? "+" : "-"}
                        {money(t.amount)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </TiltCard>
        </div>

        <TiltCard className="p-6" intensity={2}>
          <SectionHeader
            title="Budgets"
            action={
              <button onClick={() => goTo("budgets")} className="text-xs font-medium text-gold-300 hover:text-gold-200">
                Manage →
              </button>
            }
          />
          <div className="mt-4">
            {budgets.length === 0 ? (
              <EmptyState
                icon={PiggyBank}
                title="No budgets set"
                subtitle="Create category limits to keep your spending in check."
                action={
                  <button
                    onClick={() => setOpenBudget(true)}
                    className="gold-btn flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold"
                  >
                    <Plus className="h-3.5 w-3.5" /> New Budget
                  </button>
                }
              />
            ) : (
              <div className="space-y-4">
                {budgets.slice(0, 4).map((b) => {
                  const pct = Math.min(100, (b.spent / b.limit) * 100);
                  return (
                    <div key={b.id}>
                      <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                        <span className="min-w-0 truncate text-white/70">
                          {b.icon} {b.category}
                        </span>
                        <span className="shrink-0 text-right text-white/40">
                          {money(b.spent)} / {money(b.limit)}
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className="h-full rounded-full bg-gradient-to-r from-gold-300 to-gold-500"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </TiltCard>
      </div>
    </PageTransition>
  );
}