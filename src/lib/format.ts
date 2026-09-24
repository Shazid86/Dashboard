export interface CurrencyOption {
  code: string;
  label: string;
  symbol: string;
  flag: string;
}

export const CURRENCIES: CurrencyOption[] = [
  { code: "BDT", label: "Bangladeshi Taka", symbol: "\u09F3", flag: "\u{1F1E7}\u{1F1E9}" },
  { code: "USD", label: "US Dollar", symbol: "$", flag: "\u{1F1FA}\u{1F1F8}" },
  { code: "EUR", label: "Euro", symbol: "\u20AC", flag: "\u{1F1EA}\u{1F1FA}" },
  { code: "GBP", label: "British Pound", symbol: "\u00A3", flag: "\u{1F1EC}\u{1F1E7}" },
  { code: "JPY", label: "Japanese Yen", symbol: "\u00A5", flag: "\u{1F1EF}\u{1F1F5}" },
  { code: "CNY", label: "Chinese Yuan", symbol: "CN\u00A5", flag: "\u{1F1E8}\u{1F1F3}" },
  { code: "INR", label: "Indian Rupee", symbol: "\u20B9", flag: "\u{1F1EE}\u{1F1F3}" },
  { code: "AED", label: "UAE Dirham", symbol: "AED", flag: "\u{1F1E6}\u{1F1EA}" },
  { code: "SAR", label: "Saudi Riyal", symbol: "SAR", flag: "\u{1F1F8}\u{1F1E6}" },
  { code: "AUD", label: "Australian Dollar", symbol: "A$", flag: "\u{1F1E6}\u{1F1FA}" },
  { code: "CAD", label: "Canadian Dollar", symbol: "C$", flag: "\u{1F1E8}\u{1F1E6}" },
  { code: "SGD", label: "Singapore Dollar", symbol: "S$", flag: "\u{1F1F8}\u{1F1EC}" },
  { code: "MYR", label: "Malaysian Ringgit", symbol: "RM", flag: "\u{1F1F2}\u{1F1FE}" },
  { code: "KRW", label: "South Korean Won", symbol: "\u20A9", flag: "\u{1F1F0}\u{1F1F7}" },
];

const NO_DECIMALS = new Set(["JPY", "KRW"]);

function formatAmount(value: number, currency: string, compact: boolean): string {
  const digits = NO_DECIMALS.has(currency) ? 0 : 2;
  const options: Intl.NumberFormatOptions = {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  };
  if (compact) {
    options.notation = "compact";
    options.maximumFractionDigits = Math.min(1, digits);
  }
  return new Intl.NumberFormat("en-US", options).format(value);
}

export function formatCurrency(value: number, currency = "BDT"): string {
  const meta = CURRENCIES.find((c) => c.code === currency);
  return meta ? `${meta.symbol}${formatAmount(value, currency, false)}` : `${currency} ${formatAmount(value, currency, false)}`;
}

export function formatCompact(value: number, currency = "BDT"): string {
  const meta = CURRENCIES.find((c) => c.code === currency);
  return meta ? `${meta.symbol}${formatAmount(value, currency, true)}` : `${currency} ${formatAmount(value, currency, true)}`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(d);
}

export function formatDateShort(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(d);
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

/**
 * Normalize a category name so free-text budgets match the fixed
 * transaction select list: "Food & Dining", "Food and Dining",
 * "food  &  dining" → "food and dining".
 */
export function normalizeCategory(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\s+/g, " ");
}

/** True when both category names refer to the same category. */
export function sameCategory(a: string, b: string): boolean {
  return normalizeCategory(a) === normalizeCategory(b);
}

/**
 * Live monthly spending for a category: sum of this month's expense
 * transactions whose category matches (normalized). Budgets are
 * monthly limits, so "spent" is always derived — never stored.
 */
export function spentForCategory(
  category: string,
  transactions: Array<{ type: string; category: string; amount: number; date: string }>,
  now: Date = new Date()
): number {
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const target = normalizeCategory(category);
  return transactions
    .filter(
      (t) =>
        t.type === "expense" &&
        t.date.startsWith(monthKey) &&
        normalizeCategory(t.category) === target
    )
    .reduce((sum, t) => sum + t.amount, 0);
}