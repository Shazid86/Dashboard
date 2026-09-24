import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Target, X } from "lucide-react";
import PageTransition from "../components/PageTransition";
import SectionHeader from "../components/SectionHeader";
import EmptyState from "../components/EmptyState";
import TiltCard from "../components/TiltCard";
import { useDashboard } from "../context/DashboardContext";
import { formatCurrency, formatDate } from "../lib/format";
import GoalFormModal from "../components/forms/GoalFormModal";
import ConfirmDialog from "../components/ConfirmDialog";
import { useToast } from "../context/ToastContext";
import { inputClass } from "../components/forms/fields";

const COLOR_GRADIENT: Record<string, string> = {
  gold: "from-gold-300 to-gold-500",
  emerald: "from-emerald-300 to-emerald-500",
  sky: "from-sky-300 to-sky-500",
  violet: "from-violet-300 to-violet-500",
  rose: "from-rose-300 to-rose-500",
  cyan: "from-cyan-300 to-cyan-500",
};

function GoalCard({ id, index, onRequestDelete }: { id: string; index: number; onRequestDelete: (id: string) => void }) {
  const { goals, addFunds, currency } = useDashboard();
  const toast = useToast();
  const goal = goals.find((g) => g.id === id)!;
  const [adding, setAdding] = useState(false);
  const [amount, setAmount] = useState("");

  const money = (n: number) => formatCurrency(n, currency);
  const pct = goal.target > 0 ? Math.min(100, (goal.saved / goal.target) * 100) : 0;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
      <TiltCard className="group relative p-5" intensity={6}>
        <button
          onClick={() => onRequestDelete(goal.id)}
          aria-label="Delete goal"
          title="Delete goal"
          className="absolute right-3 top-3 z-10 rounded-full border border-rose-500/25 bg-rose-500/10 p-1 text-rose-300 transition hover:bg-rose-500/20"
        >
          <X className="h-3.5 w-3.5" />
        </button>
        <div className="flex items-center gap-3">
          <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br text-lg ${COLOR_GRADIENT[goal.color] ?? COLOR_GRADIENT.gold}`}>
            {goal.icon}
          </div>
          <div>
            <p className="text-sm font-semibold text-white/90">{goal.name}</p>
            {goal.deadline && <p className="text-xs text-white/35">Target: {formatDate(goal.deadline)}</p>}
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="font-medium text-white/70">{money(goal.saved)}</span>
            <span className="text-white/35">of {money(goal.target)}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className={`h-full rounded-full bg-gradient-to-r ${COLOR_GRADIENT[goal.color] ?? COLOR_GRADIENT.gold}`}
            />
          </div>
          <p className="mt-1.5 text-[11px] text-white/30">{pct.toFixed(0)}% funded</p>
        </div>

        {adding ? (
          <div className="mt-4 flex gap-2">
            <input
              autoFocus
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount"
              className={inputClass + " py-2"}
            />
            <button
              onClick={() => {
                if (amount) {
                  addFunds(goal.id, Number(amount));
                  toast.success("Funds added", `${money(Number(amount))} added to ${goal.name}.`);
                }
                setAmount("");
                setAdding(false);
              }}
              className="gold-btn rounded-xl px-3 text-xs font-semibold"
            >
              Add
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="mt-4 w-full rounded-xl border border-white/10 bg-white/[0.03] py-2 text-xs font-medium text-white/60 transition hover:border-gold-400/30 hover:text-gold-300"
          >
            + Add Funds
          </button>
        )}
      </TiltCard>
    </motion.div>
  );
}
export default function Goals() {
  const { goals, removeGoal, currency } = useDashboard();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const money = (n: number) => formatCurrency(n, currency);
  const totalTarget = goals.reduce((s, g) => s + g.target, 0);
  const totalSaved = goals.reduce((s, g) => s + g.saved, 0);

  return (
    <PageTransition>
      <GoalFormModal open={open} onClose={() => setOpen(false)} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <TiltCard className="p-5" intensity={4}>
          <p className="text-xs uppercase tracking-wider text-white/40">Active Goals</p>
          <p className="mt-2 font-display text-2xl font-semibold text-white">{goals.length}</p>
        </TiltCard>
        <TiltCard className="p-5" intensity={4}>
          <p className="text-xs uppercase tracking-wider text-white/40">Total Target</p>
          <p className="mt-2 font-display text-2xl font-semibold text-white">{money(totalTarget)}</p>
        </TiltCard>
        <TiltCard className="p-5" intensity={4}>
          <p className="text-xs uppercase tracking-wider text-white/40">Total Saved</p>
          <p className="mt-2 font-display text-2xl font-semibold text-gold-300">{money(totalSaved)}</p>
        </TiltCard>
      </div>

      <div>
        <SectionHeader
          title="Savings Goals"
          subtitle="Milestones worth working towards"
          action={
            <button
              onClick={() => setOpen(true)}
              className="gold-btn flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-transform hover:scale-[1.03] active:scale-95"
            >
              <Plus className="h-3.5 w-3.5" /> New Goal
            </button>
          }
        />
        <div className="mt-5">
          {goals.length === 0 ? (
            <EmptyState
              icon={Target}
              title="No goals set yet"
              subtitle="Whether it's a home, a trip, or an emergency fund — define it and track your progress in real time."
              action={
                <button onClick={() => setOpen(true)} className="gold-btn flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold">
                  <Plus className="h-3.5 w-3.5" /> New Goal
                </button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {goals.map((g, i) => (
                <GoalCard key={g.id} id={g.id} index={i} onRequestDelete={setPendingDelete} />
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) {
            removeGoal(pendingDelete);
            toast.success("Goal deleted", "The goal has been removed.");
          }
        }}
      />
    </PageTransition>
  );
}