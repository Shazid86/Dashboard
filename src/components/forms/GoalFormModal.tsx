import { useState } from "react";
import Modal from "../Modal";
import { useDashboard } from "../../context/DashboardContext";
import { useToast } from "../../context/ToastContext";
import { inputClass, labelClass, COLOR_SWATCHES } from "./fields";
import { cn } from "../../utils/cn";

const ICONS = ["🏡", "🚙", "🌴", "🎓", "💍", "🧳", "🛡️", "👶", "🏝️", "🚀"];

export default function GoalFormModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addGoal } = useDashboard();
  const toast = useToast();
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [saved, setSaved] = useState("");
  const [deadline, setDeadline] = useState("");
  const [color, setColor] = useState("gold");
  const [icon, setIcon] = useState(ICONS[0]);

  function reset() {
    setName("");
    setTarget("");
    setSaved("");
    setDeadline("");
    setColor("gold");
    setIcon(ICONS[0]);
  }

  function submit() {
    if (!name.trim() || !target) return;
    addGoal({ name: name.trim(), target: Number(target), saved: Number(saved) || 0, deadline: deadline || undefined, color, icon });
    toast.success("Goal created", `${name.trim()} is now being tracked.`);
    reset();
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Create Goal" subtitle="Define a milestone worth saving for">
      <div className="space-y-4">
        <div>
          <label className={labelClass}>Goal Name</label>
          <input className={inputClass} placeholder="e.g. Dream Home Down Payment" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Target Amount</label>
            <input className={inputClass} type="number" placeholder="0.00" value={target} onChange={(e) => setTarget(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Already Saved</label>
            <input className={inputClass} type="number" placeholder="0.00" value={saved} onChange={(e) => setSaved(e.target.value)} />
          </div>
        </div>
        <div>
          <label className={labelClass}>Target Date (optional)</label>
          <input className={inputClass} type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
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
          Create Goal
        </button>
      </div>
    </Modal>
  );
}