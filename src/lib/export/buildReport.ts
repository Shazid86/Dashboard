import type { Account, Transaction } from "../../types";
import { formatCurrency, formatDate } from "../format";

export interface ReportRow {
  /** Display date, e.g. "Sep 5, 2026" */
  date: string;
  type: string;
  description: string;
  category: string;
  account: string;
  /** Signed, pre-formatted for display, e.g. "+৳1,200.00" / "-৳500.00" */
  amount: string;
  /** Signed raw number — spreadsheets want a real number, not a string */
  value: number;
}

export interface MonthlyReport {
  /** "2026-09" */
  month: string;
  /** "September 2026" */
  periodLabel: string;
  /** "Sep 1, 2026 – Sep 30, 2026" */
  rangeLabel: string;
  currency: string;
  rows: ReportRow[];
  totalIncome: number;
  totalExpense: number;
  net: number;
  count: number;
}

/** Current month as "YYYY-MM". */
export function monthKeyOf(now: Date = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/** Move a "YYYY-MM" key by `delta` months (can be negative). */
export function shiftMonth(month: string, delta: number): string {
  const [year, mon] = month.split("-").map(Number);
  return monthKeyOf(new Date(year, mon - 1 + delta, 1));
}

/** "September 2026" */
export function periodLabelOf(month: string): string {
  const [year, mon] = month.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(
    new Date(year, mon - 1, 1)
  );
}

/** "Sep 1, 2026 – Sep 30, 2026" */
export function rangeLabelOf(month: string): string {
  const [year, mon] = month.split("-").map(Number);
  const lastDay = new Date(year, mon, 0).getDate();
  const fmt = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${fmt.format(new Date(year, mon - 1, 1))} – ${fmt.format(
    new Date(year, mon - 1, lastDay)
  )}`;
}

/**
 * Build the report model for one calendar month.
 *
 * Month matching intentionally uses the exact same `t.date.startsWith(month)`
 * rule as `spentForCategory` in lib/format.ts, so the exported totals can never
 * disagree with the budgets and KPIs shown on screen.
 */
export function buildMonthlyReport(
  transactions: Transaction[],
  accounts: Account[],
  currency: string,
  month: string
): MonthlyReport {
  const inMonth = transactions
    .filter((t) => t.date.startsWith(month))
    .slice()
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

  const accountName = (id: string) => accounts.find((a) => a.id === id)?.name ?? "—";

  const rows: ReportRow[] = inMonth.map((t) => {
    const signed = t.type === "income" ? t.amount : -t.amount;
    return {
      date: formatDate(t.date),
      type: t.type === "income" ? "Income" : "Expense",
      description: t.description,
      category: t.category,
      account: accountName(t.accountId),
      amount: `${signed < 0 ? "-" : "+"}${formatCurrency(Math.abs(signed), currency)}`,
      value: signed,
    };
  });

  const totalIncome = inMonth
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = inMonth
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    month,
    periodLabel: periodLabelOf(month),
    rangeLabel: rangeLabelOf(month),
    currency,
    rows,
    totalIncome,
    totalExpense,
    net: totalIncome - totalExpense,
    count: inMonth.length,
  };
}