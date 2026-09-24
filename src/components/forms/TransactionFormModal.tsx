import { useEffect, useState } from "react";
import Modal from "../Modal";
import { useDashboard } from "../../context/DashboardContext";
import { useToast } from "../../context/ToastContext";
import type { Transaction, TxType } from "../../types";
import { inputClass, labelClass } from "./fields";
import { todayIso } from "../../lib/format";
import { cn } from "../../utils/cn";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

const EXPENSE_CATEGORIES = ["Food & Dining", "Transport", "Shopping", "Housing", "Utilities", "Entertainment", "Health", "Travel", "Other"];
const INCOME_CATEGORIES = ["Salary", "Freelance", "Investments", "Gift", "Refund", "Other"];

export default function TransactionFormModal({
  open,
  onClose,
  initial = null,
}: {
  open: boolean;
  onClose: () => void;
  initial?: Transaction | null;
}) {
  const { accounts, addTransaction, updateTransaction } = useDashboard();
  const toast = useToast();
  const [type, setType] = useState<TxType>("expense");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [date, setDate] = useState(todayIso());

  useEffect(() => {
    if (!accountId && accounts.length > 0) setAccountId(accounts[0].id);
  }, [accounts, accountId]);

  /*
   * Prefill when editing; reset when opening for a fresh entry.
   */

  useEffect(() => {
    if (!open) return;

    if (initial) {
      setType(initial.type);
      setDescription(initial.description);
      setAmount(String(initial.amount));
      setCategory(initial.category);
      setAccountId(initial.accountId);
      setDate(initial.date);
    } else {
      reset();
    }
  }, [open, initial]);

  const categories = type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  function reset() {
    setType("expense");
    setDescription("");
    setAmount("");
    setCategory(EXPENSE_CATEGORIES[0]);
    setDate(todayIso());
  }

  function submit() {
    const acc = accountId || accounts[0]?.id;
    if (!description.trim() || !amount || !acc) return;

    const payload = {
      description: description.trim(),
      amount: Math.abs(Number(amount)),
      type,
      category,
      accountId: acc,
      date,
    };

    if (initial) {
      updateTransaction(initial.id, payload);
      toast.success("Transaction updated", `${payload.description} saved.`);
    } else {
      addTransaction(payload);
      toast.success(type === "income" ? "Income added" : "Expense added", `${payload.description} recorded.`);
      reset();
    }

    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? "Edit Transaction" : "Add Transaction"}
      subtitle={initial ? "Update an existing inflow or outflow" : "Log a new inflow or outflow"}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-1">
          <button
            onClick={() => {
              setType("expense");
              setCategory(EXPENSE_CATEGORIES[0]);
            }}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition",
              type === "expense" ? "bg-rose-500/15 text-rose-300" : "text-white/40 hover:text-white/70"
            )}
          >
            <ArrowDownLeft className="h-4 w-4" /> Expense
          </button>
          <button
            onClick={() => {
              setType("income");
              setCategory(INCOME_CATEGORIES[0]);
            }}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition",
              type === "income" ? "bg-emerald-500/15 text-emerald-300" : "text-white/40 hover:text-white/70"
            )}
          >
            <ArrowUpRight className="h-4 w-4" /> Income
          </button>
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <input
            className={inputClass}
            placeholder="e.g. Whole Foods Market"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Amount</label>
            <input className={inputClass} type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Date</label>
            <input className={inputClass} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Category</label>
          <select className={inputClass} value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((c) => (
              <option key={c} value={c} className="bg-ink-900">
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Account</label>
          {accounts.length === 0 ? (
            <p className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-3.5 py-2.5 text-xs text-white/40">
              Add an account first from the Accounts tab to assign transactions.
            </p>
          ) : (
            <select className={inputClass} value={accountId} onChange={(e) => setAccountId(e.target.value)}>
              {accounts.map((a) => (
                <option key={a.id} value={a.id} className="bg-ink-900">
                  {a.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <button
          disabled={accounts.length === 0}
          onClick={submit}
          className="gold-btn mt-2 w-full rounded-xl py-2.5 text-sm font-semibold transition-transform hover:scale-[1.01] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Save Transaction
        </button>
      </div>
    </Modal>
  );
}