import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BarChart3, PieChart as PieIcon } from "lucide-react";
import PageTransition from "../components/PageTransition";
import SectionHeader from "../components/SectionHeader";
import TiltCard from "../components/TiltCard";
import EmptyState from "../components/EmptyState";
import { useDashboard } from "../context/DashboardContext";
import { formatCurrency } from "../lib/format";
import BudgetBars from "../components/charts/BudgetBars";
import ChartTooltip from "../components/charts/ChartTooltip";
import { RANGE_OPTIONS, computeBudgetVsActual, computeCashFlow, computeKpis, type ChartRange } from "../lib/chartData";
import { cn } from "../utils/cn";

export default function Reports() {
  const { transactions, budgets, totals, currency } = useDashboard();
  const [range, setRange] = useState<ChartRange>("1y");

  const money = (n: number) => formatCurrency(n, currency);
  const cashFlow = useMemo(() => computeCashFlow(transactions, range), [transactions, range]);
  const budgetCompare = useMemo(() => computeBudgetVsActual(budgets, transactions, range), [budgets, transactions, range]);
  const kpis = useMemo(() => computeKpis(transactions, totals.netWorth), [transactions, totals.netWorth]);


  const categoryTotals = useMemo(() => {
    const map = new Map<string, number>();
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => map.set(t.category, (map.get(t.category) ?? 0) + t.amount));
    return Array.from(map.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  const hasActivity = transactions.length > 0;

  return (
    <PageTransition>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionHeader title="Reports" subtitle="Deep insights into your money" />
        <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1">
          {RANGE_OPTIONS.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={cn(
                "rounded-lg px-2.5 py-1 text-[11px] font-semibold transition",
                range === r.key ? "bg-gold-400/90 text-ink-950 shadow" : "text-white/45 hover:text-white/80"
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <TiltCard className="p-5" intensity={4}>
          <p className="text-xs uppercase tracking-wider text-white/40">Net Worth</p>
          <p className="mt-2 font-display text-xl font-semibold text-white">{money(kpis.netWorth)}</p>
        </TiltCard>
        <TiltCard className="p-5" intensity={4}>
          <p className="text-xs uppercase tracking-wider text-white/40">Savings Rate</p>
          <p className="mt-2 font-display text-xl font-semibold text-emerald-300">{kpis.savingsRate.toFixed(1)}%</p>
        </TiltCard>
        <TiltCard className="p-5" intensity={4}>
          <p className="text-xs uppercase tracking-wider text-white/40">Budgets Tracked</p>
          <p className="mt-2 font-display text-xl font-semibold text-white">{budgets.length}</p>
        </TiltCard>
        <TiltCard className="p-5" intensity={4}>
          <p className="text-xs uppercase tracking-wider text-white/40">Transactions</p>
          <p className="mt-2 font-display text-xl font-semibold text-white">{transactions.length}</p>
        </TiltCard>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <TiltCard className="p-6" intensity={2}>
          <SectionHeader title="Income vs Expenses" subtitle="Monthly comparison" />
          <div className="relative mt-4 h-64">
            {!hasActivity && (
              <div className="absolute inset-0 z-10 flex items-center justify-center">
                <p className="rounded-full border border-white/10 bg-ink-950/70 px-4 py-1.5 text-xs text-white/40 backdrop-blur">
                  No data yet — this report will populate as you log activity
                </p>
              </div>
            )}
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashFlow}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                <XAxis dataKey="label" stroke="var(--chart-axis)" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis stroke="var(--chart-axis)" tickLine={false} axisLine={false} fontSize={12} width={36} />
                <Tooltip content={<ChartTooltip currency={currency} mode="cashflow" />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                <Bar dataKey="income" fill="#34d399" radius={[4, 4, 0, 0]} maxBarSize={18} />
                <Bar dataKey="expense" fill="#fb7185" radius={[4, 4, 0, 0]} maxBarSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TiltCard>

        <TiltCard className="p-6" intensity={2}>
          <SectionHeader title="Net Trend" subtitle="Rolling monthly net" />
          <div className="relative mt-4 h-64">
            {!hasActivity && (
              <div className="absolute inset-0 z-10 flex items-center justify-center">
                <p className="rounded-full border border-white/10 bg-ink-950/70 px-4 py-1.5 text-xs text-white/40 backdrop-blur">
                  No trend to display yet
                </p>
              </div>
            )}
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cashFlow}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                <XAxis dataKey="label" stroke="var(--chart-axis)" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis stroke="var(--chart-axis)" tickLine={false} axisLine={false} fontSize={12} width={36} />
                <Tooltip content={<ChartTooltip currency={currency} mode="cashflow" />} cursor={{ stroke: "rgba(227,172,55,0.35)" }} />
                <Line type="monotone" dataKey="cumulative" stroke="#e3ac37" strokeWidth={2.5} dot={false} animationDuration={700} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </TiltCard>
      </div>

      <TiltCard className="p-6" intensity={1}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SectionHeader
            title="Budget vs Actual"
            subtitle="Bars shift amber at 85%, red past 100% of the target"
          />
          <div className="flex items-center gap-4 text-[11px] text-white/40">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400" /> Healthy
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-400" /> &ge; 85%
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-400" /> Over
            </span>
          </div>
        </div>
        <div className="mt-4">
          {budgets.length === 0 ? (
            <EmptyState
              icon={BarChart3}
              title="No budgets to compare"
              subtitle="Create budget categories to unlock target-vs-actual comparisons."
            />
          ) : (
            <BudgetBars data={budgetCompare} currency={currency} />
          )}
        </div>
      </TiltCard>

      <TiltCard className="p-6" intensity={1}>
        <SectionHeader title="Spending by Category" subtitle="Where your money goes" />
        <div className="mt-4">
          {categoryTotals.length === 0 ? (
            <EmptyState icon={PieIcon} title="Nothing to break down yet" subtitle="Category insights will appear once you record expenses." />
          ) : (
            <div className="space-y-3">
              {categoryTotals.map((c) => {
                const pct = totals.totalExpense > 0 ? (c.amount / totals.totalExpense) * 100 : 0;
                return (
                  <div key={c.category}>
                    <div className="mb-1.5 flex justify-between text-xs">
                      <span className="text-white/70">{c.category}</span>
                      <span className="text-white/40">{money(c.amount)}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                      <div className="h-full rounded-full bg-gradient-to-r from-gold-300 to-gold-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </TiltCard>

      <div className="hidden items-center gap-2 text-white/20 sm:flex">
        <BarChart3 className="h-3.5 w-3.5" />
        <span className="text-[11px]">Reports refresh automatically as new activity is recorded.</span>
      </div>
    </PageTransition>
  );
}