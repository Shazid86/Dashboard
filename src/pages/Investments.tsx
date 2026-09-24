import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Plus, TrendingDown, TrendingUp, Trash2, Orbit } from "lucide-react";
import PageTransition from "../components/PageTransition";
import SectionHeader from "../components/SectionHeader";
import EmptyState from "../components/EmptyState";
import TiltCard from "../components/TiltCard";
import { useDashboard } from "../context/DashboardContext";
import { formatCurrency } from "../lib/format";
import HoldingFormModal from "../components/forms/HoldingFormModal";
import ConfirmDialog from "../components/ConfirmDialog";
import { useToast } from "../context/ToastContext";
import PortfolioScene from "../components/three/PortfolioScene";

const COLOR_HEX: Record<string, string> = {
  gold: "#e3ac37",
  emerald: "#34d399",
  sky: "#38bdf8",
  violet: "#a78bfa",
  rose: "#fb7185",
  cyan: "#22d3ee",
};

export default function Investments() {
  const { holdings, removeHolding, totals, currency } = useDashboard();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const money = (n: number) => formatCurrency(n, currency);
  const pieData = useMemo(
    () => holdings.map((h) => ({ name: h.symbol, value: h.value, color: COLOR_HEX[h.color] ?? COLOR_HEX.gold })),
    [holdings]
  );

  return (
    <PageTransition>
      <HoldingFormModal open={open} onClose={() => setOpen(false)} />

      <TiltCard className="relative overflow-hidden p-6 sm:p-8" intensity={8}>
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold-300/80">Portfolio Value</p>
            <p className="mt-3 font-display text-4xl font-bold text-white sm:text-5xl">{money(totals.portfolioValue)}</p>
            <p className="mt-3 max-w-sm text-sm text-white/40">
              A living view of your investments — equities, funds, and alternative assets orbiting a single source of truth.
            </p>
            <button
              onClick={() => setOpen(true)}
              className="gold-btn mt-5 flex w-fit items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-transform hover:scale-[1.03] active:scale-95"
            >
              <Plus className="h-4 w-4" /> Add Holding
            </button>
          </div>

          <div className="perspective-1000 relative mx-auto h-64 w-64 sm:h-72 sm:w-72">
            {holdings.length === 0 ? (
              <div className="flex h-full w-full items-center justify-center">
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="relative flex h-24 w-24 flex-col items-center justify-center rounded-full border border-gold-400/30 bg-gradient-to-br from-ink-800 to-ink-950 text-center shadow-2xl"
                >
                  <Orbit className="h-6 w-6 text-gold-300" strokeWidth={1.5} />
                  <span className="mt-1 text-[10px] text-white/40">Empty</span>
                </motion.div>
              </div>
            ) : (
              <PortfolioScene holdings={holdings} />
            )}
          </div>
        </div>
      </TiltCard>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <TiltCard className="p-6" intensity={2}>
          <SectionHeader title="Allocation" subtitle="By asset" />
          <div className="relative mt-4 flex h-56 items-center justify-center">
            {holdings.length === 0 ? (
              <div className="flex h-40 w-40 items-center justify-center rounded-full border-2 border-dashed border-white/10">
                <span className="px-4 text-center text-xs text-white/30">No assets to allocate yet</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={3}>
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#101218", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </TiltCard>

        <div className="xl:col-span-2">
          <TiltCard className="p-6" intensity={1}>
            <SectionHeader
              title="Holdings"
              subtitle={`${holdings.length} position${holdings.length === 1 ? "" : "s"}`}
              action={
                <button
                  onClick={() => setOpen(true)}
                  className="gold-btn flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-transform hover:scale-[1.03] active:scale-95"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Holding
                </button>
              }
            />
            <div className="mt-4">
              {holdings.length === 0 ? (
                <EmptyState
                  icon={TrendingUp}
                  title="Your portfolio is empty"
                  subtitle="Add stocks, ETFs, crypto, or other assets to start visualizing your investment universe."
                />
              ) : (
                <ul className="divide-y divide-white/[0.06]">
                  {holdings.map((h) => (
                    <li key={h.id} className="group flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold"
                          style={{ background: `${COLOR_HEX[h.color] ?? COLOR_HEX.gold}22`, color: COLOR_HEX[h.color] ?? COLOR_HEX.gold }}
                        >
                          {h.symbol.slice(0, 3)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white/85">{h.name}</p>
                          <p className="text-xs text-white/35">{h.units} units</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-semibold text-white/85">{money(h.value)}</p>
                          <p className={`flex items-center justify-end gap-0.5 text-xs ${h.change >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                            {h.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {Math.abs(h.change).toFixed(1)}%
                          </p>
                        </div>
                        <button
                          onClick={() => setPendingDelete(h.id)}
                          aria-label="Delete holding"
                          title="Delete holding"
                          className="rounded-lg border border-rose-500/25 bg-rose-500/10 p-1.5 text-rose-300 transition hover:bg-rose-500/20 hover:text-rose-200"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </TiltCard>
        </div>
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) {
            removeHolding(pendingDelete);
            toast.success("Holding deleted", "The holding has been removed.");
          }
        }}
      />
    </PageTransition>
  );
}