import { motion } from "framer-motion";
import { useEffect } from "react";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  PieChart,
  TrendingUp,
  Target,
  BarChart3,
  Settings,
  Gem,
  ChevronsLeft,
  ChevronsRight,
  Sparkles,
} from "lucide-react";
import type { TabKey } from "../types";
import { cn } from "../utils/cn";

interface Props {
  active: TabKey;
  onChange: (tab: TabKey) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const NAV: { key: TabKey; label: string; icon: typeof LayoutDashboard }[] = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "transactions", label: "Transactions", icon: ArrowLeftRight },
  { key: "accounts", label: "Accounts", icon: Wallet },
  { key: "budgets", label: "Budgets", icon: PieChart },
  { key: "investments", label: "Investments", icon: TrendingUp },
  { key: "goals", label: "Goals", icon: Target },
  { key: "reports", label: "Reports", icon: BarChart3 },
  { key: "settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ active, onChange, collapsed, onToggleCollapse, mobileOpen, onCloseMobile }: Props) {
  // Lock background scroll while the mobile drawer is open.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={onCloseMobile} />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-full max-w-[86vw] flex-col border-r border-white/[0.06] bg-ink-950/95 bg-noise transition-[width,transform] duration-300 ease-in-out lg:sticky lg:top-0 lg:translate-x-0",
          collapsed ? "w-[84px]" : "w-[264px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className={cn("flex items-center gap-3 px-5 py-6", collapsed && "justify-center px-0")}>
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gold-400/30 bg-gradient-to-br from-gold-300/20 via-gold-500/10 to-transparent">
            <div className="absolute inset-0 animate-pulse-glow rounded-xl bg-gold-400/10 blur-md" />
            <Gem className="relative h-5 w-5 text-gold-300" strokeWidth={1.75} />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="font-display text-lg font-bold tracking-wide text-gold-gradient">AUREUS</p>
              <p className="-mt-1 text-[10px] uppercase tracking-[0.25em] text-white/30">Money Tracker</p>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {NAV.map((item) => {
            const isActive = item.key === active;
            return (
              <button
                key={item.key}
                onClick={() => {
                  onChange(item.key);
                  onCloseMobile();
                }}
                className={cn(
                  "group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  collapsed && "justify-center px-0",
                  isActive ? "text-gold-900" : "text-white/50 hover:text-white/90"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-active-pill"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-gold-300 via-gold-400 to-gold-500 shadow-[0_8px_20px_-6px_rgba(227,172,55,0.55)]"
                  />
                )}
                <item.icon className="relative z-10 h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
                {!collapsed && <span className="relative z-10">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {!collapsed && (
          <div className="mx-3 mb-3">
            <div className="relative overflow-hidden rounded-2xl border border-gold-400/25 bg-gradient-to-br from-ink-800 via-ink-850 to-ink-900 p-4">
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gold-400/10 blur-2xl" />
              <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
              <div className="relative flex items-center gap-2 text-gold-300">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Aureus Black</span>
              </div>
              <p className="relative mt-1.5 text-[11px] leading-relaxed text-white/45">
                Unlock concierge insights & advanced wealth analytics.
              </p>
              <button className="gold-btn relative mt-3 w-full rounded-lg py-1.5 text-xs font-semibold transition-transform hover:scale-[1.02] active:scale-95">
                Upgrade Tier
              </button>
            </div>
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className="hidden items-center justify-center gap-2 border-t border-white/[0.06] py-3.5 text-xs font-medium text-white/40 transition hover:text-white/80 lg:flex"
        >
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : <><ChevronsLeft className="h-4 w-4" /> Collapse</>}
        </button>
      </aside>
    </>
  );
}