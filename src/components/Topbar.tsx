import { useEffect, useRef, useState } from "react";
import {
  ArrowLeftRight,
  ArrowUpRight,
  Bell,
  Info,
  LogOut,
  Menu,
  Moon,
  PieChart,
  Plus,
  Search,
  Sparkles,
  Sun,
  Target,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { AppNotificationKind, TabKey } from "../types";
import { useDashboard } from "../context/DashboardContext";
import { supabase } from "../lib/supabase";
import ProfileModal from "./ProfileModal";
import { cn } from "../utils/cn";

const TITLES: Record<TabKey, { title: string; subtitle: string }> = {
  overview: { title: "Overview", subtitle: "Your complete financial snapshot" },
  transactions: { title: "Transactions", subtitle: "Track every inflow and outflow" },
  accounts: { title: "Accounts", subtitle: "All your balances, unified" },
  budgets: { title: "Budgets", subtitle: "Plan and control your spending" },
  investments: { title: "Investments", subtitle: "Your portfolio, visualized" },
  goals: { title: "Goals", subtitle: "Milestones you're working towards" },
  reports: { title: "Reports", subtitle: "Deep insights into your money" },
  settings: { title: "Settings", subtitle: "Personalize your experience" },
};

const NOTIF_ICON: Record<AppNotificationKind, typeof Bell> = {
  budget: PieChart,
  goal: Target,
  transaction: ArrowLeftRight,
  welcome: Sparkles,
  system: Info,
};

function timeAgo(ms: number): string {
  const s = Math.max(1, Math.floor((Date.now() - ms) / 1000));
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return m + "m ago";
  const h = Math.floor(m / 60);
  if (h < 24) return h + "h ago";
  const d = Math.floor(h / 24);
  return d + "d ago";
}

export default function Topbar({
  tab,
  theme,
  onToggleTheme,
  onOpenMobile,
  onQuickAdd,
}: {
  tab: TabKey;
  theme: "dark" | "light";
  onToggleTheme: () => void;
  onOpenMobile: () => void;
  onQuickAdd: () => void;
}) {
  const { userName, notifications, markAllNotificationsRead, clearNotifications } = useDashboard();
  const [bellOpen, setBellOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  const initials = userName ? userName.slice(0, 2).toUpperCase() : "AU";
  const meta = TITLES[tab];
  const unread = notifications.filter((n) => n.unread).length;
  const dateStr = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(new Date());

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      /* best-effort — redirect regardless of network errors */
    }
    window.location.href = import.meta.env.VITE_WEBSITE_URL || "/";
  };

  useEffect(() => {
    if (!bellOpen) return;
    function onDoc(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [bellOpen]);

  return (
    <header className="sticky top-0 z-30 bg-ink-950/80 backdrop-blur-xl sm:border-b sm:border-white/[0.06]">
      <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          <button onClick={onOpenMobile} className="rounded-lg border border-white/10 p-2 text-white/60 lg:hidden">
            <Menu className="h-4 w-4" />
          </button>
          <div className="min-w-0">
            <motion.h1
              key={meta.title}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="truncate font-display text-xl font-semibold text-white sm:text-2xl"
            >
              {meta.title}
            </motion.h1>
            <p className="hidden truncate text-xs text-white/35 sm:block">{dateStr} · {meta.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white/40 md:flex md:w-64">
            <Search className="h-4 w-4" />
            <input
              placeholder="Search transactions, accounts…"
              className="w-full bg-transparent text-white placeholder:text-white/30 focus:outline-none"
            />
          </div>

          <button
            onClick={onToggleTheme}
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            className="relative rounded-xl border border-white/10 bg-white/[0.03] p-2 text-white/60 transition hover:text-white sm:p-2.5"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={theme}
                initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.22 }}
                className="flex"
              >
                {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </motion.span>
            </AnimatePresence>
          </button>

          <div ref={bellRef} className="relative">
            <button
              onClick={() => {
                setBellOpen((o) => !o);
                if (!bellOpen && unread > 0) markAllNotificationsRead();
              }}
              aria-label="Notifications"
              title="Notifications"
              className="relative rounded-xl border border-white/10 bg-white/[0.03] p-2 text-white/60 transition hover:text-white sm:p-2.5"
            >
              <Bell className="h-4 w-4" />
              {unread > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white ring-2 ring-ink-950">
                  {unread}
                </span>
              )}
            </button>

            <AnimatePresence>
              {bellOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-11 z-50 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl glass-panel bg-ink-900/95 shadow-2xl"
                >
                  <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
                    <p className="text-sm font-semibold text-white">Notifications</p>
                    {notifications.length > 0 && (
                      <button
                        onClick={clearNotifications}
                        className="text-[11px] font-medium text-white/40 transition hover:text-white/70"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="px-4 py-10 text-center text-xs text-white/30">You're all caught up.</p>
                    ) : (
                      notifications.map((n) => {
                        const Icon = NOTIF_ICON[n.kind];
                        return (
                          <div
                            key={n.id}
                            className={cn(
                              "flex gap-3 border-b border-white/[0.04] px-4 py-3",
                              n.unread ? "bg-gold-400/[0.05]" : "bg-transparent"
                            )}
                          >
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-gold-400/20 bg-gold-400/[0.08] text-gold-300">
                              <Icon className="h-4 w-4" strokeWidth={1.5} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-white/85">{n.title}</p>
                                <span className="text-[10px] text-white/25">{timeAgo(n.time)}</span>
                              </div>
                              <p className="mt-0.5 text-xs leading-relaxed text-white/40">{n.message}</p>
                            </div>
                            {n.unread && <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-400" />}
                          </div>
                        );
                      })
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={onQuickAdd}
            className="gold-btn flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-sm font-semibold transition-transform hover:scale-[1.03] active:scale-95 sm:px-4 sm:py-2.5"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Transaction</span>
          </button>

          <a
            href={import.meta.env.VITE_WEBSITE_URL || "http://localhost:3000"}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2.5 text-sm font-medium text-white/60 transition hover:border-white/20 hover:text-white sm:px-4"
          >
            <ArrowUpRight className="h-4 w-4" />
            <span className="hidden sm:inline">Website</span>
          </a>

          <button
            onClick={() => setProfileOpen(true)}
            aria-label="Profile"
            title="Profile"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gold-400/25 bg-gradient-to-br from-gold-300/20 to-transparent font-display text-sm font-semibold text-gold-200 transition hover:border-gold-400/50"
          >
            {initials}
          </button>

          <button
            onClick={handleSignOut}
            aria-label="Log out"
            title="Log out"
            className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 text-white/50 transition hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-300 sm:flex"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </header>
  );
}