import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { DashboardProvider } from "./context/DashboardContext";
import { ToastProvider } from "./context/ToastContext";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import type { TabKey } from "./types";
import Overview from "./pages/Overview";
import Transactions from "./pages/Transactions";
import Accounts from "./pages/Accounts";
import Budgets from "./pages/Budgets";
import Investments from "./pages/Investments";
import Goals from "./pages/Goals";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import TransactionFormModal from "./components/forms/TransactionFormModal";
import ThreeBackground from "./components/three/ThreeBackground";

const THEME_KEY = "aureus.theme";

function DashboardShell() {
  const [tab, setTab] = useState<TabKey>("overview");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [quickAdd, setQuickAdd] = useState(false);
  const [txCategory, setTxCategory] = useState<string | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    try {
      return localStorage.getItem(THEME_KEY) === "light" ? "light" : "dark";
    } catch {
      return "dark";
    }
  });

  // Category drill-down from charts → Transactions page
  const filterCategory = (category: string) => {
    setTxCategory(category);
    setTab("transactions");
  };

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* private mode — ignore */
    }
  }, [theme]);

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-ink-950 bg-noise text-white">
      <ThreeBackground />

      <Sidebar
        active={tab}
        onChange={setTab}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Topbar
          tab={tab}
          theme={theme}
          onToggleTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
          onOpenMobile={() => setMobileOpen(true)}
          onQuickAdd={() => setQuickAdd(true)}
        />
        <TransactionFormModal open={quickAdd} onClose={() => setQuickAdd(false)} />

        <main className="relative flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">
          <AnimatePresence mode="wait">
            {tab === "overview" && <div key="overview"><Overview goTo={setTab} onFilterCategory={filterCategory} /></div>}
            {tab === "transactions" && <div key="transactions"><Transactions categoryFilter={txCategory} onClearFilter={() => setTxCategory(null)} /></div>}
            {tab === "accounts" && <div key="accounts"><Accounts /></div>}
            {tab === "budgets" && <div key="budgets"><Budgets /></div>}
            {tab === "investments" && <div key="investments"><Investments /></div>}
            {tab === "goals" && <div key="goals"><Goals /></div>}
            {tab === "reports" && <div key="reports"><Reports /></div>}
            {tab === "settings" && <div key="settings"><Settings /></div>}
          </AnimatePresence>

          <footer className="mt-10 flex items-center justify-center gap-1.5 pb-4 text-[11px] text-white/20">
            <span>Aureus</span>
            <span>·</span>
            <span>Precision wealth tracking, crafted for clarity.</span>
          </footer>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <DashboardProvider>
      <ToastProvider>
        <DashboardShell />
      </ToastProvider>
    </DashboardProvider>
  );
}