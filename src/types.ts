export type TabKey =
  | "overview"
  | "transactions"
  | "accounts"
  | "budgets"
  | "investments"
  | "goals"
  | "reports"
  | "settings";

export type TxType = "income" | "expense";

export interface Transaction {
  id: string;
  date: string; // ISO date
  description: string;
  category: string;
  accountId: string;
  amount: number; // always positive
  type: TxType;
  notes?: string; // optional memo — surfaced in the details modal
}

export type AccountType = "checking" | "savings" | "credit" | "investment" | "cash";

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  color: string; // tailwind gradient key
  institution?: string;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  color: string;
  icon: string;
}

export interface Goal {
  id: string;
  name: string;
  target: number;
  saved: number;
  deadline?: string;
  color: string;
  icon: string;
}

export interface Holding {
  id: string;
  symbol: string;
  name: string;
  units: number;
  value: number;
  change: number; // percent
  color: string;
}

export type AppNotificationKind = "budget" | "goal" | "transaction" | "welcome" | "system";

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  kind: AppNotificationKind;
  time: number; // epoch ms
  unread: boolean;
}

export const CARD_COLORS = [
  "gold",
  "emerald",
  "sky",
  "violet",
  "rose",
  "cyan",
] as const;

export type CardColor = (typeof CARD_COLORS)[number];