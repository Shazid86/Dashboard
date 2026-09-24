import { useEffect, useState } from "react";
import Modal from "../Modal";
import { useDashboard } from "../../context/DashboardContext";
import { useToast } from "../../context/ToastContext";
import type { Account, AccountType } from "../../types";
import { inputClass, labelClass, COLOR_SWATCHES } from "./fields";
import { cn } from "../../utils/cn";

const TYPES: { key: AccountType; label: string }[] = [
  { key: "checking", label: "Checking" },
  { key: "savings", label: "Savings" },
  { key: "credit", label: "Credit Card" },
  { key: "investment", label: "Investment" },
  { key: "cash", label: "Cash" },
];

interface Props {
  open: boolean;
  onClose: () => void;
  account: Account | null;
}

export default function AccountEditModal({ open, onClose, account }: Props) {
  const { updateAccount } = useDashboard();
  const toast = useToast();
  const [name, setName] = useState("");
  const [institution, setInstitution] = useState("");
  const [type, setType] = useState<AccountType>("checking");
  const [balance, setBalance] = useState("");
  const [color, setColor] = useState("gold");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && account) {
      setName(account.name);
      setInstitution(account.institution ?? "");
      setType(account.type);
      setBalance(String(account.balance));
      setColor(account.color);
    }
  }, [open, account]);

  const submit = async () => {
    if (!name.trim() || !account) return;
    setSaving(true);
    try {
      await updateAccount(account.id, {
        name: name.trim(),
        institution: institution.trim() || undefined,
        type,
        balance: Number(balance) || 0,
        color,
      });
      toast.success("Account updated", `${name.trim()} has been saved.`);
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update account";
      toast.error("Update failed", msg);
    } finally {
      setSaving(false);
    }
  };

  if (!account) return null;

  return (
    <Modal open={open} onClose={onClose} title="Edit Account" subtitle="Update account details">
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
            <label className={labelClass}>Balance</label>
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
          disabled={saving || !name.trim()}
          className="gold-btn mt-2 w-full rounded-xl py-2.5 text-sm font-semibold transition-transform hover:scale-[1.01] active:scale-95 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </Modal>
  );
}
