import type { Budget, Transaction } from "../types";
import { sameCategory } from "./format";

export type ChartRange = "7d" | "1m" | "6m" | "1y" | "all";

export interface RangeMeta {
  key: ChartRange;
  label: string;
  days: number | null; // null = everything
}

export const RANGE_OPTIONS: RangeMeta[] = [
  { key: "7d", label: "7D", days: 7 },
  { key: "1m", label: "1M", days: 30 },
  { key: "6m", label: "6M", days: 182 },
  { key: "1y", label: "1Y", days: 365 },
  { key: "all", label: "All", days: null },
];

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function monthKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function monthLabel(key: string): string {
  const [year, month] = key.split("-");
  return `${MONTH_LABELS[Number(month) - 1]} ${year.slice(2)}`;
}

/** Filter transactions to those within the selected range (relative to today). */
export function filterByRange(transactions: Transaction[], range: ChartRange): Transaction[] {
  const meta = RANGE_OPTIONS.find((r) => r.key === range);
  if (!meta || meta.days === null) return transactions;
  const cutoff = startOfDay(Date.now()) - (meta.days - 1) * DAY_MS;
  return transactions.filter((t) => new Date(t.date).getTime() >= cutoff);
}


export interface CashFlowPoint {
  label: string;
  iso: string;
  income: number;
  expense: number;
  net: number;
  cumulative: number;
}

function formatDateShortSafe(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(d);
}

/**
 * Income vs expense over time. Buckets by day for short ranges (7d/1m),
 * by month for longer ranges (6m/1y/all).
 */
export function computeCashFlow(transactions: Transaction[], range: ChartRange): CashFlowPoint[] {
  const scoped = filterByRange(transactions, range);
  if (scoped.length === 0) return [];

  const meta = RANGE_OPTIONS.find((r) => r.key === range)!;
  const byMonth = meta.days === null || meta.days > 92;

  if (byMonth) {
    const buckets = new Map<string, { income: number; expense: number }>();
    let minKey: string | null = null;
    let maxKey: string | null = null;
    for (const t of scoped) {
      const key = monthKey(new Date(t.date).getTime());
      const b = buckets.get(key) ?? { income: 0, expense: 0 };
      if (t.type === "income") b.income += t.amount;
      else b.expense += t.amount;
      buckets.set(key, b);
      if (minKey === null || key < minKey) minKey = key;
      if (maxKey === null || key > maxKey) maxKey = key;
    }
    if (minKey && maxKey && minKey !== maxKey) {
      const [startY, startM] = minKey.split("-").map(Number);
      const [endY, endM] = maxKey.split("-").map(Number);
      let y = startY;
      let m = startM;
      while (y < endY || (y === endY && m <= endM)) {
        const key = `${y}-${String(m).padStart(2, "0")}`;
        if (!buckets.has(key)) buckets.set(key, { income: 0, expense: 0 });
        m += 1;
        if (m > 12) {
          m = 1;
          y += 1;
        }
      }
    }
    let cumulative = 0;
    return Array.from(buckets.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, v]) => {
        const net = v.income - v.expense;
        cumulative += net;
        return {
          label: monthLabel(key),
          iso: key,
          income: Math.round(v.income * 100) / 100,
          expense: Math.round(v.expense * 100) / 100,
          net: Math.round(net * 100) / 100,
          cumulative: Math.round(cumulative * 100) / 100,
        };
      });
  }

  const dailyBuckets = new Map<string, { income: number; expense: number }>();
  const today = startOfDay(Date.now());
  const firstDay = startOfDay(new Date(scoped[0].date).getTime());
  const from = Math.max(firstDay, today - (meta.days! - 1) * DAY_MS);
  for (let ts = from; ts <= today; ts += DAY_MS) {
    dailyBuckets.set(new Date(ts).toISOString().slice(0, 10), { income: 0, expense: 0 });
  }
  for (const t of scoped) {
    const key = new Date(t.date).toISOString().slice(0, 10);
    const b = dailyBuckets.get(key);
    if (!b) continue;
    if (t.type === "income") b.income += t.amount;
    else b.expense += t.amount;
  }
  let dailyCumulative = 0;
  return Array.from(dailyBuckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, v]) => {
      const net = v.income - v.expense;
      dailyCumulative += net;
      return {
        label: formatDateShortSafe(key),
        iso: key,
        income: Math.round(v.income * 100) / 100,
        expense: Math.round(v.expense * 100) / 100,
        net: Math.round(net * 100) / 100,
        cumulative: Math.round(dailyCumulative * 100) / 100,
      };
    });
}


export interface CategorySlice {
  category: string;
  amount: number;
  count: number;
  share: number; // 0..100
  color: string;
}

const CATEGORY_COLORS = ["#e3ac37", "#34d399", "#38bdf8", "#a78bfa", "#fb7185", "#22d3ee", "#fbbf24", "#f472b6"];

export function computeCategoryBreakdown(transactions: Transaction[], range: ChartRange): CategorySlice[] {
  const scoped = filterByRange(transactions, range).filter((t) => t.type === "expense");
  const map = new Map<string, { amount: number; count: number }>();
  for (const t of scoped) {
    const b = map.get(t.category) ?? { amount: 0, count: 0 };
    b.amount += t.amount;
    b.count += 1;
    map.set(t.category, b);
  }
  const total = Array.from(map.values()).reduce((s, v) => s + v.amount, 0);
  return Array.from(map.entries())
    .map(([category, v], i) => ({
      category,
      amount: Math.round(v.amount * 100) / 100,
      count: v.count,
      share: total > 0 ? Math.round((v.amount / total) * 1000) / 10 : 0,
      color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    }))
    .sort((a, b) => b.amount - a.amount);
}

export interface BudgetComparison {
  category: string;
  icon: string;
  limit: number;
  spent: number;
  pct: number;
  color: string;
}

/** Budget target vs actual spending, with threshold coloring (emerald/amber/red). */
export function computeBudgetVsActual(budgets: Budget[], transactions: Transaction[], range: ChartRange): BudgetComparison[] {
  const scoped = filterByRange(transactions, range).filter((t) => t.type === "expense");
  return budgets.map((b) => {
    const spent = scoped
      .filter((t) => sameCategory(t.category, b.category))
      .reduce((s, t) => s + t.amount, 0);
    const pct = b.limit > 0 ? (spent / b.limit) * 100 : 0;
    return {
      category: b.category,
      icon: b.icon,
      limit: b.limit,
      spent: Math.round(spent * 100) / 100,
      pct: Math.round(pct * 10) / 10,
      color: pct > 100 ? "#fb7185" : pct >= 85 ? "#fbbf24" : "#34d399",
    };
  });
}

/** Cumulative net balance trend for the sparkline (last N days, relative to window start). */
export function computeSparkline(transactions: Transaction[], days = 30): number[] {
  const today = startOfDay(Date.now());
  const from = today - (days - 1) * DAY_MS;
  const inWindow = transactions.filter((t) => {
    const ts = new Date(t.date).getTime();
    return ts >= from && ts <= today + DAY_MS - 1;
  });

  const daily = new Map<string, number>();
  for (const t of inWindow) {
    const key = new Date(t.date).toISOString().slice(0, 10);
    daily.set(key, (daily.get(key) ?? 0) + (t.type === "income" ? t.amount : -t.amount));
  }

  const points: number[] = [];
  let running = 0;
  for (let i = 0; i < days; i++) {
    const ts = from + i * DAY_MS;
    const key = new Date(ts).toISOString().slice(0, 10);
    running += daily.get(key) ?? 0;
    points.push(Math.round(running * 100) / 100);
  }
  return points;
}

export interface KpiData {
  netWorth: number;
  savingsRate: number;
  topExpense: { category: string; amount: number } | null;
}

export function computeKpis(transactions: Transaction[], netWorth: number): KpiData {
  const expenses = transactions.filter((t) => t.type === "expense");
  const income = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expenseTotal = expenses.reduce((s, t) => s + t.amount, 0);
  const savingsRate = income > 0 ? ((income - expenseTotal) / income) * 100 : 0;

  const byCategory = new Map<string, number>();
  for (const t of expenses) byCategory.set(t.category, (byCategory.get(t.category) ?? 0) + t.amount);
  let topExpense: KpiData["topExpense"] = null;
  for (const [category, amount] of byCategory.entries()) {
    if (!topExpense || amount > topExpense.amount) topExpense = { category, amount };
  }
  return { netWorth, savingsRate: Math.round(savingsRate * 10) / 10, topExpense };
}

