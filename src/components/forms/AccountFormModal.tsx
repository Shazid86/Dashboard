import { useState } from "react";
import Modal from "../Modal";
import { useDashboard } from "../../context/DashboardContext";
import { useToast } from "../../context/ToastContext";
import type { AccountType } from "../../types";
import { inputClass, labelClass, COLOR_SWATCHES } from "./fields";
import { cn } from "../../utils/cn";

const TYPES: { key: AccountType; label: string }[] = [
  { key: "checking", label: "Checking" },
  { key: "savings", label: "Savings" },
  { key: "credit", label: "Credit Card" },
  { key: "investment", label: "Investment" },
  { key: "cash", label: "Cash" },
];

export default function AccountFormModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addAccount } = useDashboard();
  const toast = useToast();
  const [name, setName] = useState("");
  const [institution, setInstitution] = useState("");
  const [type, setType] = useState<AccountType>("checking");
  const [balance, setBalance] = useState("");
  const [color, setColor] = useState("gold");

  function reset() {
    setName("");
    setInstitution("");
    setType("checking");
    setBalance("");
    setColor("gold");
  }

  function submit() {
    if (!name.trim()) return;
    addAccount({ name: name.trim(), institution: institution.trim() || undefined, type, balance: Number(balance) || 0, color });
    toast.success("Account added", `${name.trim()} linked successfully.`);
    reset();
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Account" subtitle="Connect a new balance to your net worth">
      <div className="space-y-4">
        <div>
          <label className={labelClass}>Account Name</label>
          <input className={inputClass} placeholder="e.g. Primary Checking" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Institution (optional)</label>
          <input className={inputClass} placeholder="e.g. Goldman Sachs" value={institution} onChange={(e) => setInstitution(e.target.value)} />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Type</label>
            <select className={inputClass} value={type} onChange={(e) => setType(e.target.value as AccountType)}>
              {TYPES.map((t) => (
                <option key={t.key} value={t.key} className="bg-ink-900">
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Starting Balance</label>
            <input
              className={inputClass}
              type="number"
              placeholder="0.00"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
            />
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
          Add Account
        </button>
      </div>
    </Modal>
  );
}