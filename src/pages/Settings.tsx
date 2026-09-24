import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Download, RotateCcw, Shield, User } from "lucide-react";
import PageTransition from "../components/PageTransition";
import SectionHeader from "../components/SectionHeader";
import TiltCard from "../components/TiltCard";
import { useDashboard } from "../context/DashboardContext";
import { inputClass, labelClass } from "../components/forms/fields";
import { CURRENCIES } from "../lib/format";
import { cn } from "../utils/cn";

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors",
        checked ? "bg-gold-500" : "bg-white/10"
      )}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-pure-white shadow", checked ? "left-[22px]" : "left-0.5")}
      />
    </button>
  );
}

export default function Settings() {
  const {
    userName,
    setUserName,
    resetAll,
    accounts,
    transactions,
    budgets,
    goals,
    holdings,
    currency,
    setCurrency,
    notifBudget,
    notifWeekly,
    notifGoal,
    setNotifBudget,
    setNotifWeekly,
    setNotifGoal,
  } = useDashboard();
  const [name, setName] = useState(userName);
  const [confirmReset, setConfirmReset] = useState(false);

  function exportData() {
    const payload = { accounts, transactions, budgets, goals, holdings };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "aureus-export.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <PageTransition>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <TiltCard className="p-6" intensity={2}>
          <SectionHeader title="Profile" subtitle="Personalize your dashboard" />
          <div className="mt-5 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-gold-400/25 bg-gradient-to-br from-gold-300/20 to-transparent font-display text-xl font-bold text-gold-200">
              {(name || "AU").slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1">
              <label className={labelClass}>Display Name</label>
              <input
                className={inputClass}
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => setUserName(name)}
              />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-xs text-white/40">
            <User className="h-3.5 w-3.5" /> Your data stays private and is stored only on this device.
          </div>
        </TiltCard>

        <TiltCard className="p-6" intensity={2}>
          <SectionHeader title="Currency" subtitle="Choose your preferred display currency" />
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {CURRENCIES.map((c) => (
              <button
                key={c.code}
                onClick={() => setCurrency(c.code)}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-left text-sm transition",
                  currency === c.code
                    ? "border-gold-400/50 bg-gold-400/10 text-white"
                    : "border-white/10 bg-white/[0.03] text-white/60 hover:border-white/25 hover:bg-white/[0.05]"
                )}
              >
                <span className="text-base leading-none">{c.flag}</span>
                <span className="min-w-0 flex-1 truncate">{c.label}</span>
                <span className="text-xs font-semibold text-gold-300">{c.symbol}</span>
              </button>
            ))}
          </div>
          <p className="mt-4 text-xs text-white/35">
            Taka (BDT) is the default — your selection here becomes the app-wide currency.
          </p>
        </TiltCard>
        <TiltCard className="p-6" intensity={2}>
          <SectionHeader title="Notifications" subtitle="Choose what keeps you informed" />
          <div className="mt-5 space-y-4">
            {[
              { label: "Budget limit alerts", desc: "Notify when a category nears its limit", value: notifBudget, set: setNotifBudget },
              { label: "Weekly summary", desc: "A digest of your spending every week", value: notifWeekly, set: setNotifWeekly },
              { label: "Goal milestones", desc: "Celebrate when you hit savings milestones", value: notifGoal, set: setNotifGoal },
            ].map((n) => (
              <div key={n.label} className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-white/85">{n.label}</p>
                  <p className="text-xs text-white/35">{n.desc}</p>
                </div>
                <Toggle checked={n.value} onChange={n.set} />
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-xs text-white/40">
            <Bell className="h-3.5 w-3.5" /> Notifications you enable appear in the top bar bell.
          </div>
        </TiltCard>

        <TiltCard className="p-6" intensity={2}>
          <SectionHeader title="Data Management" subtitle="Export or reset your dashboard" />
          <div className="mt-5 space-y-3">
            <button
              onClick={exportData}
              className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium text-white/80 transition hover:border-gold-400/30 hover:bg-white/[0.05]"
            >
              <span className="flex items-center gap-2">
                <Download className="h-4 w-4 text-gold-300" /> Export data as JSON
              </span>
              <span className="text-xs text-white/30">.json</span>
            </button>

            {!confirmReset ? (
              <button
                onClick={() => setConfirmReset(true)}
                className="flex w-full items-center justify-between rounded-xl border border-rose-500/20 bg-rose-500/[0.04] px-4 py-3 text-sm font-medium text-rose-300 transition hover:border-rose-500/40 hover:bg-rose-500/[0.08]"
              >
                <span className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" /> Reset dashboard to empty state
                </span>
              </button>
            ) : (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/[0.06] p-4">
                <p className="text-sm text-rose-200">This will permanently remove all accounts, transactions, budgets and goals.</p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => {
                      resetAll();
                      setConfirmReset(false);
                    }}
                    className="flex-1 rounded-lg bg-rose-500 py-2 text-xs font-semibold text-white transition hover:bg-rose-600"
                  >
                    Yes, reset everything
                  </button>
                  <button
                    onClick={() => setConfirmReset(false)}
                    className="flex-1 rounded-lg border border-white/10 py-2 text-xs font-semibold text-white/70 transition hover:bg-white/5"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </TiltCard>

        <TiltCard className="p-6" intensity={2}>
          <SectionHeader title="Security" subtitle="Keep your wealth protected" />
          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-white/80">
                <Shield className="h-4 w-4 text-gold-300" /> Two-factor authentication
              </div>
              <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
                Enabled
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-white/80">
                <Shield className="h-4 w-4 text-gold-300" /> Biometric lock
              </div>
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/50">
                Off
              </span>
            </div>
          </div>
        </TiltCard>
      </div>
    </PageTransition>
  );
}