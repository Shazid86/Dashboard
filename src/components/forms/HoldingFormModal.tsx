import { useState } from "react";
import Modal from "../Modal";
import { useDashboard } from "../../context/DashboardContext";
import { useToast } from "../../context/ToastContext";
import { inputClass, labelClass, COLOR_SWATCHES } from "./fields";
import { cn } from "../../utils/cn";

export default function HoldingFormModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addHolding } = useDashboard();
  const toast = useToast();
  const [symbol, setSymbol] = useState("");
  const [name, setName] = useState("");
  const [units, setUnits] = useState("");
  const [value, setValue] = useState("");
  const [change, setChange] = useState("");
  const [color, setColor] = useState("gold");

  function reset() {
    setSymbol("");
    setName("");
    setUnits("");
    setValue("");
    setChange("");
    setColor("gold");
  }

  function submit() {
    if (!symbol.trim() || !value) return;
    addHolding({
      symbol: symbol.trim().toUpperCase(),
      name: name.trim() || symbol.trim().toUpperCase(),
      units: Number(units) || 0,
      value: Number(value),
      change: Number(change) || 0,
      color,
    });
    toast.success("Holding added", `${symbol.trim().toUpperCase()} added to your portfolio.`);
    reset();
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Holding" subtitle="Track a new asset in your portfolio">
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Ticker / Symbol</label>
            <input className={inputClass} placeholder="e.g. AAPL" value={symbol} onChange={(e) => setSymbol(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Name</label>
            <input className={inputClass} placeholder="e.g. Apple Inc." value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Units</label>
            <input className={inputClass} type="number" placeholder="0" value={units} onChange={(e) => setUnits(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Market Value</label>
            <input className={inputClass} type="number" placeholder="0.00" value={value} onChange={(e) => setValue(e.target.value)} />
          </div>
        </div>
        <div>
          <label className={labelClass}>Change % (optional)</label>
          <input className={inputClass} type="number" placeholder="0.0" value={change} onChange={(e) => setChange(e.target.value)} />
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
          Add Holding
        </button>
      </div>
    </Modal>
  );
}