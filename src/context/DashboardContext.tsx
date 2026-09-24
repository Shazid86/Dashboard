import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Account, AppNotification, Budget, Goal, Holding, Transaction } from "../types";
import { formatCurrency, spentForCategory, uid } from "../lib/format";
import { supabase } from "../lib/supabase";
import { useSupabaseAuth } from "./SupabaseAuthContext";

interface DashboardState {
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  holdings: Holding[];
  userName: string;
  currency: string;
  notifications: AppNotification[];
  notifBudget: boolean;
  notifWeekly: boolean;
  notifGoal: boolean;
}

interface DashboardApi extends DashboardState {
  addAccount: (a: Omit<Account, "id">) => void;
  updateAccount: (id: string, changes: Partial<Omit<Account, "id">>) => Promise<void>;
  removeAccount: (id: string) => void;
  addTransaction: (t: Omit<Transaction, "id">) => void;
  removeTransaction: (id: string) => void;
  updateTransaction: (id: string, changes: Partial<Omit<Transaction, "id">>) => void;
  addBudget: (b: Omit<Budget, "id" | "spent">) => void;
  removeBudget: (id: string) => void;
  addGoal: (g: Omit<Goal, "id">) => void;
  removeGoal: (id: string) => void;
  addFunds: (goalId: string, amount: number) => void;
  addHolding: (h: Omit<Holding, "id">) => void;
  removeHolding: (id: string) => void;
  setUserName: (n: string) => void;
  setCurrency: (c: string) => void;
  setNotifBudget: (v: boolean) => void;
  setNotifWeekly: (v: boolean) => void;
  setNotifGoal: (v: boolean) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
  resetAll: () => void;
  totals: {
    netWorth: number;
    totalBalance: number;
    totalIncome: number;
    totalExpense: number;
    savingsRate: number;
    portfolioValue: number;
  };
}

const STORAGE_KEY = "aureus.dashboard.v1";
const WELCOME_KEY = "aureus.welcome.v1";

const initialState: DashboardState = {
  accounts: [],
  transactions: [],
  budgets: [],
  goals: [],
  holdings: [],
  userName: "",
  currency: "BDT",
  notifications: [],
  notifBudget: true,
  notifWeekly: true,
  notifGoal: true,
};

function load(): DashboardState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw);
    return { ...initialState, ...parsed };
  } catch {
    return initialState;
  }
}

function pushNotification(notifications: AppNotification[], n: Omit<AppNotification, "id" | "time" | "unread">): AppNotification[] {
  const item: AppNotification = { ...n, id: uid(), time: Date.now(), unread: true };
  return [item, ...notifications].slice(0, 20);
}

const DashboardContext = createContext<DashboardApi | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DashboardState>(load);
  const welcomeRef = useRef(false);
  const { user } = useSupabaseAuth();

  /**
   * Live budget spending — derived from this month's expense transactions
   * (normalized category matching), so budget rings and the marketing
   * hero card update instantly. The stored `spent` field is superseded.
   */
  const liveBudgets: Budget[] = useMemo(
    () =>
      state.budgets.map((b) => ({
        ...b,
        spent: spentForCategory(b.category, state.transactions),
      })),
    [state.budgets, state.transactions]
  );


  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  /**
   * Snapshot sync (additive, display-only): mirrors a monthly summary to
   * Supabase so the marketing site's hero card can show live data.
   * Fire-and-forget + debounced — failures never affect the dashboard.
   */
  useEffect(() => {
    if (!user) return;
    const timer = setTimeout(() => {
      try {
        const now = new Date();
        const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
        const periodLabel = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(now);
        const income = state.transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
        const expense = state.transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
        const budgetLimit = liveBudgets.reduce((s, b) => s + b.limit, 0);
        const budgetSpent = liveBudgets.reduce((s, b) => s + b.spent, 0);
        const balance = state.accounts.reduce((s, a) => s + a.balance, 0);
        const portfolio = state.holdings.reduce((s, h) => s + h.value, 0);
        supabase
          .from("dashboard_snapshots")
          .upsert(
            {
              user_id: user.id,
              period,
              period_label: periodLabel,
              income,
              expense,
              budget_limit: budgetLimit,
              budget_spent: budgetSpent,
              net_worth: balance + portfolio,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id,period" }
          )
          .then(
            () => {},
            () => {}
          );
      } catch {
        /* snapshot sync is best-effort — never break the dashboard */
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [user, state, liveBudgets]);

  useEffect(() => {
    if (welcomeRef.current) return;
    welcomeRef.current = true;
    try {
      if (localStorage.getItem(WELCOME_KEY)) return;
      localStorage.setItem(WELCOME_KEY, "1");
      setState((s) =>
        s.notifications.some((n) => n.kind === "welcome")
          ? s
          : {
              ...s,
              notifications: pushNotification(s.notifications, {
                kind: "welcome",
                title: "Welcome to Aureus",
                message: "Your dashboard is ready. Add an account to start tracking your wealth.",
              }),
            }
      );
    } catch {
      /* private mode - ignore */
    }
  }, []);
  const api = useMemo<DashboardApi>(() => {
    const addAccount: DashboardApi["addAccount"] = (a) =>
      setState((s) => ({ ...s, accounts: [...s.accounts, { ...a, id: uid() }] }));

    const removeAccount: DashboardApi["removeAccount"] = (id) =>
      setState((s) => ({ ...s, accounts: s.accounts.filter((x) => x.id !== id) }));

    const updateAccount: DashboardApi["updateAccount"] = async (id, changes) => {
      await new Promise<void>((resolve, reject) => {
        setState((s) => {
          const exists = s.accounts.some((a) => a.id === id);
          if (!exists) {
            reject(new Error("Account not found"));
            return s;
          }
          return {
            ...s,
            accounts: s.accounts.map((a) => (a.id === id ? { ...a, ...changes } : a)),
          };
        });
        resolve();
      });
    };

    const addTransaction: DashboardApi["addTransaction"] = (t) =>
      setState((s) => {
        const tx: Transaction = { ...t, id: uid() };
        const accounts = s.accounts.map((acc) => {
          if (acc.id !== tx.accountId) return acc;
          const delta = tx.type === "income" ? tx.amount : -tx.amount;
          return { ...acc, balance: acc.balance + delta };
        });
        const budgets = s.budgets.map((b) => {
          if (tx.type !== "expense" || b.category !== tx.category) return b;
          return { ...b, spent: b.spent + tx.amount };
        });
        let notifications = s.notifications;
        if (tx.type === "expense") {
          budgets.forEach((b) => {
            if (b.category !== tx.category || b.spent < b.limit || !s.notifBudget) return;
            const prev = s.budgets.find((p) => p.id === b.id);
            if (prev && prev.spent >= b.limit) return;
            notifications = pushNotification(notifications, {
              kind: "budget",
              title: "Budget limit reached",
              message: `${b.icon} ${b.category} reached ${formatCurrency(b.limit, s.currency)}.`,
            });
          });
        }
        return { ...s, transactions: [tx, ...s.transactions], accounts, budgets, notifications };
      });

    const removeTransaction: DashboardApi["removeTransaction"] = (id) =>
      setState((s) => {
        const tx = s.transactions.find((t) => t.id === id);
        if (!tx) return s;
        const accounts = s.accounts.map((acc) => {
          if (acc.id !== tx.accountId) return acc;
          const delta = tx.type === "income" ? -tx.amount : tx.amount;
          return { ...acc, balance: acc.balance + delta };
        });
        const budgets = s.budgets.map((b) => {
          if (tx.type !== "expense" || b.category !== tx.category) return b;
          return { ...b, spent: Math.max(0, b.spent - tx.amount) };
        });
        return { ...s, transactions: s.transactions.filter((t) => t.id !== id), accounts, budgets };
      });

    /*
     * Edit: reverse the old entry's ledger effects, then apply the
     * new values — account balances and category budget "spent" stay
     * consistent even when account/category/amount/type change.
     */

    const updateTransaction: DashboardApi["updateTransaction"] = (id, changes) =>
      setState((s) => {
        const previous = s.transactions.find((t) => t.id === id);

        if (!previous) return s;

        const next: Transaction = { ...previous, ...changes };

        const accounts = s.accounts.map((acc) => {
          let balance = acc.balance;

          if (acc.id === previous.accountId) {
            balance += previous.type === "income" ? -previous.amount : previous.amount;
          }

          if (acc.id === next.accountId) {
            balance += next.type === "income" ? next.amount : -next.amount;
          }

          return balance === acc.balance ? acc : { ...acc, balance };
        });

        const budgets = s.budgets.map((b) => {
          let spent = b.spent;

          if (previous.type === "expense" && b.category === previous.category) {
            spent -= previous.amount;
          }

          if (next.type === "expense" && b.category === next.category) {
            spent += next.amount;
          }

          return spent === b.spent ? b : { ...b, spent: Math.max(0, spent) };
        });

        return {
          ...s,
          transactions: s.transactions.map((t) => (t.id === id ? next : t)),
          accounts,
          budgets,
        };
      });

    const addBudget: DashboardApi["addBudget"] = (b) =>
      setState((s) => ({ ...s, budgets: [...s.budgets, { ...b, id: uid(), spent: 0 }] }));

    const removeBudget: DashboardApi["removeBudget"] = (id) =>
      setState((s) => ({ ...s, budgets: s.budgets.filter((x) => x.id !== id) }));

    const addGoal: DashboardApi["addGoal"] = (g) =>
      setState((s) => ({ ...s, goals: [...s.goals, { ...g, id: uid() }] }));

    const removeGoal: DashboardApi["removeGoal"] = (id) =>
      setState((s) => ({ ...s, goals: s.goals.filter((x) => x.id !== id) }));

    const addFunds: DashboardApi["addFunds"] = (goalId, amount) =>
      setState((s) => {
        let completed: Goal | undefined;
        const goals = s.goals.map((g) => {
          if (g.id !== goalId) return g;
          const saved = Math.min(g.target, g.saved + amount);
          if (g.saved < g.target && saved >= g.target) completed = g;
          return { ...g, saved };
        });
        let notifications = s.notifications;
        if (completed && s.notifGoal) {
          notifications = pushNotification(notifications, {
            kind: "goal",
            title: "Goal completed",
            message: `${completed.icon} ${completed.name} is fully funded!`,
          });
        }
        return { ...s, goals, notifications };
      });

    const addHolding: DashboardApi["addHolding"] = (h) =>
      setState((s) => ({ ...s, holdings: [...s.holdings, { ...h, id: uid() }] }));

    const removeHolding: DashboardApi["removeHolding"] = (id) =>
      setState((s) => ({ ...s, holdings: s.holdings.filter((x) => x.id !== id) }));

    const setUserName: DashboardApi["setUserName"] = (n) => setState((s) => ({ ...s, userName: n }));

    const setCurrency: DashboardApi["setCurrency"] = (c) => setState((s) => ({ ...s, currency: c }));

    const setNotifBudget: DashboardApi["setNotifBudget"] = (v) => setState((s) => ({ ...s, notifBudget: v }));
    const setNotifWeekly: DashboardApi["setNotifWeekly"] = (v) => setState((s) => ({ ...s, notifWeekly: v }));
    const setNotifGoal: DashboardApi["setNotifGoal"] = (v) => setState((s) => ({ ...s, notifGoal: v }));

    const markAllNotificationsRead = () =>
      setState((s) => ({ ...s, notifications: s.notifications.map((n) => ({ ...n, unread: false })) }));

    const clearNotifications = () => setState((s) => ({ ...s, notifications: [] }));

    const resetAll = () =>
      setState((s) => ({
        ...initialState,
        userName: s.userName,
        currency: s.currency,
      }));

    const totalBalance = state.accounts.reduce((sum, a) => sum + a.balance, 0);
    const totalIncome = state.transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const totalExpense = state.transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const portfolioValue = state.holdings.reduce((s, h) => s + h.value, 0);
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;
    const netWorth = totalBalance + portfolioValue;

    return {
      ...state,
      budgets: liveBudgets,
      addAccount,
      updateAccount,
      removeAccount,
      addTransaction,
      removeTransaction,
      updateTransaction,
      addBudget,
      removeBudget,
      addGoal,
      removeGoal,
      addFunds,
      addHolding,
      removeHolding,
      setUserName,
      setCurrency,
      setNotifBudget,
      setNotifWeekly,
      setNotifGoal,
      markAllNotificationsRead,
      clearNotifications,
      resetAll,
      totals: { netWorth, totalBalance, totalIncome, totalExpense, savingsRate, portfolioValue },
    };
  }, [state, liveBudgets]);

  return <DashboardContext.Provider value={api}>{children}</DashboardContext.Provider>;
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used within DashboardProvider");
  return ctx;
}