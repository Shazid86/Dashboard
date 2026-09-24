import { useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, Landmark, Pencil, PiggyBank, Plus, TrendingUp, Wallet as WalletIcon, X } from "lucide-react";
import PageTransition from "../components/PageTransition";
import SectionHeader from "../components/SectionHeader";
import EmptyState from "../components/EmptyState";
import TiltCard from "../components/TiltCard";
import { useDashboard } from "../context/DashboardContext";
import { formatCurrency } from "../lib/format";
import AccountFormModal from "../components/forms/AccountFormModal";
import AccountEditModal from "../components/forms/AccountEditModal";
import ConfirmDialog from "../components/ConfirmDialog";
import { useToast } from "../context/ToastContext";
import type { Account, AccountType } from "../types";

const TYPE_ICON: Record<AccountType, typeof WalletIcon> = {
  checking: Landmark,
  savings: PiggyBank,
  credit: CreditCard,
  investment: TrendingUp,
  cash: WalletIcon,
};

const COLOR_GRADIENT: Record<string, string> = {
  gold: "from-gold-500/90 via-gold-400/70 to-gold-700/90",
  emerald: "from-emerald-500/90 via-emerald-400/70 to-emerald-700/90",
  sky: "from-sky-500/90 via-sky-400/70 to-sky-700/90",
  violet: "from-violet-500/90 via-violet-400/70 to-violet-700/90",
  rose: "from-rose-500/90 via-rose-400/70 to-rose-700/90",
  cyan: "from-cyan-500/90 via-cyan-400/70 to-cyan-700/90",
};

function AccountCard({ account, onRemove, onEdit }: { account: Account; onRemove: () => void; onEdit: () => void }) {
  const { currency } = useDashboard();
  const Icon = TYPE_ICON[account.type];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, rotateX: -8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      whileHover={{ y: -6, rotateX: 4, rotateY: -3 }}
      transition={{ duration: 0.4 }}
      style={{ transformStyle: "preserve-3d" }}
      className={`group relative aspect-[1.6/1] w-full overflow-hidden rounded-3xl bg-gradient-to-br p-5 shadow-2xl ${COLOR_GRADIENT[account.color] ?? COLOR_GRADIENT.gold}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.25),transparent_55%)]" />
      <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-black/10 blur-2xl" />
      <div className="absolute right-3 top-3 z-10 flex gap-1.5">
        <button
          onClick={onEdit}
          aria-label="Edit account"
          title="Edit account"
          className="rounded-full bg-black/25 p-1.5 text-pure-white backdrop-blur transition hover:bg-black/45"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={onRemove}
          aria-label="Delete account"
          title="Delete account"
          className="rounded-full bg-black/25 p-1.5 text-pure-white backdrop-blur transition hover:bg-black/45"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="relative flex h-full flex-col justify-between text-gold-900">
        <div className="flex items-center justify-between">
          <span className="rounded-lg bg-black/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-pure-white/90">
            {account.type}
          </span>
          <Icon className="h-6 w-6 text-pure-white/90" strokeWidth={1.75} />
        </div>
        <div>
          <p className="text-xs font-medium text-pure-white/75">{account.institution || "Aureus"}</p>
          <p className="font-display text-lg font-bold text-pure-white">{account.name}</p>
          <p className="mt-1 font-display text-2xl font-extrabold tracking-tight text-pure-white">{formatCurrency(account.balance, currency)}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function Accounts() {
  const { accounts, removeAccount, totals, currency } = useDashboard();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const money = (n: number) => formatCurrency(n, currency);

  return (
    <PageTransition>
      <AccountFormModal open={open} onClose={() => setOpen(false)} />
      <AccountEditModal open={editingAccount !== null} onClose={() => setEditingAccount(null)} account={editingAccount} />

      <TiltCard className="p-6" intensity={3}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-white/40">Combined Balance</p>
            <p className="mt-2 font-display text-3xl font-bold text-white">{money(totals.totalBalance)}</p>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="gold-btn flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-transform hover:scale-[1.03] active:scale-95"
          >
            <Plus className="h-4 w-4" /> Add Account
          </button>
        </div>
      </TiltCard>

      <div>
        <SectionHeader title="Your Accounts" subtitle={`${accounts.length} linked account${accounts.length === 1 ? "" : "s"}`} />
        <div className="mt-5">
          {accounts.length === 0 ? (
            <EmptyState
              icon={WalletIcon}
              title="No accounts linked yet"
              subtitle="Add your checking, savings, credit or investment accounts to unify your entire financial picture."
              action={
                <button onClick={() => setOpen(true)} className="gold-btn flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold">
                  <Plus className="h-3.5 w-3.5" /> Add Account
                </button>
              }
            />
          ) : (
            <div className="perspective-1000 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {accounts.map((a) => (
                <AccountCard
                  key={a.id}
                  account={a}
                  onRemove={() => setPendingDelete(a.id)}
                  onEdit={() => setEditingAccount(a)}
                />
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
            removeAccount(pendingDelete);
            toast.success("Account deleted", "The account has been removed.");
          }
        }}
      />
    </PageTransition>
  );
}