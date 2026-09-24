import { useState } from "react";
import Modal from "../Modal";
import { useDashboard } from "../../context/DashboardContext";
import { useToast } from "../../context/ToastContext";
import { inputClass, labelClass, COLOR_SWATCHES } from "./fields";
import { cn } from "../../utils/cn";

const ICONS = ["🛒", "🏠", "🚗", "🎬", "💡", "✈️", "💊", "🎓", "🐾", "🎁"];

/* Same names as the transaction form's expense list so budgets
   and transactions line up when the user taps a suggestion. */
const SUGGESTED_CATEGORIES = [
  "Food & Dining",
  "Transport",
  "Shopping",
  "Housing",
  "Utilities",
  "Entertainment",
  "Health",
  "Travel",
  "Other",
];

export default function BudgetFormModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addBudget } = useDashboard();
  const toast = useToast();
  const [category, setCategory] = useState("");
  const [limit, setLimit] = useState("");
  const [color, setColor] = useState("gold");
  const [icon, setIcon] = useState(ICONS[0]);

  function reset() {
    setCategory("");
    setLimit("");
    setColor("gold");
    setIcon(ICONS[0]);
  }

  function submit() {
    if (!category.trim() || !limit) return;
    addBudget({ category: category.trim(), limit: Number(limit), color, icon });
    toast.success("Budget created", `${category.trim()} limit set successfully.`);
    reset();
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Create Budget" subtitle="Set a monthly spending limit for a category">
      <div className="space-y-4">
        <div>
          <label className={labelClass}>Category Name</label>
          <input className={inputClass} placeholder="e.g. Food & Dining" value={category} onChange={(e) => setCategory(e.target.value)} />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {SUGGESTED_CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[11px] font-medium transition",
                  category.trim().toLowerCase() === c.toLowerCase()
                    ? "border-gold-400/60 bg-gold-400/10 text-gold-300"
                    : "border-white/10 bg-white/[0.03] text-white/50 hover:border-gold-400/30 hover:text-gold-200"
                )}
              >
                {c}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-[11px] text-white/30">
            Tip: pick a suggested name so its transactions count toward this budget automatically.
          </p>
        </div>
        <div>
          <label className={labelClass}>Monthly Limit</label>
          <input className={inputClass} type="number" placeholder="0.00" value={limit} onChange={(e) => setLimit(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Icon</label>
          <div className="flex flex-wrap gap-2">
            {ICONS.map((i) => (
              <button
                key={i}
                onClick={() => setIcon(i)}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg border text-base transition",
                  icon === i ? "border-gold-400/60 bg-gold-400/10" : "border-white/10 bg-white/[0.03] hover:border-white/25"
                )}
              >
                {i}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className={labelClass}>Accent Color</label>
          <div className="flex gap-2">
            {COLOR_SWATCHES.map((c) => (
              <button
                key={c.key}
                onClick={() => setColor(c.key)}
                className={cn(
                  "h-8 w-8 rounded-full bg-gradient-to-br transition",
                  c.className,
                  color === c.key ? "ring-2 ring-white ring-offset-2 ring-offset-ink-900" : "opacity-70 hover:opacity-100"
                )}
              />
            ))}
          </div>
        </div>
        <button
          onClick={submit}
          className="gold-btn mt-2 w-full rounded-xl py-2.5 text-sm font-semibold transition-transform hover:scale-[1.01] active:scale-95"
        >
          Create Budget
        </button>
      </div>
    </Modal>
  );
}